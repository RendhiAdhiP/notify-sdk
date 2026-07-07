import { Logger } from '../types';
export declare class NotificationLogger {
    private logger;
    constructor(logger?: Partial<Logger>);
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
    debug(...args: unknown[]): void;
}
