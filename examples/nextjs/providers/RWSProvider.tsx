'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { type ConnectionState, type NotificationItem, type NotificationListData, RWSClient } from 'rws-js';

import { getRWSClient } from '../lib/rws';

interface RWSContextValue {
    client: RWSClient | null;
    connectionState: ConnectionState;
    notifications: NotificationListData | null;
    unreadCount: number;
    connect: (userUniqueCode: string) => Promise<void>;
    disconnect: () => void;
    refresh: () => Promise<void>;
    markAsRead: (notifId: string) => Promise<void>;
    markAllAsRead: (notifIds: string[]) => Promise<void>;
}

const RWSContext = createContext<RWSContextValue | null>(null);

export function useRWS(): RWSContextValue {
    const ctx = useContext(RWSContext);
    if (!ctx) {
        throw new Error('useRWS must be used within RWSProvider');
    }
    return ctx;
}

interface Props {
    children: ReactNode;
    channels: string[];
    origin: string;
}

export function RWSProvider({ children, channels, origin }: Props) {
    const [client] = useState(() => getRWSClient());
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [notifications, setNotifications] = useState<NotificationListData | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userUniqueCode, setUserUniqueCode] = useState<string | null>(null);
    const userUniqueCodeRef = useRef<string | null>(null);

    useEffect(() => {
        const unsub1 = client.on('connect', () => {
            setConnectionState('connected');
        });
        const unsub2 = client.on('disconnect', () => {
            setConnectionState('disconnected');
        });
        const unsub3 = client.on('reconnecting', () => {
            setConnectionState('reconnecting');
        });
        const unsub4 = client.on('error', (err) => {
            console.error('[RWS] Error:', err);
        });
        const unsub5 = client.on('notification', (payload) => {
            const notif = payload.data ?? (payload as unknown as NotificationItem);
            refresh().catch((err) => console.error('[RWS] Refresh after new notification failed:', err));
        });

        const unsub6 = client.on('notification_list', (data) => {
            console.log('[RWS] Notification List:', data);
            setNotifications(data);
            setUnreadCount(data.total_unread ?? 0);
        });


        return () => {
            unsub1();
            unsub2();
            unsub3();
            unsub4();
            unsub5();
            unsub6();
        };
    }, [client]);

    useEffect(() => {
        if (notifications) {
            setUnreadCount(notifications.total_unread ?? 0);
        }
        console.log('notifications', notifications);
    }, [notifications]);

    const connect = useCallback(
        async (userId: string) => {
            setUserUniqueCode(userId);
            userUniqueCodeRef.current = userId;
            await client.connect();

            for (const channel of channels) {
                client.join(origin, channel, userId);
            }
        },
        [client, channels, origin],
    );

    const disconnect = useCallback(() => {
        client.leaveAll();
        client.disconnect();
        setNotifications(null);
        setUnreadCount(0);
        setUserUniqueCode(null);
        userUniqueCodeRef.current = null;
    }, [client]);

    const refresh = useCallback(async () => {
        if (!userUniqueCodeRef.current) return;

        const result = (await client.getNotifications(channels, userUniqueCodeRef.current)) as NotificationListData;

        setNotifications(result);
        setUnreadCount(result?.total_unread ?? 0);
    }, [client, channels]);

    const markAsRead = useCallback(
        async (notifId: string) => {
            if (!userUniqueCode) return;
            await client.markAsRead(notifId, userUniqueCode);
            refresh();
        },
        [client, userUniqueCode],
    );

    const markAllAsRead = useCallback(
        async (notifIds: string[]) => {
            if (!userUniqueCode) return;
            await client.markAllAsRead(notifIds, userUniqueCode);
            refresh();
        },
        [client, userUniqueCode],
    );

    return (
        <RWSContext.Provider
            value={{
                client,
                connectionState,
                notifications,
                unreadCount,
                connect,
                disconnect,
                refresh,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </RWSContext.Provider>
    );
}
