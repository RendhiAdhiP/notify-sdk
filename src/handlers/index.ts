import type {
  RWSEventName,
  RWSEventListener,
} from "../types"

export class EventHandler {
  private listeners = new Map<RWSEventName, Set<(...args: unknown[]) => void>>()

  on<E extends RWSEventName>(
    event: E,
    listener: RWSEventListener<E>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as (...args: unknown[]) => void)

    return () => this.off(event, listener as (...args: unknown[]) => void)
  }

  off<E extends RWSEventName>(
    event: E,
    listener: RWSEventListener<E>,
  ): void {
    this.listeners.get(event)?.delete(listener as (...args: unknown[]) => void)
  }

  emit<E extends RWSEventName>(
    event: E,
    ...args: Parameters<RWSEventListener<E>>
  ): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(...args)
      } catch (err) {
        console.error(`[RWSSDK] Error in ${event} listener:`, err)
      }
    })
  }

  removeAll(): void {
    this.listeners.clear()
  }

  listenerCount(event: RWSEventName): number {
    return this.listeners.get(event)?.size ?? 0
  }
}
