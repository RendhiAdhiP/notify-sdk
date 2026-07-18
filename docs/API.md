# API Reference

## RWSClient

### Constructor

```typescript
new RWSClient(config: RWSConfig)
```

### Properties

| Property | Tipe | Deskripsi |
|---|---|---|
| `connectionState` | `ConnectionState` | Status koneksi saat ini |
| `serverUrl` | `string` | URL server yang digunakan |
| `origin` | `string` | Origin platform |

### Methods

#### `connect(): Promise<void>`
Membuka koneksi WebSocket ke server. Otomatis dipanggil jika `autoConnect: true`. Hanya berfungsi di browser (me-reject di server-side).

#### `disconnect(): Promise<void>`
Menutup koneksi WebSocket dan menghapus semua room.

#### `destroy(): Promise<void>`
Menutup koneksi dan menghapus semua event listener.

#### `join(destination: string, channel: string, userUniqueCode?: string): void`
Subscribe ke channel notifikasi. Room akan dibuat dengan format `destination:channel[:userUniqueCode]`. Jika sudah terkoneksi, langsung emit `room:join`.

#### `leave(destination: string, channel: string, userUniqueCode?: string): void`
Unsubscribe dari channel notifikasi.

#### `leaveAll(): void`
Unsubscribe dari semua channel yang sudah di-join.

#### `on<E>(event: E, listener: Function): () => void`
Subscribe ke event SDK. Mengembalikan fungsi unsubscribe.

#### `off<E>(event: E, listener: Function): void`
Hapus listener dari event.

#### `getNotifications(channels: string[], userUniqueCode: string): Promise<GetNotificationsResponse>`
Fetch semua notifikasi untuk channel dan user tertentu via WebSocket. Request dikirim dengan event `notification:list`, response diterima via event `notification:list`.

#### `markAsRead(notifId: string, userId: string, origin?: string): Promise<ApiResponse>`
Tandai notifikasi sebagai sudah dibaca via HTTP POST.

#### `markAllAsRead(notifIds: string[], userId: string, origin?: string): Promise<ApiResponse>`
Tandai beberapa notifikasi sebagai sudah dibaca via HTTP POST.

#### `markAsDelete(notifId: string, userId: string, origin?: string): Promise<ApiResponse>`
Tandai notifikasi sebagai dihapus (soft delete) via HTTP POST.

#### `setProjectToken(token: string): void`
Update project token.

#### `setOrigin(origin: string): void`
Update origin platform.

### Events

| Event | Payload | Deskripsi |
|---|---|---|
| `connect` | — | Koneksi berhasil |
| `disconnect` | `reason: string` | Koneksi terputus |
| `reconnecting` | `attempt: number` | Percobaan reconnect ke-n |
| `error` | `error: Error` | Terjadi error |
| `notification` | `notif: RWSPayload` | Menerima notifikasi baru |

## Types

### RWSConfig

```typescript
{
  serverUrl: string
  projectToken: string
  origin: string
  autoConnect?: boolean        // default: true
  timeout?: number             // default: 10000
  reconnection?: ReconnectionConfig
  logger?: Logger
}
```

### ReconnectionConfig

```typescript
{
  enabled?: boolean           // default: true
  maxAttempts?: number        // default: 10
  initialDelay?: number       // default: 1000 (ms)
  maxDelay?: number           // default: 30000 (ms)
  backoffMultiplier?: number  // default: 2
}
```

### RWSPayload

```typescript
{
  _id: string
  owner_id: string
  room: "public" | "private"
  title: string
  message: string
  link: string
  user_unique_code?: string
  type?: string
  meta: {
    destination: string
    channel: string
    origin?: string
  }
  is_read: boolean
  created_at: string
  updated_at: string
}
```

### GetNotificationsResponse

```typescript
{
  total: number
  total_is_read: number
  total_unread: number
  data: ChannelGroup[]
}

// ChannelGroup
{
  channel: string
  total: number
  total_is_read: number
  total_unread: number
  data: DateGroup[]
}

// DateGroup
{
  label: string  // "Hari Ini", "Kemarin", atau "Senin, 1/1/2024"
  notif: RWSPayload[]
}
```

### ApiResponse

```typescript
{
  status: "success" | "fail" | "error"
  code: number
  message: string
  data: unknown | null
}
```

### ConnectionState

```typescript
type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting"
```

### Logger

```typescript
{
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}
```
