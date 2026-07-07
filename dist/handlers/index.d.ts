import { NotificationEventName, NotificationEventListener } from '../types';
export declare class EventHandler {
    private listeners;
    on<E extends NotificationEventName>(event: E, listener: NotificationEventListener<E>): () => void;
    off<E extends NotificationEventName>(event: E, listener: NotificationEventListener<E>): void;
    emit<E extends NotificationEventName>(event: E, ...args: Parameters<NotificationEventListener<E>>): void;
    removeAll(): void;
    listenerCount(event: NotificationEventName): number;
}
