import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    FRONTEND_URL: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    PORT: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    NODE_ENV: "development" | "production" | "test";
    FRONTEND_URL: string;
    PORT: number;
}, {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    FRONTEND_URL?: string | undefined;
    PORT?: number | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare const env: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    NODE_ENV: "development" | "production" | "test";
    FRONTEND_URL: string;
    PORT: number;
};
export {};
