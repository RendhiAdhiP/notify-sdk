export interface RWSPayload {
  _id: string
  owner_id: string
  room: "public" | "private"
  title: string
  message: string
  link: string
  user_unique_code?: string
  type?: string
  meta: RWSNotificationMeta
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface RWSNotificationMeta {
  destination: string
  channel: string
  origin?: string
}

export interface GetNotificationsRequest {
  channels: string[]
  origin: string
  user_unique_code: string
  private: string
}

export interface GetNotificationsResponse {
  total: number
  total_is_read: number
  total_unread: number
  data: ChannelGroup[]
}

export interface ChannelGroup {
  channel: string
  total: number
  total_is_read: number
  total_unread: number
  data: DateGroup[]
}

export interface DateGroup {
  label: string
  notif: RWSPayload[]
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
