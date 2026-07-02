# API Reference

## NotificationClient

### Constructor

```typescript
new NotificationClient(config: NotificationClientConfig)
```

### Properties

| Property | Tipe | Deskripsi |
|---|---|---|
| `connectionState` | `ConnectionState` | Status koneksi saat ini |
| `serverUrl` | `string` | URL server yang digunakan |
| `origin` | `string` | Origin platform |

### Methods

#### `connect(): Promise<void>`
Membuka koneksi WebSocket ke server. Otomatis dipanggil jika `autoConnect: true`.

#### `disconnect(): Promise<void>`
Menutup koneksi WebSocket.

#### `destroy(): Promise<void>`
Menutup koneksi dan menghapus semua event listener.

#### `join(destination: string, channel: string, userUniqueCode?: string): void`
Subscribe ke channel notifikasi. Room akan dibuat dengan format `destination:channel[:userUniqueCode]`.

#### `leave(destination: string, channel: string, userUniqueCode?: string): void`
Unsubscribe dari channel notifikasi.

#### `leaveAll(): void`
Unsubscribe dari semua channel yang sudah di-join.

#### `on<E>(event: E, listener: Function): () => void`
Subscribe ke event SDK. Mengembalikan fungsi unsubscribe.

#### `off<E>(event: E, listener: Function): void`
Hapus listener dari event.

#### `getNotifications(channels: string[], userUniqueCode: string): Promise<GetNotificationsResponse>`
Fetch semua notifikasi untuk channel dan user tertentu via WebSocket.

#### `markAsRead(notifId: string, userId: string, origin?: string): Promise<ApiResponse>`
Tandai notifikasi sebagai sudah dibaca.

#### `markAllAsRead(notifIds: string[], userId: string, origin?: string): Promise<ApiResponse>`
Tandai beberapa notifikasi sebagai sudah dibaca.

#### `markAsDelete(notifId: string, userId: string, origin?: string): Promise<ApiResponse>`
Tandai notifikasi sebagai dihapus (soft delete).

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
| `notification` | `notif: NotificationPayload` | Menerima notifikasi baru |

## Types

### NotificationClientConfig

```typescript
{
  serverUrl: string
  projectToken: string
  origin: string
  autoConnect?: boolean
  reconnection?: ReconnectionConfig
  timeout?: number
  logger?: Logger
}
```

### ReconnectionConfig

```typescript
{
  enabled?: boolean        // default: true
  maxAttempts?: number     // default: 10
  initialDelay?: number    // default: 1000 (ms)
  maxDelay?: number        // default: 30000 (ms)
  backoffMultiplier?: number // default: 2
}
```

### NotificationPayload

```typescript
{
  _id: string
  ownerId: string
  room: "public" | "private"
  title: string
  message: string
  link: string
  userUniqueCode?: string
  type?: string
  meta: {
    destination: string
    channel: string
    origin?: string
  }
  isRead: boolean
  createdAt: string
  updatedAt: string
}
```

### GetNotificationsResponse

```typescript
{
  total: number
  total_isread: number
  total_unread: number
  data: ChannelGroup[]
}

// ChannelGroup
{
  channel: string
  total: number
  total_isread: number
  total_unread: number
  data: DateGroup[]
}

// DateGroup
{
  label: string  // "Hari Ini", "Kemarin", atau "Senin, 1/1/2024"
  notif: NotificationPayload[]
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
