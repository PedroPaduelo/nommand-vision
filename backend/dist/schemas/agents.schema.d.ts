import { z } from 'zod';
export declare const createAgentSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["assistant", "custom", "tool", "supervisor"]>>;
    model: z.ZodOptional<z.ZodString>;
    systemPrompt: z.ZodOptional<z.ZodString>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    iconColor: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    category: z.ZodDefault<z.ZodOptional<z.ZodEnum<["dev", "review", "qa", "deploy", "custom"]>>>;
}, "strip", z.ZodTypeAny, {
    type: "custom" | "assistant" | "tool" | "supervisor";
    name: string;
    isActive: boolean;
    category: "custom" | "dev" | "review" | "qa" | "deploy";
    description?: string | undefined;
    iconColor?: string | undefined;
    model?: string | undefined;
    systemPrompt?: string | undefined;
    config?: Record<string, unknown> | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    tools?: string[] | undefined;
}, {
    name: string;
    type?: "custom" | "assistant" | "tool" | "supervisor" | undefined;
    description?: string | undefined;
    iconColor?: string | undefined;
    model?: string | undefined;
    systemPrompt?: string | undefined;
    config?: Record<string, unknown> | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    tools?: string[] | undefined;
    isActive?: boolean | undefined;
    category?: "custom" | "dev" | "review" | "qa" | "deploy" | undefined;
}>;
export declare const updateAgentSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodDefault<z.ZodEnum<["assistant", "custom", "tool", "supervisor"]>>>;
    model: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    systemPrompt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    config: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    temperature: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    maxTokens: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    tools: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    iconColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    category: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<["dev", "review", "qa", "deploy", "custom"]>>>>;
}, "strip", z.ZodTypeAny, {
    type?: "custom" | "assistant" | "tool" | "supervisor" | undefined;
    name?: string | undefined;
    description?: string | undefined;
    iconColor?: string | undefined;
    model?: string | undefined;
    systemPrompt?: string | undefined;
    config?: Record<string, unknown> | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    tools?: string[] | undefined;
    isActive?: boolean | undefined;
    category?: "custom" | "dev" | "review" | "qa" | "deploy" | undefined;
}, {
    type?: "custom" | "assistant" | "tool" | "supervisor" | undefined;
    name?: string | undefined;
    description?: string | undefined;
    iconColor?: string | undefined;
    model?: string | undefined;
    systemPrompt?: string | undefined;
    config?: Record<string, unknown> | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    tools?: string[] | undefined;
    isActive?: boolean | undefined;
    category?: "custom" | "dev" | "review" | "qa" | "deploy" | undefined;
}>;
export declare const listAgentsSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<["dev", "review", "qa", "deploy", "custom"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "error"]>>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "error" | "active" | "inactive" | undefined;
    search?: string | undefined;
    category?: "custom" | "dev" | "review" | "qa" | "deploy" | undefined;
}, {
    status?: "error" | "active" | "inactive" | undefined;
    search?: string | undefined;
    category?: "custom" | "dev" | "review" | "qa" | "deploy" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const runAgentSchema: z.ZodObject<{
    input: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    input: string;
    userId?: string | undefined;
    projectId?: string | undefined;
}, {
    input: string;
    userId?: string | undefined;
    projectId?: string | undefined;
}>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type ListAgentsInput = z.infer<typeof listAgentsSchema>;
export type RunAgentInput = z.infer<typeof runAgentSchema>;
