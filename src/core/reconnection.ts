import type { ReconnectionConfig } from "../types"
import { DEFAULT_RECONNECTION } from "../config/default"

export class ReconnectionManager {
  private config: ReconnectionConfig
  private attempt = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  private onAttempt: ((attempt: number, delay: number) => void) | null = null

  constructor(config?: Partial<ReconnectionConfig>) {
    this.config = { ...DEFAULT_RECONNECTION, ...config }
  }

  get enabled(): boolean {
    return this.config.enabled ?? true
  }

  get maxAttempts(): number {
    return this.config.maxAttempts ?? 10
  }

  get currentAttempt(): number {
    return this.attempt
  }

  set onReconnectAttempt(
    handler: ((attempt: number, delay: number) => void) | null,
  ) {
    this.onAttempt = handler
  }

  reset(): void {
    this.attempt = 0
    this.clearTimer()
  }

  clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  getDelay(): number {
    const initial = this.config.initialDelay ?? 1000
    const max = this.config.maxDelay ?? 30000
    const multiplier = this.config.backoffMultiplier ?? 2
    const delay = Math.min(initial * Math.pow(multiplier, this.attempt), max)
    return Math.floor(delay + Math.random() * 1000)
  }

  schedule(callback: () => void): boolean {
    if (!this.enabled) return false
    if (this.attempt >= this.maxAttempts) return false

    this.attempt++
    const delay = this.getDelay()
    this.onAttempt?.(this.attempt, delay)
    this.timer = setTimeout(callback, delay)
    return true
  }

  cancel(): void {
    this.clearTimer()
    this.reset()
  }

  getConfig(): ReconnectionConfig {
    return { ...this.config }
  }
}
