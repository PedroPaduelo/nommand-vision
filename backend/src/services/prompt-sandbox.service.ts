import type { AppEnv } from '../types/context.js'

export type PromptValidationResult = {
  isValid: boolean
  errors: string[]
  sanitized?: string
}

/**
 * Prompt Sandbox Service
 * Protege contra prompt injection e manipulação maliciosa
 */
export class PromptSandboxService {
  // Palavras-chave perigosas que indicam tentativa de injection
  private static DANGEROUS_PATTERNS = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /disregard\s+(all\s+)?previous\s+orders?/i,
    /forget\s+(all\s+)?(what\s+)?you\s+know/i,
    /system\s+prompt/i,
    /instructions?\s*:\s*/i,
    /<\|.*?\|>/i, // tokens especiais
    /\\n\\n/i, // tentativa de separar prompts
    /\/\*.*?\*\/gs, // tentativa de comentário JS
    /```[\s\S]*?```/g, // tentativa de bloco de código
    /\/\//, // comentário de linha
    /#/i, // pode ser usado para comments
  ]

  // Comandos proibidos
  private static FORBIDDEN_COMMANDS = [
    'rm -rf',
    'sudo',
    'system(',
    'exec(',
    'eval(',
    '_process',
    'require(',
    'import ',
    'child_process',
    'fs.',
    'readFile',
    'writeFile',
    'delete',
    'drop',
    'truncate',
    'alter',
    'grant',
    'revoke',
  ]

  /**
   * Valida e sanitiza um prompt antes de enviar para Claude
   */
  validateAndSanitize(prompt: string, agentType: string = 'custom'): PromptValidationResult {
    const errors: string[] = []
    let sanitized = prompt

    // 1. Verificar comprimento máximo
    if (prompt.length > 128000) {
      errors.push('Prompt excede o tamanho máximo de 128.000 caracteres')
      return { isValid: false, errors }
    }

    // 2. Verificar padrões de injection (apenas para agentes customizados)
    if (agentType === 'custom') {
      for (const pattern of this.DANGEROUS_PATTERNS) {
        if (pattern.test(prompt)) {
          errors.push(`Padrão suspeito detectado: ${pattern.toString()}`)
        }
      }
    }

    // 3. Verificar comandos proibidos
    for (const cmd of this.FORBIDDEN_COMMANDS) {
      if (prompt.toLowerCase().includes(cmd.toLowerCase())) {
        errors.push(`Comando proibido detectado: ${cmd}`)
      }
    }

    // 4. Sanitizar newlines excessivos
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n')

    // 5. Remover tentativas de blob de código
    sanitized = sanitized.replace(/```[\s\S]*?```/g, '[code removed]')

    // 6. Escapar caracteres de controle
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: sanitized === prompt ? undefined : sanitized,
    }
  }

  /**
   * Escapa prompts de system para evitar injection via systemPrompt
   */
  escapeSystemPrompt(prompt: string): string {
    return prompt
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
  }

  /**
   * Verifica se um prompt contém referências a arquivos do sistema
   */
  containsFileReferences(prompt: string): { found: boolean; files: string[] } {
    const filePatterns = [
      /\.(env|config|json|yaml|yml|toml|ini|cfg)$/i,
      /\.(sh|bash|zsh|fish)$/i,
      /\.(py|js|ts|tsx|jsx)$/i,
      /etc\//,
      /\/home\//,
      /C:\\/,
      /\.env/,
      /package\.json/,
      /\.git/,
    ]

    const found: string[] = []
    for (const pattern of filePatterns) {
      const match = prompt.match(pattern)
      if (match) {
        found.push(match[0])
      }
    }

    return { found: found.length > 0, files: found }
  }

  /**
   * Aplica várias camadas de sanitização
   */
  deepSanitize(prompt: string): string {
    let result = prompt

    // 1. Remover HTML/XML tags
    result = result.replace(/<[^>]*>/g, '')

    // 2. Remover URLs que podem ser usadas para exfiltração
    result = result.replace(/https?:\/\/[^\s]+/g, '[URL removed]')

    // 3. Remover possíveis tokens/api keys
    result = result.replace(/(sk|gh|ey)[_-]?[A-Za-z0-9]{20,}/g, '[REDACTED]')

    // 4. Normalizar espaços
    result = result.replace(/\s+/g, ' ').trim()

    // 5. Limitar tamanho final
    if (result.length > 100000) {
      result = result.substring(0, 100000) + '... [truncated]'
    }

    return result
  }
}

export const promptSandboxService = new PromptSandboxService()
