import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    stack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cpuLevel: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    stack?: string[] | undefined;
    name?: string | undefined;
    avatarUrl?: string | undefined;
    cpuLevel?: number | undefined;
}, {
    stack?: string[] | undefined;
    name?: string | undefined;
    avatarUrl?: string | undefined;
    cpuLevel?: number | undefined;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    oldPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    oldPassword: string;
    newPassword: string;
}, {
    oldPassword: string;
    newPassword: string;
}>;
export declare const updateThemeSchema: z.ZodObject<{
    theme: z.ZodEnum<["dark", "light"]>;
}, "strip", z.ZodTypeAny, {
    theme: "dark" | "light";
}, {
    theme: "dark" | "light";
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;
