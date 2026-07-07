export interface NotificationPayload {
    _id: string;
    ownerId: string;
    room: "public" | "private";
    title: string;
    message: string;
    link: string;
    userUniqueCode?: string;
    type?: string;
    meta: NotificationMeta;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface NotificationMeta {
    destination: string;
    channel: string;
    origin?: string;
}
export interface GetNotificationsRequest {
    channels: string[];
    origin: string;
    user_unique_code: string;
    private: string;
}
export interface GetNotificationsResponse {
    total: number;
    total_isread: number;
    total_unread: number;
    data: ChannelGroup[];
}
export interface ChannelGroup {
    channel: string;
    total: number;
    total_isread: number;
    total_unread: number;
    data: DateGroup[];
}
export interface DateGroup {
    label: string;
    notif: NotificationPayload[];
}
export interface MarkReadRequest {
    user_id: string;
    origin: string;
}
export interface MarkAllReadRequest {
    user_id: string;
    notif_ids: string[];
    origin: string;
}
export interface MarkDeleteRequest {
    user_id: string;
    origin: string;
}
export interface ApiResponse {
    status: "success" | "fail" | "error";
    code: number;
    message: string;
    data: unknown | null;
}
