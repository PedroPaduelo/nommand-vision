import type { Server } from 'http';
export declare function setupWebSocket(server: Server): import("ws").Server<typeof import("ws"), typeof import("http").IncomingMessage>;
