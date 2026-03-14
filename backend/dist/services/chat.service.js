import { db } from '../db/index.js';
import { chatSessions, chatMessages } from '../db/schema/index.js';
import { eq, and, desc, sql } from 'drizzle-orm';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
export async function listSessions(workspaceId, input) {
    const conditions = [eq(chatSessions.workspaceId, workspaceId)];
    if (input.projectId) {
        conditions.push(eq(chatSessions.projectId, input.projectId));
    }
    const offset = (input.page - 1) * input.perPage;
    const list = await db
        .select()
        .from(chatSessions)
        .where(and(...conditions))
        .orderBy(desc(chatSessions.updatedAt))
        .limit(input.perPage)
        .offset(offset);
    const [{ count }] = await db
        .select({ count: sql `count(*)` })
        .from(chatSessions)
        .where(and(...conditions));
    return {
        data: list.map(formatSession),
        meta: { total: Number(count), page: input.page, perPage: input.perPage },
    };
}
export async function getSession(workspaceId, id) {
    const [session] = await db
        .select()
        .from(chatSessions)
        .where(and(eq(chatSessions.workspaceId, workspaceId), eq(chatSessions.id, id)))
        .limit(1);
    if (!session) {
        throw new Error('Session not found');
    }
    const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, id))
        .orderBy(desc(chatMessages.createdAt));
    return {
        ...formatSession(session),
        messages: messages.map(formatMessage),
    };
}
export async function createSession(workspaceId, userId, input) {
    const [session] = await db
        .insert(chatSessions)
        .values({
        workspaceId,
        userId,
        title: input.title || 'Nova conversa',
        model: input.model || DEFAULT_MODEL,
        projectId: input.projectId,
    })
        .returning();
    return formatSession(session);
}
export async function deleteSession(workspaceId, id) {
    const [session] = await db
        .delete(chatSessions)
        .where(and(eq(chatSessions.workspaceId, workspaceId), eq(chatSessions.id, id)))
        .returning();
    if (!session) {
        throw new Error('Session not found');
    }
    return { success: true };
}
export async function sendMessage(workspaceId, userId, sessionId, input) {
    await getSession(workspaceId, sessionId);
    const startTime = Date.now();
    const [userMsg] = await db
        .insert(chatMessages)
        .values({
        sessionId,
        role: 'user',
        content: input.content,
    })
        .returning();
    const mockResponse = generateMockResponse(input.content);
    const durationMs = Date.now() - startTime;
    const tokensIn = Math.ceil(input.content.length / 4);
    const tokensOut = Math.ceil(mockResponse.length / 4);
    const [assistantMsg] = await db
        .insert(chatMessages)
        .values({
        sessionId,
        role: 'assistant',
        content: mockResponse,
        tokensIn,
        tokensOut,
        durationMs,
    })
        .returning();
    await db
        .update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, sessionId));
    return {
        userMessage: formatMessage(userMsg),
        assistantMessage: formatMessage(assistantMsg),
    };
}
export async function streamMessage(workspaceId, userId, sessionId, input) {
    const result = await sendMessage(workspaceId, userId, sessionId, input);
    const words = result.assistantMessage.content.split(' ');
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            for (const word of words) {
                const chunk = word + ' ';
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
                await new Promise((resolve) => setTimeout(resolve, 30));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
        },
    });
}
function generateMockResponse(userContent) {
    const content = userContent.toLowerCase();
    if (content.includes('deploy')) {
        return 'Posso ajudar com o deploy! Qual ambiente? Producao, staging ou preview? Me diga a branch.';
    }
    if (content.includes('test')) {
        return 'Executando testes... 42 unit passing, 15 integration passing, 8 E2E passing. Todos passaram!';
    }
    if (content.includes('performance') || content.includes('otimiz')) {
        return 'Analise: 3 components com re-renders, 2 queries sem indices, 1 imagem nao otimizada. Posso corrigir.';
    }
    if (content.includes('security') || content.includes('seguranc')) {
        return 'Seguranca OK. Sem vulnerabilidades nas dependencias. Quer verificacao mais profunda?';
    }
    const responses = [
        `Sobre "${userContent.slice(0, 30)}": Posso gerar codigo, revisar, explicar conceitos ou resolver bugs.`,
        `Vou elaborar uma resposta detalhada com as melhores opcoes para isso.`,
        `Baseado no contexto do projeto, sugiro a seguinte abordagem.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}
function formatSession(session) {
    return {
        id: session.id,
        workspaceId: session.workspaceId,
        projectId: session.projectId,
        userId: session.userId,
        title: session.title,
        model: session.model,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    };
}
function formatMessage(msg) {
    return {
        id: msg.id,
        sessionId: msg.sessionId,
        role: msg.role,
        content: msg.content,
        tokensIn: msg.tokensIn,
        tokensOut: msg.tokensOut,
        durationMs: msg.durationMs,
        createdAt: msg.createdAt,
    };
}
