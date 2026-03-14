import type { CreateProjectInput, UpdateProjectInput, ListProjectsInput } from '../schemas/projects.schema.js';
export declare function listProjects(workspaceId: string, input: ListProjectsInput): Promise<{
    data: {
        id: string;
        name: string;
        slug: string;
        desc: string | null;
        icon: string | null;
        iconColor: string | null;
        status: "active" | "draft";
        branch: string | null;
        framework: string | null;
        stack: string[] | null;
        agentIds: string[] | null;
        role: "Frontend" | "Backend" | "Design" | "Data" | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
    meta: {
        total: number;
        page: number;
        perPage: number;
    };
}>;
export declare function getProjectBySlug(workspaceId: string, slug: string): Promise<{
    id: string;
    name: string;
    slug: string;
    desc: string | null;
    icon: string | null;
    iconColor: string | null;
    status: "active" | "draft";
    branch: string | null;
    framework: string | null;
    stack: string[] | null;
    agentIds: string[] | null;
    role: "Frontend" | "Backend" | "Design" | "Data" | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function getProjectById(workspaceId: string, id: string): Promise<{
    id: string;
    name: string;
    slug: string;
    desc: string | null;
    icon: string | null;
    iconColor: string | null;
    status: "active" | "draft";
    branch: string | null;
    framework: string | null;
    stack: string[] | null;
    agentIds: string[] | null;
    role: "Frontend" | "Backend" | "Design" | "Data" | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function createProject(workspaceId: string, userId: string, input: CreateProjectInput): Promise<{
    id: string;
    name: string;
    slug: string;
    desc: string | null;
    icon: string | null;
    iconColor: string | null;
    status: "active" | "draft";
    branch: string | null;
    framework: string | null;
    stack: string[] | null;
    agentIds: string[] | null;
    role: "Frontend" | "Backend" | "Design" | "Data" | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateProject(workspaceId: string, id: string, input: UpdateProjectInput): Promise<{
    id: string;
    name: string;
    slug: string;
    desc: string | null;
    icon: string | null;
    iconColor: string | null;
    status: "active" | "draft";
    branch: string | null;
    framework: string | null;
    stack: string[] | null;
    agentIds: string[] | null;
    role: "Frontend" | "Backend" | "Design" | "Data" | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteProject(workspaceId: string, id: string): Promise<{
    success: boolean;
}>;
export declare function getProjectStats(workspaceId: string, projectId: string): Promise<{
    commits: number;
    deploys: number;
    uptime: string;
    lastDeploy: string;
}>;
export declare function getProjectActivity(workspaceId: string, projectId: string): Promise<{
    data: {
        color: string;
        text: string;
        time: string;
    }[];
}>;
