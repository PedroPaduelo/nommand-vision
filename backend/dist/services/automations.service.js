import { db } from '../db/index.js';
import { automations, automationRuns } from '../db/schema/index.js';
import { eq, and, desc, sql } from 'drizzle-orm';
export async function list(workspaceId, input) {
    const conditions = [eq(automations.workspaceId, workspaceId)];
    if (input.triggerType) {
        conditions.push(eq(automations.triggerType, input.triggerType));
    }
    if (input.enabled !== undefined) {
        conditions.push(eq(automations.enabled, input.enabled));
    }
    const offset = (input.page - 1) * input.perPage;
    const data = await db
        .select()
        .from(automations)
        .where(and(...conditions))
        .orderBy(desc(automations.updatedAt))
        .limit(input.perPage)
        .offset(offset);
    const [{ count }] = await db
        .select({ count: sql `count(*)` })
        .from(automations)
        .where(and(...conditions));
    return {
        data: data.map(formatAutomation),
        meta: {
            total: Number(count),
            page: input.page,
            perPage: input.perPage,
        },
    };
}
export async function getById(id) {
    const [automation] = await db.select().from(automations).where(eq(automations.id, id)).limit(1);
    if (!automation) {
        throw new Error('Automation not found');
    }
    return formatAutomation(automation);
}
export async function create(workspaceId, userId, input) {
    const [automation] = await db
        .insert(automations)
        .values({
        workspaceId,
        name: input.name,
        description: input.description,
        triggerType: input.triggerType,
        triggerConfig: input.triggerConfig,
        actions: input.actions,
        enabled: input.enabled,
        createdBy: userId,
    })
        .returning();
    return formatAutomation(automation);
}
export async function update(id, input) {
    const [automation] = await db
        .update(automations)
        .set({
        ...input,
        updatedAt: new Date(),
    })
        .where(eq(automations.id, id))
        .returning();
    if (!automation) {
        throw new Error('Automation not found');
    }
    return formatAutomation(automation);
}
export async function remove(id) {
    const [automation] = await db
        .delete(automations)
        .where(eq(automations.id, id))
        .returning();
    if (!automation) {
        throw new Error('Automation not found');
    }
    return { success: true };
}
export async function toggle(id) {
    const [existing] = await db.select().from(automations).where(eq(automations.id, id)).limit(1);
    if (!existing) {
        throw new Error('Automation not found');
    }
    const [automation] = await db
        .update(automations)
        .set({
        enabled: !existing.enabled,
        updatedAt: new Date(),
    })
        .where(eq(automations.id, id))
        .returning();
    return formatAutomation(automation);
}
export async function trigger(id) {
    const [automation] = await db.select().from(automations).where(eq(automations.id, id)).limit(1);
    if (!automation) {
        throw new Error('Automation not found');
    }
    const startTime = Date.now();
    const [run] = await db
        .insert(automationRuns)
        .values({
        automationId: id,
        status: 'success',
        triggeredBy: 'manual',
        output: { message: 'Executed successfully', actions: automation.actions },
        durationMs: Date.now() - startTime,
    })
        .returning();
    await db
        .update(automations)
        .set({
        lastRunAt: new Date(),
        runCount: sql `${automations.runCount} + 1`,
        updatedAt: new Date(),
    })
        .where(eq(automations.id, id));
    return {
        runId: run.id,
        status: run.status,
        durationMs: run.durationMs,
    };
}
export async function getHistory(id, page = 1, perPage = 20) {
    const offset = (page - 1) * perPage;
    const data = await db
        .select()
        .from(automationRuns)
        .where(eq(automationRuns.automationId, id))
        .orderBy(desc(automationRuns.createdAt))
        .limit(perPage)
        .offset(offset);
    const [{ count }] = await db
        .select({ count: sql `count(*)` })
        .from(automationRuns)
        .where(eq(automationRuns.automationId, id));
    return {
        data: data.map(r => ({
            id: r.id,
            status: r.status,
            triggeredBy: r.triggeredBy,
            output: r.output,
            error: r.error,
            durationMs: r.durationMs,
            createdAt: r.createdAt,
        })),
        meta: {
            total: Number(count),
            page,
            perPage,
        },
    };
}
export async function getRun(runId) {
    const [run] = await db
        .select()
        .from(automationRuns)
        .where(eq(automationRuns.id, runId))
        .limit(1);
    if (!run) {
        throw new Error('Run not found');
    }
    return {
        id: run.id,
        automationId: run.automationId,
        status: run.status,
        triggeredBy: run.triggeredBy,
        output: run.output,
        error: run.error,
        durationMs: run.durationMs,
        createdAt: run.createdAt,
    };
}
export async function cancelRun(runId) {
    const [run] = await db
        .select()
        .from(automationRuns)
        .where(eq(automationRuns.id, runId))
        .limit(1);
    if (!run) {
        throw new Error('Run not found');
    }
    if (run.status !== 'running') {
        throw new Error('Run is not running');
    }
    const [updated] = await db
        .update(automationRuns)
        .set({ status: 'cancelled' })
        .where(eq(automationRuns.id, runId))
        .returning();
    return {
        id: updated.id,
        status: updated.status,
    };
}
function formatAutomation(a) {
    return {
        id: a.id,
        workspaceId: a.workspaceId,
        name: a.name,
        description: a.description,
        triggerType: a.triggerType,
        triggerConfig: a.triggerConfig,
        actions: a.actions,
        enabled: a.enabled,
        lastRunAt: a.lastRunAt,
        runCount: a.runCount,
        createdBy: a.createdBy,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
    };
}
