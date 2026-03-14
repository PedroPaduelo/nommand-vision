import { Hono } from 'hono';
import type { AppEnv } from '../types/context.js';
declare const logsRouter: Hono<AppEnv, import("hono/types").BlankSchema, "/">;
export default logsRouter;
