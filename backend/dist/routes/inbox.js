import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as inboxService from '../services/inbox.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { listInboxSchema } from '../schemas/inbox.schema.js';
const inboxRouter = new Hono();
inboxRouter.use('/*', authMiddleware);
inboxRouter.get('/', zValidator('query', listInboxSchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('query');
    try {
        const result = await inboxService.listInbox(user.workspaceId, input);
        return c.json(result);
    }
    catch (error) {
        console.error('List inbox error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list inbox' } }, 500);
    }
});
inboxRouter.get('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
        const item = await inboxService.getInbox(user.workspaceId, id);
        return c.json({ data: item });
    }
    catch (error) {
        if (error.message === 'Inbox item not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Inbox item not found' } }, 404);
        }
        console.error('Get inbox error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get inbox item' } }, 500);
    }
});
inboxRouter.get('/unread-count', async (c) => {
    const user = c.get('user');
    try {
        const result = await inboxService.getUnreadCount(user.workspaceId);
        return c.json({ data: result });
    }
    catch (error) {
        console.error('Get unread count error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get unread count' } }, 500);
    }
});
inboxRouter.post('/:id/read', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
        const item = await inboxService.markRead(user.workspaceId, id);
        return c.json({ data: item });
    }
    catch (error) {
        if (error.message === 'Inbox item not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Inbox item not found' } }, 404);
        }
        console.error('Mark read error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to mark as read' } }, 500);
    }
});
inboxRouter.post('/read-all', async (c) => {
    const user = c.get('user');
    try {
        const result = await inboxService.markAllRead(user.workspaceId);
        return c.json({ data: result });
    }
    catch (error) {
        console.error('Mark all read error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to mark all as read' } }, 500);
    }
});
inboxRouter.post('/:id/archive', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
        const item = await inboxService.archiveItem(user.workspaceId, id);
        return c.json({ data: item });
    }
    catch (error) {
        if (error.message === 'Inbox item not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Inbox item not found' } }, 404);
        }
        console.error('Archive error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to archive' } }, 500);
    }
});
inboxRouter.post('/:id/unarchive', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
        const item = await inboxService.unarchiveItem(user.workspaceId, id);
        return c.json({ data: item });
    }
    catch (error) {
        if (error.message === 'Inbox item not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Inbox item not found' } }, 404);
        }
        console.error('Unarchive error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to unarchive' } }, 500);
    }
});
inboxRouter.delete('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
        const result = await inboxService.deleteItem(user.workspaceId, id);
        return c.json({ data: result });
    }
    catch (error) {
        if (error.message === 'Inbox item not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Inbox item not found' } }, 404);
        }
        console.error('Delete inbox item error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete' } }, 500);
    }
});
export default inboxRouter;
