import { Hono } from 'hono';
import type { AppEnv } from '../types/context.js';
declare const automationsRouter: Hono<AppEnv, import("hono/types").BlankSchema, "/">;
export default automationsRouter;
