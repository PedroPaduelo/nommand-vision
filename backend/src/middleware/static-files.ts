import { Context, Next } from 'hono'
import { readFile } from 'fs/promises'
import path from 'path'

/**
 * Middleware para servir arquivos estáticos (uploads, thumbnails)
 */
export async function staticFilesMiddleware(c: Context, next: Next) {
  const pathname = c.req.path

  // Verificar se é uma requisição para arquivos estáticos
  if (pathname.startsWith('/uploads/') || pathname.startsWith('/thumbnails/')) {
    const uploadDir = process.env.UPLOAD_DIR || './uploads'
    let filePath = path.join(uploadDir, pathname.replace(/^\//, ''))

    // Tratar thumbnails separadamente
    if (pathname.startsWith('/thumbnails/')) {
      filePath = path.join(uploadDir, 'thumbnails', pathname.replace(/^\/thumbnails\//, ''))
    }

    try {
      const file = await readFile(filePath)

      // Determinar Content-Type baseado na extensão
      const ext = path.extname(filePath).toLowerCase()
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      }

      const contentType = mimeTypes[ext] || 'application/octet-stream'

      c.res.headers.set('Content-Type', contentType)
      c.res.headers.set('Cache-Control', 'public, max-age=86400') // 24h cache

      return c.body(file)
    } catch {
      // Se não encontrar, continuar com outras rotas
    }
  }

  await next()
}

export default staticFilesMiddleware
