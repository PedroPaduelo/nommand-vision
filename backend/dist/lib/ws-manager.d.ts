import type { WebSocket } from 'ws';
declare class WebSocketManager {
    private connections;
    addConnection(userId: string, workspaceId: string, ws: WebSocket): void;
    removeConnection(userId: string, ws: WebSocket): void;
    sendToUser(userId: string, event: string, data: unknown): void;
    sendToWorkspace(workspaceId: string, event: string, data: unknown): void;
    broadcast(event: string, data: unknown): void;
    getOnlineUsers(): string[];
    getOnlineCount(): number;
}
export declare const wsManager: WebSocketManager;
export {};
