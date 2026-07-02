# Penggunaan

## Inisialisasi Client

```typescript
import { NotificationClient } from "notification-sdk"

const client = new NotificationClient({
  serverUrl: "https://notif.regarmarket.id",
  projectToken: "eyJhbGciOiJIUzI1NiIs...",
  origin: "regarmarket",
  // Opsional:
  autoConnect: true,
  timeout: 10000,
  reconnection: {
    enabled: true,
    maxAttempts: 10,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },
})
```

### Opsi Konfigurasi

| Opsi | Tipe | Default | Deskripsi |
|---|---|---|---|
| `serverUrl` | `string` | — | URL server WebSocket (wajib) |
| `projectToken` | `string` | — | Token autentikasi project (wajib) |
| `origin` | `string` | — | Origin platform (wajib) |
| `autoConnect` | `boolean` | `true` | Auto-connect saat inisialisasi |
| `timeout` | `number` | `10000` | Timeout koneksi (ms) |
| `reconnection` | `object` | — | Konfigurasi auto-reconnect |

## Event Listeners

### Daftar Event

| Event | Callback | Deskripsi |
|---|---|---|
| `connect` | `() => void` | Terkoneksi ke server |
| `disconnect` | `(reason: string) => void` | Terputus dari server |
| `reconnecting` | `(attempt: number) => void` | Sedang mencoba reconnect |
| `error` | `(error: Error) => void` | Terjadi error |
| `notification` | `(notif: NotificationPayload) => void` | Menerima notifikasi baru |

### Subscribe

```typescript
const unsub = client.on("notification", (notif) => {
  console.log(`[${notif.type}] ${notif.title}: ${notif.message}`)
})

// Hapus listener
unsub()

// Atau pake off
const handler = (notif) => console.log(notif.title)
client.on("notification", handler)
client.off("notification", handler)
```

## Channel Management

### Join Room

```typescript
// Join public channel (menerima notifikasi publik di channel "orders")
client.join("regarmarket", "orders")

// Join private channel (menerima notifikasi pribadi untuk user "user123")
client.join("regarmarket", "orders", "user123")

// Multiple channels
client.join("regarmarket", "orders")
client.join("regarmarket", "system")
client.join("regarmarket", "messages", "user123")
```

### Leave Room

```typescript
client.leave("regarmarket", "orders")
client.leave("regarmarket", "orders", "user123")

// Leave semua room
client.leaveAll()
```

## Fetch Notifications

```typescript
const result = await client.getNotifications(
  ["orders", "system"], // channel yang ingin diambil
  "user123",            // user unique code
)

console.log(`Total: ${result.total}`)
console.log(`Unread: ${result.total_unread}`)

// Iterasi per channel
for (const channel of result.data) {
  console.log(`Channel: ${channel.channel}`)
  for (const group of channel.data) {
    console.log(`Date: ${group.label}`)
    for (const notif of group.notif) {
      console.log(`- ${notif.title}: ${notif.message}`)
    }
  }
}
```

### Response Structure

```typescript
{
  total: number
  total_isread: number
  total_unread: number
  data: [{
    channel: string
    total: number
    total_isread: number
    total_unread: number
    data: [{
      label: string         // "Hari Ini", "Kemarin", atau "Senin, 1/1/2024"
      notif: NotificationPayload[]
    }]
  }]
}
```

## Mark Notifications

### Mark as Read

```typescript
await client.markAsRead("notifId123", "user123")

// Dengan origin berbeda (opsional, default: origin dari config)
await client.markAsRead("notifId123", "user123", "regarmarket")
```

### Mark All as Read

```typescript
await client.markAllAsRead(
  ["notifId1", "notifId2", "notifId3"],
  "user123",
)
```

### Mark as Delete (Soft Delete)

```typescript
await client.markAsDelete("notifId123", "user123")
```

## Connection Management

```typescript
// Manual connect (jika autoConnect: false)
await client.connect()

// Cek status
console.log(client.connectionState)
// "disconnected" | "connecting" | "connected" | "reconnecting"

// Disconnect
await client.disconnect()

// Destroy (cleanup semua listener)
await client.destroy()
```

## Update Credentials

```typescript
client.setProjectToken("new-token")
client.setOrigin("new-origin")

// Catatan: perubahan tidak memengaruhi koneksi aktif.
// Untuk menggunakan kredensial baru, disconnect lalu connect ulang.
```

## Error Handling

```typescript
client.on("error", (err) => {
  console.error("SDK Error:", err.message)
})

client.on("disconnect", (reason) => {
  if (reason === "io server disconnect") {
    // Server yang memutus koneksi, jangan reconnect otomatis
    // SDK tidak akan auto-reconnect dalam kasus ini
    console.log("Server disconnected us")
  }
})

try {
  await client.getNotifications(["orders"], "user123")
} catch (err) {
  console.error("Failed to fetch notifications:", err)
}
```

## Logging

```typescript
const client = new NotificationClient({
  // ...
  logger: {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  },
})
```
