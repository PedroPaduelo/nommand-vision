import type { TrackEventInput, TimeseriesInput, DashboardInput } from '../schemas/analytics.schema.js';
export declare function getDashboard(workspaceId: string, input: DashboardInput): Promise<{
    period: "7d" | "30d" | "90d";
    deploys: {
        total: number;
        success: number;
        failed: number;
        success_rate: number;
    };
    agents: {
        active: number;
    };
    messages: {
        total: number;
    };
    performance: {
        avg_response_time_ms: number;
    };
}>;
export declare function getTimeSeries(workspaceId: string, input: TimeseriesInput): Promise<{
    date: string;
    value: number;
}[]>;
export declare function trackEvent(workspaceId: string, userId: string | null, input: TrackEventInput): Promise<{
    workspaceId: string;
    id: string;
    createdAt: Date;
    userId: string | null;
    agentId: string | null;
    projectId: string | null;
    eventType: string;
    eventData: Record<string, unknown> | null;
}>;
export declare function getTopProjects(workspaceId: string): Promise<{
    projectId: string | null;
    name: string;
    slug: string;
    events: number;
}[]>;
export declare function getTopAgents(workspaceId: string): Promise<{
    agentId: string;
    agentName: string;
    actions: number;
}[]>;
export declare function getDeployTrends(workspaceId: string, period?: string): Promise<{
    date: string;
    total: number;
    success: number;
    failed: number;
}[]>;
export declare function getCostAnalysis(workspaceId: string): Promise<{
    tokens: {
        input: number;
        output: number;
        total: number;
    };
    cost: {
        input: number;
        output: number;
        total: number;
    };
}>;
