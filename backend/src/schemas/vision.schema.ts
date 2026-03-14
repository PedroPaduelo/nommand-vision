import { z } from 'zod'

// Schema para upload de imagem
export const uploadImageSchema = z.object({
  projectId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

// Schema para atualizar imagem
export const updateImageSchema = z.object({
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

// Schema para criar label
export const createLabelSchema = z.object({
  imageId: z.string().uuid(),
  type: z.enum(['object', 'scene', 'concept', 'text', 'color', 'face']),
  name: z.string().min(1).max(255),
  x: z.number().min(0).max(1).optional(),
  y: z.number().min(0).max(1).optional(),
  width: z.number().min(0).max(1).optional(),
  height: z.number().min(0).max(1).optional(),
  confidence: z.number().min(0).max(1),
  notes: z.string().optional(),
  isManual: z.boolean().default(true),
})

// Schema para atualizar label
export const updateLabelSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  notes: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  x: z.number().min(0).max(1).optional(),
  y: z.number().min(0).max(1).optional(),
  width: z.number().min(0).max(1).optional(),
  height: z.number().min(0).max(1).optional(),
})

// Schema para categoria
export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  icon: z.string().max(100).optional(),
  color: z.string().max(7).optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().nullable().optional(),
  icon: z.string().max(100).optional(),
  color: z.string().max(7).optional(),
})

// Schema para busca visual
export const visualSearchSchema = z.object({
  imageId: z.string().uuid().optional(),
  text: z.string().optional(),
  categories: z.array(z.string().uuid()).optional(),
  labels: z.array(z.string()).optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  maxResults: z.number().min(1).max(100).optional(),
  limit: z.number().min(1).max(100).optional(),
})

// Schema para associar imagem a categorias
export const addImageCategorySchema = z.object({
  categoryId: z.string().uuid(),
  confidence: z.number().min(0).max(1).optional(),
})

// Schema para busca por similaridade
export const similaritySearchSchema = z.object({
  imageId: z.string().uuid(),
  threshold: z.number().min(0).max(1).default(0.7),
  limit: z.number().min(1).max(50).default(10),
})

// Schema para salvar busca
export const saveSearchSchema = z.object({
  name: z.string().min(1).max(255),
  query: z.object({
    imageId: z.string().uuid().optional(),
    text: z.string().optional(),
    categories: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    minConfidence: z.number().min(0).max(1).optional(),
    maxResults: z.number().min(1).max(100).optional(),
  }),
})

// Tipos inferidos
export type UploadImageInput = z.infer<typeof uploadImageSchema>
export type UpdateImageInput = z.infer<typeof updateImageSchema>
export type CreateLabelInput = z.infer<typeof createLabelSchema>
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type VisualSearchInput = z.infer<typeof visualSearchSchema>
export type AddImageCategoryInput = z.infer<typeof addImageCategorySchema>
export type SimilaritySearchInput = z.infer<typeof similaritySearchSchema>
export type SaveSearchInput = z.infer<typeof saveSearchSchema>
