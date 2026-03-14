import { Hono } from 'hono';
import type { AppEnv } from './types/context.js';
declare const app: Hono<AppEnv, import("hono/types").BlankSchema, "/">;
export default app;
