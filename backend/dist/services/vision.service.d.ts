import { type NewImage, type NewLabel, type NewCategory, type NewImageCategory, type NewSavedSearch } from '../db/schema/vision.js';
/**
 * Carrega o modelo MobileNet para extração de features
 */
export declare function loadModel(): Promise<void>;
/**
 * Processa imagem e extrai features usando MobileNet
 */
export declare function extractFeatures(imageBuffer: Buffer): Promise<number[]>;
/**
 * Classifica imagem usando MobileNet
 */
export declare function classifyImage(imageBuffer: Buffer): Promise<Array<{
    class: string;
    confidence: number;
}>>;
/**
 * Obtem dimensões da imagem
 */
export declare function getImageDimensions(buffer: Buffer): Promise<{
    width: number;
    height: number;
}>;
/**
 * Gera thumbnail da imagem
 */
export declare function generateThumbnail(buffer: Buffer): Promise<Buffer>;
/**
 * Salva imagem no armazenamento local
 */
export declare function saveImageToStorage(buffer: Buffer, filename: string): Promise<{
    storageKey: string;
    path: string;
}>;
/**
 * Remove imagem do armazenamento
 */
export declare function deleteImageFromStorage(storageKey: string): Promise<void>;
/**
 * Cria uma nova imagem no banco
 */
export declare function createImage(data: {
    workspaceId: string;
    userId: string;
    projectId?: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    width: number;
    height: number;
    storageKey: string;
    cdnUrl?: string;
    thumbnailUrl?: string;
    processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
    modelVersion?: string;
    confidence?: string;
    tags?: string[];
    metadata?: Record<string, any>;
}): Promise<NewImage>;
/**
 * Processa imagem com ML
 */
export declare function processImage(imageId: string): Promise<void>;
/**
 * Lista imagens com filtros
 */
export declare function listImages(workspaceId: string, options: {
    projectId?: string;
    tags?: string[];
    processingStatus?: string;
    limit?: number;
    offset?: number;
}): Promise<{
    images: NewImage[];
    total: number;
}>;
/**
 * Busca imagem por ID
 */
export declare function getImageById(imageId: string): Promise<NewImage | null>;
/**
 * Atualiza imagem
 */
export declare function updateImage(imageId: string, data: {
    tags?: string[];
    metadata?: Record<string, any>;
}): Promise<NewImage>;
/**
 * Deleta imagem
 */
export declare function deleteImage(imageId: string): Promise<void>;
/**
 * Cria label manual
 */
export declare function createLabel(data: {
    imageId: string;
    userId: string;
    type: 'object' | 'scene' | 'concept' | 'text' | 'color' | 'face';
    name: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    confidence: number;
    notes?: string;
}): Promise<NewLabel>;
/**
 * Lista labels de uma imagem
 */
export declare function getImageLabels(imageId: string): Promise<NewLabel[]>;
/**
 * Atualiza label
 */
export declare function updateLabel(labelId: string, data: {
    name?: string;
    notes?: string;
    confidence?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}): Promise<NewLabel>;
/**
 * Deleta label
 */
export declare function deleteLabel(labelId: string): Promise<void>;
/**
 * Busca visual por similaridade
 */
export declare function searchBySimilarity(imageId: string, options: {
    threshold?: number;
    limit?: number;
}): Promise<Array<{
    image: NewImage;
    similarity: number;
}>>;
/**
 * Busca por texto (labels)
 */
export declare function searchByLabels(workspaceId: string, labelNames: string[], options: {
    minConfidence?: number;
    limit?: number;
}): Promise<NewImage[]>;
/**
 * Cria categoria
 */
export declare function createCategory(data: {
    workspaceId: string;
    name: string;
    description?: string;
    parentId?: string;
    icon?: string;
    color?: string;
}): Promise<NewCategory>;
/**
 * Lista categorias
 */
export declare function listCategories(workspaceId: string): Promise<NewCategory[]>;
/**
 * Associa imagem a categoria
 */
export declare function addImageCategory(data: {
    imageId: string;
    categoryId: string;
    confidence?: number;
}): Promise<NewImageCategory>;
/**
 * Busca imagens por categoria
 */
export declare function searchByCategory(workspaceId: string, categoryId: string): Promise<NewImage[]>;
/**
 * Salva busca
 */
export declare function saveSearch(data: {
    workspaceId: string;
    userId: string;
    name: string;
    query: {
        imageId?: string;
        text?: string;
        categories?: string[];
        labels?: string[];
        minConfidence?: number;
        maxResults?: number;
    };
}): Promise<NewSavedSearch>;
/**
 * Lista buscas salvas
 */
export declare function listSavedSearches(workspaceId: string): Promise<NewSavedSearch[]>;
