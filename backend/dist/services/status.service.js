import { db } from '../db/index.js';
import { services, incidents, uptimeChecks } from '../db/schema/status.js';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
export async function getOverview(workspaceId) {
    const list = await db
        .select()
        .from(services)
        .where(eq(services.workspaceId, workspaceId))
        .orderBy(services.name);
    const allOperational = list.every((s) => s.status === 'operational');
    const hasMajor = list.some((s) => s.status === 'major_outage');
    let globalStatus = 'operational';
    if (hasMajor)
        globalStatus = 'major_outage';
    else if (!allOperational)
        globalStatus = 'degraded';
    return {
        globalStatus,
        services: list.map(formatService),
    };
}
export async function getService(id) {
    const [service] = await db
        .select()
        .from(services)
        .where(eq(services.id, id))
        .limit(1);
    if (!service)
        throw new Error('Service not found');
    return formatService(service);
}
export async function createService(workspaceId, input) {
    const [service] = await db
        .insert(services)
        .values({
        workspaceId,
        name: input.name,
        description: input.description,
        url: input.url,
        type: input.type || 'api',
        status: input.status || 'operational',
    })
        .returning();
    return formatService(service);
}
export async function updateService(id, input) {
    const [service] = await db
        .update(services)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(services.id, id))
        .returning();
    if (!service)
        throw new Error('Service not found');
    return formatService(service);
}
export async function deleteService(id) {
    const [service] = await db
        .delete(services)
        .where(eq(services.id, id))
        .returning();
    if (!service)
        throw new Error('Service not found');
    return { success: true };
}
export async function updateServiceStatus(id, status, responseTimeMs) {
    const [service] = await db
        .update(services)
        .set({
        status: status,
        responseTimeMs: responseTimeMs ?? null,
        lastCheckAt: new Date(),
        updatedAt: new Date(),
    })
        .where(eq(services.id, id))
        .returning();
    if (!service)
        throw new Error('Service not found');
    return formatService(service);
}
export async function getUptimeHistory(serviceId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const checks = await db
        .select()
        .from(uptimeChecks)
        .where(and(eq(uptimeChecks.serviceId, serviceId), gte(uptimeChecks.checkedAt, since)))
        .orderBy(desc(uptimeChecks.checkedAt));
    return checks.map((c) => ({
        id: c.id,
        status: c.status,
        responseTimeMs: c.responseTimeMs,
        checkedAt: c.checkedAt,
    }));
}
export async function getUptimePercentage(serviceId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const [result] = await db
        .select({
        total: sql `count(*)`,
        up: sql `count(*) filter (where ${uptimeChecks.status} = 'up')`,
    })
        .from(uptimeChecks)
        .where(and(eq(uptimeChecks.serviceId, serviceId), gte(uptimeChecks.checkedAt, since)));
    const total = Number(result.total);
    if (total === 0)
        return { percentage: 100, total: 0, up: 0 };
    const up = Number(result.up);
    return {
        percentage: Math.round((up / total) * 10000) / 100,
        total,
        up,
    };
}
export async function listIncidents(workspaceId, filters) {
    const conditions = [eq(incidents.workspaceId, workspaceId)];
    if (filters.status) {
        conditions.push(eq(incidents.status, filters.status));
    }
    if (filters.severity) {
        conditions.push(eq(incidents.severity, filters.severity));
    }
    if (filters.serviceId) {
        conditions.push(eq(incidents.serviceId, filters.serviceId));
    }
    const list = await db
        .select()
        .from(incidents)
        .where(and(...conditions))
        .orderBy(desc(incidents.startedAt));
    return list.map(formatIncident);
}
export async function createIncident(workspaceId, input) {
    const [incident] = await db
        .insert(incidents)
        .values({
        workspaceId,
        serviceId: input.serviceId,
        title: input.title,
        description: input.description,
        severity: input.severity || 'minor',
        status: input.status || 'investigating',
    })
        .returning();
    return formatIncident(incident);
}
export async function updateIncident(id, input) {
    const [incident] = await db
        .update(incidents)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(incidents.id, id))
        .returning();
    if (!incident)
        throw new Error('Incident not found');
    return formatIncident(incident);
}
export async function resolveIncident(id) {
    const [incident] = await db
        .update(incidents)
        .set({
        status: 'resolved',
        resolvedAt: new Date(),
        updatedAt: new Date(),
    })
        .where(eq(incidents.id, id))
        .returning();
    if (!incident)
        throw new Error('Incident not found');
    return formatIncident(incident);
}
export async function recordCheck(serviceId, status, responseTimeMs) {
    const [check] = await db
        .insert(uptimeChecks)
        .values({
        serviceId,
        status: status,
        responseTimeMs,
    })
        .returning();
    await db
        .update(services)
        .set({
        status: status === 'up' ? 'operational' : status === 'degraded' ? 'degraded' : 'major_outage',
        responseTimeMs,
        lastCheckAt: new Date(),
        updatedAt: new Date(),
    })
        .where(eq(services.id, serviceId));
    return {
        id: check.id,
        status: check.status,
        responseTimeMs: check.responseTimeMs,
        checkedAt: check.checkedAt,
    };
}
function formatService(service) {
    return {
        id: service.id,
        workspaceId: service.workspaceId,
        name: service.name,
        description: service.description,
        url: service.url,
        type: service.type,
        status: service.status,
        responseTimeMs: service.responseTimeMs,
        lastCheckAt: service.lastCheckAt,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
    };
}
function formatIncident(incident) {
    return {
        id: incident.id,
        workspaceId: incident.workspaceId,
        serviceId: incident.serviceId,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        startedAt: incident.startedAt,
        resolvedAt: incident.resolvedAt,
        createdAt: incident.createdAt,
        updatedAt: incident.updatedAt,
    };
}
