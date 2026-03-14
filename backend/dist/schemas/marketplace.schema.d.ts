import { z } from 'zod';
export declare const listMarketplaceSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<["agent", "template", "integration", "plugin"]>>;
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodDefault<z.ZodEnum<["name", "downloads", "rating", "created"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    perPage: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sort: "name" | "downloads" | "rating" | "created";
    page: number;
    perPage: number;
    search?: string | undefined;
    category?: "agent" | "template" | "integration" | "plugin" | undefined;
}, {
    sort?: "name" | "downloads" | "rating" | "created" | undefined;
    search?: string | undefined;
    category?: "agent" | "template" | "integration" | "plugin" | undefined;
    page?: number | undefined;
    perPage?: number | undefined;
}>;
export declare const rateItemSchema: z.ZodObject<{
    rating: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    rating: number;
}, {
    rating: number;
}>;
export declare const installItemSchema: z.ZodObject<{
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    config?: Record<string, any> | undefined;
}, {
    config?: Record<string, any> | undefined;
}>;
export type ListMarketplaceInput = z.infer<typeof listMarketplaceSchema>;
export type RateItemInput = z.infer<typeof rateItemSchema>;
export type InstallItemInput = z.infer<typeof installItemSchema>;
