import pg from 'pg';
import * as schema from './schema/index.js';
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: pg.Pool;
};
