import { RWSEventName, RWSEventListener } from '../types';
export declare class EventHandler {
    private listeners;
    on<E extends RWSEventName>(event: E, listener: RWSEventListener<E>): () => void;
    off<E extends RWSEventName>(event: E, listener: RWSEventListener<E>): void;
    emit<E extends RWSEventName>(event: E, ...args: Parameters<RWSEventListener<E>>): void;
    removeAll(): void;
    listenerCount(event: RWSEventName): number;
}
