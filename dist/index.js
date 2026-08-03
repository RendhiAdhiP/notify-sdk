import { io } from "socket.io-client";
const DEFAULT_RECONNECTION = {
  enabled: true,
  maxAttempts: 10,
  initialDelay: 1e3,
  maxDelay: 3e4,
  backoffMultiplier: 2
};
const DEFAULT_TIMEOUT = 1e4;
const DEFAULT_LOGGER = {
  info: () => {
  },
  warn: () => {
  },
  error: () => {
  },
  debug: () => {
  }
};
class AuthManager {
  constructor(projectToken, origin) {
    this.credentials = { projectToken, origin };
  }
  getProjectToken() {
    return this.credentials.projectToken;
  }
  getOrigin() {
    return this.credentials.origin;
  }
  setProjectToken(token) {
    this.credentials.projectToken = token;
  }
  setOrigin(origin) {
    this.credentials.origin = origin;
  }
  getSocketAuth() {
    return {
      project_token: this.credentials.projectToken,
      origin: this.credentials.origin
    };
  }
  getHttpHeaders() {
    return {
      project_token: this.credentials.projectToken,
      origin: this.credentials.origin
    };
  }
}
class ReconnectionManager {
  constructor(config) {
    this.attempt = 0;
    this.timer = null;
    this.onAttempt = null;
    this.config = { ...DEFAULT_RECONNECTION, ...config };
  }
  get enabled() {
    return this.config.enabled ?? true;
  }
  get maxAttempts() {
    return this.config.maxAttempts ?? 10;
  }
  get currentAttempt() {
    return this.attempt;
  }
  set onReconnectAttempt(handler) {
    this.onAttempt = handler;
  }
  reset() {
    this.attempt = 0;
    this.clearTimer();
  }
  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
  getDelay() {
    const initial = this.config.initialDelay ?? 1e3;
    const max = this.config.maxDelay ?? 3e4;
    const multiplier = this.config.backoffMultiplier ?? 2;
    const delay = Math.min(initial * Math.pow(multiplier, this.attempt), max);
    return Math.floor(delay + Math.random() * 1e3);
  }
  schedule(callback) {
    var _a;
    if (!this.enabled) return false;
    if (this.attempt >= this.maxAttempts) return false;
    this.attempt++;
    const delay = this.getDelay();
    (_a = this.onAttempt) == null ? void 0 : _a.call(this, this.attempt, delay);
    this.timer = setTimeout(callback, delay);
    return true;
  }
  cancel() {
    this.clearTimer();
    this.reset();
  }
  getConfig() {
    return { ...this.config };
  }
}
class EventHandler {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(listener);
    return () => this.off(event, listener);
  }
  off(event, listener) {
    var _a;
    (_a = this.listeners.get(event)) == null ? void 0 : _a.delete(listener);
  }
  emit(event, ...args) {
    var _a;
    (_a = this.listeners.get(event)) == null ? void 0 : _a.forEach((listener) => {
      try {
        listener(...args);
      } catch (err) {
        console.error(`[RWSSDK] Error in ${event} listener:`, err);
      }
    });
  }
  removeAll() {
    this.listeners.clear();
  }
  listenerCount(event) {
    var _a;
    return ((_a = this.listeners.get(event)) == null ? void 0 : _a.size) ?? 0;
  }
}
class RWSLogger {
  constructor(logger) {
    this.logger = { ...DEFAULT_LOGGER, ...logger };
  }
  info(...args) {
    this.logger.info(`[RWSSDK]`, ...args);
  }
  warn(...args) {
    this.logger.warn(`[RWSSDK]`, ...args);
  }
  error(...args) {
    this.logger.error(`[RWSSDK]`, ...args);
  }
  debug(...args) {
    this.logger.debug(`[RWSSDK]`, ...args);
  }
}
let requestIdCounter = 0;
function nextRequestId() {
  return `req_${Date.now()}_${++requestIdCounter}`;
}
class RWSClient {
  constructor(config) {
    this.socket = null;
    this.state = "disconnected";
    this.joinedRooms = /* @__PURE__ */ new Set();
    this.destroyed = false;
    this.connectPromise = null;
    this.pendingRequests = /* @__PURE__ */ new Map();
    this.config = config;
    this.authManager = new AuthManager(config.projectToken, config.origin);
    this.reconnectionManager = new ReconnectionManager(config.reconnection);
    this.eventHandler = new EventHandler();
    this.logger = new RWSLogger(config.logger);
    this.isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    this.reconnectionManager.onReconnectAttempt = (attempt, delay) => {
      this.logger.info(`Reconnection attempt ${attempt} in ${delay}ms`);
      this.eventHandler.emit("reconnecting", attempt);
    };
    if (config.autoConnect !== false && this.isBrowser) {
      this.connect();
    }
  }
  get connectionState() {
    return this.state;
  }
  get serverUrl() {
    return this.config.serverUrl;
  }
  get origin() {
    return this.authManager.getOrigin();
  }
  setState(newState) {
    this.state = newState;
  }
  cleanupSocket() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }
  wrapPayload(event, data, meta = {}) {
    return {
      event,
      data,
      meta,
      error: null
    };
  }
  resolvePending(requestId, data) {
    const entry = this.pendingRequests.get(requestId);
    if (!entry) return;
    clearTimeout(entry.timer);
    this.pendingRequests.delete(requestId);
    entry.resolve(data);
  }
  rejectPending(requestId, error) {
    const entry = this.pendingRequests.get(requestId);
    if (!entry) return;
    clearTimeout(entry.timer);
    this.pendingRequests.delete(requestId);
    entry.reject(error);
  }
  rejectAllPending(error) {
    for (const [, entry] of this.pendingRequests) {
      clearTimeout(entry.timer);
      entry.reject(error);
    }
    this.pendingRequests.clear();
  }
  request(event, data, meta = {}) {
    return new Promise((resolve, reject) => {
      var _a;
      if (!((_a = this.socket) == null ? void 0 : _a.connected)) {
        reject(new Error("Socket not connected"));
        return;
      }
      const requestId = nextRequestId();
      const payload = this.wrapPayload(event, data, { ...meta, request_id: requestId });
      console.log(payload);
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout: ${event}`));
      }, this.config.timeout ?? DEFAULT_TIMEOUT);
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timer
      });
      this.socket.emit(event, payload);
    });
  }
  async connect() {
    var _a;
    if (!this.isBrowser) {
      const err = new Error("WebSocket not available in server-side rendering");
      this.logger.error(err.message);
      return Promise.reject(err);
    }
    if ((_a = this.socket) == null ? void 0 : _a.connected) return;
    if (this.connectPromise) return this.connectPromise;
    this.destroyed = false;
    if (this.socket) this.cleanupSocket();
    this.setState("connecting");
    this.logger.info(`Connecting to ${this.config.serverUrl}`);
    const timeoutMs = this.config.timeout ?? DEFAULT_TIMEOUT;
    this.connectPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.connectPromise = null;
        this.cleanupSocket();
        this.setState("disconnected");
        reject(new Error(`Connection timeout after ${timeoutMs}ms`));
      }, timeoutMs);
      try {
        this.socket = io(this.config.serverUrl, {
          auth: this.authManager.getSocketAuth(),
          transports: ["websocket", "polling"],
          forceNew: true
        });
        this.socket.on("connect", () => {
          clearTimeout(timeout);
          this.connectPromise = null;
          this.setState("connected");
          this.reconnectionManager.reset();
          this.logger.info("Connected");
          this.eventHandler.emit("connect");
          this.rejoinRooms();
          resolve();
        });
        this.socket.on("disconnect", (reason) => {
          this.connectPromise = null;
          this.setState("disconnected");
          this.logger.info(`Disconnected: ${reason}`);
          this.eventHandler.emit("disconnect", reason);
          if (!this.destroyed && reason !== "io client disconnect") {
            this.handleReconnect();
          }
        });
        this.socket.on("connect_error", (err) => {
          this.logger.error(`Connection error: ${err.message}`);
          this.eventHandler.emit("error", err);
        });
        this.socket.onAny((event, payload) => {
          var _a2;
          if (!payload) return;
          const requestId = (_a2 = payload.meta) == null ? void 0 : _a2.request_id;
          if (payload.error) {
            if (requestId) {
              const err = new Error(payload.error.message);
              err.name = payload.error.code;
              this.rejectPending(requestId, err);
            }
            if (event === "room:join") this.eventHandler.emit("room_join_error", payload.error);
            if (event === "room:leave") this.eventHandler.emit("room_leave_error", payload.error);
            return;
          }
          if (requestId) {
            this.resolvePending(requestId, payload.data);
          }
          switch (event) {
            case "notification:new":
              this.eventHandler.emit(
                "notification",
                payload
              );
              break;
            case "chat:updated":
              this.eventHandler.emit("chat_updated", payload.data);
              break;
            case "notification:list":
              this.eventHandler.emit("notification_list", payload.data);
              break;
            case "chat:resolve":
              this.eventHandler.emit("chat_resolve", payload.data);
              break;
          }
        });
      } catch (err) {
        clearTimeout(timeout);
        this.connectPromise = null;
        this.cleanupSocket();
        this.setState("disconnected");
        this.logger.error("Failed to create socket", err);
        reject(err);
      }
    });
    return this.connectPromise;
  }
  handleReconnect() {
    this.connectPromise = null;
    this.reconnectionManager.schedule(() => {
      if (this.destroyed) return;
      this.logger.info("Attempting reconnection...");
      this.connect().catch((err) => {
        this.logger.error("Reconnection failed", err);
        this.eventHandler.emit("error", err);
      });
    });
  }
  async rejoinRooms() {
    var _a;
    if (this.joinedRooms.size === 0) return;
    this.logger.info(`Rejoining ${this.joinedRooms.size} room(s)`);
    for (const room of this.joinedRooms) {
      (_a = this.socket) == null ? void 0 : _a.emit("room:join", this.wrapPayload("room:join", { room }));
    }
  }
  async disconnect() {
    this.destroyed = true;
    this.connectPromise = null;
    this.reconnectionManager.cancel();
    this.joinedRooms.clear();
    this.rejectAllPending(new Error("Disconnected"));
    this.cleanupSocket();
    this.setState("disconnected");
    this.logger.info("Disconnected");
  }
  async destroy() {
    this.eventHandler.removeAll();
    await this.disconnect();
  }
  join(destination, channel, userUniqueCode) {
    var _a;
    const rooms = [`${destination}:${channel}`];
    if (userUniqueCode) rooms.push(`${destination}:${channel}:${userUniqueCode}`);
    for (const room of rooms) {
      this.joinedRooms.add(room);
      if ((_a = this.socket) == null ? void 0 : _a.connected) {
        this.socket.emit("room:join", this.wrapPayload("room:join", { room }));
      }
    }
  }
  leave(destination, channel, userUniqueCode) {
    var _a;
    const rooms = [`${destination}:${channel}`];
    if (userUniqueCode) rooms.push(`${destination}:${channel}:${userUniqueCode}`);
    for (const room of rooms) {
      this.joinedRooms.delete(room);
      if ((_a = this.socket) == null ? void 0 : _a.connected) {
        this.socket.emit("room:leave", this.wrapPayload("room:leave", { room }));
      }
    }
  }
  leaveAll() {
    var _a;
    for (const room of this.joinedRooms) {
      if ((_a = this.socket) == null ? void 0 : _a.connected) {
        this.socket.emit("room:leave", this.wrapPayload("room:leave", { room }));
      }
    }
    this.joinedRooms.clear();
  }
  on(event, listener) {
    return this.eventHandler.on(event, listener);
  }
  off(event, listener) {
    this.eventHandler.off(event, listener);
  }
  getNotifications(channels, userUniqueCode) {
    const data = {
      channels,
      origin: this.authManager.getOrigin(),
      user_unique_code: userUniqueCode,
      private: `${this.authManager.getOrigin()}:all:${userUniqueCode}`
    };
    return this.request("notification:list", data);
  }
  resolveChat(req) {
    return this.request("chat:resolve", req);
  }
  sendChat(req) {
    return this.request("chat:send", req);
  }
  deleteChat(req) {
    return this.request("chat:delete", req);
  }
  async markAsRead(notifId, userId, origin) {
    return this.httpPost(
      `${this.getHttpBaseUrl()}/api/notification/${notifId}/read`,
      { user_id: userId, origin: origin ?? this.authManager.getOrigin() }
    );
  }
  async markAllAsRead(notifIds, userId, origin) {
    return this.httpPost(
      `${this.getHttpBaseUrl()}/api/notification/read-all`,
      { user_id: userId, notif_ids: notifIds, origin: origin ?? this.authManager.getOrigin() }
    );
  }
  async markAsDelete(notifId, userId, origin) {
    return this.httpPost(
      `${this.getHttpBaseUrl()}/api/notification/mark-as-delete/${notifId}`,
      { user_id: userId, origin: origin ?? this.authManager.getOrigin() }
    );
  }
  getHttpBaseUrl() {
    return this.config.serverUrl.replace(/\/+$/, "");
  }
  async httpPost(url, body) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.authManager.getHttpHeaders()
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }
  setProjectToken(token) {
    this.authManager.setProjectToken(token);
  }
  setOrigin(origin) {
    this.authManager.setOrigin(origin);
  }
}
export {
  RWSClient
};
