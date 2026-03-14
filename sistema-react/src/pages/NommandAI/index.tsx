import { useState, useRef, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import { ModelTag } from '@/components/atoms/ModelTag'
import { useToast } from '@/hooks/useToast.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { sanitizeHtml } from '@/utils/sanitize.ts'
import styles from './NommandAI.module.css'

interface ChatMsg {
  role: 'user' | 'bot'
  content: string
}

interface HistoryItem {
  id: string
  title: string
  time: string
  group: string
}

const DEFAULT_HISTORY: HistoryItem[] = [
  { id: 'h1', title: 'Otimizar queries N+1', time: '14:32', group: 'Hoje' },
  { id: 'h2', title: 'Configurar rate limiting', time: '11:05', group: 'Hoje' },
  { id: 'h3', title: 'Setup CI/CD pipeline', time: '09:20', group: 'Ontem' },
  { id: 'h4', title: 'Refactor auth middleware', time: '16:45', group: 'Ontem' },
  { id: 'h5', title: 'Design system tokens', time: '10:30', group: 'Semana Passada' },
]

const INITIAL_MESSAGES: ChatMsg[] = [
  { role: 'user', content: 'Como posso otimizar as queries N+1 no endpoint /api/users?' },
  { role: 'bot', content: '<p>Excelente pergunta! O padrao N+1 ocorre quando voce faz uma query para buscar usuarios e depois uma query adicional para cada usuario.</p><p>Aqui esta a solucao usando <code>DataLoader</code>:</p><pre>import DataLoader from \'dataloader\';\n\n// Batch function\nconst projectLoader = new DataLoader(\n  async (userIds) => {\n    const projects = await db.query(\n      `SELECT * FROM projects\n       WHERE user_id IN (?)`,\n      [userIds]\n    );\n    return userIds.map(id =>\n      projects.filter(p => p.user_id === id)\n    );\n  }\n);</pre><p>Isso vai reduzir de <strong>N+1 queries</strong> para apenas <strong>2 queries</strong>, melhorando o tempo de resposta de ~120ms para ~15ms.</p>' },
  { role: 'user', content: 'E como aplico isso no resolver do GraphQL?' },
  { role: 'bot', content: '<p>No resolver, basta substituir a chamada direta pelo loader:</p><pre>const resolvers = {\n  User: {\n    projects: (user, _, { loaders }) => {\n      return loaders.project.load(user.id);\n    }\n  }\n};</pre><p>Crie o loader no contexto do request para evitar cache entre requests diferentes:</p><pre>const server = new ApolloServer({\n  context: () => ({\n    loaders: {\n      project: new DataLoader(batchProjects)\n    }\n  })\n});</pre><p>Resultado esperado:</p><p>- Antes: <code>~120ms</code> (N+1 queries)<br>- Depois: <code>~15ms</code> (2 queries batched)</p>' },
]

const AI_RESPONSES: { keywords: string[]; html: string }[] = [
  {
    keywords: ['deploy', 'producao', 'production', 'release'],
    html: '<p>Para fazer deploy em producao, siga estes passos:</p><p>1. Certifique-se que todos os testes passaram em CI<br>2. Merge o PR na branch <code>main</code><br>3. O pipeline automatico fara build e deploy</p><pre>git checkout main\ngit merge --no-ff feat/sua-feature\ngit push origin main</pre><p>O deploy sera automatico via pipeline CI/CD. Tempo medio: <strong>1.4 minutos</strong>.</p>',
  },
  {
    keywords: ['teste', 'test', 'testing', 'coverage', 'jest', 'vitest'],
    html: '<p>Para melhorar a cobertura de testes do seu projeto:</p><pre>import { render, screen } from \'@testing-library/react\'\nimport { describe, it, expect } from \'vitest\'\n\ndescribe(\'Component\', () => {\n  it(\'renders correctly\', () => {\n    render(&lt;Component /&gt;)\n    expect(screen.getByText(\'Hello\')).toBeInTheDocument()\n  })\n})</pre><p>Dica: O agente <strong>QA Bot</strong> pode gerar testes automaticamente analisando seu codigo. Coverage atual: <strong>94%</strong>.</p>',
  },
  {
    keywords: ['performance', 'lento', 'slow', 'otimizar', 'optimize', 'speed'],
    html: '<p>Identifiquei algumas oportunidades de otimizacao no seu workspace:</p><p>1. <strong>Bundle splitting</strong> — seu bundle principal tem 142kb. Pode reduzir 30% com dynamic imports<br>2. <strong>Image optimization</strong> — use <code>next/image</code> com lazy loading<br>3. <strong>Cache headers</strong> — configure <code>stale-while-revalidate</code> no CDN</p><pre>// next.config.js\nmodule.exports = {\n  images: { formats: [\'image/avif\', \'image/webp\'] },\n  experimental: { optimizeCss: true }\n}</pre><p>Core Web Vitals atuais: LCP <strong>1.2s</strong>, FID <strong>12ms</strong>, CLS <strong>0.02</strong>.</p>',
  },
  {
    keywords: ['seguranca', 'security', 'vulnerabilidade', 'cve', 'owasp'],
    html: '<p>Scan de seguranca do workspace:</p><p>- Vulnerabilidades criticas: <strong style="color:var(--green)">0</strong><br>- Vulnerabilidades medias: <strong style="color:var(--yellow)">1</strong> (lodash@4.17.20)<br>- Dependencias desatualizadas: <strong>3</strong></p><pre>npm audit fix\nnpm update lodash</pre><p>O agente <strong>Sentinel</strong> monitora CVEs em tempo real. Ultimo scan: <strong>0 problemas criticos</strong>.</p>',
  },
  {
    keywords: ['api', 'endpoint', 'rest', 'graphql', 'rota'],
    html: '<p>Estrutura recomendada para seus endpoints:</p><pre>// routes/api/v2/users.ts\nexport async function GET(req: Request) {\n  const users = await db.user.findMany({\n    include: { projects: true },\n    take: 20,\n    orderBy: { createdAt: \'desc\' }\n  })\n  return Response.json(users)\n}</pre><p>Endpoints ativos: <strong>24</strong> | Latencia media: <strong>11ms</strong> | Rate limit: <strong>1000 req/min</strong></p>',
  },
  {
    keywords: ['docker', 'container', 'kubernetes', 'k8s', 'infra'],
    html: '<p>Configuracao recomendada do Dockerfile:</p><pre>FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nEXPOSE 3000\nCMD ["node", "dist/server.js"]</pre><p>Imagem final: <strong>~89MB</strong>. Use multi-stage build para otimizar.</p>',
  },
  {
    keywords: ['banco', 'database', 'sql', 'postgres', 'prisma', 'query'],
    html: '<p>Otimizacoes de banco de dados detectadas:</p><p>1. <strong>Indices faltando</strong> em <code>projects.user_id</code> e <code>analytics.timestamp</code><br>2. <strong>Connection pool</strong> pode ser aumentado para 25 conexoes<br>3. <strong>Queries lentas</strong>: 2 queries acima de 200ms</p><pre>-- Adicionar indice\nCREATE INDEX idx_projects_user_id\nON projects(user_id);\n\n-- Verificar queries lentas\nSELECT * FROM pg_stat_statements\nORDER BY mean_time DESC\nLIMIT 10;</pre>',
  },
]

function getAIResponse(text: string): string {
  const lower = text.toLowerCase()
  for (const r of AI_RESPONSES) {
    if (r.keywords.some(k => lower.includes(k))) return r.html
  }
  return `<p>Analisei sua pergunta sobre "<strong>${text.substring(0, 60)}</strong>". Aqui estao minhas recomendacoes:</p><p>1. Verifique a documentacao oficial do projeto<br>2. Consulte os logs recentes para contexto adicional<br>3. Execute os testes relevantes antes de aplicar mudancas</p><p>Posso ajudar com algo mais especifico?</p>`
}

const BotAvatar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 22h20L12 2Z" fill="currentColor" />
  </svg>
)

