export interface RWSConfig {
    serverUrl: string;
    projectToken: string;
    origin: string;
    autoConnect?: boolean;
    reconnection?: ReconnectionConfig;
    timeout?: number;
    logger?: Logger;
}
export interface ReconnectionConfig {
    enabled?: boolean;
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
}
export interface Logger {
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
}
export type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting";
