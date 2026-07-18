import { RWSClient } from "rws-sdk"

let clientInstance: RWSClient | null = null

export function getRWSClient(): RWSClient {
  if (clientInstance) return clientInstance

  clientInstance = new RWSClient({
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

export function destroyRWSClient(): void {
  if (clientInstance) {
    clientInstance.destroy()
    clientInstance = null
  }
}
