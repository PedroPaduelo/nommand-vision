import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as deploysService from '../services/deploys.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { createDeploySchema, listDeploysSchema, setEnvVarSchema } from '../schemas/deploys.schema.js';
const deploysRouter = new Hono();
deploysRouter.use('/*', authMiddleware);
deploysRouter.get('/', zValidator('query', listDeploysSchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('query');
    try {
        const result = await deploysService.list(user.workspaceId, input);
        return c.json(result);
    }
    catch (error) {
        console.error('List deploys error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list deploys' } }, 500);
    }
});
deploysRouter.get('/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const deploy = await deploysService.get(id);
        return c.json({ data: deploy });
    }
    catch (error) {
        if (error.message === 'Deploy not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Deploy not found' } }, 404);
        }
        console.error('Get deploy error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get deploy' } }, 500);
    }
});
deploysRouter.post('/', zValidator('json', createDeploySchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('json');
    try {
        const deploy = await deploysService.create(user.workspaceId, user.id, input);
        return c.json({ data: deploy }, 201);
    }
    catch (error) {
        if (error.message === 'Project not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404);
        }
        console.error('Create deploy error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create deploy' } }, 500);
    }
});
deploysRouter.post('/:id/cancel', async (c) => {
    const id = c.req.param('id');
    try {
        const deploy = await deploysService.cancel(id);
        return c.json({ data: deploy });
    }
    catch (error) {
        if (error.message === 'Deploy not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Deploy not found' } }, 404);
        }
        if (error.message === 'Cannot cancel deploy in current status') {
            return c.json({ error: { code: 'INVALID_STATE', message: 'Cannot cancel deploy in current status' } }, 400);
        }
        console.error('Cancel deploy error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to cancel deploy' } }, 500);
    }
});
deploysRouter.post('/:id/retry', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
        const deploy = await deploysService.retry(id, user.id);
        return c.json({ data: deploy }, 201);
    }
    catch (error) {
        if (error.message === 'Deploy not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Deploy not found' } }, 404);
        }
        console.error('Retry deploy error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to retry deploy' } }, 500);
    }
});
deploysRouter.get('/:id/logs', async (c) => {
    const id = c.req.param('id');
    try {
        const result = await deploysService.getLogs(id);
        return c.json({ data: result });
    }
    catch (error) {
        if (error.message === 'Deploy not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Deploy not found' } }, 404);
        }
        console.error('Get logs error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get logs' } }, 500);
    }
});
deploysRouter.get('/:id/logs/stream', async (c) => {
    const id = c.req.param('id');
    try {
        await deploysService.get(id);
        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();
                const sendEvent = (data) => {
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                };
                sendEvent(`Connecting to deploy ${id}...`);
                setTimeout(() => {
                    sendEvent('Build started...');
                    sendEvent('Installing dependencies...');
                    sendEvent('Running tests...');
                    sendEvent('Building...');
                    sendEvent('Deploy complete!');
                    controller.close();
                }, 1000);
            },
        });
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    }
    catch (error) {
        if (error.message === 'Deploy not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Deploy not found' } }, 404);
        }
        console.error('Stream logs error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to stream logs' } }, 500);
    }
});
deploysRouter.get('/:id/env', async (c) => {
    const id = c.req.param('id');
    try {
        await deploysService.get(id);
        const envVars = await deploysService.listEnvVars(id);
        return c.json({ data: envVars });
    }
    catch (error) {
        if (error.message === 'Deploy not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Deploy not found' } }, 404);
        }
        console.error('List env vars error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list env vars' } }, 500);
    }
});
deploysRouter.post('/:id/env', zValidator('json', setEnvVarSchema), async (c) => {
    const id = c.req.param('id');
    const input = c.req.valid('json');
    try {
        await deploysService.get(id);
        const envVar = await deploysService.setEnvVar(id, input);
        return c.json({ data: envVar }, 201);
    }
    catch (error) {
        if (error.message === 'Deploy not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Deploy not found' } }, 404);
        }
        console.error('Set env var error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to set env var' } }, 500);
    }
});
deploysRouter.delete('/:id/env/:varId', async (c) => {
    const varId = c.req.param('varId');
    try {
        await deploysService.deleteEnvVar(varId);
        return c.json({ data: { success: true } });
    }
    catch (error) {
        if (error.message === 'Env var not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Env var not found' } }, 404);
        }
        console.error('Delete env var error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete env var' } }, 500);
    }
});
export default deploysRouter;
