import type {
  NotificationEventName,
  NotificationEventListener,
} from "../types"

export class EventHandler {
  private listeners = new Map<NotificationEventName, Set<(...args: unknown[]) => void>>()

  on<E extends NotificationEventName>(
    event: E,
    listener: NotificationEventListener<E>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as (...args: unknown[]) => void)

    return () => this.off(event, listener as (...args: unknown[]) => void)
  }

  off<E extends NotificationEventName>(
    event: E,
    listener: NotificationEventListener<E>,
  ): void {
    this.listeners.get(event)?.delete(listener as (...args: unknown[]) => void)
  }

  emit<E extends NotificationEventName>(
    event: E,
    ...args: Parameters<NotificationEventListener<E>>
  ): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(...args)
      } catch (err) {
        console.error(`[NotificationSDK] Error in ${event} listener:`, err)
      }
    })
  }

  removeAll(): void {
    this.listeners.clear()
  }

  listenerCount(event: NotificationEventName): number {
    return this.listeners.get(event)?.size ?? 0
  }
}
