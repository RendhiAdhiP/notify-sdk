import type { ReconnectionConfig, Logger } from "../types"

export const DEFAULT_RECONNECTION: ReconnectionConfig = {
  enabled: true,
  maxAttempts: 10,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
}

export const DEFAULT_TIMEOUT = 10000

export const DEFAULT_LOGGER: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
}
