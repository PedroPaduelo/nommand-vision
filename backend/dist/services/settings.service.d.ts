import type { CreateApiKeyInput, CreateWebhookInput, UpdateWebhookInput } from '../schemas/settings.schema.js';
export declare function getSettings(workspaceId: string): Promise<Record<string, any>>;
export declare function updateSetting(workspaceId: string, key: string, value: any): Promise<{
    key: string;
    value: any;
}>;
export declare function listApiKeys(workspaceId: string): Promise<{
    id: string;
    name: string;
    prefix: string;
    permissions: string[] | null;
    lastUsedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
}[]>;
export declare function createApiKey(workspaceId: string, input: CreateApiKeyInput): Promise<{
    id: string;
    name: string;
    key: string;
    prefix: string;
    permissions: string[] | null;
    expiresAt: Date | null;
    createdAt: Date;
}>;
export declare function revokeApiKey(id: string): Promise<{
    success: boolean;
}>;
export declare function listWebhooks(workspaceId: string): Promise<{
    id: string;
    name: string;
    url: string;
    events: string[] | null;
    active: boolean;
    lastTriggeredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function createWebhook(workspaceId: string, input: CreateWebhookInput): Promise<{
    id: string;
    name: string;
    url: string;
    events: string[] | null;
    active: boolean;
    lastTriggeredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateWebhook(id: string, input: UpdateWebhookInput): Promise<{
    id: string;
    name: string;
    url: string;
    events: string[] | null;
    active: boolean;
    lastTriggeredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteWebhook(id: string): Promise<{
    success: boolean;
}>;
export declare function testWebhook(id: string): Promise<{
    success: boolean;
    status: number;
    message: any;
}>;
