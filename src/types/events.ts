import type { NotificationItem, NotificationListData, ChatRoom, RWSPayload } from "./notification"

export type RWSEventMap = {
  connect: () => void
  disconnect: (reason: string) => void
  reconnecting: (attempt: number) => void
  error: (error: Error) => void
  notification: (notification: RWSPayload<NotificationItem>) => void
  chat_updated: (chat: ChatRoom) => void
  notification_list: (data: NotificationListData) => void
  chat_resolve: (chat: ChatRoom) => void
  room_join_error: (error: { code: string; message: string }) => void
  room_leave_error: (error: { code: string; message: string }) => void
}

export type RWSEventName = keyof RWSEventMap

export type RWSEventListener<E extends RWSEventName> = RWSEventMap[E]
