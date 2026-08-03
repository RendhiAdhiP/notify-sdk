# RWS SDK

**RWS SDK** — Realtime WebSocket client untuk notifikasi, chat, dan event realtime.
Mengikuti standar payload `{ event, data, meta, error }` sesuai WebSocket Request & Response Standard.

Package: `rws-js` | Exports class: `RWSClient`

## Fitur

- Koneksi WebSocket dengan autentikasi (`project_token`)
- Subscribe / Unsubscribe room notifikasi
- Notifikasi real-time via event listener
- Fetch notifikasi dengan format standar (`notification_platforms` + `notification_channels`)
- Chat: resolve, send, delete via WebSocket
- Mark as read, mark all as read, mark as delete (via HTTP)
- Auto-reconnect dengan exponential backoff
- TypeScript — full type definitions
- Framework-agnostic

## Instalasi

```bash
npm install github:RendhiAdhiP/rws-js
```

Atau dari local package:

```bash
npm install ../rws-js
```

## Quick Start

```typescript
import { RWSClient } from "rws-js"

const client = new RWSClient({
  serverUrl: "https://notif.regarmarket.id",
  projectToken: "your-project-token",
  origin: "regarmarket",
})

// Listen notifikasi real-time
client.on("notification", (notif) => {
  console.log("Notifikasi baru:", notif.title)
})

// Join room
client.join("regarmarket", "orders", "user123")

// Fetch notifikasi
const notifs = await client.getNotifications(["orders", "system"], "user123")
console.log(notifs.total_notif, notifs.notification_platforms)
```

## Events

| Event | Payload | Deskripsi |
|-------|---------|-----------|
| `connect` | `void` | Terhubung ke server |
| `disconnect` | `reason` | Terputus dari server |
| `reconnecting` | `attempt` | Sedang mencoba reconnect |
| `error` | `Error` | Error umum |
| `notification` | `NotificationItem` | Notifikasi real-time baru |
| `chat_updated` | `ChatRoom` | Chat diupdate |
| `notification_list` | `NotificationListData` | Response fetch notifikasi |
| `chat_resolve` | `ChatRoom` | Response resolve chat |

## API Methods

| Method | Keterangan |
|--------|------------|
| `join(dest, channel, userCode?)` | Join room |
| `leave(dest, channel, userCode?)` | Leave room |
| `leaveAll()` | Leave semua room |
| `getNotifications(channels, userCode)` | Fetch notifikasi → `Promise<NotificationListData>` |
| `resolveChat(req)` | Resolve chat → `Promise<ChatRoom>` |
| `sendChat(req)` | Kirim pesan → `Promise<ChatRoom>` |
| `deleteChat(req)` | Hapus pesan → `Promise<ChatRoom>` |
| `markAsRead(notifId, userId, origin?)` | Tandai dibaca |
| `markAllAsRead(notifIds, userId, origin?)` | Tandai semua dibaca |
| `markAsDelete(notifId, userId, origin?)` | Tandai dihapus |

## Standar Payload

Semua request dikirim dengan format:
```json
{ "event": "...", "data": {}, "meta": {}, "error": null }
```

Semua response diterima dengan format:
```json
{ "event": "...", "data": {}, "meta": {}, "error": null }
```

Error:
```json
{ "event": "...", "data": null, "meta": {}, "error": { "code": "...", "message": "..." } }
```

## Build

```bash
npm run build    # Output ke dist/
```
