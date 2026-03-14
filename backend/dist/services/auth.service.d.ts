import type { RegisterInput, LoginInput, UpdateProfileInput } from '../schemas/auth.schema.js';
export declare function register(input: RegisterInput): Promise<{
    user: {
        id: string;
        email: string;
        name: string;
        avatarUrl: string | null;
        role: "Frontend" | "Backend" | "Design" | "Data" | "Admin" | null;
        stack: string[] | null;
        cpuLevel: number | null;
        onboarded: boolean;
        theme: "dark" | "light";
        tourDone: boolean;
        plan: "free" | "pro" | "enterprise";
        authenticated: boolean;
    };
    accessToken: string;
    refreshToken: string;
}>;
export declare function login(input: LoginInput): Promise<{
    user: {
        id: string;
        email: string;
        name: string;
        avatarUrl: string | null;
        role: "Frontend" | "Backend" | "Design" | "Data" | "Admin" | null;
        stack: string[] | null;
        cpuLevel: number | null;
        onboarded: boolean;
        theme: "dark" | "light";
        tourDone: boolean;
        plan: "free" | "pro" | "enterprise";
        authenticated: boolean;
    };
    accessToken: string;
    refreshToken: string;
}>;
export declare function logout(userId: string, refreshToken?: string): Promise<void>;
export declare function refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare function getMe(userId: string): Promise<{
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    role: "Frontend" | "Backend" | "Design" | "Data" | "Admin" | null;
    stack: string[] | null;
    cpuLevel: number | null;
    onboarded: boolean;
    theme: "dark" | "light";
    tourDone: boolean;
    plan: "free" | "pro" | "enterprise";
    authenticated: boolean;
}>;
export declare function updateMe(userId: string, input: UpdateProfileInput): Promise<{
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    role: "Frontend" | "Backend" | "Design" | "Data" | "Admin" | null;
    stack: string[] | null;
    cpuLevel: number | null;
    onboarded: boolean;
    theme: "dark" | "light";
    tourDone: boolean;
    plan: "free" | "pro" | "enterprise";
    authenticated: boolean;
}>;
