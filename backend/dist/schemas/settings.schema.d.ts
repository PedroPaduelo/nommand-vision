import { z } from 'zod';
export declare const updateSettingSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    key: string;
    value?: any;
}, {
    key: string;
    value?: any;
}>;
export declare const createApiKeySchema: z.ZodObject<{
    name: z.ZodString;
    permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    permissions: string[];
    expiresAt?: string | undefined;
}, {
    name: string;
    expiresAt?: string | undefined;
    permissions?: string[] | undefined;
}>;
export declare const updateApiKeySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    permissions?: string[] | undefined;
}, {
    name?: string | undefined;
    permissions?: string[] | undefined;
}>;
export declare const createWebhookSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    events: z.ZodArray<z.ZodString, "many">;
    secret: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    url: string;
    events: string[];
    secret?: string | undefined;
}, {
    name: string;
    url: string;
    events: string[];
    secret?: string | undefined;
}>;
export declare const updateWebhookSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    events: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    secret: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    secret?: string | undefined;
    name?: string | undefined;
    active?: boolean | undefined;
    url?: string | undefined;
    events?: string[] | undefined;
}, {
    secret?: string | undefined;
    name?: string | undefined;
    active?: boolean | undefined;
    url?: string | undefined;
    events?: string[] | undefined;
}>;
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
