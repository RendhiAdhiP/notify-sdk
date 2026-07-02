import type { Logger } from "../types"
import { DEFAULT_LOGGER } from "../config/default"

export class NotificationLogger {
  private logger: Logger

  constructor(logger?: Partial<Logger>) {
    this.logger = { ...DEFAULT_LOGGER, ...logger }
  }

  info(...args: unknown[]) {
    this.logger.info(`[NotificationSDK]`, ...args)
  }

  warn(...args: unknown[]) {
    this.logger.warn(`[NotificationSDK]`, ...args)
  }

  error(...args: unknown[]) {
    this.logger.error(`[NotificationSDK]`, ...args)
  }

  debug(...args: unknown[]) {
    this.logger.debug(`[NotificationSDK]`, ...args)
  }
}
