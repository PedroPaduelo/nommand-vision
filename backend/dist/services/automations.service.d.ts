import type { CreateAutomationInput, UpdateAutomationInput, ListAutomationsInput } from '../schemas/automations.schema.js';
export declare function list(workspaceId: string, input: ListAutomationsInput): Promise<{
    data: {
        id: string;
        workspaceId: string;
        name: string;
        description: string | null;
        triggerType: "schedule" | "webhook" | "event" | "manual";
        triggerConfig: Record<string, any> | null;
        actions: Record<string, any>[];
        enabled: boolean;
        lastRunAt: Date | null;
        runCount: number;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
    meta: {
        total: number;
        page: number;
        perPage: number;
    };
}>;
export declare function getById(id: string): Promise<{
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    triggerType: "schedule" | "webhook" | "event" | "manual";
    triggerConfig: Record<string, any> | null;
    actions: Record<string, any>[];
    enabled: boolean;
    lastRunAt: Date | null;
    runCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function create(workspaceId: string, userId: string, input: CreateAutomationInput): Promise<{
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    triggerType: "schedule" | "webhook" | "event" | "manual";
    triggerConfig: Record<string, any> | null;
    actions: Record<string, any>[];
    enabled: boolean;
    lastRunAt: Date | null;
    runCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function update(id: string, input: UpdateAutomationInput): Promise<{
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    triggerType: "schedule" | "webhook" | "event" | "manual";
    triggerConfig: Record<string, any> | null;
    actions: Record<string, any>[];
    enabled: boolean;
    lastRunAt: Date | null;
    runCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function remove(id: string): Promise<{
    success: boolean;
}>;
export declare function toggle(id: string): Promise<{
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    triggerType: "schedule" | "webhook" | "event" | "manual";
    triggerConfig: Record<string, any> | null;
    actions: Record<string, any>[];
    enabled: boolean;
    lastRunAt: Date | null;
    runCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function trigger(id: string): Promise<{
    runId: string;
    status: string;
    durationMs: number | null;
}>;
export declare function getHistory(id: string, page?: number, perPage?: number): Promise<{
    data: {
        id: string;
        status: string;
        triggeredBy: string;
        output: Record<string, any> | null;
        error: string | null;
        durationMs: number | null;
        createdAt: Date;
    }[];
    meta: {
        total: number;
        page: number;
        perPage: number;
    };
}>;
export declare function getRun(runId: string): Promise<{
    id: string;
    automationId: string;
    status: string;
    triggeredBy: string;
    output: Record<string, any> | null;
    error: string | null;
    durationMs: number | null;
    createdAt: Date;
}>;
export declare function cancelRun(runId: string): Promise<{
    id: string;
    status: string;
}>;
