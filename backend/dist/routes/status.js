import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as statusService from '../services/status.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { createServiceSchema, updateServiceSchema, createIncidentSchema, updateIncidentSchema, listIncidentsSchema, uptimeQuerySchema, } from '../schemas/status.schema.js';
const statusRouter = new Hono();
statusRouter.use('/*', authMiddleware);
// GET /api/status — overview de todos os serviços
statusRouter.get('/', async (c) => {
    const user = c.get('user');
    try {
        const overview = await statusService.getOverview(user.workspaceId);
        return c.json({ data: overview });
    }
    catch (error) {
        console.error('Status overview error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get status overview' } }, 500);
    }
});
// GET /api/status/services/:id — detalhe de um serviço
statusRouter.get('/services/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const service = await statusService.getService(id);
        return c.json({ data: service });
    }
    catch (error) {
        if (error.message === 'Service not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Service not found' } }, 404);
        }
        console.error('Get service error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get service' } }, 500);
    }
});
// POST /api/status/services — criar serviço
statusRouter.post('/services', zValidator('json', createServiceSchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('json');
    try {
        const service = await statusService.createService(user.workspaceId, input);
        return c.json({ data: service }, 201);
    }
    catch (error) {
        console.error('Create service error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create service' } }, 500);
    }
});
// PATCH /api/status/services/:id — atualizar serviço
statusRouter.patch('/services/:id', zValidator('json', updateServiceSchema), async (c) => {
    const id = c.req.param('id');
    const input = c.req.valid('json');
    try {
        const service = await statusService.updateService(id, input);
        return c.json({ data: service });
    }
    catch (error) {
        if (error.message === 'Service not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Service not found' } }, 404);
        }
        console.error('Update service error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update service' } }, 500);
    }
});
// DELETE /api/status/services/:id — deletar serviço
statusRouter.delete('/services/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const result = await statusService.deleteService(id);
        return c.json({ data: result });
    }
    catch (error) {
        if (error.message === 'Service not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Service not found' } }, 404);
        }
        console.error('Delete service error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete service' } }, 500);
    }
});
// GET /api/status/services/:id/uptime?days=30 — histórico uptime
statusRouter.get('/services/:id/uptime', zValidator('query', uptimeQuerySchema), async (c) => {
    const id = c.req.param('id');
    const { days } = c.req.valid('query');
    try {
        const [history, percentage] = await Promise.all([
            statusService.getUptimeHistory(id, days),
            statusService.getUptimePercentage(id, days),
        ]);
        return c.json({ data: { history, ...percentage } });
    }
    catch (error) {
        console.error('Get uptime error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get uptime data' } }, 500);
    }
});
// GET /api/status/incidents — listar incidentes
statusRouter.get('/incidents', zValidator('query', listIncidentsSchema), async (c) => {
    const user = c.get('user');
    const filters = c.req.valid('query');
    try {
        const list = await statusService.listIncidents(user.workspaceId, filters);
        return c.json({ data: list });
    }
    catch (error) {
        console.error('List incidents error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list incidents' } }, 500);
    }
});
// POST /api/status/incidents — criar incidente
statusRouter.post('/incidents', zValidator('json', createIncidentSchema), async (c) => {
    const user = c.get('user');
    const input = c.req.valid('json');
    try {
        const incident = await statusService.createIncident(user.workspaceId, input);
        return c.json({ data: incident }, 201);
    }
    catch (error) {
        console.error('Create incident error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create incident' } }, 500);
    }
});
// PATCH /api/status/incidents/:id — atualizar incidente
statusRouter.patch('/incidents/:id', zValidator('json', updateIncidentSchema), async (c) => {
    const id = c.req.param('id');
    const input = c.req.valid('json');
    try {
        const incident = await statusService.updateIncident(id, input);
        return c.json({ data: incident });
    }
    catch (error) {
        if (error.message === 'Incident not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Incident not found' } }, 404);
        }
        console.error('Update incident error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update incident' } }, 500);
    }
});
// POST /api/status/incidents/:id/resolve — resolver incidente
statusRouter.post('/incidents/:id/resolve', async (c) => {
    const id = c.req.param('id');
    try {
        const incident = await statusService.resolveIncident(id);
        return c.json({ data: incident });
    }
    catch (error) {
        if (error.message === 'Incident not found') {
            return c.json({ error: { code: 'NOT_FOUND', message: 'Incident not found' } }, 404);
        }
        console.error('Resolve incident error:', error);
        return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to resolve incident' } }, 500);
    }
});
export default statusRouter;
