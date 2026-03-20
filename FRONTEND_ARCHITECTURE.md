# Mapeamento Completo da Arquitetura Frontend - Nommand Vision

## 📊 Visão Geral

**Nome do Projeto:** Nommand Vision
**Framework:** React 19
**Roteamento:** React Router DOM v6.30
**Gerenciamento de Estado:** React Query v5 + Context API
**Build Tool:** Vite 7.3
**Linguagem:** TypeScript 5.9
**Testes:** Vitest + Testing Library

---

## 🗂️ Estrutura de Pastas (Atomic Design)

```
src/
├── App.tsx
├── main.tsx
├── router.tsx
├── providers/
│   └── AppProviders.tsx
├── components/
│   ├── atoms/          (10 componentes)
│   │   ├── Avatar
│   │   ├── EnvBadge
│   │   ├── Kbd
│   │   ├── LiveIndicator
│   │   ├── MessageTag
│   │   ├── ModelTag
│   │   ├── ProgressBar
│   │   ├── StatusBadge
│   │   ├── StatusDot
│   │   └── Tag
│   ├── molecules/      (16 componentes)
│   │   ├── ColorPicker
│   │   ├── ConfirmDialog
│   │   ├── EmptyState
│   │   ├── ErrorBoundary
│   │   ├── FilterBar
│   │   ├── IconPicker
│   │   ├── MetricCard
│   │   ├── Modal
│   │   ├── PillSelector
│   │   ├── SearchInput
│   │   ├── TerminalOutput
│   │   ├── Toast
│   │   ├── Toggle
│   │   └── Tooltip
│   ├── organisms/      (14 componentes)
│   │   ├── ActivityTimeline
│   │   ├── AgentCard
│   │   ├── BarChart
│   │   ├── ChatMessage
│   │   ├── CodePreview
│   │   ├── DataTable
│   │   ├── DeployRow
│   │   ├── DonutChart
│   │   ├── FileTree
│   │   ├── LineChart
│   │   ├── ProjectCard
│   │   ├── ScoreBar
│   │   ├── Sparkline
│   │   └── UptimeBar
│   └── templates/      (7 templates)
│       ├── AppShell
│       ├── CommandPalette
│       ├── Header
│       ├── NotificationPanel
│       ├── Sidebar
│       ├── TabNavigation
│       └── TourOverlay
├── hooks/
│   ├── useAuth.ts
│   ├── useTheme.ts
│   ├── useTranslation.ts
│   ├── useToast.ts
│   ├── useConfirm.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useLocalStorage.ts
│   ├── useOnboarding.ts
│   └── queries/          (13 custom hooks de query)
│       ├── useProjectQueries.ts
│       ├── useDeployQueries.ts
│       ├── useInboxQueries.ts
│       ├── useAgentQueries.ts
│       ├── useAnalyticsQueries.ts
│       ├── useLogQueries.ts
│       ├── useAutomationQueries.ts
│       ├── useMarketplaceQueries.ts
│       ├── useStatusQueries.ts
│       ├── useProfileQueries.ts
│       ├── useSettingsQueries.ts
│       ├── useNotificationQueries.ts
├── pages/                (17 páginas)
│   ├── Login
│   ├── Onboarding
│   ├── Panorama
│   ├── Projetos
│   ├── ProjetoDetalhe
│   ├── Inbox
│   ├── Analytics
│   ├── Deploys
│   ├── NommandAI
│   ├── Agentes
│   ├── Logs
│   ├── Automacoes
│   ├── Marketplace
│   ├── Playground
│   ├── Status
│   ├── Perfil
│   └── Configuracoes
├── stores/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   ├── I18nContext.tsx
│   ├── ToastContext.tsx
│   └── ConfirmContext.tsx
├── services/
│   ├── api.ts            (cliente HTTP principal)
│   ├── auth.service.ts
│   ├── projects.service.ts
│   ├── agents.service.ts
│   ├── analytics.service.ts
│   ├── deploys.service.ts
│   ├── inbox.service.ts
│   ├── logs.service.ts
│   ├── automations.service.ts
│   ├── marketplace.service.ts
│   ├── notifications.service.ts
│   ├── profile.service.ts
│   ├── settings.service.ts
│   └── status.service.ts
├── types/
│   ├── index.ts
│   ├── auth.ts
│   ├── models.ts
│   └── ui.ts
├── styles/
│   ├── global.css
│   ├── themes.css
│   ├── tokens.css
│   └── animations.css
├── i18n/
│   ├── pt-BR.json
│   ├── en.json
│   └── es.json
├── utils/
│   ├── constants.ts
│   ├── formatters.ts
│   ├── sanitize.ts
│   └── confetti.ts
```

