import { io, Socket } from "socket.io-client"
import type {
  NotificationClientConfig,
  ConnectionState,
  NotificationPayload,
  GetNotificationsResponse,
  MarkReadRequest,
  MarkAllReadRequest,
  MarkDeleteRequest,
  ApiResponse,
  NotificationEventName,
  NotificationEventListener,
} from "../types"
import { DEFAULT_TIMEOUT } from "../config/default"
import { AuthManager } from "./auth"
import { ReconnectionManager } from "./reconnection"
import { EventHandler } from "../handlers"
import { NotificationLogger } from "../utils/logger"
import { generatePrivateRoom } from "../utils/helpers"

export class NotificationClient {
  private socket: Socket | null = null
  private config: NotificationClientConfig
  private authManager: AuthManager
  private reconnectionManager: ReconnectionManager
  private eventHandler: EventHandler
  private logger: NotificationLogger
  private state: ConnectionState = "disconnected"
  private joinedRooms = new Set<string>()
  private privateRoom: string
  private destroyed = false
  private connectPromise: Promise<void> | null = null
  private isBrowser: boolean

  constructor(config: NotificationClientConfig) {
    this.config = config
    this.authManager = new AuthManager(config.projectToken, config.origin)
    this.reconnectionManager = new ReconnectionManager(config.reconnection)
    this.eventHandler = new EventHandler()
    this.logger = new NotificationLogger(config.logger)
    this.privateRoom = generatePrivateRoom()
    this.isBrowser = typeof window !== "undefined" && typeof document !== "undefined"

    this.reconnectionManager.onReconnectAttempt = (attempt, delay) => {
      this.logger.info(`Reconnection attempt ${attempt} in ${delay}ms`)
      this.eventHandler.emit("reconnecting", attempt)
    }

    if (config.autoConnect !== false && this.isBrowser) {
      this.connect()
    }
  }

  get connectionState(): ConnectionState {
    return this.state
  }

  get serverUrl(): string {
    return this.config.serverUrl
  }

  get origin(): string {
    return this.authManager.getOrigin()
  }

  private setState(newState: ConnectionState): void {
    this.state = newState
  }

