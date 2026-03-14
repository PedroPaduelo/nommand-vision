import type { ListNotificationsInput, CreateNotificationInput, UpdatePreferencesInput } from '../schemas/notifications.schema.js';
export declare function list(userId: string, input: ListNotificationsInput): Promise<{
    data: {
        id: string;
        workspaceId: string;
        userId: string;
        type: "deploy" | "system" | "agent" | "alert" | "billing";
        title: string;
        body: string | null;
        channel: "push" | "email" | "in_app";
        read: boolean;
        link: string | null;
        createdAt: Date;
    }[];
    meta: {
        total: number;
        page: number;
        perPage: number;
    };
}>;
export declare function markRead(id: string, userId: string): Promise<{
    id: string;
    workspaceId: string;
    userId: string;
    type: "deploy" | "system" | "agent" | "alert" | "billing";
    title: string;
    body: string | null;
    channel: "push" | "email" | "in_app";
    read: boolean;
    link: string | null;
    createdAt: Date;
}>;
export declare function markAllRead(userId: string): Promise<{
    success: boolean;
}>;
export declare function remove(id: string, userId: string): Promise<{
    success: boolean;
}>;
export declare function removeAll(userId: string): Promise<{
    success: boolean;
}>;
export declare function getUnreadCount(userId: string): Promise<{
    count: number;
}>;
export declare function create(input: CreateNotificationInput): Promise<{
    id: string;
    workspaceId: string;
    userId: string;
    type: "deploy" | "system" | "agent" | "alert" | "billing";
    title: string;
    body: string | null;
    channel: "push" | "email" | "in_app";
    read: boolean;
    link: string | null;
    createdAt: Date;
}>;
export declare function getPreferences(userId: string): Promise<{
    type: string;
    inApp: boolean;
    email: boolean;
    push: boolean;
    updatedAt: Date;
}[]>;
export declare function updatePreferences(userId: string, input: UpdatePreferencesInput): Promise<{
    type: string;
    inApp: boolean;
    email: boolean;
    push: boolean;
    updatedAt: Date;
}>;