**Organização:** Atomic Design + Feature-based (pages)
**Estrutura:** Horizontal (shared components) + Vertical (pages com suas lógicas)

---

## 🔄 Rotas e Proteções

### Tabela de Rotas

| Path | Componente | Proteções | Lazy Load | Descrição |
|------|-----------|-----------|-----------|-----------|
| `/login` | `pages/Login` | Público | ✅ | Página de autenticação |
| `/onboarding` | `pages/Onboarding` | Auth + Não onboardado | ✅ | Onboarding do usuário |
| `/panorama` | `pages/Panorama` | Auth + Onboardado | ✅ | Dashboard principal |
| `/projetos` | `pages/Projetos` | Auth + Onboardado | ✅ | Lista de projetos |
| `/projetos/:slug` | `pages/ProjetoDetalhe` | Auth + Onboardado | ✅ | Detalhes do projeto |
| `/inbox` | `pages/Inbox` | Auth + Onboardado | ✅ | Central de mensagens |
| `/analytics` | `pages/Analytics` | Auth + Onboardado | ✅ | Analytics e métricas |
| `/deploys` | `pages/Deploys` | Auth + Onboardado | ✅ | Histórico de deploys |
| `/nommand-ai` | `pages/NommandAI` | Auth + Onboardado | ✅ | Chat com IA Nommand |
| `/agentes` | `pages/Agentes` | Auth + Onboardado | ✅ | Gerenciamento de agentes |
| `/logs` | `pages/Logs` | Auth + Onboardado | ✅ | Logs do sistema |
| `/automacoes` | `pages/Automacoes` | Auth + Onboardado | ✅ | Workflows e automações |
| `/marketplace` | `pages/Marketplace` | Auth + Onboardado | ✅ | Marketplace de agentes |
| `/playground` | `pages/Playground` | Auth + Onboardado | ✅ | Ambiente de testes |
| `/status` | `pages/Status` | Auth + Onboardado | ✅ | Status dos serviços |
| `/perfil` | `pages/Perfil` | Auth + Onboardado | ✅ | Perfil do usuário |
| `/configuracoes` | `pages/Configuracoes` | Auth + Onboardado | ✅ | Configurações do sistema |
| `*` | Redirect para `/panorama` | - | ❌ | 404 fallback |

### Guardas de Rota

**AuthGuard** (`router.tsx:102-108`):
- Verifica `user.authenticated`
- Redireciona para `/login` se não autenticado

**OnboardingGuard** (`router.tsx:110-116`):
- Verifica `user.onboarded`
- Redireciona para `/onboarding` se não completado

**Hierarquia:**
```
Rota Protegida
├── AuthGuard
│   └── OnboardingGuard
│       └── AppShell (layout principal)
│           └── Outlet (página)
```

### Estrutura do Router

```typescript
// router.tsx
const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/onboarding', element: <Onboarding /> },
  {
    element: <ErrorBoundary><AuthGuard><OnboardingGuard><AppShell /></></></>,
    children: [
      { index: true, element: <Navigate to="/panorama" /> },
      { path: '/panorama', element: <Panorama /> },
      // ... outras rotas
    ]
  },
  { path: '*', element: <Navigate to="/panorama" /> }
])
```

---

## 🎨 Gerenciamento de Estado

### Context Providers (5)

| Provider | Estado Global | Persistência | Responsabilidade |
|----------|--------------|--------------|------------------|
| `AuthProvider` | ✅ | localStorage | Autenticação, perfil, onboarding |
| `ThemeProvider` | ✅ | localStorage + API | Tema (dark/light), accent color por role |
| `I18nProvider` | ✅ | localStorage | Traduções (pt-BR, en, es) |
| `ToastProvider` | ✅ | memória (temporário) | Sistema de notificações |
| `ConfirmProvider` | ✅ | memória (temporário) | Diálogos de confirmação |

