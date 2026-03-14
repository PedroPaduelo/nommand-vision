import type { AppEnv } from '../types/context.js';
export declare function rateLimit(opts?: {
    windowMs?: number;
    max?: number;
}): import("hono").MiddlewareHandler<AppEnv, string, {}, Response>;
export declare const authRateLimit: import("hono").MiddlewareHandler<AppEnv, string, {}, Response>;
export declare const apiRateLimit: import("hono").MiddlewareHandler<AppEnv, string, {}, Response>;
