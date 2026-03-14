import { Context, Next } from 'hono';
/**
 * Middleware para servir arquivos estáticos (uploads, thumbnails)
 */
export declare function staticFilesMiddleware(c: Context, next: Next): Promise<(Response & import("hono").TypedResponse<NonSharedBuffer, import("hono/utils/http-status").ContentfulStatusCode, "body">) | undefined>;
export default staticFilesMiddleware;