### React Query (TanStack Query v5)

**Configuração padrão** (`AppProviders.tsx:9-17`):
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,      // 30 segundos
      retry: 1,               // 1 retry
      refetchOnWindowFocus: false,
    },
  },
})
```

**Hooks de Query** (13 entities):

| Hook | Query Key | staleTime | Uso |
|------|-----------|-----------|-----|
| `useProjects(role)` | `['projects', role]` | 30s | Lista projetos filtrada por role |
| `useProjectBySlug(slug)` | `['project', slug]` | 30s | Projeto individual |
| `useAgents()` | `['agents']` | 30s | Lista de agentes |
| `useAgentById(id)` | `['agent', id]` | 30s | Agente individual |
| `useMetrics(period)` | `['analytics', 'metrics', period]` | 30s | Métricas do painel |
| `useEndpoints()` | `['analytics', 'endpoints']` | 30s | Endpoints de API |
| `useNotifications()` | `['notifications']` | 30s | Notificações do usuário |
| `useDeploys()` | `['deploys']` | 30s | Histórico de deploys |
| `useInboxMessages()` | `['inbox']` | 30s | Mensagens da inbox |
| `useLogs()` | `['logs']` | 30s | Logs do sistema |
| `useStatus()` | `['status']` | 30s | Status dos serviços |
| `useAutomations()` | `['automations']` | 30s | Automações configuradas |
| `useMarketplaceAgents()` | `['marketplace']` | 30s | Agentes do marketplace |

### Mutations

Cada entity tem mutations típicas (CRUD):
- `useCreateProject()`, `useUpdateProject()`, `useDeleteProject()`
- `useCreateAgent()`, `useStartAgent()`, `useStopAgent()`, `useDeleteAgent()`
- `useStartDeploy()`, `useCancelDeploy()`
- `useSendMessage()`, `useMarkAsRead()`

**Padrão:** Todas as mutations invalidam queries relevantes no `onSuccess`:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['projects'] })
}
```

---

## 🌍 Roteamento (React Router v6)

### Padrão de Navegação

**Lazy Loading com Suspense:**
```typescript
const Panorama = lazy(() => import('@/pages/Panorama/index.tsx'))

element: (
  <Suspense fallback={<PageLoader />}>
    <Panorama />
  </Suspense>
)
```

**PageLoader:** Spinner simples com animação CSS

### Error Handling

- `ErrorBoundary` (molecule) em todos os níveis
- `RouteErrorFallback` em `router.tsx:58-100`
- Mostra mensagem de erro + botão "Voltar ao início"

### Navegação Programática

**Uso de `useNavigate()`:**
```typescript
const navigate = useNavigate()
navigate('/projetos')
navigate(`/projetos/${slug}`)
navigate('/panorama', { replace: true })
```

### Atalhos de Teclado

**Hook `useKeyboardShortcuts`** (`hooks/useKeyboardShortcuts.ts`):

| Atalho | Ação |
|--------|------|
| `Ctrl/Cmd + K` | Abrir Command Palette |
| `Ctrl/Cmd + N` | Ir para `/projetos` |
| `Ctrl/Cmd + D` | Ir para `/deploys` |
| `Ctrl/Cmd + L` | Ir para `/logs` |
| `?` | Mostrar ajuda de atalhos |
| `G` + `P` | Ir para Panorama |
| `G` + `J` | Ir para Projetos |
| `G` + `I` | Ir para Inbox |
| `G` + `A` | Ir para Analytics |
| `G` + `D` | Ir para Deploys |
| `G` + `S` | Ir para Configurações |
| `G` + `M` | Ir para Marketplace |
| `G` + `L` | Ir para Logs |

---

## 🎨 Theming (Dark/Light Mode)

### Sistema de Temas

**Provider:** `ThemeContext` + `ThemeProvider`
- Lê/salva tema em `localStorage` (`nexus_theme`)
- Baseado no role do usuário, aplica accent color dinâmica
- Role-based theming: cada role tem cor neon diferente

