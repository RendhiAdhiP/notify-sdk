export interface StandardPayload<T = unknown> {
  event: string
  data: T
  meta: Record<string, unknown>
  error: null | { code: string; message: string }
}

export interface RequestPayload<T = unknown> {
  event: string
  data: T
  meta: Record<string, unknown>
  error: null
}

export interface ErrorPayload {
  event: string
  data: null
  meta: Record<string, unknown>
  error: { code: string; message: string }
}

export interface RWSNotificationMeta {
  destination: string
  channel: string
  origin?: string
}

export interface RWSPayload<T = unknown> {
  event: string
  data: T
  meta: Record<string, unknown>
  error: null | { code: string; message: string }
}

export interface DateGroup {
  label: string
  notif: RWSPayload[]
}

export interface ChannelGroup {
  channel: string
  total: number
  total_is_read: number
  total_unread: number
  data: DateGroup[]
}

export interface GetNotificationsOldResponse {
  total: number
  total_is_read: number
  total_unread: number
  data: ChannelGroup[]
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  is_read: boolean
  link: string
  delivered_at: string
}

export interface NotificationPlatform {
  platform: string
  total_notif: number
  total_unread: number
  icon: string
  data: NotificationItem[]
}

export interface NotificationChannel {
  channel: string
  total_notif: number
  total_unread: number
  data: NotificationItem[]
}

export interface NotificationListData {
  total_notif: number
  total_unread: number
  notification_platforms: NotificationPlatform[]
  notification_channels: NotificationChannel[]
}

export interface ChatMeta {
  channel: string
  topic_id: string
  platform_admin?: string
  platform_user?: string
  [key: string]: unknown
}

export interface ChatMessageItem {
  _id: string
  chat_id: string
  conversation_code?: string | null
  sender_id: string
  message?: string | null
  image?: string | null
  imageThumb?: string | null
  ftp?: string | null
  ftp_domain?: string | null
  ftp_file_path?: string | null
  ftp_file_path_thumb?: string | null
  ftp_file_name?: string | null
  created_at: string
  updated_at: string
}

export interface MessageGroup {
  label: string
  messages: ChatMessageItem[]
}

export interface ChatRoom {
  _id: string
  owner_id?: string
  conversation_code: string
  user_id: number | null
  admin_id: number | null
  meta: ChatMeta
  is_active?: boolean
  created_at: string
  updated_at: string
  messages: MessageGroup[]
  totalMessages?: number
  lastMessage?: ChatMessageItem | null
}

export interface GetNotificationsRequest {
  channels: string[]
  origin: string
  user_unique_code: string
  private: string
}

export interface ChatResolveRequest {
  chat: {
    meta: {
      channel: string
      topic_id: string
      [key: string]: unknown
    }
    user_id: number | string
    admin_id?: number | string
  }
  private: string
}

export interface ChatSendRequest {
  chat: {
    chat_id: string
    message: string
    sender_id: string
    image?: { buffer: ArrayBuffer; name: string }
    notification?: {
      title?: string
      link?: string
      additional?: Record<string, unknown>
    }
  }
}

export interface ChatDeleteRequest {
  message_id: string
}

export interface RoomJoinRequest {
  room: string
}

export interface RoomLeaveRequest {
  room: string
}

export interface MarkReadRequest {
  user_id: string
  origin: string
}

export interface MarkAllReadRequest {
  user_id: string
  notif_ids: string[]
  origin: string
}

export interface MarkDeleteRequest {
  user_id: string
  origin: string
}

export interface ApiResponse {
  status: "success" | "fail" | "error"
  code: number
  message: string
  data: unknown | null
}
