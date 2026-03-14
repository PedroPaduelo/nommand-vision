import { createMiddleware } from 'hono/factory';
export const workspaceMiddleware = createMiddleware(async (c, next) => {
    const user = c.get('user');
    if (!user || !user.workspaceId) {
        return c.json({ error: { code: 'UNAUTHORIZED', message: 'No workspace context' } }, 401);
    }
    c.set('workspaceId', user.workspaceId);
    await next();
});
