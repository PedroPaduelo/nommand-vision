import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as marketplaceService from '../services/marketplace.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { listMarketplaceSchema, rateItemSchema, installItemSchema } from '../schemas/marketplace.schema.js';
const marketplaceRouter = new Hono();
marketplaceRouter.use('/*', authMiddleware);
// GET /api/marketplace
marketplaceRouter.get('/', zValidator('query', listMarketplaceSchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('query');
    try {
        const result = await marketplaceService.listItems(user.workspaceId, input);
        return c.json(result);
    }
    catch (error) {
        console.error('List marketplace items error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list items' } }, 500);
    }
});
// GET /api/marketplace/installed (must come before /:id)
marketplaceRouter.get('/installed', async (c) => {
    const user = c.get('user');
    try {
        const installed = await marketplaceService.listInstalled(user.workspaceId);
        return c.json({ data: installed });
    }
    catch (error) {
        console.error('List installed items error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list installed items' } }, 500);
    }
});
// GET /api/marketplace/:id
marketplaceRouter.get('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
        const item = await marketplaceService.getItem(id, user.workspaceId);
        return c.json({ data: item });
    }
    catch (error) {
        if (error.message === 'Item not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Item not found' } }, 404);
        }
        console.error('Get marketplace item error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get item' } }, 500);
    }
});
// POST /api/marketplace/:id/install
marketplaceRouter.post('/:id/install', zValidator('json', installItemSchema), async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const input = c.req.valid('json');
    try {
        const result = await marketplaceService.installItem(user.workspaceId, id, user.id, input);
        return c.json({ data: result }, result.installed ? 201 : 200);
    }
    catch (error) {
        if (error.message === 'Item not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Item not found' } }, 404);
        }
        console.error('Install marketplace item error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to install item' } }, 500);
    }
});
// DELETE /api/marketplace/:id/uninstall
marketplaceRouter.delete('/:id/uninstall', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
        const result = await marketplaceService.uninstallItem(user.workspaceId, id);
        return c.json({ data: result });
    }
    catch (error) {
        if (error.message === 'Installation not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Installation not found' } }, 404);
        }
        console.error('Uninstall marketplace item error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to uninstall item' } }, 500);
    }
});
// POST /api/marketplace/:id/rate
marketplaceRouter.post('/:id/rate', zValidator('json', rateItemSchema), async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const input = c.req.valid('json');
    try {
        const result = await marketplaceService.rateItem(user.workspaceId, id, input);
        return c.json({ data: result });
    }
    catch (error) {
        if (error.message === 'Item not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Item not found' } }, 404);
        }
        console.error('Rate marketplace item error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to rate item' } }, 500);
    }
});
export default marketplaceRouter;
