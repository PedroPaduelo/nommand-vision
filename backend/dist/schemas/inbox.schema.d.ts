import { z } from 'zod';
export declare const listInboxSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["info", "warning", "error", "success", "action"]>>;
    read: z.ZodOptional<z.ZodEnum<["true", "false"]>>;
    archived: z.ZodDefault<z.ZodOptional<z.ZodEnum<["true", "false"]>>>;
    page: z.ZodDefault<z.ZodNumber>;
    perPage: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    archived: "true" | "false";
    page: number;
    perPage: number;
    type?: "info" | "error" | "warning" | "success" | "action" | undefined;
    read?: "true" | "false" | undefined;
}, {
    type?: "info" | "error" | "warning" | "success" | "action" | undefined;
    read?: "true" | "false" | undefined;
    archived?: "true" | "false" | undefined;
    page?: number | undefined;
    perPage?: number | undefined;
}>;
export declare const createInboxSchema: z.ZodObject<{
    toUserId: z.ZodOptional<z.ZodString>;
    fromAgentId: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "success", "action"]>>;
    subject: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    actionUrl: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "info" | "error" | "warning" | "success" | "action";
    subject: string;
    metadata?: Record<string, unknown> | undefined;
    fromAgentId?: string | undefined;
    toUserId?: string | undefined;
    body?: string | undefined;
    actionUrl?: string | undefined;
}, {
    subject: string;
    type?: "info" | "error" | "warning" | "success" | "action" | undefined;
    metadata?: Record<string, unknown> | undefined;
    fromAgentId?: string | undefined;
    toUserId?: string | undefined;
    body?: string | undefined;
    actionUrl?: string | undefined;
}>;
export type ListInboxInput = z.infer<typeof listInboxSchema>;
export type CreateInboxInput = z.infer<typeof createInboxSchema>;