**Role Themes** (`utils/constants.ts:3-8`):
```typescript
export const ROLE_THEMES: Record<Role, RoleTheme> = {
  Frontend: { hex: '#3b82f6', name: 'UI Edge' },      // Azul
  Backend: { hex: '#22c55e', name: 'Core API' },      // Verde
  Design: { hex: '#c026d3', name: 'Creative' },       // Magenta
  Data: { hex: '#eab308', name: 'Pipelines' }         // Amarelo
}
```

### CSS Variables

**Tokens** (`styles/tokens.css`):
- Cores base: `--bg`, `--text`, `--muted`, `--border`, `--neon`
- `--neon` é atualizado dinamicamente via JS:
```typescript
document.documentElement.style.setProperty('--neon', accent)
```

### Modo Escuro/Padrão

- tema padrão: **dark**
- light mode tem overrides especiais (`themes.css`):
  - Reduz opacidade de glows
  - Ajusta scrollbar

### Uso em Componentes

```typescript
import { useTheme } from '@/hooks/useTheme.ts'

const { theme, accent, setTheme, toggleTheme } = useTheme()

// CSS
<div style={{ background: 'var(--neon)' }} />
<div className={clsx(styles.card, theme === 'dark' && styles.dark)} />
```

---

## 🔧 Componentes UI Reutilizáveis

### Atoms (10)

| Componente | Props | Uso | Arquivo |
|-----------|-------|-----|---------|
| `Avatar` | `src`, `alt`, `initials`, `status` | Avatar de usuário | `components/atoms/Avatar/` |
| `EnvBadge` | `env` | Badge de ambiente | `components/atoms/EnvBadge/` |
| `Kbd` | children | Tecla de atalho estilizada | `components/atoms/Kbd/` |
| `LiveIndicator` | - | Indicador ao vivo | `components/atoms/LiveIndicator/` |
| `MessageTag` | `tag`, `color` | Tag de mensagem | `components/atoms/MessageTag/` |
| `ModelTag` | `model` | Tag de modelo IA | `components/atoms/ModelTag/` |
| `ProgressBar` | `value`, `max` | Barra de progresso | `components/atoms/ProgressBar/` |
| `StatusBadge` | `status`, `size` | Badge de status | `components/atoms/StatusBadge/` |
| `StatusDot` | `status`, `size` | Ponto de status | `components/atoms/StatusDot/` |
| `Tag` | `color`, `children` | Tag genérica | `components/atoms/Tag/` |

### Molecules (16)

| Componente | Props | Uso |
|-----------|-------|-----|
| `ColorPicker` | `colors`, `selected`, `onChange` | Seletor de cor |
| `ConfirmDialog` | title, message, onConfirm, onCancel | Diálogo de confirmação |
| `EmptyState` | icon, title, description, action | Estado vazio |
| `ErrorBoundary` | children, fallback | Captura erros |
| `FilterBar` | filters, activeFilter, onChange | Barra de filtros |
| `IconPicker` | options, selected, onChange | Seletor de ícone |
| `MetricCard` | label, value, trend, sparkline | Card de métrica |
| `Modal` | open, onClose, title, width | Modal reutilizável |
| `PillSelector` | options, selected, onChange, multi | Seleção múltipla |
| `SearchInput` | value, onChange, placeholder | Input de busca |
| `TerminalOutput` | lines, className | Output de terminal |
| `Toast` | toasts, onRemove | Container de toasts |
| `Toggle` | checked, onChange, label | Botão toggle |
| `Tooltip` | content, children | Tooltip |
| `FileTree` | files, onSelect | Árvore de arquivos |
| `DataTable` | columns, data, onRowClick | Tabela de dados |

### Organisms (14)

| Componente | Uso |
|-----------|-----|
| `ActivityTimeline` | Linha do tempo de atividades |
| `AgentCard` | Card de agente IA |
| `BarChart` | Gráfico de barras |
| `ChatMessage` | Mensagem de chat |
| `CodePreview` | Visualizador de código com syntax highlight |
| `DataTable` | Tabela completa com ordenação |
| `DeployRow` | Linha de deploy |
| `DonutChart` | Gráfico de rosca |
| `FileTree` | Árvore de arquivos navegável |
| `LineChart` | Gráfico de linha |
| `ProjectCard` | Card de projeto |
| `ScoreBar` | Barra de pontuação |
| `Sparkline` | Mini gráfico sparkline |
| `UptimeBar` | Barra de uptime (30 dias) |

