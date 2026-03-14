import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as settingsService from '../services/settings.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { createApiKeySchema, createWebhookSchema, updateWebhookSchema } from '../schemas/settings.schema.js';
const settingsRouter = new Hono();
settingsRouter.use('/*', authMiddleware);
// GET /api/settings
settingsRouter.get('/', async (c) => {
    const user = c.get('user');
    try {
        const settings = await settingsService.getSettings(user.workspaceId);
        return c.json({ data: settings });
    }
    catch (error) {
        console.error('Get settings error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get settings' } }, 500);
    }
});
// PATCH /api/settings/:key
settingsRouter.patch('/:key', async (c) => {
    const user = c.get('user');
    const key = c.req.param('key');
    const value = await c.req.json();
    try {
        const result = await settingsService.updateSetting(user.workspaceId, key, value);
        return c.json({ data: result });
    }
    catch (error) {
        console.error('Update setting error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update setting' } }, 500);
    }
});
// GET /api/settings/api-keys
settingsRouter.get('/api-keys', async (c) => {
    const user = c.get('user');
    try {
        const apiKeys = await settingsService.listApiKeys(user.workspaceId);
        return c.json({ data: apiKeys });
    }
    catch (error) {
        console.error('List API keys error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list API keys' } }, 500);
    }
});
// POST /api/settings/api-keys
settingsRouter.post('/api-keys', zValidator('json', createApiKeySchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('json');
    try {
        const apiKey = await settingsService.createApiKey(user.workspaceId, input);
        return c.json({ data: apiKey }, 201);
    }
    catch (error) {
        console.error('Create API key error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create API key' } }, 500);
    }
});
// DELETE /api/settings/api-keys/:id
settingsRouter.delete('/api-keys/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const result = await settingsService.revokeApiKey(id);
        return c.json({ data: result });
    }
    catch (error) {
        if (error.message === 'API key not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'API key not found' } }, 404);
        }
        console.error('Revoke API key error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke API key' } }, 500);
    }
});
// GET /api/settings/webhooks
settingsRouter.get('/webhooks', async (c) => {
    const user = c.get('user');
    try {
        const webhooks = await settingsService.listWebhooks(user.workspaceId);
        return c.json({ data: webhooks });
    }
    catch (error) {
        console.error('List webhooks error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list webhooks' } }, 500);
    }
});
// POST /api/settings/webhooks
settingsRouter.post('/webhooks', zValidator('json', createWebhookSchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('json');
    try {
        const webhook = await settingsService.createWebhook(user.workspaceId, input);
        return c.json({ data: webhook }, 201);
    }
    catch (error) {
        console.error('Create webhook error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create webhook' } }, 500);
    }
});
// PATCH /api/settings/webhooks/:id
settingsRouter.patch('/webhooks/:id', zValidator('json', updateWebhookSchema), async (c) => {
    const id = c.req.param('id');
    const input = c.req.valid('json');
    try {
        const webhook = await settingsService.updateWebhook(id, input);
        return c.json({ data: webhook });
    }
    catch (error) {
        if (error.message === 'Webhook not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Webhook not found' } }, 404);
        }
        console.error('Update webhook error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update webhook' } }, 500);
    }
});
// DELETE /api/settings/webhooks/:id
settingsRouter.delete('/webhooks/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const result = await settingsService.deleteWebhook(id);
        return c.json({ data: result });
    }
    catch (error) {
        if (error.message === 'Webhook not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Webhook not found' } }, 404);
        }
        console.error('Delete webhook error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete webhook' } }, 500);
    }
});
// POST /api/settings/webhooks/:id/test
settingsRouter.post('/webhooks/:id/test', async (c) => {
    const id = c.req.param('id');
    try {
        const result = await settingsService.testWebhook(id);
        return c.json({ data: result });
    }
    catch (error) {
        if (error.message === 'Webhook not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Webhook not found' } }, 404);
        }
        console.error('Test webhook error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to test webhook' } }, 500);
    }
});
export default settingsRouter;
