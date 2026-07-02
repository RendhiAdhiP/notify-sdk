"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import {
  NotificationClient,
  type ConnectionState,
  type NotificationPayload,
  type GetNotificationsResponse,
} from "notification-sdk"
import { getNotificationClient } from "../lib/notification"

interface NotificationContextValue {
  client: NotificationClient | null
  connectionState: ConnectionState
  notifications: NotificationPayload[]
  unreadCount: number
  connect: (userUniqueCode: string) => void
  disconnect: () => void
  refresh: () => Promise<void>
  markAsRead: (notifId: string) => Promise<void>
  markAllAsRead: (notifIds: string[]) => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return ctx
}

interface Props {
  children: ReactNode
  channels: string[]
  origin: string
}

export function NotificationProvider({ children, channels, origin }: Props) {
  const [client] = useState(() => getNotificationClient())
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected")
  const [notifications, setNotifications] = useState<NotificationPayload[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [userUniqueCode, setUserUniqueCode] = useState<string | null>(null)

  useEffect(() => {
    const unsub1 = client.on("connect", () => {
      setConnectionState("connected")
    })

    const unsub2 = client.on("disconnect", (reason) => {
      setConnectionState("disconnected")
    })

    const unsub3 = client.on("reconnecting", () => {
      setConnectionState("reconnecting")
    })

    const unsub4 = client.on("error", (err) => {
      console.error("[Notification] Error:", err)
    })

    const unsub5 = client.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
      unsub5()
    }
  }, [client])

  const connect = useCallback(
    async (userId: string) => {
      setUserUniqueCode(userId)
      await client.connect()

      for (const channel of channels) {
        client.join(origin, channel, userId)
      }
    },
    [client, channels, origin],
  )

  const disconnect = useCallback(() => {
    client.leaveAll()
    client.disconnect()
    setNotifications([])
    setUnreadCount(0)
    setUserUniqueCode(null)
  }, [client])

  const refresh = useCallback(async () => {
    if (!userUniqueCode) return
    const result: GetNotificationsResponse = await client.getNotifications(
      channels,
      userUniqueCode,
    )
    setNotifications(
      result.data.flatMap((g) => g.data.flatMap((d) => d.notif)),
    )
    setUnreadCount(result.total_unread)
  }, [client, channels, userUniqueCode])

  const markAsRead = useCallback(
    async (notifId: string) => {
      if (!userUniqueCode) return
      await client.markAsRead(notifId, userUniqueCode)
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    },
    [client, userUniqueCode],
  )

  const markAllAsRead = useCallback(
    async (notifIds: string[]) => {
      if (!userUniqueCode) return
      await client.markAllAsRead(notifIds, userUniqueCode)
      setNotifications((prev) =>
        prev.map((n) =>
          notifIds.includes(n._id) ? { ...n, isRead: true } : n,
        ),
      )
      setUnreadCount(0)
    },
    [client, userUniqueCode],
  )

  return (
    <NotificationContext.Provider
      value={{
        client,
        connectionState,
        notifications,
        unreadCount,
        connect,
        disconnect,
        refresh,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
