import type { Logger } from "../types"
import { DEFAULT_LOGGER } from "../config/default"

export class RWSLogger {
  private logger: Logger

  constructor(logger?: Partial<Logger>) {
    this.logger = { ...DEFAULT_LOGGER, ...logger }
  }

  info(...args: unknown[]) {
    this.logger.info(`[RWSSDK]`, ...args)
  }

  warn(...args: unknown[]) {
    this.logger.warn(`[RWSSDK]`, ...args)
  }

  error(...args: unknown[]) {
    this.logger.error(`[RWSSDK]`, ...args)
  }

  debug(...args: unknown[]) {
    this.logger.debug(`[RWSSDK]`, ...args)
  }
}
