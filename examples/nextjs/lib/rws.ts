import { RWSClient } from "rws-js"

let clientInstance: RWSClient | null = null

export function getRWSClient(): RWSClient {
  if (clientInstance) return clientInstance

  clientInstance = new RWSClient({
    serverUrl: process.env.NEXT_PUBLIC_RWS_SERVER_URL!,
    projectToken: process.env.NEXT_PUBLIC_RWS_PROJECT_TOKEN!,
    origin: process.env.NEXT_PUBLIC_RWS_ORIGIN!,
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
