import type { CreateDeployInput, ListDeploysInput, SetEnvVarInput } from '../schemas/deploys.schema.js';
export declare function list(workspaceId: string, filters: ListDeploysInput): Promise<{
    data: {
        id: string;
        projectId: string;
        workspaceId: string;
        environment: "production" | "preview" | "staging";
        status: "success" | "queued" | "building" | "deploying" | "failed" | "cancelled";
        branch: string | null;
        commitSha: string | null;
        commitMessage: string | null;
        logs: string | null;
        url: string | null;
        error: string | null;
        durationMs: number | null;
        triggeredBy: string;
        startedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    }[];
    meta: {
        total: number;
        page: number;
        perPage: number;
    };
}>;
export declare function get(id: string): Promise<{
    envVars: {
        id: string;
        key: string;
        isSecret: boolean;
        createdAt: Date;
    }[];
    id: string;
    projectId: string;
    workspaceId: string;
    environment: "production" | "preview" | "staging";
    status: "success" | "queued" | "building" | "deploying" | "failed" | "cancelled";
    branch: string | null;
    commitSha: string | null;
    commitMessage: string | null;
    logs: string | null;
    url: string | null;
    error: string | null;
    durationMs: number | null;
    triggeredBy: string;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
}>;
export declare function create(workspaceId: string, userId: string, input: CreateDeployInput): Promise<{
    id: string;
    projectId: string;
    workspaceId: string;
    environment: "production" | "preview" | "staging";
    status: "success" | "queued" | "building" | "deploying" | "failed" | "cancelled";
    branch: string | null;
    commitSha: string | null;
    commitMessage: string | null;
    logs: string | null;
    url: string | null;
    error: string | null;
    durationMs: number | null;
    triggeredBy: string;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
}>;
export declare function cancel(id: string): Promise<{
    id: string;
    projectId: string;
    workspaceId: string;
    environment: "production" | "preview" | "staging";
    status: "success" | "queued" | "building" | "deploying" | "failed" | "cancelled";
    branch: string | null;
    commitSha: string | null;
    commitMessage: string | null;
    logs: string | null;
    url: string | null;
    error: string | null;
    durationMs: number | null;
    triggeredBy: string;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
}>;
export declare function retry(id: string, userId: string): Promise<{
    id: string;
    projectId: string;
    workspaceId: string;
    environment: "production" | "preview" | "staging";
    status: "success" | "queued" | "building" | "deploying" | "failed" | "cancelled";
    branch: string | null;
    commitSha: string | null;
    commitMessage: string | null;
    logs: string | null;
    url: string | null;
    error: string | null;
    durationMs: number | null;
    triggeredBy: string;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
}>;
export declare function getLogs(id: string): Promise<{
    data: {
        id: string;
        level: "info" | "warn" | "error";
        message: string;
        timestamp: Date;
    }[];
}>;
export declare function streamLogs(id: string): Promise<{
    deployId: string;
    logs: never[];
    streamAvailable: boolean;
}>;
export declare function listEnvVars(deployId: string): Promise<{
    id: string;
    key: string;
    value: string;
    isSecret: boolean;
    createdAt: Date;
}[]>;
export declare function setEnvVar(deployId: string, input: SetEnvVarInput): Promise<{
    id: string;
    key: string;
    isSecret: boolean;
    createdAt: Date;
}>;
export declare function deleteEnvVar(id: string): Promise<{
    success: boolean;
}>;
export declare function getStats(workspaceId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    successRate: number;
}>;
