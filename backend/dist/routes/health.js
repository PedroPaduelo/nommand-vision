import { Hono } from 'hono';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';
const startTime = Date.now();
const health = new Hono();
health.get('/', async (c) => {
    let dbStatus = 'connected';
    let dbError;
    try {
        await db.execute(sql `SELECT 1`);
    }
    catch (error) {
        dbStatus = 'error';
        dbError = String(error);
    }
    const mem = process.memoryUsage();
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const overallStatus = dbStatus === 'connected' ? 'ok' : 'degraded';
    const payload = {
        status: overallStatus,
        version: '1.0.0',
        uptime: uptimeSeconds,
        timestamp: new Date().toISOString(),
        db: dbStatus,
        memory: {
            rss: Math.round(mem.rss / 1024 / 1024),
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        },
    };
    if (dbError) {
        payload.dbError = dbError;
    }
    return c.json(payload, overallStatus === 'ok' ? 200 : 503);
});
export default health;
