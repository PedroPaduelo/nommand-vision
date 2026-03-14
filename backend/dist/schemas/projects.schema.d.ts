import { z } from 'zod';
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    iconColor: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "draft"]>>;
    branch: z.ZodOptional<z.ZodString>;
    framework: z.ZodOptional<z.ZodString>;
    stack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    role: z.ZodOptional<z.ZodEnum<["Frontend", "Backend", "Design", "Data"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    status?: "active" | "draft" | undefined;
    stack?: string[] | undefined;
    role?: "Frontend" | "Backend" | "Design" | "Data" | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    iconColor?: string | undefined;
    branch?: string | undefined;
    framework?: string | undefined;
}, {
    name: string;
    status?: "active" | "draft" | undefined;
    stack?: string[] | undefined;
    role?: "Frontend" | "Backend" | "Design" | "Data" | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    iconColor?: string | undefined;
    branch?: string | undefined;
    framework?: string | undefined;
}>;
export declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    icon: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    iconColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["active", "draft"]>>>;
    branch: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    framework: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    stack: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    role: z.ZodOptional<z.ZodOptional<z.ZodEnum<["Frontend", "Backend", "Design", "Data"]>>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "draft" | undefined;
    stack?: string[] | undefined;
    name?: string | undefined;
    role?: "Frontend" | "Backend" | "Design" | "Data" | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    iconColor?: string | undefined;
    branch?: string | undefined;
    framework?: string | undefined;
}, {
    status?: "active" | "draft" | undefined;
    stack?: string[] | undefined;
    name?: string | undefined;
    role?: "Frontend" | "Backend" | "Design" | "Data" | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    iconColor?: string | undefined;
    branch?: string | undefined;
    framework?: string | undefined;
}>;
export declare const listProjectsSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["active", "draft"]>>;
    role: z.ZodOptional<z.ZodEnum<["Frontend", "Backend", "Design", "Data"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    perPage: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    perPage: number;
    status?: "active" | "draft" | undefined;
    role?: "Frontend" | "Backend" | "Design" | "Data" | undefined;
}, {
    status?: "active" | "draft" | undefined;
    role?: "Frontend" | "Backend" | "Design" | "Data" | undefined;
    page?: number | undefined;
    perPage?: number | undefined;
}>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsInput = z.infer<typeof listProjectsSchema>;
