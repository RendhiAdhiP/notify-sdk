"use client"

import { useState } from "react"
import { useNotification } from "../providers/NotificationProvider"

interface Props {
  userId: string
}

export function NotificationBell({ userId }: Props) {
  const {
    connectionState,
    notifications,
    unreadCount,
    connect,
    disconnect,
    refresh,
    markAsRead,
  } = useNotification()

  const [isOpen, setIsOpen] = useState(false)
  const isConnected = connectionState === "connected"

  const handleToggle = () => {
    if (!isConnected) {
      connect(userId)
    }
    setIsOpen(!isOpen)
    if (!isOpen) {
      refresh()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border max-h-96 overflow-y-auto">
          <div className="p-3 border-b flex justify-between items-center">
            <span className="font-semibold">Notifications</span>
            <div className="flex gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  isConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {connectionState}
              </span>
              <button
                onClick={() => disconnect()}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Disconnect
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              No notifications
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                  !notif.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => markAsRead(notif._id)}
              >
                <div className="font-medium text-sm">{notif.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {notif.message}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
