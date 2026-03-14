import { Hono } from 'hono';
import type { AppEnv } from '../types/context.js';
declare const settingsRouter: Hono<AppEnv, import("hono/types").BlankSchema, "/">;
export default settingsRouter;
