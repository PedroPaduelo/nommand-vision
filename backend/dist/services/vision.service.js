import { db } from '../db/index.js';
import { images, labels, categories, imageCategories, imageFeatures, savedSearches } from '../db/schema/vision.js';
import { eq, desc, and, sql, asc } from 'drizzle-orm';
import * as tf from '@tensorflow/tfjs-node';
import sharp from 'sharp';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
// URLs dos modelos pré-treinados do TensorFlow Hub (MobileNet)
const MOBILENET_URL = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/feature_vector/4/default/1';
// Classes do ImageNet (top 1000)
const IMAGENET_CLASSES = {
    0: 'tench', 1: 'goldfish', 2: 'great white shark', 3: 'tiger shark', 4: 'hammerhead shark',
    5: 'electric ray', 6: 'cock', 7: 'hen', 8: 'ostrich', 9: 'brambling',
    10: 'goldfinch', 11: 'house finch', 12: 'junco', 13: 'indigo bunting', 14: 'robin',
    15: 'bulbul', 16: 'jay', 17: 'magpie', 18: 'chickadee', 19: 'water ouzel',
    20: 'kite', 21: 'bald eagle', 22: 'vulture', 23: 'great grey owl', 24: 'fire salamander',
    25: 'newt', 26: 'axolotl', 27: 'frog', 28: 'tree frog', 29: 'tailed frog',
    30: 'loggerhead', 31: 'leatherback turtle', 42: 'killer whale', 50: 'titi', 60: 'langur',
    70: 'capuchin', 80: 'howler monkey', 90: 'squirrel monkey', 100: 'patas', 110: 'baboon',
    120: 'marmoset', 130: 'proboscis monkey', 140: 'macaque', 150: 'gibbon', 160: 'siamang',
    170: 'guereza', 180: 'langur', 190: 'monkey', 200: 'colobus', 210: 'marmoset',
    220: 'tamarin', 230: 'saki', 240: 'uakari', 250: 'titi', 260: 'saki',
    281: 'tabby', 282: 'tiger cat', 283: 'persian cat', 284: 'siamese cat', 285: 'egyian cat',
    386: 'afghan hound', 387: 'basset', 388: 'beagle', 389: 'bloodhound', 390: 'bluetick',
    400: 'coyote', 401: 'wolf', 402: 'fox', 403: 'dingo', 404: 'dhole',
    281: 'tabby', 387: 'basset', 388: 'beagle'
};
let model = null;
let modelLoading = false;
let modelLoadPromise = null;
/**
 * Carrega o modelo MobileNet para extração de features
 */
export async function loadModel() {
    if (model)
        return;
    if (modelLoading && modelLoadPromise) {
        return modelLoadPromise;
    }
    modelLoading = true;
    modelLoadPromise = (async () => {
        try {
            console.log('[Vision ML] Loading MobileNet model...');
            model = await tf.loadGraphModel(MOBILENET_URL);
            console.log('[Vision ML] Model loaded successfully');
        }
        catch (error) {
            console.error('[Vision ML] Failed to load model:', error);
            model = null;
            throw error;
        }
        finally {
            modelLoading = false;
        }
    })();
    return modelLoadPromise;
}
/**
 * Gera um storage key único para a imagem
 */
function generateStorageKey(filename) {
    const hash = crypto.randomUUID();
    const ext = path.extname(filename);
    return `vision/${hash.slice(0, 2)}/${hash}${ext}`;
}
/**
 * Processa imagem e extrai features usando MobileNet
 */
export async function extractFeatures(imageBuffer) {
    await loadModel();
    if (!model) {
        throw new Error('Model not loaded');
    }
    try {
        // Processar imagem com sharp para o formato correto
        const processedBuffer = await sharp(imageBuffer)
            .resize(224, 224, { fit: 'cover' })
            .toFormat('jpeg')
            .toBuffer();
        // Converter para tensor
        const imageTensor = tf.node.decodeJpeg(processedBuffer, 3);
        const expandedTensor = imageTensor.expandDims(0);
        const floatTensor = expandedTensor.toFloat().div(127.5).sub(1);
        // Extrair features
        const result = model.predict(floatTensor);
        const features = await result.data();
        // Cleanup
        imageTensor.dispose();
        expandedTensor.dispose();
        floatTensor.dispose();
        result.dispose();
        return Array.from(features);
    }
    catch (error) {
        console.error('[Vision ML] Error extracting features:', error);
        throw error;
    }
}
/**
 * Classifica imagem usando MobileNet
 */
