import type { CreateServiceInput, UpdateServiceInput, CreateIncidentInput, UpdateIncidentInput, ListIncidentsInput } from '../schemas/status.schema.js';
export declare function getOverview(workspaceId: string): Promise<{
    globalStatus: "operational" | "degraded" | "major_outage";
    services: {
        id: string;
        workspaceId: string;
        name: string;
        description: string | null;
        url: string | null;
        type: "api" | "database" | "worker" | "external";
        status: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
        responseTimeMs: number | null;
        lastCheckAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
}>;
export declare function getService(id: string): Promise<{
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    url: string | null;
    type: "api" | "database" | "worker" | "external";
    status: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
    responseTimeMs: number | null;
    lastCheckAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function createService(workspaceId: string, input: CreateServiceInput): Promise<{
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    url: string | null;
    type: "api" | "database" | "worker" | "external";
    status: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
    responseTimeMs: number | null;
    lastCheckAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateService(id: string, input: UpdateServiceInput): Promise<{
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    url: string | null;
    type: "api" | "database" | "worker" | "external";
    status: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
    responseTimeMs: number | null;
    lastCheckAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteService(id: string): Promise<{
    success: boolean;
}>;
export declare function updateServiceStatus(id: string, status: string, responseTimeMs?: number): Promise<{
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    url: string | null;
    type: "api" | "database" | "worker" | "external";
    status: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
    responseTimeMs: number | null;
    lastCheckAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function getUptimeHistory(serviceId: string, days?: number): Promise<{
    id: string;
    status: "degraded" | "up" | "down";
    responseTimeMs: number;
    checkedAt: Date;
}[]>;
export declare function getUptimePercentage(serviceId: string, days?: number): Promise<{
    percentage: number;
    total: number;
    up: number;
}>;
export declare function listIncidents(workspaceId: string, filters: ListIncidentsInput): Promise<{
    id: string;
    workspaceId: string;
    serviceId: string;
    title: string;
    description: string | null;
    severity: "minor" | "major" | "critical";
    status: "investigating" | "identified" | "monitoring" | "resolved";
    startedAt: Date;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function createIncident(workspaceId: string, input: CreateIncidentInput): Promise<{
    id: string;
    workspaceId: string;
    serviceId: string;
    title: string;
    description: string | null;
    severity: "minor" | "major" | "critical";
    status: "investigating" | "identified" | "monitoring" | "resolved";
    startedAt: Date;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateIncident(id: string, input: UpdateIncidentInput): Promise<{
    id: string;
    workspaceId: string;
    serviceId: string;
    title: string;
    description: string | null;
    severity: "minor" | "major" | "critical";
    status: "investigating" | "identified" | "monitoring" | "resolved";
    startedAt: Date;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function resolveIncident(id: string): Promise<{
    id: string;
    workspaceId: string;
    serviceId: string;
    title: string;
    description: string | null;
    severity: "minor" | "major" | "critical";
    status: "investigating" | "identified" | "monitoring" | "resolved";
    startedAt: Date;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function recordCheck(serviceId: string, status: string, responseTimeMs: number): Promise<{
    id: string;
    status: "degraded" | "up" | "down";
    responseTimeMs: number;
    checkedAt: Date;
}>;