### Templates (Layouts)

| Template | Descrição |
|----------|-----------|
| `AppShell` | Layout principal com sidebar + header + content area |
| `Header` | Barra superior com busca, notificações, perfil |
| `Sidebar` | Menu lateral navigation |
| `CommandPalette` | Palette de comandos (Ctrl+K) |
| `NotificationPanel` | Painel de notificações |
| `TabNavigation` | Navegação por abas |
| `TourOverlay` | Overlay de tour guiado |

---

## 🌐 Cliente HTTP

### API Client (`services/api.ts`)

**Tipo:** Wrapper fetch nativo (não usa axios)
**Base URL:** `import.meta.env.VITE_API_URL || '/api'`
**Autenticação:** Bearer token no header `Authorization`

#### Features:

1. **Token Refresh Automático:**
   - Tokens salvos em `localStorage`:
     - `nommand_access_token`
     - `nommand_refresh_token`
   - Intercepta erros 401
   - Refresh em paralelo (singleton pattern)
   - Recria request após refresh

2. **Métodos CRUD:**
```typescript
api.get<T>(endpoint)
api.post<T>(endpoint, body)
api.patch<T>(endpoint, body)
api.put<T>(endpoint, body)
api.delete<T>(endpoint)
```

3. **Error Handling:**
```typescript
if (!response.ok) {
  const error = await response.json()
  throw new Error(error.error.message || 'Request failed')
}
```

#### Estrutura de Serviços

Cada domain tem seu service module:
- `projects.service.ts` - 7 funções CRUD + stats + activity
- `agents.service.ts` - CRUD + start/stop
- `analytics.service.ts` - metrics, endpoints, geo, period data
- `deploys.service.ts` - deploys, logs
- `inbox.service.ts` - mensagens, threads
- `logs.service.ts` - logs do sistema
- `status.service.ts` - health check, services
- `auth.service.ts` - login, logout, getMe
- `settings.service.ts` - user settings, api keys
- `profile.service.ts` - perfil do usuário
- `notifications.service.ts` - CRUD de notificações
- `marketplace.service.ts` - agentes marketplace
- `automations.service.ts` - automações

**Padrão:** Cada service usa `api.*` e retorna tipos TypeScript.

---

## 🎯 Hooks Customizados

### Context Hooks (5)

| Hook | Provider | Export | Uso |
|------|----------|--------|-----|
| `useAuth()` | `AuthContext` | AuthProvider | user, login, logout, completeOnboarding |
| `useTheme()` | `ThemeContext` | ThemeProvider | theme, accent, toggleTheme |
| `useTranslation()` | `I18nContext` | I18nProvider | t(key, params), lang, setLang |
| `useToast()` | `ToastContext` | ToastProvider | success, error, warning, info |
| `useConfirm()` | `ConfirmContext` | ConfirmProvider | confirm(title, msg, danger?) |

### Utility Hooks (4)

| Hook | Descrição |
|------|-----------|
| `useLocalStorage(key, defaultValue)` | Hook genérico para localStorage |
| `useKeyboardShortcuts(navigate, callbacks)` | Gestiona atalhos globais |
| `useOnboarding()` | Gerencia estado do onboarding |
| `useConfirm()` | Mostra diálogo de confirmação |

### Query Hooks (13)

Cada entity tem 2-4 hooks (list, byId, create, update, delete, mutations).

**Exemplo - Projects:**
```typescript
useProjects(role)              // GET /projects?role=X
useProjectBySlug(slug)        // GET /projects/:slug
useProjectById(id)            // GET /projects/:id
useCreateProject()            // POST /projects
useUpdateProject()            // PUT /projects/:id
useDeleteProject()            // DELETE /projects/:id
```

---

## 🌍 Internacionalização (i18n)

### Provider: `I18nProvider`

- 3 idiomas: `pt-BR` (padrão), `en`, `es`
- Detecção automática via `navigator.language`
- Persistência em `localStorage` (`nexus_lang`)
- Hook: `useTranslation()` → `{ t, lang, setLang }`

### Uso:
```typescript
const { t } = useTranslation()
t('projects.nameRequired')           // Simples
t('projects.created', { name })     // Com parâmetros
```

