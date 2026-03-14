import { z } from 'zod';
export declare const dashboardSchema: z.ZodObject<{
    period: z.ZodDefault<z.ZodEnum<["7d", "30d", "90d"]>>;
}, "strip", z.ZodTypeAny, {
    period: "7d" | "30d" | "90d";
}, {
    period?: "7d" | "30d" | "90d" | undefined;
}>;
export declare const timeseriesSchema: z.ZodObject<{
    metric: z.ZodEnum<["deploys", "messages", "agents", "uptime", "errors"]>;
    period: z.ZodDefault<z.ZodEnum<["7d", "30d", "90d"]>>;
}, "strip", z.ZodTypeAny, {
    period: "7d" | "30d" | "90d";
    metric: "agents" | "deploys" | "messages" | "uptime" | "errors";
}, {
    metric: "agents" | "deploys" | "messages" | "uptime" | "errors";
    period?: "7d" | "30d" | "90d" | undefined;
}>;
export declare const trackEventSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    eventType: z.ZodString;
    eventData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    eventType: string;
    projectId?: string | undefined;
    eventData?: Record<string, unknown> | undefined;
}, {
    eventType: string;
    projectId?: string | undefined;
    eventData?: Record<string, unknown> | undefined;
}>;
export type DashboardInput = z.infer<typeof dashboardSchema>;
export type TimeseriesInput = z.infer<typeof timeseriesSchema>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;