  private cleanupSocket(): void {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }
  }

  async connect(): Promise<void> {
    if (!this.isBrowser) {
      const err = new Error("WebSocket not available in server-side rendering")
      this.logger.error(err.message)
      return Promise.reject(err)
    }

    if (this.socket?.connected) {
      return
    }

    if (this.connectPromise) {
      return this.connectPromise
    }

    this.destroyed = false

    if (this.socket) {
      this.cleanupSocket()
    }

    this.setState("connecting")
    this.logger.info(`Connecting to ${this.config.serverUrl}`)

    const timeoutMs = this.config.timeout ?? DEFAULT_TIMEOUT

    this.connectPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.connectPromise = null
        this.cleanupSocket()
        this.setState("disconnected")
        reject(new Error(`Connection timeout after ${timeoutMs}ms`))
      }, timeoutMs)

      try {
        this.socket = io(this.config.serverUrl, {
          auth: this.authManager.getSocketAuth(),
          transports: ["websocket", "polling"],
          forceNew: true,
        })

        this.socket.on("connect", () => {
          clearTimeout(timeout)
          this.connectPromise = null
          this.setState("connected")
          this.reconnectionManager.reset()
          this.logger.info("Connected")
          this.eventHandler.emit("connect")
          this.rejoinRooms()
          resolve()
        })

        this.socket.on("disconnect", (reason) => {
          this.connectPromise = null
          this.setState("disconnected")
          this.logger.info(`Disconnected: ${reason}`)
          this.eventHandler.emit("disconnect", reason)

          if (!this.destroyed && reason !== "io client disconnect") {
            this.handleReconnect()
          }
        })

        this.socket.on("connect_error", (err) => {
          this.logger.error(`Connection error: ${err.message}`)
          this.eventHandler.emit("error", err)
        })

        this.socket.on("get-notif", (notification: NotificationPayload) => {
          this.eventHandler.emit("notification", notification)
        })
      } catch (err) {
        clearTimeout(timeout)
        this.connectPromise = null
        this.cleanupSocket()
        this.setState("disconnected")
        this.logger.error("Failed to create socket", err)
        reject(err)
      }
    })

    return this.connectPromise
  }

  private handleReconnect(): void {
    this.connectPromise = null
    this.reconnectionManager.schedule(() => {
      if (this.destroyed) return
      this.logger.info("Attempting reconnection...")
      this.connect().catch((err) => {
        this.logger.error("Reconnection failed", err)
        this.eventHandler.emit("error", err)
      })
    })
  }

  private async rejoinRooms(): Promise<void> {
    if (this.joinedRooms.size === 0) return
    this.logger.info(`Rejoining ${this.joinedRooms.size} room(s)`)
    for (const room of this.joinedRooms) {
      this.socket?.emit("join-room", room)
    }
  }

  async disconnect(): Promise<void> {
    this.destroyed = true
    this.connectPromise = null
    this.reconnectionManager.cancel()
    this.joinedRooms.clear()
    this.cleanupSocket()
    this.setState("disconnected")
    this.logger.info("Disconnected")
  }

  async destroy(): Promise<void> {
    this.eventHandler.removeAll()
    await this.disconnect()
  }

  join(destination: string, channel: string, userUniqueCode?: string): void {
    const room = `${destination}:${channel}${userUniqueCode ? `:${userUniqueCode}` : ""}`
    this.joinedRooms.add(room)

    if (this.socket?.connected) {
      this.socket.emit("join-room", room)
    }
  }

  leave(destination: string, channel: string, userUniqueCode?: string): void {
    const room = `${destination}:${channel}${userUniqueCode ? `:${userUniqueCode}` : ""}`
    this.joinedRooms.delete(room)

    if (this.socket?.connected) {
      this.socket.emit("leave-room", room)
    }
  }

  leaveAll(): void {
    for (const room of this.joinedRooms) {
      if (this.socket?.connected) {
        this.socket.emit("leave-room", room)
      }
    }
    this.joinedRooms.clear()
  }

  on<E extends NotificationEventName>(
    event: E,
    listener: NotificationEventListener<E>,
  ): () => void {
    return this.eventHandler.on(event, listener)
  }

  off<E extends NotificationEventName>(
    event: E,
    listener: NotificationEventListener<E>,
  ): void {
    this.eventHandler.off(event, listener)
  }

  getNotifications(
    channels: string[],
    userUniqueCode: string,
  ): Promise<GetNotificationsResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Socket not connected"))
        return
      }

      let settled = false
      let cleanup: (() => void) | null = null

      const done = () => {
        if (settled) return
        settled = true
        cleanup?.()
      }

      const listener = (data: unknown) => {
        done()
        resolve(data as GetNotificationsResponse)
      }

      const onDisconnect = () => {
        done()
        this.socket?.off("disconnect", onDisconnect)
        reject(new Error("Socket disconnected while fetching notifications"))
      }

      cleanup = () => {
        this.socket?.off("get-all-notif", listener)
        this.socket?.off("disconnect", onDisconnect)
      }

      this.socket.on("get-all-notif", listener)
      this.socket.on("disconnect", onDisconnect)

      this.socket.emit("get-all-notif", {
        channels,
        origin: this.authManager.getOrigin(),
        user_unique_code: userUniqueCode,
        private: this.privateRoom,
      })

      setTimeout(() => {
        done()
        reject(new Error("getNotifications timeout"))
      }, DEFAULT_TIMEOUT)
    })
  }

  async markAsRead(
    notifId: string,
    userId: string,
    origin?: string,
  ): Promise<ApiResponse> {
    return this.httpPost<ApiResponse>(
      `${this.getHttpBaseUrl()}/api/notification/${notifId}/read`,
      {
        user_id: userId,
        origin: origin ?? this.authManager.getOrigin(),
      } satisfies MarkReadRequest,
    )
  }

  async markAllAsRead(
    notifIds: string[],
    userId: string,
    origin?: string,
  ): Promise<ApiResponse> {
    return this.httpPost<ApiResponse>(
      `${this.getHttpBaseUrl()}/api/notification/read-all`,
      {
        user_id: userId,
        notif_ids: notifIds,
        origin: origin ?? this.authManager.getOrigin(),
      } satisfies MarkAllReadRequest,
    )
  }

  async markAsDelete(
    notifId: string,
    userId: string,
    origin?: string,
  ): Promise<ApiResponse> {
    return this.httpPost<ApiResponse>(
      `${this.getHttpBaseUrl()}/api/notification/mark-as-delete/${notifId}`,
      {
        user_id: userId,
        origin: origin ?? this.authManager.getOrigin(),
      } satisfies MarkDeleteRequest,
    )
  }

  private getHttpBaseUrl(): string {
    return this.config.serverUrl.replace(/\/+$/, "")
  }

  private async httpPost<T>(url: string, body: unknown): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.authManager.getHttpHeaders(),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return (await response.json()) as T
    } finally {
      clearTimeout(timeout)
    }
  }

  setProjectToken(token: string): void {
    this.authManager.setProjectToken(token)
  }

  setOrigin(origin: string): void {
    this.authManager.setOrigin(origin)
  }
}
