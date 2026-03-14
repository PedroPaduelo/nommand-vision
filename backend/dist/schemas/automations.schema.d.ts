import { z } from 'zod';
export declare const createAutomationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    triggerType: z.ZodEnum<["schedule", "webhook", "event", "manual"]>;
    triggerConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    actions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">>>;
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    actions: Record<string, any>[];
    triggerType: "schedule" | "webhook" | "event" | "manual";
    enabled: boolean;
    description?: string | undefined;
    triggerConfig?: Record<string, any> | undefined;
}, {
    name: string;
    triggerType: "schedule" | "webhook" | "event" | "manual";
    actions?: Record<string, any>[] | undefined;
    description?: string | undefined;
    triggerConfig?: Record<string, any> | undefined;
    enabled?: boolean | undefined;
}>;
export declare const updateAutomationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    triggerType: z.ZodOptional<z.ZodEnum<["schedule", "webhook", "event", "manual"]>>;
    triggerConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    actions: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">>;
    enabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    actions?: Record<string, any>[] | undefined;
    description?: string | undefined;
    triggerType?: "schedule" | "webhook" | "event" | "manual" | undefined;
    triggerConfig?: Record<string, any> | undefined;
    enabled?: boolean | undefined;
}, {
    name?: string | undefined;
    actions?: Record<string, any>[] | undefined;
    description?: string | undefined;
    triggerType?: "schedule" | "webhook" | "event" | "manual" | undefined;
    triggerConfig?: Record<string, any> | undefined;
    enabled?: boolean | undefined;
}>;
export declare const listAutomationsSchema: z.ZodObject<{
    triggerType: z.ZodOptional<z.ZodEnum<["schedule", "webhook", "event", "manual"]>>;
    enabled: z.ZodOptional<z.ZodEffects<z.ZodEnum<["true", "false"]>, boolean, "true" | "false">>;
    page: z.ZodDefault<z.ZodNumber>;
    perPage: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    perPage: number;
    triggerType?: "schedule" | "webhook" | "event" | "manual" | undefined;
    enabled?: boolean | undefined;
}, {
    triggerType?: "schedule" | "webhook" | "event" | "manual" | undefined;
    enabled?: "true" | "false" | undefined;
    page?: number | undefined;
    perPage?: number | undefined;
}>;
export type CreateAutomationInput = z.infer<typeof createAutomationSchema>;
export type UpdateAutomationInput = z.infer<typeof updateAutomationSchema>;
export type ListAutomationsInput = z.infer<typeof listAutomationsSchema>;