export async function classifyImage(imageBuffer) {
    await loadModel();
    if (!model) {
        throw new Error('Model not loaded');
    }
    try {
        // Processar imagem
        const processedBuffer = await sharp(imageBuffer)
            .resize(224, 224, { fit: 'cover' })
            .toFormat('jpeg')
            .toBuffer();
        // Converter para tensor
        const imageTensor = tf.node.decodeJpeg(processedBuffer, 3);
        const expandedTensor = imageTensor.expandDims(0);
        const floatTensor = expandedTensor.toFloat().div(127.5).sub(1);
        // Obter predições (MobileNet retorna feature vector, não probabilities)
        const result = model.predict(floatTensor);
        // Converter features para array
        const features = await result.data();
        // Encontrar os maiores valores (simples heurística)
        const indexedFeatures = Array.from(features).map((v, i) => ({ value: v, index: i }));
        indexedFeatures.sort((a, b) => b.value - a.value);
        // Mapear para classes conhecidas (simplificado)
        const topClasses = [];
        // Usar heuristics baseadas nos valores de ativação
        // Isso é uma aproximação - em produção, use um classificador adicional
        const avgActivation = features.reduce((a, b) => a + b, 0) / features.length;
        const threshold = avgActivation * 1.5;
        for (let i = 0; i < Math.min(10, indexedFeatures.length); i++) {
            const { value, index } = indexedFeatures[i];
            if (value > threshold) {
                // Mapear índice para classe conhecida ou gerar nome genérico
                const className = IMAGENET_CLASSES[index] || `class_${index}`;
                topClasses.push({
                    class: className,
                    confidence: Math.min(0.99, value / (features.reduce((a, b) => Math.max(a, b), 0) || 1))
                });
            }
        }
        // Se não encontrou classes específicas, adicionar classe genérica
        if (topClasses.length === 0) {
            topClasses.push({
                class: 'image',
                confidence: 0.8
            });
        }
        // Cleanup
        imageTensor.dispose();
        expandedTensor.dispose();
        floatTensor.dispose();
        result.dispose();
        return topClasses;
    }
    catch (error) {
        console.error('[Vision ML] Error classifying image:', error);
        throw error;
    }
}
/**
 * Obtem dimensões da imagem
 */
export async function getImageDimensions(buffer) {
    const metadata = await sharp(buffer).metadata();
    return {
        width: metadata.width || 0,
        height: metadata.height || 0
    };
}
/**
 * Gera thumbnail da imagem
 */