export default function NommandAI() {
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeHistory, setActiveHistory] = useState('h1')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const { t } = useTranslation()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text || isTyping) return

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setIsTyping(true)

    const delay = 800 + Math.random() * 1000
    setTimeout(() => {
      const response = getAIResponse(text)
      setMessages(prev => [...prev, { role: 'bot', content: response }])
      setIsTyping(false)
    }, delay)
  }, [input, isTyping])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  const handleNewChat = useCallback(() => {
    setMessages([])
    setActiveHistory('')
    toast.info(t('nommandAI.newConvoStarted'))
    inputRef.current?.focus()
  }, [toast])

  const handleHistoryClick = useCallback((id: string) => {
    setActiveHistory(id)
    if (id === 'h1') {
      setMessages(INITIAL_MESSAGES)
    } else {
      setMessages([])
    }
    toast.info(t('nommandAI.convoLoaded'))
  }, [toast])

  const GROUP_KEYS = ['Hoje', 'Ontem', 'Semana Passada'] as const
  const groupLabelMap: Record<string, string> = {
    'Hoje': t('nommandAI.today'),
    'Ontem': t('nommandAI.yesterday'),
    'Semana Passada': t('nommandAI.lastWeek'),
  }

  return (
    <div className={styles.aiLayout}>
      <div className={styles.aiSidebar}>
        <button className={styles.newChat} onClick={handleNewChat}>
          {t('nommandAI.newConversation')}
        </button>

        {GROUP_KEYS.map(group => {
          const items = DEFAULT_HISTORY.filter(h => h.group === group)
          if (!items.length) return null
          return (
            <div key={group} className={styles.historyGroup}>
              <div className={styles.historyGroupLabel}>{groupLabelMap[group]}</div>
              {items.map(item => (
                <button
                  key={item.id}
                  className={clsx(styles.historyItem, activeHistory === item.id && styles.historyItemActive)}
                  onClick={() => handleHistoryClick(item.id)}
                  title={item.title}
                >
                  {item.title}
                  <span className={styles.historyTime}>{item.time}</span>
                </button>
              ))}
            </div>
          )
        })}
      </div>

      <div className={styles.aiChatArea}>
        <div className={styles.aiMessages}>
          {messages.length === 0 && !isTyping && (
            <div className={styles.emptyChat}>
              {t('nommandAI.startConversation')}
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={clsx(styles.msg, msg.role === 'user' ? styles.msgUser : styles.msgBot)}
            >
              <div className={clsx(styles.msgAvatar, msg.role === 'user' ? styles.avatarUser : styles.avatarBot)}>
                {msg.role === 'user' ? 'AJ' : <BotAvatar />}
              </div>
              <div className={styles.msgBubble}>
                {msg.role === 'bot' ? (
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.content) }} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className={clsx(styles.msg, styles.msgBot)}>
              <div className={clsx(styles.msgAvatar, styles.avatarBot)}>
                <BotAvatar />
              </div>
              <div className={styles.msgBubble}>
                <span className={styles.typingDots}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className={styles.aiInputArea}>
          <ModelTag model="nommand-v3-turbo" />
          <input
            ref={inputRef}
            type="text"
            className={styles.aiInput}
            placeholder={t('nommandAI.placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className={styles.aiSendBtn} onClick={sendMessage}>
            {t('nommandAI.send')}
          </button>
        </div>
      </div>
    </div>
  )
}
