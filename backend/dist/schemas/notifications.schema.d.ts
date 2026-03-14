import { z } from 'zod';
export declare const notificationTypes: readonly ["deploy", "agent", "system", "alert", "billing"];
export declare const listNotificationsSchema: z.ZodObject<{
    read: z.ZodOptional<z.ZodEnum<["true", "false"]>>;
    type: z.ZodOptional<z.ZodEnum<["deploy", "agent", "system", "alert", "billing"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    perPage: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    perPage: number;
    type?: "deploy" | "system" | "agent" | "alert" | "billing" | undefined;
    read?: "true" | "false" | undefined;
}, {
    type?: "deploy" | "system" | "agent" | "alert" | "billing" | undefined;
    read?: "true" | "false" | undefined;
    page?: number | undefined;
    perPage?: number | undefined;
}>;
export declare const createNotificationSchema: z.ZodObject<{
    userId: z.ZodString;
    workspaceId: z.ZodString;
    type: z.ZodEnum<["deploy", "agent", "system", "alert", "billing"]>;
    title: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    channel: z.ZodDefault<z.ZodEnum<["in_app", "email", "push"]>>;
    link: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "deploy" | "system" | "agent" | "alert" | "billing";
    workspaceId: string;
    userId: string;
    title: string;
    channel: "push" | "email" | "in_app";
    link?: string | undefined;
    body?: string | undefined;
}, {
    type: "deploy" | "system" | "agent" | "alert" | "billing";
    workspaceId: string;
    userId: string;
    title: string;
    link?: string | undefined;
    body?: string | undefined;
    channel?: "push" | "email" | "in_app" | undefined;
}>;
export declare const updatePreferencesSchema: z.ZodObject<{
    type: z.ZodString;
    inApp: z.ZodDefault<z.ZodBoolean>;
    email: z.ZodDefault<z.ZodBoolean>;
    push: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: string;
    push: boolean;
    email: boolean;
    inApp: boolean;
}, {
    type: string;
    push?: boolean | undefined;
    email?: boolean | undefined;
    inApp?: boolean | undefined;
}>;
export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