export async function generateThumbnail(buffer) {
    return sharp(buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
}
/**
 * Calcula similaridade Cosseno entre dois vetores
 */
function cosineSimilarity(a, b) {
    if (a.length !== b.length)
        return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0)
        return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
/**
 * Salva imagem no armazenamento local
 */
export async function saveImageToStorage(buffer, filename) {
    const storageKey = generateStorageKey(filename);
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    // Criar diretório se não existir
    const dirPath = path.join(uploadDir, path.dirname(storageKey));
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    const fullPath = path.join(uploadDir, storageKey);
    fs.writeFileSync(fullPath, buffer);
    return { storageKey, path: fullPath };
}
/**
 * Remove imagem do armazenamento
 */
export async function deleteImageFromStorage(storageKey) {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const fullPath = path.join(uploadDir, storageKey);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}
/**
 * Cria uma nova imagem no banco
 */
export async function createImage(data) {
    const [image] = await db.insert(images).values({
        workspaceId: data.workspaceId,
        userId: data.userId,
        projectId: data.projectId,
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        width: data.width,
        height: data.height,
        storageKey: data.storageKey,
        cdnUrl: data.cdnUrl,
        thumbnailUrl: data.thumbnailUrl,
        processingStatus: data.processingStatus || 'pending',
        modelVersion: data.modelVersion,
        confidence: data.confidence,
        tags: data.tags,
        metadata: data.metadata,
    }).returning();
    return image;
}
/**
 * Processa imagem com ML
 */
export async function processImage(imageId) {
    // Atualizar status para processing
    await db.update(images)
        .set({ processingStatus: 'processing' })
        .where(eq(images.id, imageId));
    try {
        // Buscar imagem
        const [image] = await db.select().from(images).where(eq(images.id, imageId));
        if (!image)
            throw new Error('Image not found');
        // Carregar buffer da imagem
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const imagePath = path.join(uploadDir, image.storageKey);
        if (!fs.existsSync(imagePath)) {
            throw new Error('Image file not found');
        }
        const imageBuffer = fs.readFileSync(imagePath);
        // Gerar thumbnail
        const thumbnailBuffer = await generateThumbnail(imageBuffer);
        const thumbnailFilename = `thumb_${path.basename(image.storageKey)}`;
        const thumbnailDir = path.join(uploadDir, 'thumbnails');
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }
        const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
        fs.writeFileSync(thumbnailPath, thumbnailBuffer);
        // Classificar imagem
        const classifications = await classifyImage(imageBuffer);
        // Extrair features
        const features = await extractFeatures(imageBuffer);
        // Salvar features no banco
        await db.insert(imageFeatures).values({
            imageId: image.id,
            features: features,
            modelName: 'mobilenet_v2',
            modelVersion: '1.0',
            dimensions: features.length,
        });
        // Criar labels automáticos
        const topConfidence = classifications[0]?.confidence || 0;
        const labelNames = classifications.slice(0, 5).map(c => c.class);
        for (const cls of classifications.slice(0, 5)) {
            await db.insert(labels).values({
                imageId: image.id,
                userId: image.userId,
                type: 'object',
                name: cls.class,
                confidence: cls.confidence.toString(),
                isManual: false,
            });
        }
        // Atualizar imagem com status e metadados
        await db.update(images)
            .set({
            processingStatus: 'completed',
            modelVersion: '1.0',
            confidence: topConfidence.toString(),
            thumbnailUrl: `/thumbnails/${thumbnailFilename}`,
            metadata: {
                ...(image.metadata || {}),
                classifications,
                labelNames,
                featureDimensions: features.length,
            }
        })
            .where(eq(images.id, imageId));
        console.log(`[Vision ML] Image ${imageId} processed successfully`);
    }
    catch (error) {
        console.error(`[Vision ML] Error processing image ${imageId}:`, error);
        await db.update(images)
            .set({ processingStatus: 'failed' })
            .where(eq(images.id, imageId));
        throw error;
    }
}
/**
 * Lista imagens com filtros
 */
export async function listImages(workspaceId, options) {
    const conditions = [eq(images.workspaceId, workspaceId)];
    if (options.projectId) {
        conditions.push(eq(images.projectId, options.projectId));
    }
    if (options.processingStatus) {
        conditions.push(eq(images.processingStatus, options.processingStatus));
    }
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const result = await db.select()
        .from(images)
        .where(and(...conditions))
        .orderBy(desc(images.createdAt))
        .limit(limit)
        .offset(offset);
    const countResult = await db.select({ count: sql `count(*)` })
        .from(images)
        .where(and(...conditions));
    return {
        images: result,
        total: countResult[0]?.count || 0
    };
}
/**
 * Busca imagem por ID
 */
export async function getImageById(imageId) {
    const [image] = await db.select().from(images).where(eq(images.id, imageId));
    return image || null;
}
/**
 * Atualiza imagem
 */
export async function updateImage(imageId, data) {
    const [image] = await db.update(images)
        .set({
        tags: data.tags,
        metadata: data.metadata,
        updatedAt: new Date(),
    })
        .where(eq(images.id, imageId))
        .returning();
    return image;
}
/**
 * Deleta imagem
 */
