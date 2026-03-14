import { z } from 'zod';
export declare const createSessionSchema: z.ZodObject<{
    title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    model: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    model?: string | undefined;
    projectId?: string | undefined;
}, {
    model?: string | undefined;
    projectId?: string | undefined;
    title?: string | undefined;
}>;
export declare const listSessionsSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    perPage: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    perPage: number;
    projectId?: string | undefined;
}, {
    projectId?: string | undefined;
    page?: number | undefined;
    perPage?: number | undefined;
}>;
export declare const sendMessageSchema: z.ZodObject<{
    content: z.ZodString;
    model: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string;
    model?: string | undefined;
}, {
    content: string;
    model?: string | undefined;
}>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type ListSessionsInput = z.infer<typeof listSessionsSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
