import { NotificationClient } from "notification-sdk"

let clientInstance: NotificationClient | null = null

export function getNotificationClient(): NotificationClient {
  if (clientInstance) return clientInstance

  clientInstance = new NotificationClient({
    serverUrl: process.env.NEXT_PUBLIC_NOTIF_SERVER_URL!,
    projectToken: process.env.NEXT_PUBLIC_NOTIF_PROJECT_TOKEN!,
    origin: process.env.NEXT_PUBLIC_NOTIF_ORIGIN!,
    autoConnect: false,
    reconnection: {
      enabled: true,
      maxAttempts: 10,
    },
  })

  return clientInstance
}


export function destroyNotificationClient(): void {
  if (clientInstance) {
    clientInstance.destroy()
    clientInstance = null
  }
}
