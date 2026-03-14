import { z } from 'zod'

/**
 * Query Validation Service
 * Valida queries dinâmicas (filtros, ordenação, paginação) para prevenir SQL injection
 */
export class QueryValidatorService {
  // Schema para ordenação
  private static sortSchema = z.object({
    by: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Nome de coluna inválido').max(100),
    dir: z.enum(['asc', 'desc']).default('asc'),
  })

  // Schema para paginação
  private static paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1).max(1000),
    limit: z.coerce.number().int().positive().default(20).max(100),
  })

  // Schema para filtros de texto
  private static textFilterSchema = z.object({
    q: z.string().max(500).optional(),
    fields: z.array(z.string().max(50)).optional().default(['name', 'description', 'content']),
  })

  // Schema para filtro de datas
  private static dateRangeSchema = z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })

  // Schema para filtro booleano
  private static booleanFilterSchema = z.object({
    active: z.boolean().optional(),
    isActive: z.boolean().optional(),
    enabled: z.boolean().optional(),
  })

  // Schema para filtro de enum
  private static enumFilterSchema = z.enum([
    'pending', 'running', 'completed', 'failed', 'cancelled',
    'preview', 'staging', 'production',
    'active', 'draft', 'archived',
    'assistant', 'custom', 'tool', 'supervisor',
    'dev', 'review', 'qa', 'deploy',
  ])

  /**
   * Valida parâmetros de ordenação (sort)
   */
  validateSort(input: unknown): z.infer<typeof this.sortSchema> {
    return this.sortSchema.parse(input)
  }

  /**
   * Valida parâmetros de paginação
   */
  validatePagination(input: unknown): z.infer<typeof this.paginationSchema> {
    return this.paginationSchema.parse(input)
  }

  /**
   * Valida filtros de texto
   */
  validateTextFilter(input: unknown): z.infer<typeof this.textFilterSchema> {
    return this.textFilterSchema.parse(input)
  }

  /**
   * Valida filtro de intervalo de datas
   */
  validateDateRange(input: unknown): z.infer<typeof this.dateRangeSchema> {
    return this.dateRangeSchema.parse(input)
  }

  /**
   * Valida filtro booleano
   */
  validateBooleanFilter(input: unknown): z.infer<typeof this.booleanFilterSchema> {
    return this.booleanFilterSchema.parse(input)
  }

  /**
   * Valida filtro de enum
   */
  validateEnum(value: unknown): z.infer<typeof this.enumFilterSchema> {
    return this.enumFilterSchema.parse(value)
  }

  /**
   * Valida uma query completa (sort + pagination + filters)
   */
  validateQueryParams(params: Record<string, unknown>): {
    sort?: { by: string; dir: 'asc' | 'desc' }
    page: number
    limit: number
    filters: Record<string, unknown>
  } {
    const validated: Record<string, unknown> = {}
    const filterKeys: string[] = []

    for (const [key, value] of Object.entries(params)) {
      if (key === 'sort' || key === 'page' || key === 'limit') {
        continue
      }

      // Whitelist de chaves de filtro permitidas
      const allowedFilterKeys = [
        'q', 'fields',
        'from', 'to',
        'active', 'isActive', 'enabled',
        'status', 'type', 'category', 'environment',
        'workspaceId', 'userId', 'projectId', 'agentId',
      ]

      if (!allowedFilterKeys.includes(key)) {
        throw new Error(`Parâmetro de filtro não permitido: ${key}`)
      }

      filterKeys.push(key)
    }

    // Validar sort se presente
    let sort: { by: string; dir: 'asc' | 'desc' } | undefined
    if (params.sort) {
      sort = this.validateSort(params.sort)
      // Whitelist de colunas permitidas para ordenação
      const allowedSortColumns = [
        'createdAt', 'updatedAt', 'name', 'email', 'status',
        'id', 'title', 'type', 'category', 'model',
      ]
      if (!allowedSortColumns.includes(sort.by)) {
        throw new Error(`Coluna de ordenação não permitida: ${sort.by}`)
      }
    }

    // Validar paginação
    const page = this.validatePagination(params).page
    const limit = this.validatePagination(params).limit

    // Validar cada filtro
    const filters: Record<string, unknown> = {}
    for (const key of filterKeys) {
      const value = params[key]

      switch (key) {
        case 'q':
          filters[key] = this.validateTextFilter({ q: value }).q
          break
        case 'fields':
          filters[key] = this.validateTextFilter({ fields: value }).fields
          break
        case 'from':
        case 'to':
          filters[key] = this.validateDateRange({ [key]: value })[key]
          break
        case 'active':
        case 'isActive':
        case 'enabled':
          filters[key] = this.validateBooleanFilter({ [key]: value })[key]
          break
        case 'status':
        case 'type':
        case 'category':
        case 'environment':
          filters[key] = this.validateEnum(value)
          break
        case 'workspaceId':
        case 'userId':
        case 'projectId':
        case 'agentId':
          // Validar que são UUIDs válidos
          const uuidSchema = z.string().uuid()
          filters[key] = uuidSchema.parse(value)
          break
        default:
          // Para outras chaves aprovadas na whitelist, passar como string
          filters[key] = z.string().max(100).parse(value)
      }
    }

    return { sort, page, limit, filters }
  }

  /**
   * Valida parâmetros de consulta, retorna saneados ou lança erro
   */
  safeParseQuery(params: Record<string, unknown>): {
    success: true
    data: Awaited<ReturnType<this['validateQueryParams']>>
  } | {
    success: false
    error: z.ZodError
  } {
    try {
      const result = this.validateQueryParams(params)
      return { success: true, data: result }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error }
      }
      throw error
    }
  }

  /**
   * Escape de valores para uso em SQL direto (se necessário)
   * Nota: Prefira sempre usar parâmetros bind do Drizzle
   */
  escapeForRawQuery(value: unknown): string {
    if (value === null || value === undefined) {
      return 'NULL'
    }
    if (typeof value === 'number') {
      return String(value)
    }
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE'
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`
    }
    // String - escapar aspas simples
    return `'${String(value).replace(/'/g, "''")}'`
  }
}

export const queryValidatorService = new QueryValidatorService()