### Arquivos:
- `i18n/pt-BR.json` - traduções PT-BR
- `i18n/en.json` - traduções EN
- `i18n/es.json` - traduções ES

---

## 🏗️ Padrões de Código

### State Management

**Estado local:** `useState`, `useReducer` (ex: formulários)
**Estado global:**
- User/session: `AuthContext`
- UI state: `ToastProvider`, `ConfirmProvider`
- Server state: `React Query`
- Theme/i18n: `ThemeProvider`, `I18nProvider`

### Formulários

Padrão misto:
- `useState` simples (Login, Onboarding)
- `useReducer` complexo (Projetos - forms longos)
- `react-hook-form` - **não utilizado**, forms manuais

### Loading States

- Suspense boundaries para lazy loading
- `isLoading`, `isPending` do React Query
- Spinner customizado (`PageLoader`)
- Skeleton components - **não implementados**

### Error Handling

1. API errors → throw → catch em mutations
2. `useQuery` → `isError`, `error`
3. `ErrorBoundary` para erros de renderização
4. `RouteErrorFallback` para rotas

### CSS Modules

Todos os componentes usam CSS Modules:
```typescript
import styles from './Component.module.css'
<div className={styles.container} />
```

**CSS Global:** `styles/global.css` (reset, scrollbar, glows)
**Theme CSS:** `styles/themes.css` (overrides light mode)
**Tokens:** `styles/tokens.css` (CSS variables)

---

## 📁 Tipos TypeScript

### Arquivos (`types/`)

| Arquivo | Tipos Exportados |
|---------|------------------|
| `auth.ts` | `Role`, `RoleTheme`, `User` |
| `models.ts` | `Project`, `Deploy`, `InboxMessage`, `Agent`, `Endpoint`, `Workflow`, `MarketplaceAgent`, `StatusService`, `Incident`, `LogEntry`, `Notification`, `Activity`, `Session` |
| `ui.ts` | `ToastType`, `ToastItem`, `ConfirmOptions` |
| `index.ts` | Re-export de todos os tipos |

### APIs Fortemente Tipadas

Cada service retorna tipos específicos:
```typescript
type ProjectListResponse = { data: Project[]; meta: { total: number; page: number; perPage: number } }
type ProjectResponse = { data: Project }
```

---

## ⚙️ Configurações