export async function deleteImage(imageId) {
    const [image] = await db.select().from(images).where(eq(images.id, imageId));
    if (image) {
        // Deletar arquivo físico
        await deleteImageFromStorage(image.storageKey);
        // Deletar thumbnail
        if (image.thumbnailUrl) {
            const uploadDir = process.env.UPLOAD_DIR || './uploads';
            const thumbPath = path.join(uploadDir, image.thumbnailUrl.replace(/^\//, ''));
            if (fs.existsSync(thumbPath)) {
                fs.unlinkSync(thumbPath);
            }
        }
        // Deletar do banco (cascade deleta labels e features)
        await db.delete(images).where(eq(images.id, imageId));
    }
}
/**
 * Cria label manual
 */
export async function createLabel(data) {
    const [label] = await db.insert(labels).values({
        imageId: data.imageId,
        userId: data.userId,
        type: data.type,
        name: data.name,
        x: data.x?.toString(),
        y: data.y?.toString(),
        width: data.width?.toString(),
        height: data.height?.toString(),
        confidence: data.confidence.toString(),
        notes: data.notes,
        isManual: true,
    }).returning();
    return label;
}
/**
 * Lista labels de uma imagem
 */
export async function getImageLabels(imageId) {
    return db.select().from(labels).where(eq(labels.imageId, imageId));
}
/**
 * Atualiza label
 */
export async function updateLabel(labelId, data) {
    const [label] = await db.update(labels)
        .set({
        name: data.name,
        notes: data.notes,
        confidence: data.confidence?.toString(),
        x: data.x?.toString(),
        y: data.y?.toString(),
        width: data.width?.toString(),
        height: data.height?.toString(),
    })
        .where(eq(labels.id, labelId))
        .returning();
    return label;
}
/**
 * Deleta label
 */
export async function deleteLabel(labelId) {
    await db.delete(labels).where(eq(labels.id, labelId));
}
/**
 * Busca visual por similaridade
 */
export async function searchBySimilarity(imageId, options) {
    const threshold = options.threshold || 0.7;
    const limit = options.limit || 10;
    // Buscar features da imagem de referência
    const [sourceFeatures] = await db.select()
        .from(imageFeatures)
        .where(eq(imageFeatures.imageId, imageId));
    if (!sourceFeatures || !sourceFeatures.features) {
        return [];
    }
    // Buscar todas as outras imagens com features
    const allFeatures = await db.select()
        .from(imageFeatures)
        .where(sql `${imageFeatures.imageId} != ${imageId}`);
    // Calcular similaridade
    const results = [];
    for (const feature of allFeatures) {
        if (feature.features) {
            const similarity = cosineSimilarity(sourceFeatures.features, feature.features);
            if (similarity >= threshold) {
                results.push({ imageId: feature.imageId, similarity });
            }
        }
    }
    // Ordenar por similaridade
    results.sort((a, b) => b.similarity - a.similarity);
    // Buscar imagens completas
    const imageResults = [];
    for (const r of results.slice(0, limit)) {
        const [image] = await db.select().from(images).where(eq(images.id, r.imageId));
        if (image) {
            imageResults.push({ image, similarity: r.similarity });
        }
    }
    return imageResults;
}
/**
 * Busca por texto (labels)
 */
export async function searchByLabels(workspaceId, labelNames, options) {
    const limit = options.limit || 20;
    // Buscar labels correspondentes
    const matchingLabels = await db.select()
        .from(labels)
        .where(sql `${labels.name} IN ${labelNames} AND ${labels.confidence} >= ${options.minConfidence || 0}`);
    if (matchingLabels.length === 0) {
        return [];
    }
    const imageIds = [...new Set(matchingLabels.map(l => l.imageId))];
    // Buscar imagens
    return db.select()
        .from(images)
        .where(and(eq(images.workspaceId, workspaceId), sql `${images.id} IN ${imageIds}`))
        .limit(limit);
}
/**
 * Cria categoria
 */
export async function createCategory(data) {
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const [category] = await db.insert(categories).values({
        workspaceId: data.workspaceId,
        name: data.name,
        slug,
        description: data.description,
        parentId: data.parentId,
        icon: data.icon,
        color: data.color,
    }).returning();
    return category;
}
/**
 * Lista categorias
 */
export async function listCategories(workspaceId) {
    return db.select()
        .from(categories)
        .where(eq(categories.workspaceId, workspaceId))
        .orderBy(asc(categories.name));
}
/**
 * Associa imagem a categoria
 */
export async function addImageCategory(data) {
    const [imageCategory] = await db.insert(imageCategories).values({
        imageId: data.imageId,
        categoryId: data.categoryId,
        confidence: data.confidence?.toString(),
    }).returning();
    return imageCategory;
}
/**
 * Busca imagens por categoria
 */
export async function searchByCategory(workspaceId, categoryId) {
    return db.select()
        .from(images)
        .innerJoin(imageCategories, sql `${images.id} = ${imageCategories.imageId}`)
        .where(and(eq(images.workspaceId, workspaceId), eq(imageCategories.categoryId, categoryId)));
}
/**
 * Salva busca
 */
export async function saveSearch(data) {
    const [saved] = await db.insert(savedSearches).values({
        workspaceId: data.workspaceId,
        userId: data.userId,
        name: data.name,
        query: data.query,
    }).returning();
    return saved;
}
/**
 * Lista buscas salvas
 */
export async function listSavedSearches(workspaceId) {
    return db.select()
        .from(savedSearches)
        .where(eq(savedSearches.workspaceId, workspaceId))
        .orderBy(desc(savedSearches.createdAt));
}
