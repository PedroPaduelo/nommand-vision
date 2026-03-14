import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as analyticsService from '../services/analytics.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { dashboardSchema, timeseriesSchema, trackEventSchema } from '../schemas/analytics.schema.js';
const analyticsRouter = new Hono();
analyticsRouter.use('/*', authMiddleware);
analyticsRouter.get('/dashboard', zValidator('query', dashboardSchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('query');
    try {
        const data = await analyticsService.getDashboard(user.workspaceId, input);
        return c.json({ data });
    }
    catch (error) {
        console.error('Analytics dashboard error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get dashboard' } }, 500);
    }
});
analyticsRouter.get('/tokens', async (c) => {
    const user = c.get('user');
    const period = c.req.query('period') || '30d';
    try {
        const data = await analyticsService.getCostAnalysis(user.workspaceId);
        return c.json({ data });
    }
    catch (error) {
        console.error('Analytics tokens error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get token usage' } }, 500);
    }
});
analyticsRouter.get('/timeseries', zValidator('query', timeseriesSchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('query');
    try {
        const data = await analyticsService.getTimeSeries(user.workspaceId, input);
        return c.json({ data });
    }
    catch (error) {
        console.error('Analytics timeseries error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get timeseries' } }, 500);
    }
});
analyticsRouter.get('/top-projects', async (c) => {
    const user = c.get('user');
    try {
        const data = await analyticsService.getTopProjects(user.workspaceId);
        return c.json({ data });
    }
    catch (error) {
        console.error('Analytics top-projects error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get top projects' } }, 500);
    }
});
analyticsRouter.get('/top-agents', async (c) => {
    const user = c.get('user');
    try {
        const data = await analyticsService.getTopAgents(user.workspaceId);
        return c.json({ data });
    }
    catch (error) {
        console.error('Analytics top-agents error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get top agents' } }, 500);
    }
});
analyticsRouter.post('/track', zValidator('json', trackEventSchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('json');
    try {
        const data = await analyticsService.trackEvent(user.workspaceId, user.id, input);
        return c.json({ data }, 201);
    }
    catch (error) {
        console.error('Analytics track error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to track event' } }, 500);
    }
});
export default analyticsRouter;