### Vite (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5000, allowedHosts: 'all', cors: true },
  preview: { host: '0.0.0.0', allowedHosts: 'all', cors: true },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: { modules: { classNameStrategy: 'non-scoped' } }
  }
})
```

**Alias:** `@` → `./src`

### TypeScript

`tsconfig.json` → references `tsconfig.app.json` e `tsconfig.node.json`

**Features esperadas:**
- Strict mode: ✅
- JSX: React 19
- Module resolution: Vite
- Path mapping: `@/*`

### Package.json

**Dependencies Principais:**
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^6.30.3",
    "@tanstack/react-query": "^5.90.21",
    "clsx": "^2.1.1",
    "dompurify": "^3.3.1",
    "pg": "^8.20.0",
    "express": "^5.2.1"
  },
  "devDependencies": {
    "typescript": "~5.9.3",
    "vite": "^7.3.1",
    "vitest": "^4.0.18",
    "@vitejs/plugin-react": "^5.1.1",
    "@testing-library/react": "^16.3.2",
    "eslint": "^9.39.1"
  }
}
```

---

## 📱 SSR/SSG

**Status:** ❌ Não usa SSR/SSG
**Tipo:** SPA (Single Page Application) puramente client-side
**Build:** `vite build` gera assets estáticos
**Server:** `node server.js` + Vite dev server (hot reload)

**Justificativa:**
- App dashboard user-centric
- Muitas features interativas em tempo real
- React Query lida com cache
- Sem necessidade de SEO

---

## 🔁 Fluxo de Dados

```mermaid
graph TD
    A[User Action] --> B[Component Event]
    B --> C[State Update]
    B --> D[React Query Mutation]
    D --> E[Service Layer]
    E --> F[API Client]
    F --> G[Backend API]
    G --> F
    F --> E
    E --> D
    D --> H[Query Invalidation]
    H --> I[Auto Refetch]
    I --> J[UI Update]
    C --> J

    subgraph "Context Sync"
        K[Auth Context] --> L[LocalStorage]
        L --> M[API (getMe)]
        M --> K
    end

    subgraph "Theme System"
        N[Theme Context] --> O[CSS Variables]
        P[Role-based Colors] --> O
    end

    A --> Q[Toast/Confirm Context]
    Q --> R[Temporary UI State]
```

### Exemplo - Criar Projeto:

1. User preenche formulário → `handleCreate()`
2. Chama `createMutation.mutate(data)`
3. Mutation executa `projects.service.createProject(data)`
4. Service chama `api.post('/projects', data)`
5. API retorna projeto criado
6. `onSuccess` → `queryClient.invalidateQueries(['projects'])`
7. React Query refetea `useProjects()`
8. UI atualiza com nova lista
9. Toast de sucesso exibido via `toast.success()`

---

## 🧪 Testes

**Framework:** Vitest
**Libs:** Testing Library (React, User Event, Jest DOM)
**Setup:** `src/test/setup.ts`
**Test files:** `__tests__` em cada diretório

### Test Coverage:

| Módulo | Testes |
|--------|--------|
| `hooks/` | `useAuth.test.tsx`, `useLocalStorage.test.ts`, `useTheme.test.tsx`, `useToast.test.tsx`, `useTranslation.test.tsx` |
| `hooks/queries/` | `__tests__/` |
| `services/` | `__tests__/` para todos services |
| `components/molecules/` | `DataTable.test.tsx` |
| `components/templates/` | `AppShell.test.tsx` |

---

## 📋 Observações Gerais

### Pontos Fortes

✅ Arquitetura limpa com Atomic Design
✅ TypeScript em todo lugar (tipagem forte)
✅ React Query padrão ouro (caching, invalidation)
✅ Lazy loading + code splitting
✅ Internacionalização completa
✅ Sistema de temas role-based inovador
✅ Error boundaries estratégicos
✅ Hooks customizados bem organizados
✅ CSS Modules (sem conflitos)
✅ Testes implementados

### Oportunidades de Melhoria

⚠️ **Sem shadcn/ui** - componentes customizados poderiam usar biblioteca testada
⚠️ **Sem skeleton loading** - apenas spinners
⚠️ **Forms sem validação** - react-hook-form/yup não usado
⚠️ **Sem retry policy configurável** - só 1 retry global
⚠️ **API mock no login** - `setTimeout` fake (`Login.tsx:40`)
⚠️ **Sem paginação real** - `useProjects` não usa `page/perPage` do backend
⚠️ **Demo data hardcoded** - Panorama usa dados fake (`Panorama.tsx:142-143`)
⚠️ **Sem React Hook Form** - forms manuais são verbosos
⚠️ **CSS sem Tailwind** - apenas CSS modules manual
⚠️ **Toast position fixo** - não configurável

### Decisões Arquiteturais

1. **Context + Query, não Redux/Zustand:** Escolha acertada - React Query gerencia server state, Context gerencia UI state
2. **CSS Modules vs Tailwind:** CSS Modules dá mais controle, mas mais verboso. Tailwind seria mais produtivo.
3. **Fetch nativo vs Axios:** Fetch padrão reduz bundle, mas perde features (interceptors nativos limitados)
4. **Atomic Design:** Organiza components, mas força estrutura rígida. Pode ser overkill para app pequeno.
5. **Role-based theming:** Diferencial criativo, vincula UI ao perfil do usuário

---

## 🎯 Páginas - Detalhes

### 1. Login (`/login`)

- Form email/password
- OAuth buttons (stub - warning toast)
- Forgot password (email recovery stub)
- Redirect automático se autenticado
- Lazy loaded

### 2. Onboarding (`/onboarding`)

- Multi-step wizard
- Seleção de role (Frontend, Backend, Design, Data)
- Stack de tecnologias
- CPU level (compute power)
- Salva em `AuthContext` + `localStorage`

### 3. Panorama (`/panorama`)

**Dashboard principal** com:
- 4 metric cards (status, requests, latency, uptime)
- Sparklines e UptimeBar (demo data)
- Active stack visualization
- Compute power bar (baseado em CPU level)
- Recent activity timeline
- Recent deploys list
- Integrated terminal fake
- Tour overlay (primeiro acesso)

### 4. Projetos (`/projetos`)

**Features:**
- Grid de project cards
- Filtros: all/active/draft
- Busca por nome/descrição
- Modal de detalhe com:
  - Métricas (commits, deploys, uptime, branch)
  - Stack e framework
  - Agentes vinculados
  - Timeline de atividade
- Modal de criação com:
  - Formulário completo
  - Color picker + icon picker
  - Pill selector (stack, agents)
  - Selects (framework, branch, env, node)

### 5. ProjetoDetalhe (`/projetos/:slug`)

**Missing:** Arquivo não encontrado na listagem inicial, mas rota existe.
**Nota:** Seria página de detalhe completo do projeto com tabs (Overview, Código, Deploys, Logs, Agentes, Config, Segurança)

---

## 🔒 Segurança

### Autenticação

- JWT tokens (access + refresh)
- Refresh automático em 401
- Token stored em `localStorage` (⚠️ vulnerável a XSS)
- `AuthProvider` sincroniza com API (`getMe()`)

### Authorization

- Role-based: Frontend, Backend, Design, Data
- Cada role tem accent color e theme name
- Sem RB fino (não tem permissões por recurso)
- Apenas autenticação/não-autenticação

### Sanitização

- `dompurify` instalado (não visto em uso)
- `utils/sanitize.ts` presente (não examinado)

---

## 🎬 Loading & Error States

### Loading

- `PageLoader` - Spinner simples com CSS animation
- `isLoading` do React Query em páginas
- States `isPending` em mutations
- Sem skeletons

### Error

- `ErrorBoundary` (molecule) - captura erros de render
- `isError` do React Query - mostra mensagem local
- `RouteErrorFallback` - página de erro de rota
- Toast errors em mutations `onError`

---

## 📊 Dependências

### Production (14)

| Pacote | Versão | Uso |
|--------|--------|-----|
| `react` | ^19.2.0 | Core |
| `react-dom` | ^19.2.0 | Renderização |
| `react-router-dom` | ^6.30.3 | Roteamento |
| `@tanstack/react-query` | ^5.90.21 | Data fetching |
| `clsx` | ^2.1.1 | Conditional classes |
| `dompurify` | ^3.3.1 | Sanitização HTML |
| `pg` | ^8.20.0 | PostgreSQL client (server-side) |
| `express` | ^5.2.1 | Express server |

### Dev (14)

| Pacote | Versão | Uso |
|--------|--------|-----|
| `typescript` | ~5.9.3 | Type system |
| `vite` | ^7.3.1 | Build tool |
| `vitest` | ^4.0.18 | Test runner |
| `@vitejs/plugin-react` | ^5.1.1 | Vite + React |
| `@testing-library/*` | ^16.x | Testing utilities |
| `eslint` | ^9.39.1 | Linter |
| `@types/*` | Various | Type definitions |

**Bundle size estimado:** ~150KB gzipped (sem analyzes)

---

## 🎯 Recomendações

### Curto Prazo

1. Implementar skeleton loading states
2. Adicionar react-hook-form + zod/yup para validação
3. Criar componentes de UI reutilizáveis (Button, Input, Card) base
4. Implementar paginação real nos projects
5. Substituir demo data por dados reais no Panorama
6. Implementar OAuth real (ou remover botões)

### Médio Prazo

1. Migrar para Tailwind CSS (produtividade)
2. Adicionar React Hook Form globalmente
3. Implementar testes E2E (Playwright/Cypress)
4. Adicionar feature flags
5. Implementar rate limiting no cliente
6. Cache mais granular (React Query)

### Longo Prazo

1. Considerar SSR (Next.js) se SEO for necessário
2. Service Worker para offline support
3. WebSocket para real-time (agentes, logs)
4. Monitoring integrado (Sentry)
5. A/B testing framework

---

## 📞 Contatos & Manutenção

**Estrutura bem organizada** com clara separação de responsabilidades:
- Pages: roteamento
- Components: UI reusable
- Hooks: lógica customizada
- Services: API calls
- Stores: global state

**Manutenibilidade:** Alta
**Escalabilidade:** Boa
**Onboarding:** Fácil (estrutura previsível)

---

*Documento gerado em 2026-03-20*
*Projeto: Nommand Vision - Frontend Architecture Map*
