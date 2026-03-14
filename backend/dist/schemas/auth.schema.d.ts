import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    name: string;
}, {
    password: string;
    email: string;
    name: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export declare const refreshSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["Frontend", "Backend", "Design", "Data"]>>;
    stack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cpuLevel: z.ZodOptional<z.ZodNumber>;
    onboarded: z.ZodOptional<z.ZodBoolean>;
    theme: z.ZodOptional<z.ZodEnum<["dark", "light"]>>;
    tourDone: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    stack?: string[] | undefined;
    name?: string | undefined;
    role?: "Frontend" | "Backend" | "Design" | "Data" | undefined;
    theme?: "dark" | "light" | undefined;
    cpuLevel?: number | undefined;
    onboarded?: boolean | undefined;
    tourDone?: boolean | undefined;
}, {
    stack?: string[] | undefined;
    name?: string | undefined;
    role?: "Frontend" | "Backend" | "Design" | "Data" | undefined;
    theme?: "dark" | "light" | undefined;
    cpuLevel?: number | undefined;
    onboarded?: boolean | undefined;
    tourDone?: boolean | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
