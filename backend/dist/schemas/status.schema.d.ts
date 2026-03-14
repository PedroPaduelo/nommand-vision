import { z } from 'zod';
export declare const createServiceSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["api", "database", "worker", "external"]>>;
    status: z.ZodOptional<z.ZodEnum<["operational", "degraded", "partial_outage", "major_outage", "maintenance"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type?: "api" | "database" | "worker" | "external" | undefined;
    status?: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance" | undefined;
    description?: string | undefined;
    url?: string | undefined;
}, {
    name: string;
    type?: "api" | "database" | "worker" | "external" | undefined;
    status?: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance" | undefined;
    description?: string | undefined;
    url?: string | undefined;
}>;
export declare const updateServiceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodOptional<z.ZodEnum<["api", "database", "worker", "external"]>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["operational", "degraded", "partial_outage", "major_outage", "maintenance"]>>>;
}, "strip", z.ZodTypeAny, {
    type?: "api" | "database" | "worker" | "external" | undefined;
    status?: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance" | undefined;
    name?: string | undefined;
    description?: string | undefined;
    url?: string | undefined;
}, {
    type?: "api" | "database" | "worker" | "external" | undefined;
    status?: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance" | undefined;
    name?: string | undefined;
    description?: string | undefined;
    url?: string | undefined;
}>;
export declare const createIncidentSchema: z.ZodObject<{
    serviceId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<["minor", "major", "critical"]>>;
    status: z.ZodOptional<z.ZodEnum<["investigating", "identified", "monitoring", "resolved"]>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    serviceId: string;
    status?: "investigating" | "identified" | "monitoring" | "resolved" | undefined;
    description?: string | undefined;
    severity?: "minor" | "major" | "critical" | undefined;
}, {
    title: string;
    serviceId: string;
    status?: "investigating" | "identified" | "monitoring" | "resolved" | undefined;
    description?: string | undefined;
    severity?: "minor" | "major" | "critical" | undefined;
}>;
export declare const updateIncidentSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<["minor", "major", "critical"]>>;
    status: z.ZodOptional<z.ZodEnum<["investigating", "identified", "monitoring", "resolved"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "investigating" | "identified" | "monitoring" | "resolved" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    severity?: "minor" | "major" | "critical" | undefined;
}, {
    status?: "investigating" | "identified" | "monitoring" | "resolved" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    severity?: "minor" | "major" | "critical" | undefined;
}>;
export declare const listIncidentsSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["investigating", "identified", "monitoring", "resolved"]>>;
    severity: z.ZodOptional<z.ZodEnum<["minor", "major", "critical"]>>;
    serviceId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "investigating" | "identified" | "monitoring" | "resolved" | undefined;
    serviceId?: string | undefined;
    severity?: "minor" | "major" | "critical" | undefined;
}, {
    status?: "investigating" | "identified" | "monitoring" | "resolved" | undefined;
    serviceId?: string | undefined;
    severity?: "minor" | "major" | "critical" | undefined;
}>;
export declare const uptimeQuerySchema: z.ZodObject<{
    days: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    days: number;
}, {
    days?: number | undefined;
}>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type ListIncidentsInput = z.infer<typeof listIncidentsSchema>;
