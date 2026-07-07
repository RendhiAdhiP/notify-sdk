import { NotificationPayload } from './notification';
export type NotificationEventMap = {
    connect: () => void;
    disconnect: (reason: string) => void;
    reconnecting: (attempt: number) => void;
    reconnected: () => void;
    error: (error: Error) => void;
    notification: (notification: NotificationPayload) => void;
};
export type NotificationEventName = keyof NotificationEventMap;
export type NotificationEventListener<E extends NotificationEventName> = NotificationEventMap[E];
