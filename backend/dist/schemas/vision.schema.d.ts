import { z } from 'zod';
export declare const uploadImageSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    projectId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    tags?: string[] | undefined;
}, {
    projectId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    tags?: string[] | undefined;
}>;
export declare const updateImageSchema: z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    metadata?: Record<string, any> | undefined;
    tags?: string[] | undefined;
}, {
    metadata?: Record<string, any> | undefined;
    tags?: string[] | undefined;
}>;
export declare const createLabelSchema: z.ZodObject<{
    imageId: z.ZodString;
    type: z.ZodEnum<["object", "scene", "concept", "text", "color", "face"]>;
    name: z.ZodString;
    x: z.ZodOptional<z.ZodNumber>;
    y: z.ZodOptional<z.ZodNumber>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    confidence: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    isManual: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "object" | "text" | "scene" | "concept" | "color" | "face";
    name: string;
    imageId: string;
    confidence: number;
    isManual: boolean;
    x?: number | undefined;
    y?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    notes?: string | undefined;
}, {
    type: "object" | "text" | "scene" | "concept" | "color" | "face";
    name: string;
    imageId: string;
    confidence: number;
    x?: number | undefined;
    y?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    notes?: string | undefined;
    isManual?: boolean | undefined;
}>;
export declare const updateLabelSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    confidence: z.ZodOptional<z.ZodNumber>;
    x: z.ZodOptional<z.ZodNumber>;
    y: z.ZodOptional<z.ZodNumber>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    x?: number | undefined;
    y?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    confidence?: number | undefined;
    notes?: string | undefined;
}, {
    name?: string | undefined;
    x?: number | undefined;
    y?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    confidence?: number | undefined;
    notes?: string | undefined;
}>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    icon?: string | undefined;
    color?: string | undefined;
    parentId?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    icon?: string | undefined;
    color?: string | undefined;
    parentId?: string | undefined;
}>;
export declare const updateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    icon: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    color?: string | undefined;
    parentId?: string | null | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    color?: string | undefined;
    parentId?: string | null | undefined;
}>;
export declare const visualSearchSchema: z.ZodObject<{
    imageId: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minConfidence: z.ZodOptional<z.ZodNumber>;
    maxResults: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    text?: string | undefined;
    imageId?: string | undefined;
    categories?: string[] | undefined;
    labels?: string[] | undefined;
    minConfidence?: number | undefined;
    maxResults?: number | undefined;
}, {
    limit?: number | undefined;
    text?: string | undefined;
    imageId?: string | undefined;
    categories?: string[] | undefined;
    labels?: string[] | undefined;
    minConfidence?: number | undefined;
    maxResults?: number | undefined;
}>;
export declare const addImageCategorySchema: z.ZodObject<{
    categoryId: z.ZodString;
    confidence: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    categoryId: string;
    confidence?: number | undefined;
}, {
    categoryId: string;
    confidence?: number | undefined;
}>;
export declare const similaritySearchSchema: z.ZodObject<{
    imageId: z.ZodString;
    threshold: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    imageId: string;
    threshold: number;
}, {
    imageId: string;
    limit?: number | undefined;
    threshold?: number | undefined;
}>;
export declare const saveSearchSchema: z.ZodObject<{
    name: z.ZodString;
    query: z.ZodObject<{
        imageId: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        minConfidence: z.ZodOptional<z.ZodNumber>;
        maxResults: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        text?: string | undefined;
        imageId?: string | undefined;
        categories?: string[] | undefined;
        labels?: string[] | undefined;
        minConfidence?: number | undefined;
        maxResults?: number | undefined;
    }, {
        text?: string | undefined;
        imageId?: string | undefined;
        categories?: string[] | undefined;
        labels?: string[] | undefined;
        minConfidence?: number | undefined;
        maxResults?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    query: {
        text?: string | undefined;
        imageId?: string | undefined;
        categories?: string[] | undefined;
        labels?: string[] | undefined;
        minConfidence?: number | undefined;
        maxResults?: number | undefined;
    };
}, {
    name: string;
    query: {
        text?: string | undefined;
        imageId?: string | undefined;
        categories?: string[] | undefined;
        labels?: string[] | undefined;
        minConfidence?: number | undefined;
        maxResults?: number | undefined;
    };
}>;
export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type UpdateImageInput = z.infer<typeof updateImageSchema>;
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type VisualSearchInput = z.infer<typeof visualSearchSchema>;
export type AddImageCategoryInput = z.infer<typeof addImageCategorySchema>;
export type SimilaritySearchInput = z.infer<typeof similaritySearchSchema>;
export type SaveSearchInput = z.infer<typeof saveSearchSchema>;
