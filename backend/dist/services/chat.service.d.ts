import type { CreateSessionInput, ListSessionsInput, SendMessageInput } from '../schemas/chat.schema.js';
export declare function listSessions(workspaceId: string, input: ListSessionsInput): Promise<{
    data: {
        id: string;
        workspaceId: string;
        projectId: string | null;
        userId: string;
        title: string;
        model: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
    meta: {
        total: number;
        page: number;
        perPage: number;
    };
}>;
export declare function getSession(workspaceId: string, id: string): Promise<{
    messages: {
        id: string;
        sessionId: string;
        role: "user" | "assistant" | "system";
        content: string;
        tokensIn: number | null;
        tokensOut: number | null;
        durationMs: number | null;
        createdAt: Date;
    }[];
    id: string;
    workspaceId: string;
    projectId: string | null;
    userId: string;
    title: string;
    model: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function createSession(workspaceId: string, userId: string, input: CreateSessionInput): Promise<{
    id: string;
    workspaceId: string;
    projectId: string | null;
    userId: string;
    title: string;
    model: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteSession(workspaceId: string, id: string): Promise<{
    success: boolean;
}>;
export declare function sendMessage(workspaceId: string, userId: string, sessionId: string, input: SendMessageInput): Promise<{
    userMessage: {
        id: string;
        sessionId: string;
        role: "user" | "assistant" | "system";
        content: string;
        tokensIn: number | null;
        tokensOut: number | null;
        durationMs: number | null;
        createdAt: Date;
    };
    assistantMessage: {
        id: string;
        sessionId: string;
        role: "user" | "assistant" | "system";
        content: string;
        tokensIn: number | null;
        tokensOut: number | null;
        durationMs: number | null;
        createdAt: Date;
    };
}>;
export declare function streamMessage(workspaceId: string, userId: string, sessionId: string, input: SendMessageInput): Promise<ReadableStream>;
