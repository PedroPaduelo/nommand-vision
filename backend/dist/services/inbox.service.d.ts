import type { ListInboxInput } from '../schemas/inbox.schema.js';
export declare function listInbox(workspaceId: string, input: ListInboxInput): Promise<{
    data: {
        id: string;
        workspaceId: string;
        fromAgentId: string | null;
        toUserId: string | null;
        type: "info" | "error" | "warning" | "success" | "action";
        subject: string;
        body: string | null;
        read: boolean;
        archived: boolean;
        actionUrl: string | null;
        metadata: Record<string, unknown> | null;
        createdAt: Date;
    }[];
    meta: {
        total: number;
        page: number;
        perPage: number;
    };
}>;
export declare function getInbox(workspaceId: string, id: string): Promise<{
    id: string;
    workspaceId: string;
    fromAgentId: string | null;
    toUserId: string | null;
    type: "info" | "error" | "warning" | "success" | "action";
    subject: string;
    body: string | null;
    read: boolean;
    archived: boolean;
    actionUrl: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}>;
export declare function markRead(workspaceId: string, id: string): Promise<{
    id: string;
    workspaceId: string;
    fromAgentId: string | null;
    toUserId: string | null;
    type: "info" | "error" | "warning" | "success" | "action";
    subject: string;
    body: string | null;
    read: boolean;
    archived: boolean;
    actionUrl: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}>;
export declare function markAllRead(workspaceId: string): Promise<{
    success: boolean;
}>;
export declare function archiveItem(workspaceId: string, id: string): Promise<{
    id: string;
    workspaceId: string;
    fromAgentId: string | null;
    toUserId: string | null;
    type: "info" | "error" | "warning" | "success" | "action";
    subject: string;
    body: string | null;
    read: boolean;
    archived: boolean;
    actionUrl: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}>;
export declare function unarchiveItem(workspaceId: string, id: string): Promise<{
    id: string;
    workspaceId: string;
    fromAgentId: string | null;
    toUserId: string | null;
    type: "info" | "error" | "warning" | "success" | "action";
    subject: string;
    body: string | null;
    read: boolean;
    archived: boolean;
    actionUrl: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}>;
export declare function deleteItem(workspaceId: string, id: string): Promise<{
    success: boolean;
}>;
export declare function getUnreadCount(workspaceId: string): Promise<{
    unread: number;
}>;
