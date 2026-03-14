class WebSocketManager {
    connections = new Map();
    addConnection(userId, workspaceId, ws) {
        const existing = this.connections.get(userId) || [];
        existing.push({ ws, userId, workspaceId });
        this.connections.set(userId, existing);
    }
    removeConnection(userId, ws) {
        const existing = this.connections.get(userId);
        if (!existing)
            return;
        const filtered = existing.filter((c) => c.ws !== ws);
        if (filtered.length === 0) {
            this.connections.delete(userId);
        }
        else {
            this.connections.set(userId, filtered);
        }
    }
    sendToUser(userId, event, data) {
        const conns = this.connections.get(userId);
        if (!conns)
            return;
        const message = JSON.stringify({ event, data });
        for (const conn of conns) {
            if (conn.ws.readyState === 1) {
                conn.ws.send(message);
            }
        }
    }
    sendToWorkspace(workspaceId, event, data) {
        const message = JSON.stringify({ event, data });
        for (const conns of this.connections.values()) {
            for (const conn of conns) {
                if (conn.workspaceId === workspaceId && conn.ws.readyState === 1) {
                    conn.ws.send(message);
                }
            }
        }
    }
    broadcast(event, data) {
        const message = JSON.stringify({ event, data });
        for (const conns of this.connections.values()) {
            for (const conn of conns) {
                if (conn.ws.readyState === 1) {
                    conn.ws.send(message);
                }
            }
        }
    }
    getOnlineUsers() {
        return Array.from(this.connections.keys());
    }
    getOnlineCount() {
        return this.connections.size;
    }
}
export const wsManager = new WebSocketManager();
