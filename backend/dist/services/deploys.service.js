import { db } from '../db/index.js';
import { deploys, deployEnvVars, deployLogs, projects } from '../db/schema/index.js';
import { eq, and, desc, sql } from 'drizzle-orm';
export async function list(workspaceId, filters) {
    const conditions = [
        eq(deploys.workspaceId, workspaceId),
    ];
    if (filters.projectId) {
        conditions.push(eq(deploys.projectId, filters.projectId));
    }
    if (filters.status) {
        conditions.push(eq(deploys.status, filters.status));
    }
    if (filters.environment) {
        conditions.push(eq(deploys.environment, filters.environment));
    }
    const offset = (filters.page - 1) * filters.limit;
    const data = await db
        .select()
        .from(deploys)
        .where(and(...conditions))
        .orderBy(desc(deploys.createdAt))
        .limit(filters.limit)
        .offset(offset);
    const [{ count }] = await db
        .select({ count: sql `count(*)` })
        .from(deploys)
        .where(and(...conditions));
    return {
        data: data.map(formatDeploy),
        meta: {
            total: Number(count),
            page: filters.page,
            perPage: filters.limit,
        },
    };
}
export async function get(id) {
    const [deploy] = await db
        .select()
        .from(deploys)
        .where(eq(deploys.id, id))
        .limit(1);
    if (!deploy) {
        throw new Error('Deploy not found');
    }
    const envVars = await listEnvVars(deploy.id);
    return {
        ...formatDeploy(deploy),
        envVars: envVars.map(v => ({
            id: v.id,
            key: v.key,
            isSecret: v.isSecret,
            createdAt: v.createdAt,
        })),
    };
}
export async function create(workspaceId, userId, input) {
    const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);
    if (!project) {
        throw new Error('Project not found');
    }
    const [deploy] = await db
        .insert(deploys)
        .values({
        workspaceId,
        projectId: input.projectId,
        environment: input.environment || 'preview',
        status: 'queued',
        commitSha: input.commitSha,
        commitMessage: input.commitMessage,
        branch: input.branch || 'main',
        triggeredBy: userId,
    })
        .returning();
    return formatDeploy(deploy);
}
export async function cancel(id) {
    const [deploy] = await db
        .select()
        .from(deploys)
        .where(eq(deploys.id, id))
        .limit(1);
    if (!deploy) {
        throw new Error('Deploy not found');
    }
    if (!['queued', 'building', 'deploying'].includes(deploy.status)) {
        throw new Error('Cannot cancel deploy in current status');
    }
    const [updated] = await db
        .update(deploys)
        .set({ status: 'cancelled', completedAt: new Date() })
        .where(eq(deploys.id, id))
        .returning();
    return formatDeploy(updated);
}
export async function retry(id, userId) {
    const [original] = await db
        .select()
        .from(deploys)
        .where(eq(deploys.id, id))
        .limit(1);
    if (!original) {
        throw new Error('Deploy not found');
    }
    const [deploy] = await db
        .insert(deploys)
        .values({
        workspaceId: original.workspaceId,
        projectId: original.projectId,
        environment: original.environment,
        status: 'queued',
        commitSha: original.commitSha,
        commitMessage: `Retry: ${original.commitMessage || id}`,
        branch: original.branch,
        triggeredBy: userId,
    })
        .returning();
    return formatDeploy(deploy);
}
export async function getLogs(id) {
    await get(id);
    const logs = await db
        .select()
        .from(deployLogs)
        .where(eq(deployLogs.deployId, id))
        .orderBy(deployLogs.timestamp)
        .limit(100);
    return {
        data: logs.map(log => ({
            id: log.id,
            level: log.level,
            message: log.message,
            timestamp: log.timestamp,
        })),
    };
}
export async function streamLogs(id) {
    await get(id);
    return {
        deployId: id,
        logs: [],
        streamAvailable: true,
    };
}
export async function listEnvVars(deployId) {
    const vars = await db
        .select()
        .from(deployEnvVars)
        .where(eq(deployEnvVars.deployId, deployId));
    return vars.map(v => ({
        id: v.id,
        key: v.key,
        value: v.isSecret ? '***' : v.valueEncrypted,
        isSecret: v.isSecret,
        createdAt: v.createdAt,
    }));
}
export async function setEnvVar(deployId, input) {
    const existing = await db
        .select()
        .from(deployEnvVars)
        .where(and(eq(deployEnvVars.deployId, deployId), eq(deployEnvVars.key, input.key)))
        .limit(1);
    if (existing.length > 0) {
        const [updated] = await db
            .update(deployEnvVars)
            .set({
            valueEncrypted: input.value,
            isSecret: input.isSecret ?? true,
        })
            .where(eq(deployEnvVars.id, existing[0].id))
            .returning();
        return {
            id: updated.id,
            key: updated.key,
            isSecret: updated.isSecret,
            createdAt: updated.createdAt,
        };
    }
    const [created] = await db
        .insert(deployEnvVars)
        .values({
        deployId,
        key: input.key,
        valueEncrypted: input.value,
        isSecret: input.isSecret ?? true,
    })
        .returning();
    return {
        id: created.id,
        key: created.key,
        isSecret: created.isSecret,
        createdAt: created.createdAt,
    };
}
export async function deleteEnvVar(id) {
    const [deleted] = await db
        .delete(deployEnvVars)
        .where(eq(deployEnvVars.id, id))
        .returning();
    if (!deleted) {
        throw new Error('Env var not found');
    }
    return { success: true };
}
export async function getStats(workspaceId) {
    const rows = await db
        .select({
        status: deploys.status,
        count: sql `count(*)`,
    })
        .from(deploys)
        .where(eq(deploys.workspaceId, workspaceId))
        .groupBy(deploys.status);
    const stats = {};
    let total = 0;
    for (const row of rows) {
        stats[row.status] = Number(row.count);
        total += Number(row.count);
    }
    const successRate = total > 0 ? Math.round(((stats['success'] || 0) / total) * 100) : 0;
    return {
        total,
        byStatus: stats,
        successRate,
    };
}
function formatDeploy(deploy) {
    return {
        id: deploy.id,
        projectId: deploy.projectId,
        workspaceId: deploy.workspaceId,
        environment: deploy.environment,
        status: deploy.status,
        branch: deploy.branch,
        commitSha: deploy.commitSha,
        commitMessage: deploy.commitMessage,
        logs: deploy.logs,
        url: deploy.url,
        error: deploy.error,
        durationMs: deploy.durationMs,
        triggeredBy: deploy.triggeredBy,
        startedAt: deploy.startedAt,
        completedAt: deploy.completedAt,
        createdAt: deploy.createdAt,
    };
}
