import type { RWSPayload } from "./notification"

export type RWSEventMap = {
  connect: () => void
  disconnect: (reason: string) => void
  reconnecting: (attempt: number) => void
  error: (error: Error) => void
  notification: (notification: RWSPayload) => void
}

export type RWSEventName = keyof RWSEventMap

export type RWSEventListener<E extends RWSEventName> =
  RWSEventMap[E]
