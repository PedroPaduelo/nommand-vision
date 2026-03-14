import type { UpdateProfileInput, ChangePasswordInput, UpdateThemeInput } from '../schemas/profile.schema.js';
export declare function getProfile(userId: string): Promise<{
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
    createdAt: Date;
}>;
export declare function updateProfile(userId: string, input: UpdateProfileInput): Promise<{
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
    createdAt: Date;
}>;
export declare function changePassword(userId: string, input: ChangePasswordInput): Promise<{
    success: boolean;
}>;
export declare function completeOnboarding(userId: string): Promise<{
    success: boolean;
    onboarded: boolean;
}>;
export declare function completeTour(userId: string): Promise<{
    success: boolean;
    tourDone: boolean;
}>;
export declare function updateTheme(userId: string, input: UpdateThemeInput): Promise<{
    success: boolean;
    theme: "dark" | "light";
}>;
export declare function deleteAccount(userId: string): Promise<{
    success: boolean;
}>;
