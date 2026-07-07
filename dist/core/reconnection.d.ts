import { ReconnectionConfig } from '../types';
export declare class ReconnectionManager {
    private config;
    private attempt;
    private timer;
    private onAttempt;
    constructor(config?: Partial<ReconnectionConfig>);
    get enabled(): boolean;
    get maxAttempts(): number;
    get currentAttempt(): number;
    set onReconnectAttempt(handler: ((attempt: number, delay: number) => void) | null);
    reset(): void;
    clearTimer(): void;
    getDelay(): number;
    schedule(callback: () => void): boolean;
    cancel(): void;
    getConfig(): ReconnectionConfig;
}
