import type { ListLogsInput, CreateLogInput, SearchLogsInput } from '../schemas/logs.schema.js';
export declare function list(workspaceId: string, input: ListLogsInput): Promise<{
    data: {
        id: string;
        workspaceId: string;
        projectId: string | null;
        agentId: string | null;
        level: "debug" | "info" | "warn" | "error" | "fatal";
        message: string;
        metadata: Record<string, unknown> | null;
        source: string | null;
        traceId: string | null;
        createdAt: Date;
    }[];
    meta: {
        total: number;
        page: number;
        perPage: number;
    };
}>;
export declare function getById(workspaceId: string, id: string): Promise<{
    id: string;
    workspaceId: string;
    projectId: string | null;
    agentId: string | null;
    level: "debug" | "info" | "warn" | "error" | "fatal";
    message: string;
    metadata: Record<string, unknown> | null;
    source: string | null;
    traceId: string | null;
    createdAt: Date;
}>;
export declare function create(workspaceId: string, input: CreateLogInput): Promise<{
    message: string;
    workspaceId: string;
    id: string;
    createdAt: Date;
    agentId: string | null;
    projectId: string | null;
    level: "debug" | "info" | "warn" | "error" | "fatal";
    metadata: Record<string, unknown> | null;
    source: string | null;
    traceId: string | null;
}>;
export declare function createBatch(workspaceId: string, items: CreateLogInput[]): Promise<{
    count: number;
}>;
export declare function getStats(workspaceId: string): Promise<{
    byLevel: {
        level: "debug" | "info" | "warn" | "error" | "fatal";
        count: number;
    }[];
    bySource: {
        source: string;
        count: number;
    }[];
}>;
export declare function search(workspaceId: string, input: SearchLogsInput): Promise<{
    data: {
        id: string;
        workspaceId: string;
        projectId: string | null;
        agentId: string | null;
        level: "debug" | "info" | "warn" | "error" | "fatal";
        message: string;
        metadata: Record<string, unknown> | null;
        source: string | null;
        traceId: string | null;
        createdAt: Date;
    }[];
    meta: {
        total: number;
        page: number;
        perPage: number;
    };
}>;
export declare function deleteOld(workspaceId: string, olderThanDays: number): Promise<{
    deleted: number;
}>;
