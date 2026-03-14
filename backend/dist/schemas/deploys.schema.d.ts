import { z } from 'zod';
export declare const createDeploySchema: z.ZodObject<{
    projectId: z.ZodString;
    environment: z.ZodDefault<z.ZodOptional<z.ZodEnum<["preview", "staging", "production"]>>>;
    commitSha: z.ZodOptional<z.ZodString>;
    commitMessage: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    environment: "production" | "preview" | "staging";
    branch?: string | undefined;
    commitSha?: string | undefined;
    commitMessage?: string | undefined;
}, {
    projectId: string;
    branch?: string | undefined;
    environment?: "production" | "preview" | "staging" | undefined;
    commitSha?: string | undefined;
    commitMessage?: string | undefined;
}>;
export declare const listDeploysSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["queued", "building", "deploying", "success", "failed", "cancelled"]>>;
    environment: z.ZodOptional<z.ZodEnum<["preview", "staging", "production"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "success" | "queued" | "building" | "deploying" | "failed" | "cancelled" | undefined;
    projectId?: string | undefined;
    environment?: "production" | "preview" | "staging" | undefined;
}, {
    status?: "success" | "queued" | "building" | "deploying" | "failed" | "cancelled" | undefined;
    projectId?: string | undefined;
    environment?: "production" | "preview" | "staging" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const setEnvVarSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
    isSecret: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    value: string;
    key: string;
    isSecret: boolean;
}, {
    value: string;
    key: string;
    isSecret?: boolean | undefined;
}>;
export type CreateDeployInput = z.infer<typeof createDeploySchema>;
export type ListDeploysInput = z.infer<typeof listDeploysSchema>;
export type SetEnvVarInput = z.infer<typeof setEnvVarSchema>;
