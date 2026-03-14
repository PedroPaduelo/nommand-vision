import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as agentsService from '../services/agents.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { createAgentSchema, updateAgentSchema, listAgentsSchema, runAgentSchema } from '../schemas/agents.schema.js';
const agentsRouter = new Hono();
agentsRouter.use('/*', authMiddleware);
agentsRouter.get('/', zValidator('query', listAgentsSchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('query');
    try {
        const result = await agentsService.list(user.workspaceId, input);
        return c.json(result);
    }
    catch (error) {
        console.error('List agents error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list agents' } }, 500);
    }
});
agentsRouter.get('/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const agent = await agentsService.get(id);
        return c.json({ data: agent });
    }
    catch (error) {
        if (error.message === 'Agent not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404);
        }
        console.error('Get agent error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get agent' } }, 500);
    }
});
agentsRouter.post('/', zValidator('json', createAgentSchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('json');
    try {
        const agent = await agentsService.create(user.workspaceId, user.id, input);
        return c.json({ data: agent }, 201);
    }
    catch (error) {
        console.error('Create agent error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create agent' } }, 500);
    }
});
agentsRouter.patch('/:id', zValidator('json', updateAgentSchema), async (c) => {
    const id = c.req.param('id');
    const input = c.req.valid('json');
    try {
        const agent = await agentsService.update(id, input);
        return c.json({ data: agent });
    }
    catch (error) {
        if (error.message === 'Agent not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404);
        }
        console.error('Update agent error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update agent' } }, 500);
    }
});
agentsRouter.delete('/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const result = await agentsService.remove(id);
        return c.json({ data: result });
    }
    catch (error) {
        if (error.message === 'Agent not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404);
        }
        console.error('Delete agent error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete agent' } }, 500);
    }
});
agentsRouter.post('/:id/toggle', async (c) => {
    const id = c.req.param('id');
    try {
        const agent = await agentsService.toggle(id);
        return c.json({ data: agent });
    }
    catch (error) {
        if (error.message === 'Agent not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404);
        }
        console.error('Toggle agent error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to toggle agent' } }, 500);
    }
});
agentsRouter.get('/:id/stats', async (c) => {
    const id = c.req.param('id');
    try {
        const stats = await agentsService.getStats(id);
        return c.json({ data: stats });
    }
    catch (error) {
        if (error.message === 'Agent not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404);
        }
        console.error('Get agent stats error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' } }, 500);
    }
});
agentsRouter.post('/:id/run', zValidator('json', runAgentSchema), async (c) => {
    const id = c.req.param('id');
    const user = c.get('user');
    const input = c.req.valid('json');
    try {
        const result = await agentsService.run(id, {
            ...input,
            userId: input.userId || user.id,
        });
        return c.json({ data: result });
    }
    catch (error) {
        if (error.message === 'Agent not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404);
        }
        if (error.message === 'Agent is not active') {
            return c.json({ error: { code: 'INVALID_STATE', message: 'Agent is not active' } }, 400);
        }
        console.error('Run agent error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to run agent' } }, 500);
    }
});
agentsRouter.get('/:id/runs', async (c) => {
    const id = c.req.param('id');
    const page = Number(c.req.query('page') || '1');
    const limit = Number(c.req.query('limit') || '20');
    try {
        const result = await agentsService.listRuns(id, { page, limit });
        return c.json(result);
    }
    catch (error) {
        console.error('List agent runs error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list runs' } }, 500);
    }
});
agentsRouter.get('/runs/:runId', async (c) => {
    const runId = c.req.param('runId');
    try {
        const run = await agentsService.getRun(runId);
        return c.json({ data: run });
    }
    catch (error) {
        if (error.message === 'Run not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Run not found' } }, 404);
        }
        console.error('Get run error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get run' } }, 500);
    }
});
export default agentsRouter;
