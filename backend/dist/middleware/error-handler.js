import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { logger } from '../lib/logger.js';
export const errorHandler = createMiddleware(async (c, next) => {
    try {
        await next();
    }
    catch (error) {
        const requestId = c.get('requestId');
        if (error instanceof HTTPException) {
            logger.warn('HTTP Exception', {
                requestId,
                status: error.status,
                message: error.message,
                path: c.req.path,
            });
            return c.json({
                error: {
                    code: 'HTTP_ERROR',
                    message: error.message,
                },
            }, error.status);
        }
        const err = error;
        logger.error('Unhandled error', {
            requestId,
            path: c.req.path,
            method: c.req.method,
            error: err.message,
            stack: err.stack,
        });
        return c.json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred',
            },
        }, 500);
    }
});
