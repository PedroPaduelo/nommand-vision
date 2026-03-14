import { z } from 'zod';
export declare const listLogsSchema: z.ZodObject<{
    level: z.ZodOptional<z.ZodEnum<["debug", "info", "warn", "error", "fatal"]>>;
    projectId: z.ZodOptional<z.ZodString>;
    agentId: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    perPage: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    perPage: number;
    agentId?: string | undefined;
    projectId?: string | undefined;
    level?: "debug" | "info" | "warn" | "error" | "fatal" | undefined;
    source?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
}, {
    agentId?: string | undefined;
    projectId?: string | undefined;
    level?: "debug" | "info" | "warn" | "error" | "fatal" | undefined;
    source?: string | undefined;
    from?: string | undefined;
    page?: number | undefined;
    perPage?: number | undefined;
    to?: string | undefined;
}>;
export declare const createLogSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    agentId: z.ZodOptional<z.ZodString>;
    level: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error", "fatal"]>>;
    message: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    source: z.ZodOptional<z.ZodString>;
    traceId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    level: "debug" | "info" | "warn" | "error" | "fatal";
    agentId?: string | undefined;
    projectId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    source?: string | undefined;
    traceId?: string | undefined;
}, {
    message: string;
    agentId?: string | undefined;
    projectId?: string | undefined;
    level?: "debug" | "info" | "warn" | "error" | "fatal" | undefined;
    metadata?: Record<string, unknown> | undefined;
    source?: string | undefined;
    traceId?: string | undefined;
}>;
export declare const createLogBatchSchema: z.ZodObject<{
    logs: z.ZodArray<z.ZodObject<{
        projectId: z.ZodOptional<z.ZodString>;
        agentId: z.ZodOptional<z.ZodString>;
        level: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error", "fatal"]>>;
        message: z.ZodString;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        source: z.ZodOptional<z.ZodString>;
        traceId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        level: "debug" | "info" | "warn" | "error" | "fatal";
        agentId?: string | undefined;
        projectId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
        source?: string | undefined;
        traceId?: string | undefined;
    }, {
        message: string;
        agentId?: string | undefined;
        projectId?: string | undefined;
        level?: "debug" | "info" | "warn" | "error" | "fatal" | undefined;
        metadata?: Record<string, unknown> | undefined;
        source?: string | undefined;
        traceId?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    logs: {
        message: string;
        level: "debug" | "info" | "warn" | "error" | "fatal";
        agentId?: string | undefined;
        projectId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
        source?: string | undefined;
        traceId?: string | undefined;
    }[];
}, {
    logs: {
        message: string;
        agentId?: string | undefined;
        projectId?: string | undefined;
        level?: "debug" | "info" | "warn" | "error" | "fatal" | undefined;
        metadata?: Record<string, unknown> | undefined;
        source?: string | undefined;
        traceId?: string | undefined;
    }[];
}>;
export declare const searchLogsSchema: z.ZodObject<{
    q: z.ZodString;
    page: z.ZodDefault<z.ZodNumber>;
    perPage: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    perPage: number;
    q: string;
}, {
    q: string;
    page?: number | undefined;
    perPage?: number | undefined;
}>;
export declare const cleanupLogsSchema: z.ZodObject<{
    olderThanDays: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    olderThanDays: number;
}, {
    olderThanDays?: number | undefined;
}>;
export type ListLogsInput = z.infer<typeof listLogsSchema>;
export type CreateLogInput = z.infer<typeof createLogSchema>;
export type CreateLogBatchInput = z.infer<typeof createLogBatchSchema>;
export type SearchLogsInput = z.infer<typeof searchLogsSchema>;
export type CleanupLogsInput = z.infer<typeof cleanupLogsSchema>;
