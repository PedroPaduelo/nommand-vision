# Regras de Negócio — Nommand Vision

> Documento gerado via análise de código-fonte (backend/src/services, schemas, routes, db/schema).
> Data de geração: 2026-03-20

---

## Índice

1. [Domínio: Auth & Sessions](#domínio-auth--sessions)
2. [Domínio: Users & Profile](#domínio-users--profile)
3. [Domínio: Workspaces](#domínio-workspaces)
4. [Domínio: Projects](#domínio-projects)
5. [Domínio: Agents](#domínio-agents)
6. [Domínio: Deploys](#domínio-deploys)
7. [Domínio: Chat / Sessions de IA](#domínio-chat--sessions-de-ia)
8. [Domínio: Conversations (Agente Direto)](#domínio-conversations-agente-direto)
9. [Domínio: Inbox](#domínio-inbox)
10. [Domínio: Notifications](#domínio-notifications)
11. [Domínio: Automations](#domínio-automations)
12. [Domínio: Analytics](#domínio-analytics)
13. [Domínio: Logs](#domínio-logs)
14. [Domínio: Status & Incidents](#domínio-status--incidents)
15. [Domínio: Marketplace](#domínio-marketplace)
16. [Domínio: Settings (Workspace)](#domínio-settings-workspace)
17. [Domínio: Security (Rate Limits & Token Limits)](#domínio-security-rate-limits--token-limits)
18. [Domínio: Prompt Sandbox](#domínio-prompt-sandbox)
19. [Fluxo de Dados entre Domínios](#fluxo-de-dados-entre-domínios)

---

## Domínio: Auth & Sessions

### Propósito
Gerenciar autenticação (registro, login, logout, refresh de tokens) e manutenção de sessões ativas por usuário.

### Entidades
- `users` — conta do usuário
- `sessions` — sessões de refresh token ativas
- `tokenBlacklist` — tokens revogados (access ou refresh)
- `workspaces` — criado automaticamente junto ao usuário no registro

### Regras de Negócio

#### Registro
- Email deve ser válido (formato de e-mail).
- Senha deve ter no mínimo 8 caracteres.
- Nome deve ter entre 2 e 100 caracteres.
- No momento do registro:
  1. Um **Workspace** é criado automaticamente com o nome `"{name}'s Workspace"`.
  2. O slug do workspace é gerado normalizando o nome (lowercase, sem acentos, espaços viram hífens) + sufixo de timestamp em base36 para garantir unicidade.
  3. O workspace começa com `plan = 'free'`.
  4. O usuário é criado vinculado ao workspace recém-criado.
  5. O usuário começa com: `onboarded = false`, `theme = 'dark'`, `tourDone = false`, `plan = 'free'`, `emailVerified = false`.
- Se o e-mail já estiver cadastrado, retorna erro `CONFLICT` (409).

#### Login
- Requer e-mail e senha.
- Se o usuário existir mas não tiver `passwordHash` (login via OAuth), retorna `UNAUTHORIZED` com mensagem "Please login with OAuth provider".
- Credenciais inválidas retornam `UNAUTHORIZED` com mensagem genérica "Invalid email or password" (não especifica qual campo está errado — segurança por obscuridade).
- Após login bem-sucedido, uma sessão de refresh token é criada com expiração de **7 dias**.

#### Logout
- Se `refreshToken` for fornecido: remove apenas a sessão específica.
- Se `refreshToken` não for fornecido: remove **todas as sessões** do usuário (logout global).

#### Refresh de Token
- Valida o refresh token via JWT.
- Busca a sessão no banco por `userId + refreshTokenHash`.
- Se a sessão não existir: erro `UNAUTHORIZED`.
- Se a sessão estiver expirada: deleta a sessão e retorna erro `UNAUTHORIZED`.
- Se tudo válido: **rotação de refresh token** — a sessão antiga é deletada e uma nova sessão é criada com novos tokens. Expiração: 7 dias.

#### Token Blacklist
- Tokens podem ser revogados individualmente (tipo `access` ou `refresh`).
- Razões de revogação: `logout`, `expired`, `revoked`.
- O IP que revogou o token é registrado.
- A tabela indexa por `userId`, `tokenHash` e `expiresAt` para buscas eficientes.

#### Forgot/Reset Password
- Endpoint `POST /auth/forgot-password` aceita um e-mail e sempre retorna sucesso (não expõe se o e-mail existe ou não).
- Endpoint `POST /auth/reset-password` aceita `token` + nova senha (mínimo 8 caracteres). Ambos os endpoints estão implementados como stubs — sem envio real de e-mail ou validação de token no momento atual.

### Workflows

#### Register Flow
```
1. POST /auth/register (email, password, name)
2. Validar schema (email válido, password >= 8, name 2-100)
3. Hash da senha (bcrypt)
4. Criar Workspace (slug = normalize(name) + timestamp36)
5. Criar User (vinculado ao workspace, onboarded=false)
6. Emitir accessToken + refreshToken
7. Criar Session (refreshTokenHash, expiresAt = +7d)
8. Retornar { user, accessToken, refreshToken }
```

#### Login Flow
```
1. POST /auth/login (email, password)
2. Buscar user por email
3. Verificar passwordHash existe (senão: OAuth error)
4. Verificar senha
5. Emitir accessToken + refreshToken
6. Criar Session (refreshTokenHash, expiresAt = +7d)
7. Retornar { user, accessToken, refreshToken }
```

#### Refresh Flow
```
1. POST /auth/refresh (refreshToken)
2. Verificar JWT do refreshToken
3. Buscar Session por userId + refreshTokenHash
4. Verificar session.expiresAt > now
5. Deletar session antiga
6. Criar nova session (rotação)
7. Retornar { accessToken, refreshToken (novo) }
```

### Permissions
- Todos os endpoints de auth (`/register`, `/login`, `/logout`, `/refresh`, `/forgot-password`, `/reset-password`) são públicos — exceto `/logout` que requer `authMiddleware`.
- `GET /auth/me` e `PATCH /auth/me` requerem autenticação.

### Rate Limits (Auth)
- `authRateLimit`: **10 requisições/minuto por IP** em todas as rotas de autenticação.

### Estados e Transições (Session)
```
[Criada] --> [Ativa] --> [Expirada] (após 7 dias)
[Ativa] --> [Deletada] (logout ou rotação)
```

### Side-Effects
- Registro: cria workspace + user + sessão em uma única operação.
- Login: cria nova sessão a cada login.
- Refresh: deleta sessão antiga + cria nova sessão (side-effect de segurança: sem token reuse).

---

## Domínio: Users & Profile

### Propósito
Gerenciar o perfil do usuário autenticado: informações pessoais, preferências de UI, onboarding, troca de senha e exclusão de conta.

### Entidades
- `users` — perfil completo do usuário

### Regras de Negócio

#### Atualização de Perfil
- Campos atualizáveis: `name` (2-100 chars), `role`, `stack`, `cpuLevel`, `onboarded`, `theme`, `tourDone`.
- Roles disponíveis: `Frontend`, `Backend`, `Design`, `Data`.
- `cpuLevel` aceita apenas valores 1, 2 ou 3 (representa nível de performance/carga da máquina).
- `theme` aceita apenas `dark` ou `light`.

#### Troca de Senha
- Requer a senha atual (`oldPassword`) para validação antes de permitir a nova.
- Se o usuário não tiver `passwordHash` (conta OAuth), a troca de senha não é permitida.
- Nova senha: nenhuma restrição de comprimento mínimo definida no `ChangePasswordInput` (verificar schema `profile.schema.ts`).

#### Onboarding
- `POST /profile/onboarding` — marca `onboarded = true`. Ação idempotente.
- `POST /profile/tour` — marca `tourDone = true`. Ação idempotente.
- Uma vez marcado como `onboarded`, não há mecanismo para reverter via API normal.

#### Deleção de Conta
- `DELETE /profile` — deleta o registro do usuário.
- Por conta do `ON DELETE CASCADE` nas tabelas filhas (`sessions`, `notifications`, `conversations`, etc.), a deleção é propagada em cascata para todos os dados relacionados ao usuário.
- **Atenção**: o workspace **não** é deletado automaticamente — o `ownerId` do workspace ficará órfão.

### Campos Públicos Retornados (sem senha)
O formatter `formatUser` exclui `passwordHash`, `oauthProvider`, `oauthId` e `emailVerified`. Retorna: `id`, `email`, `name`, `avatarUrl`, `role`, `stack`, `cpuLevel`, `onboarded`, `theme`, `tourDone`, `plan`, `createdAt`.

### Permissions
- Todas as rotas de `/profile` requerem `authMiddleware`.
- Usuário só pode editar/ler seu próprio perfil.

---

## Domínio: Workspaces

### Propósito
Unidade de multitenancy. Isola todos os dados (projetos, agentes, deploys, etc.) por organização/time.

### Entidades
- `workspaces` — workspace/organização

### Campos
- `id`: UUID único.
- `name`: até 100 caracteres.
- `slug`: único globalmente, até 100 caracteres, usado em URLs.
- `ownerId`: UUID do usuário criador (sem FK explícita para `users`, evitando dependência circular).
- `plan`: `free | pro | enterprise`, padrão `free`.

### Regras de Negócio
- Um workspace é criado automaticamente no registro do usuário — não existe API pública para criar workspaces diretamente.
- O slug é gerado via `generateSlug(name)`: normaliza para lowercase, remove acentos, troca espaços/caracteres inválidos por hífens, e adiciona sufixo timestamp em base36 para garantir unicidade.
- Planos disponíveis: `free`, `pro`, `enterprise`. O plano do workspace é independente do plano do usuário (ambos têm o campo `plan`).
- `ON DELETE CASCADE`: ao deletar um workspace, todos os dados filhos são deletados em cascata (users, projects, agents, deploys, etc.).

### Multitenancy Pattern
Todos os serviços recebem `workspaceId` como primeiro filtro nas queries — nenhum dado cruza fronteiras de workspace. O `workspaceId` é extraído do JWT do usuário autenticado (`payload.workspaceId`).

---

## Domínio: Projects

### Propósito
Gerenciar projetos de software dentro de um workspace. Projetos são a unidade central que agrupa deploys, agentes, chats, logs e atividades.

### Entidades
- `projects` — projeto de software

### Campos e Validações

| Campo | Tipo | Restrições |
|-------|------|-----------|
| `name` | string | 2-100 caracteres, obrigatório |
| `slug` | string | gerado automaticamente, único por workspace |
| `description` | text | opcional |
| `icon` | string | até 10 chars (emoji) |
| `iconColor` | string | até 7 chars (hex color, ex: `#FF5733`) |
| `status` | enum | `active` (padrão) ou `draft` |
| `branch` | string | até 100 chars, padrão `'main'` |
| `framework` | string | até 50 chars |
| `stack` | string[] | jsonb array |
| `role` | enum | `Frontend`, `Backend`, `Design`, `Data` |
| `agentIds` | string[] | jsonb array de UUIDs de agentes |
| `createdBy` | UUID | FK para `users.id` |
| `deletedAt` | timestamp | soft delete |

### Regras de Negócio

#### Criação
- O slug é gerado automaticamente a partir do `name` e garantido único por workspace via `generateUniqueSlug`.
- Status padrão: `active`.
- Branch padrão: `main`.
- Projetos são criados dentro de um workspace e todos os acessos são filtrados por `workspaceId`.

#### Listagem
- Filtra por `workspaceId` + `deletedAt IS NULL` (exclui projetos deletados).
- Suporta filtros por `status` e `role`.
- Paginado: padrão 20 itens/página, máximo 50.
- Ordenado por `updatedAt DESC`.

#### Soft Delete
- Projetos nunca são excluídos permanentemente via API — apenas `deletedAt` é preenchido.
- Todas as queries filtram `deletedAt IS NULL`.
- Exemplo: `deleteProject` define `deletedAt = NOW()` em vez de remover o registro.

#### Stats do Projeto
- Endpoint `GET /projects/:id/stats` retorna: `commits`, `deploys`, `uptime`, `lastDeploy`.
- **Atenção**: Atualmente retorna valores estáticos (`commits: 0`, `deploys: 0`, `uptime: '100%'`) — funcionalidade em desenvolvimento.

#### Activity do Projeto
- Endpoint `GET /projects/:id/activity` retorna lista de atividades.
- **Atenção**: Atualmente retorna apenas o evento de criação do projeto — funcionalidade em desenvolvimento.

### Workflows

#### Create Project Flow
```
1. POST /projects (name, description?, icon?, iconColor?, status?, branch?, framework?, stack?, role?)
2. Validar schema
3. Gerar slug único: normalize(name) + contador (ex: my-project, my-project-1, my-project-2)
4. INSERT com workspaceId do JWT
5. Retornar projeto formatado
```

#### Delete Project Flow (Soft Delete)
```
1. DELETE /projects/:id
2. Verificar projeto existe no workspace (deletedAt IS NULL)
3. SET deletedAt = NOW()
4. Retornar { success: true }
```

### Permissions
- Todas as rotas requerem autenticação.
- `workspaceId` é inferido do JWT — usuário só acessa projetos do seu workspace.

### Relações com outros Domínios
- `Project → Deploys`: um projeto pode ter múltiplos deploys.
- `Project → AgentIds`: lista de IDs de agentes associados (relação via jsonb array).
- `Project → ChatSessions`: sessões de chat podem ser vinculadas a um projeto.
- `Project → AnalyticsEvents`: eventos de analytics referenciam projetos.
- `Project → Logs`: logs podem ser filtrados por projeto.

---

## Domínio: Agents

### Propósito
Gerenciar agentes de IA configuráveis dentro de um workspace. Agentes são entidades com configuração de modelo, system prompt, ferramentas e histórico de execuções.

### Entidades
- `agents` — agente de IA configurado
- `agentRuns` — registro de cada execução do agente

### Campos e Validações

#### Agent

| Campo | Tipo | Restrições / Padrão |
|-------|------|---------------------|
| `name` | string | 2-100 chars |
| `description` | text | opcional |
| `type` | enum | `assistant`, `custom`, `tool`, `supervisor`; padrão: `custom` |
| `model` | string | até 50 chars; padrão: `claude-sonnet-4-20250514` |
| `systemPrompt` | text | opcional |
| `config` | jsonb | configurações arbitrárias |
| `temperature` | string (!) | 0.0–2.0, armazenado como string, padrão `'0.7'` |
| `maxTokens` | integer | 1–128.000, padrão 4096 |
| `tools` | string[] | lista de tools habilitadas, padrão `[]` |
| `iconColor` | string | hex color |
| `isActive` | string | `'1'` (ativo) ou `'0'` (inativo) — armazenado como char, convertido para boolean na API |
| `status` | enum | `active`, `inactive`, `error`; padrão: `active` |
| `category` | enum | `dev`, `review`, `qa`, `deploy`, `custom`; padrão: `custom` |
| `statsTotalRuns` | integer | contador de execuções, padrão 0 |
| `statsAvgDurationMs` | integer | média de duração em ms, padrão 0 |
| `statsSuccessRate` | string | percentual de sucesso (ex: `"98.50"`), padrão `"100"` |

**Nota técnica**: `isActive` é armazenado como `varchar(1)` (`'1'`/`'0'`) em vez de boolean — provavelmente herança de design inicial. A API converte para boolean na resposta.

#### AgentRun

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | enum | `running`, `completed`, `error`, `timeout` |
| `input` | text | prompt enviado ao agente |
| `output` | text | resposta gerada |
| `tokensUsed` | integer | tokens consumidos na execução |
| `durationMs` | integer | tempo de execução em ms |
| `error` | text | mensagem de erro (se status = `error`) |
| `completedAt` | timestamp | null enquanto `running` |

### Regras de Negócio

#### Criação de Agente
- Modelo padrão: `claude-sonnet-4-20250514`.
- Temperature padrão: `0.7` (range: 0.0–2.0).
- MaxTokens padrão: 4096 (máximo: 128.000).
- Categoria padrão: `custom`.
- Agente criado como ativo por padrão (`isActive = '1'`).

#### Toggle de Agente
- `POST /agents/:id/toggle` inverte o `isActive` (de `'1'` para `'0'` e vice-versa).
- Um agente inativo (`isActive = '0'`) não pode ser executado — retorna erro `"Agent is not active"`.

#### Execução de Agente (Run)
- Verifica se o agente está ativo antes de executar.
- Cria um `agentRun` com `status = 'running'` imediatamente.
- Executa a lógica (atualmente: simulação com delay aleatório de 1-3s e resposta mock).
- Ao completar: atualiza `agentRun` com `status = 'completed'`, `output`, `tokensUsed`, `durationMs`, `completedAt`.
- Em caso de erro: atualiza `agentRun` com `status = 'error'` e `error` message.
- **Side-effect automático**: `updateStats` é chamado após cada run (sucesso ou falha).

#### Atualização de Stats
- `statsTotalRuns` incrementa em 1 após cada run.
- `statsAvgDurationMs` calculado com média cumulativa: `(oldAvg * (total-1) + newDuration) / total`.
- `statsSuccessRate` calculado como: `(successCount / totalRuns) * 100`, arredondado para 2 casas decimais.

#### Agentes por Projeto
- `GET /agents/by-project/:projectId` — retorna agentes cujos IDs estão na lista `agentIds` do projeto.
- Verifica se o projeto pertence ao workspace antes de buscar os agentes.

### Workflows

#### Agent Run Flow
```
1. POST /agents/:id/run (input, projectId?, userId?)
2. Verificar agente ativo (isActive === '1')
3. INSERT agentRun (status = 'running')
4. Executar lógica do agente (simulada atualmente)
5. UPDATE agentRun (status = 'completed', output, tokensUsed, durationMs, completedAt)
6. updateStats(agentId, { duration, success: true })
7. Retornar { id, agentId, input, output, tokensUsed, durationMs, status }

Em caso de falha:
5b. UPDATE agentRun (status = 'error', error)
6b. updateStats(agentId, { duration, success: false })
7b. Re-throw error
```

### Permissions
- Autenticação requerida.
- `workspaceId` do JWT filtra agentes.
- Rate limit: `agentRateLimit` — **30 req/min por workspace + usuário** nas rotas de run.

### Estados do AgentRun
```
[running] --> [completed]
[running] --> [error]
[running] --> [timeout]
```

### Side-Effects
- Toda run atualiza as stats do agente (totalRuns, avgDurationMs, successRate).

---

## Domínio: Deploys

### Propósito
Gerenciar o ciclo de vida de deploys de projetos em diferentes ambientes. Registra o histórico de deploys, logs detalhados, variáveis de ambiente criptografadas e estatísticas.

### Entidades
- `deploys` — deploy de um projeto
- `deployLogs` — logs linha a linha de um deploy
- `deployEnvVars` — variáveis de ambiente por deploy

### Campos e Validações

#### Deploy

| Campo | Tipo | Restrições / Padrão |
|-------|------|---------------------|
| `projectId` | UUID | FK obrigatória para `projects.id` |
| `workspaceId` | UUID | FK obrigatória para `workspaces.id` |
| `environment` | enum | `preview` (padrão), `staging`, `production` |
| `status` | enum | `queued` (padrão), `building`, `deploying`, `success`, `failed`, `cancelled` |
| `branch` | string | até 100 chars, padrão `'main'` |
| `commitSha` | string | até 40 chars (SHA do git) |
| `commitMessage` | text | mensagem do commit |
| `logs` | text | logs consolidados |
| `url` | string | URL de acesso ao deploy |
| `error` | text | mensagem de erro |
| `durationMs` | integer | duração total em ms |
| `startedAt` | timestamp | quando o deploy iniciou |
| `completedAt` | timestamp | quando finalizou |
| `triggeredBy` | UUID | FK para `users.id` |

#### DeployEnvVar

| Campo | Tipo | Regra |
|-------|------|-------|
| `key` | string | 1-100 chars |
| `valueEncrypted` | text | valor armazenado (campo diz "encrypted" mas service salva em plaintext atualmente) |
| `isSecret` | boolean | padrão `true`; se `true`, a API retorna `'***'` em vez do valor |

### Regras de Negócio

#### Criação de Deploy
- Verifica se o projeto existe antes de criar o deploy.
- Status inicial sempre `queued`.
- Branch padrão: `main`.
- Ambiente padrão: `preview`.
- O deploy é vinculado a `workspaceId + projectId + triggeredBy`.

#### Cancelamento de Deploy
- Só pode cancelar deploys em status `queued`, `building` ou `deploying`.
- Se o status for `success`, `failed` ou `cancelled`, retorna erro `"Cannot cancel deploy in current status"`.
- Ao cancelar: define `status = 'cancelled'` e `completedAt = NOW()`.

#### Retry de Deploy
- Cria um **novo deploy** baseado no deploy original (não reutiliza o mesmo registro).
- O novo deploy tem `commitMessage = "Retry: {original.commitMessage || id}"`.
- Status inicial: `queued`.
- O `triggeredBy` do retry é o usuário que acionou o retry (não o original).

#### Variáveis de Ambiente
- Operação de **upsert**: se a chave já existir para o `deployId`, atualiza; senão, cria.
- Secrets (`isSecret = true`) têm seus valores mascarados como `'***'` na API de leitura.
- **Atenção**: o campo é chamado `valueEncrypted` mas atualmente o service salva em plaintext — criptografia não está implementada.

#### Stats de Deploys
- `GET /deploys/stats` retorna total de deploys agrupados por status + taxa de sucesso.
- `successRate = (success_count / total) * 100` (arredondado).

### Workflows

#### Deploy Lifecycle
```
1. POST /deploys (projectId, environment?, commitSha?, commitMessage?, branch?)
2. Verificar projeto existe no workspace
3. INSERT deploy (status = 'queued', triggeredBy = userId do JWT)
4. [Pipeline externo] status: queued → building → deploying → success | failed
5. (Cancel): POST /deploys/:id/cancel → status = 'cancelled', completedAt = NOW()
6. (Retry): POST /deploys/:id/retry → cria novo deploy com status 'queued'
```

#### Env Var Upsert Flow
```
1. POST /deploys/:id/env (key, value, isSecret?)
2. Verificar se chave já existe para o deploy
3a. Se existe: UPDATE valueEncrypted + isSecret
3b. Se não existe: INSERT
4. Retornar { id, key, isSecret, createdAt } (sem o valor)
```

### Permissions
- Autenticação requerida.
- Isolamento por `workspaceId` do JWT.

### Estados e Transições
```
queued
  └─> building
        └─> deploying
              ├─> success
              └─> failed
queued | building | deploying
  └─> cancelled (via cancelamento manual)
failed | success
  └─> [novo deploy via retry]
```

### Side-Effects
- Logs de deploy são armazenados em `deployLogs` (tabela separada, nível info/warn/error).
- **Não há notificação automática** disparada ao mudar status de deploy — esse pipeline seria implementado externamente.

---

## Domínio: Chat / Sessions de IA

### Propósito
Interface de chat interativo entre usuários e IA (Claude). Sessões de chat podem ser vinculadas a projetos ou ser independentes. Suporta mensagens síncronas e streaming.

### Entidades
- `chatSessions` — sessão de chat (contexto)
- `chatMessages` — mensagens individuais da sessão

### Campos e Validações

#### ChatSession

| Campo | Tipo | Padrão |
|-------|------|--------|
| `title` | string | até 200 chars; padrão: `'Nova conversa'` |
| `model` | string | até 50 chars; padrão: `'gpt-4-turbo'` (nota: pode ser desatualizado) |
| `projectId` | UUID | opcional — vincula ao projeto |
| `userId` | UUID | FK obrigatória |
| `workspaceId` | UUID | FK obrigatória |

**Nota**: O modelo padrão no schema `chatSessions` é `gpt-4-turbo`, mas o service `chat.service.ts` define `DEFAULT_MODEL = 'claude-sonnet-4-20250514'`. O service prevalece na criação.

#### ChatMessage

| Campo | Tipo | Regras |
|-------|------|--------|
| `role` | enum | `user`, `assistant`, `system` |
| `content` | text | obrigatório |
| `tokensIn` | integer | tokens de entrada (contados pelo service) |
| `tokensOut` | integer | tokens de saída |
| `durationMs` | integer | latência da resposta |

### Regras de Negócio

#### Criação de Sessão
- Título padrão: `'Nova conversa'`.
- Modelo padrão: `'claude-sonnet-4-20250514'` (via `DEFAULT_MODEL` no service).
- Sessão pode ser vinculada a um projeto (`projectId`) para filtrar por contexto.

#### Envio de Mensagem
- Verifica se a sessão existe e pertence ao workspace antes de enviar.
- Cria a mensagem do usuário (`role = 'user'`) primeiro.
- Gera a resposta do assistente (`role = 'assistant'`) imediatamente (simulada atualmente).
- `tokensIn` = `ceil(content.length / 4)` (estimativa de tokens).
- `tokensOut` = `ceil(response.length / 4)`.
- Atualiza `chatSessions.updatedAt` após cada mensagem enviada.
- Retorna ambas as mensagens (user + assistant) na resposta.

#### Streaming
- `POST /chat/sessions/:id/stream` — retorna `ReadableStream` com eventos SSE.
- Formato: `data: {"content": "palavra "}` palavra a palavra, com delay de 30ms entre palavras.
- Finaliza com `data: [DONE]`.
- Internamente, chama `sendMessage` e depois simula o streaming palavra a palavra.

#### Respostas Contextuais (Mock)
O service detecta palavras-chave no input do usuário para gerar respostas relevantes:
- `deploy` → resposta sobre deploy
- `test` → resultado fictício de testes
- `performance` / `otimiz` → análise de performance
- `security` / `seguranc` → relatório de segurança
- Outros → resposta genérica aleatória

**Atenção**: A integração com LLM real (Claude/GPT) não está implementada — todas as respostas são simuladas.

### Workflows

#### Send Message Flow
```
1. POST /chat/sessions/:id/messages (content)
2. getSession(workspaceId, sessionId) → verificar existência
3. INSERT chatMessage (role = 'user', content)
4. Gerar resposta (mock atualmente)
5. Calcular tokensIn, tokensOut, durationMs
6. INSERT chatMessage (role = 'assistant', content, tokensIn, tokensOut, durationMs)
7. UPDATE chatSession.updatedAt
8. Retornar { userMessage, assistantMessage }
```

### Permissions
- Autenticação requerida.
- Isolamento por `workspaceId`.
- Usuário só acessa sessões do seu workspace.

---

## Domínio: Conversations (Agente Direto)

### Propósito
Conversas diretas usuário-agente, distintas do Chat genérico. Vincula uma conversa a um agente específico e permite fixar conversas.

### Entidades
- `conversations` — conversa usuário-agente
- `messages` — mensagens da conversa (com suporte a tool calls e attachments)

### Diferença de Chat vs Conversations
| Aspecto | Chat (chatSessions) | Conversations |
|---------|---------------------|---------------|
| Vinculação | Pode vincular a projeto | Vincula a um agente específico |
| Modelo default | `claude-sonnet-4-20250514` | `claude-sonnet-4-20250514` |
| Pin | Não | Sim (`pinned`) |
| Tool Calls | Não | Sim (`toolCalls jsonb`) |
| Attachments | Não | Sim (`attachments jsonb`) |
| Uso | Chat genérico de projeto | Conversa com agente configurado |

### Campos de Message

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `role` | enum | `user`, `assistant`, `system` |
| `toolCalls` | jsonb | chamadas de ferramentas feitas pelo modelo |
| `attachments` | jsonb | `[{ name, url, type }]` |
| `tokensUsed` | integer | tokens consumidos |
| `model` | string | modelo usado nesta mensagem específica |

### Regras de Negócio
- Título padrão: `'Nova conversa'`.
- `pinned = false` por padrão.
- `agentId` pode ser null (conversa sem agente vinculado, ON DELETE SET NULL).
- Se o agente for deletado, a conversa permanece com `agentId = null`.

---

## Domínio: Inbox

### Propósito
Sistema de mensagens internas recebidas pelos usuários — principalmente provenientes de agentes. Funciona como uma caixa de entrada assíncrona dentro do workspace.

### Entidades
- `inboxMessages` — mensagem de inbox

### Campos

| Campo | Tipo | Regras |
|-------|------|--------|
| `fromAgentId` | UUID | opcional — agente remetente (ON DELETE SET NULL) |
| `toUserId` | UUID | opcional — usuário destinatário (ON DELETE CASCADE) |
| `subject` | string | até 200 chars |
| `body` | text | opcional |
| `type` | enum | `info`, `warning`, `error`, `success`, `action` |
| `read` | boolean | padrão `false` |
| `archived` | boolean | padrão `false` |
| `actionUrl` | string | URL de ação associada |
| `metadata` | jsonb | dados extras livres |

### Regras de Negócio

#### Leitura
- `PATCH /inbox/:id/read` — marca `read = true`.
- `POST /inbox/read-all` — marca todas as mensagens não lidas do workspace como `read = true`.

#### Arquivamento
- `PATCH /inbox/:id/archive` — marca `archived = true` E `read = true` (arquivar implica leitura).
- `PATCH /inbox/:id/unarchive` — marca `archived = false` (não altera `read`).

#### Contador de Não Lidos
- `GET /inbox/unread-count` retorna contagem de mensagens com `read = false` E `archived = false` (mensagens arquivadas não contam como não lidas).

#### Deleção
- `DELETE /inbox/:id` — deleção permanente (hard delete).

#### Filtros de Listagem
- Por `type`: `info`, `warning`, `error`, `success`, `action`.
- Por `read`: `'true'` ou `'false'` (string, convertido internamente para boolean).
- Por `archived`: `'true'` ou `'false'`.
- Paginado: padrão 20 itens.
- Ordenado por `createdAt DESC`.

### Estados e Transições
```
[nova: read=false, archived=false]
  └─> [lida: read=true, archived=false]
        └─> [arquivada: read=true, archived=true]
              └─> [desarquivada: read=true, archived=false]
[qualquer estado] --> [deletada] (hard delete)
```

---

## Domínio: Notifications

### Propósito
Sistema de notificações em tempo real via WebSocket, com suporte a múltiplos canais (in-app, email, push) e preferências por tipo de notificação.

### Entidades
- `notifications` — notificação gerada
- `notificationPreferences` — preferências do usuário por tipo

### Tipos de Notificação
- `deploy` — eventos de deploy
- `agent` — eventos de agente
- `system` — eventos de sistema
- `alert` — alertas importantes
- `billing` — notificações de cobrança

### Canais
- `in_app` — notificação dentro do app
- `email` — envio por email
- `push` — push notification

### Preferências Padrão (criadas automaticamente na primeira consulta)

| Tipo | in_app | email | push |
|------|--------|-------|------|
| deploy | true | false | true |
| agent | true | false | true |
| system | true | false | true |
| alert | true | **true** | true |
| billing | true | **true** | false |

### Regras de Negócio

#### Criação de Notificação
- Ao criar uma notificação via `create()`, além de inserir no banco, dispara imediatamente um evento WebSocket para o usuário via `wsManager.sendToUser(userId, 'notification', data)`.
- Esse é o único lado do sistema com integração real de tempo real.

#### Preferências
- Se o usuário ainda não tem preferências cadastradas, elas são criadas automaticamente com os defaults ao fazer `GET /notifications/preferences`.
- `PATCH /notifications/preferences` atualiza uma preferência específica por `type`.
- Tipos válidos: `deploy`, `agent`, `system`, `alert`, `billing`.

#### Limpeza
- `DELETE /notifications` — remove **todas** as notificações do usuário.
- `DELETE /notifications/:id` — remove uma notificação específica.

#### Contador de Não Lidos
- `GET /notifications/unread-count` retorna contagem de notificações `read = false` do usuário.

### Side-Effects
- `create()` → dispara WebSocket `'notification'` para o usuário em tempo real.

### Permissions
- Notificações são por usuário — filtro por `userId`, não por `workspaceId`.

---

## Domínio: Automations

### Propósito
Automações configuráveis que executam ações baseadas em triggers (agenda, webhook, evento, manual). Cada automação registra um histórico de execuções.

### Entidades
- `automations` — definição da automação
- `automationRuns` — histórico de execuções

### Tipos de Trigger
- `schedule` — execução por agendamento (cron-like)
- `webhook` — ativada por chamada HTTP externa
- `event` — ativada por evento interno do sistema
- `manual` — ativada manualmente via API

### Campos da Automação

| Campo | Tipo | Regras |
|-------|------|--------|
| `name` | string | 2-100 chars |
| `triggerType` | enum | obrigatório |
| `triggerConfig` | jsonb | configuração do trigger (ex: cron expression, URL, event name) |
| `actions` | jsonb[] | lista de ações a executar, padrão `[]` |
| `enabled` | boolean | padrão `true` |
| `runCount` | integer | contador automático de execuções |
| `lastRunAt` | timestamp | atualizado após cada execução |

### Regras de Negócio

#### Toggle
- `POST /automations/:id/toggle` inverte `enabled` (true ↔ false).

#### Trigger Manual
- `POST /automations/:id/trigger` executa a automação imediatamente.
- **Não verifica** se a automação está habilitada (`enabled`) antes de executar manualmente — qualquer automação pode ser disparada manualmente independentemente do estado.
- Cria um `automationRun` com `status = 'success'` e `triggeredBy = 'manual'`.
- **Atenção**: A execução real das ações não está implementada — o run apenas registra `output = { message: 'Executed successfully', actions }`.
- Incrementa `runCount` via SQL (`runCount + 1`).
- Atualiza `lastRunAt = NOW()`.

#### Cancelar Run
- `POST /automations/:id/runs/:runId/cancel` — só cancela runs com `status = 'running'`.
- Se o run não estiver `running`, retorna erro `"Run is not running"`.

### Workflows

#### Automation Trigger Flow
```
1. POST /automations/:id/trigger
2. Verificar automação existe
3. INSERT automationRun (status='success', triggeredBy='manual', output={actions})
4. UPDATE automations (lastRunAt=NOW(), runCount+1)
5. Retornar { runId, status, durationMs }
```

### Estados do AutomationRun
```
running --> success
running --> error
running --> cancelled (via cancelRun, se status='running')
```

---

## Domínio: Analytics

### Propósito
Tracking de eventos, métricas agregadas e análise de custos de tokens de IA. Fornece dashboard com visão geral do workspace.

### Entidades
- `analyticsEvents` — evento individual rastreado
- `dailyMetrics` — métricas diárias consolidadas
- `analyticsSnapshots` — snapshots periódicos (daily/weekly/monthly)

### Tipos de Evento Suportados

| Tipo | Descrição |
|------|-----------|
| `deploy` | evento de deploy (com `status: success/failed` em `eventData`) |
| `message` | mensagem de chat enviada |
| `agent_action` | ação executada por um agente |
| `agent_run` | execução de agente |
| `chat_message` | mensagem de chat |
| `token_usage` | uso de tokens de IA |

### Regras de Negócio

#### Track de Eventos
- `POST /analytics/track` aceita `eventType`, `eventData`, `projectId` opcionais.
- Usuário pode ser `null` (eventos anônimos permitidos).
- Inserção direta em `analyticsEvents`.

#### Dashboard
- Suporta períodos: `7d`, `30d`, `90d`.
- Agrega de `analyticsEvents`: total de deploys, deploys com sucesso, deploys com falha.
- Total de mensagens (eventType = `message`).
- Agentes ativos (distinct count de `agentId` em `agent_action`).
- Tempo médio de resposta: calculado da tabela `dailyMetrics.avgResponseTimeMs`.

#### Séries Temporais
- `GET /analytics/timeseries?metric={eventType}&period={7d|30d|90d}` — retorna contagem diária do evento solicitado.

#### Top Projects
- Retorna até 10 projetos com mais eventos (qualquer tipo), excluindo projetos deletados.

#### Top Agents
- Retorna até 10 agentes com mais `agent_action` events, agrupado por `eventData->>'agent_id'`.

#### Custo de Tokens (Cost Analysis)
- Soma `input_tokens` e `output_tokens` de eventos do tipo `token_usage`.
- Custo calculado:
  - Input: `tokens * $0.000003` (USD por token)
  - Output: `tokens * $0.000015` (USD por token)
  - Total: soma dos dois.
- Arredondado para 2 casas decimais.

#### Deploy Trends
- Retorna série temporal de deploys com breakdown: `total`, `success`, `failed` por dia.

### Snapshots Periódicos
- Tabela `analyticsSnapshots` armazena snapshots de período `daily`, `weekly`, `monthly`.
- Campos do snapshot: `total_deploys`, `success_rate`, `active_agents`, `total_messages`, `avg_response_time`, `uptime`.
- **Atenção**: Não há job agendado implementado para gerar os snapshots automaticamente.

---

## Domínio: Logs

### Propósito
Sistema centralizado de logs do workspace. Permite registrar, buscar e purgar logs de projetos, agentes e serviços.

### Entidades
- `logs` — entrada de log

### Níveis de Log
`debug` < `info` < `warn` < `error` < `fatal`

### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `level` | enum | debug, info, warn, error, fatal |
| `message` | text | conteúdo do log |
| `metadata` | jsonb | dados extras estruturados |
| `source` | string | origem do log (ex: nome do serviço) |
| `traceId` | string | ID de rastreamento distribuído |
| `projectId` | UUID | projeto relacionado (opcional) |
| `agentId` | UUID | agente relacionado (opcional) |

### Regras de Negócio

#### Ingestão em Lote
- `POST /logs/batch` aceita array de logs e insere em uma única operação.
- Útil para ingestão de logs de serviços externos.

#### Busca Full-Text
- `GET /logs/search?q={query}` — busca por `ILIKE '%query%'` no campo `message`.

#### Filtros de Listagem
- Por `level`, `projectId`, `agentId`, `source`.
- Por intervalo de tempo: `from` e `to` (ISO datetime).
- Paginado, ordenado por `createdAt DESC`.

#### Purga de Logs Antigos
- `DELETE /logs/old?days={n}` — remove logs com `createdAt < NOW() - n days`.
- Retorna `{ deleted: count }`.
- Útil para manutenção e controle de custo de armazenamento.

#### Stats de Logs
- `GET /logs/stats` — retorna contagem por nível (`byLevel`) e por fonte (`bySource`, top 20).

---

## Domínio: Status & Incidents

### Propósito
Monitoramento de saúde de serviços internos e externos. Gerencia incidentes e histórico de uptime, calculando percentuais de disponibilidade.

### Entidades
- `services` — serviço monitorado
- `incidents` — incidente de serviço
- `uptimeChecks` — histórico de checks de uptime

### Tipos de Serviço
`api` | `database` | `worker` | `external`

### Status de Serviço
`operational` | `degraded` | `partial_outage` | `major_outage` | `maintenance`

### Severidade de Incidente
`minor` | `major` | `critical`

### Status de Incidente
`investigating` → `identified` → `monitoring` → `resolved`

### Status de Check
`up` | `down` | `degraded`

### Regras de Negócio

#### Status Global do Workspace
- `GET /status/overview` computa o `globalStatus` automaticamente:
  - Se **qualquer** serviço está em `major_outage` → `globalStatus = 'major_outage'`.
  - Se **todos** estão `operational` → `globalStatus = 'operational'`.
  - Caso contrário → `globalStatus = 'degraded'`.

#### Registro de Check de Uptime
- `recordCheck(serviceId, status, responseTimeMs)`:
  - Cria entrada em `uptimeChecks`.
  - Atualiza `services.status`, `services.responseTimeMs`, `services.lastCheckAt` automaticamente.
  - Mapeamento: `'up'` → `operational`; `'degraded'` → `degraded`; `'down'` → `major_outage`.

#### Cálculo de Uptime
- `getUptimePercentage(serviceId, days)`:
  - Conta checks `status = 'up'` / total de checks no período.
  - Se não há checks: retorna 100% por padrão.
  - Resultado arredondado para 2 casas decimais (ex: `99.95`).

#### Resolução de Incidente
- `POST /status/incidents/:id/resolve` — define `status = 'resolved'`, `resolvedAt = NOW()`.
- Uma vez resolvido, não há endpoint para reabrir o incidente.

### Transições de Status do Incidente
```
investigating → identified → monitoring → resolved
(qualquer estado pode ser resolvido via /resolve)
```

---

## Domínio: Marketplace

### Propósito
Catálogo de itens instaláveis (agentes, templates, integrações, plugins) que podem ser adicionados ao workspace.

### Entidades
- `marketplaceItems` — item disponível no marketplace
- `marketplaceInstalls` — instalação de um item por um workspace

### Categorias
`agent` | `template` | `integration` | `plugin`

### Regras de Negócio

#### Listagem de Itens
- Apenas itens com `published = true` são listados.
- Enriquece com campo `installed: boolean` baseado nas instalações do workspace.
- Ordenação suportada: `name`, `downloads`, `rating` (padrão: `createdAt DESC`).

#### Instalação
- Verifica se o item existe e está publicado.
- Se o workspace já instalou o item:
  - **Não duplica** a instalação — atualiza a configuração.
  - Retorna `{ success: true, reinstalled: false }`.
- Se é instalação nova:
  - Cria registro em `marketplaceInstalls`.
  - Incrementa `marketplaceItems.downloads` via SQL atômico.
  - Retorna `{ success: true, installed: true }`.

#### Avaliação (Rating)
- `POST /marketplace/:id/rate` — aceita `rating` numérico.
- O novo rating é calculado como **média simples entre o rating atual e o novo valor**: `(currentRating + newRating) / 2`.
- **Atenção**: Isso não é uma média ponderada real — cada nova avaliação puxa o rating 50% em direção ao novo valor.

#### Desinstalação
- Remove apenas o registro de `marketplaceInstalls`.
- O item do marketplace não é afetado.
- O contador de `downloads` **não é decrementado** ao desinstalar.

---

## Domínio: Settings (Workspace)

### Propósito
Configurações chave-valor do workspace, gerenciamento de API Keys e Webhooks.

### Entidades
- `workspaceSettings` — configuração chave-valor genérica
- `apiKeys` — chaves de API do workspace
- `webhooks` — webhooks configurados

### Settings Genéricas
- Armazenamento chave-valor com `jsonb` como tipo de valor (aceita qualquer tipo JSON).
- Operação de **upsert**: `updateSetting` cria ou atualiza o par chave-valor.
- Sem restrição de quais chaves são válidas — qualquer string é aceita.

### API Keys

#### Geração
- Formato: `nxs_` + 32 bytes aleatórios em hex (totalizando `nxs_` + 64 chars hex).
- Prefixo visível: `nxs_xxx` (primeiros 8 chars da key gerada).
- Armazenamento: apenas o hash SHA-256 (`keyHash`) — a key raw nunca é armazenada.
- A key raw é retornada **apenas uma vez** no momento da criação.
- Suporte a `expiresAt` opcional e `permissions` (array de strings).

#### Revogação
- `DELETE /settings/api-keys/:id` — deleção permanente (hard delete).

### Webhooks

#### Criação
- Suporta `secret` opcional — armazenado como hash (`secretHash`), nunca exposto na leitura.
- `events`: array de strings representando eventos que disparam o webhook.
- `active`: boolean, padrão `true`.

#### Teste de Webhook
- `POST /settings/webhooks/:id/test` — envia um payload de teste para a URL configurada.
- Payload: `{ event: 'webhook.test', timestamp, data: { message: 'Test webhook from Nommand Vision' } }`.
- Atualiza `lastTriggeredAt` após o teste.
- Retorna `{ success, status, message }` independentemente de sucesso ou falha.
- Em caso de erro de rede: retorna `{ success: false, status: 0, message: error.message }`.

---

## Domínio: Security (Rate Limits & Token Limits)

### Propósito
Proteção contra abuso, DoS e controle de custos de IA.

### Rate Limits de HTTP

| Profile | Limite | Janela | Dimensão |
|---------|--------|--------|----------|
| `authRateLimit` | 10 req | 1 min | por IP |
| `apiRateLimit` | 120 req | 1 min | IP + Workspace + Usuário |
| `workspaceRateLimit` | 300 req | 1 min | por Workspace |
| `agentRateLimit` | 30 req | 1 min | Workspace + Usuário |
| IP fallback | 60 req | 1 min | por IP |

#### Hierarquia de Verificação (rateLimit middleware)
```
1. Rate limit por IP (60 req/min) — sempre aplicado se byIp=true
2. Rate limit por workspace (300 req/min) — se byWorkspace=true e workspaceId disponível
3. Rate limit por usuário (120 req/min) — se byUser=true e userId disponível
4. Rate limit genérico IP+path — conforme configuração do perfil
```

#### Headers de Resposta
- `X-Workspace-RateLimit-Remaining`: tokens restantes do workspace.
- `X-Workspace-RateLimit-Reset`: segundos até reset.
- `X-User-RateLimit-Remaining`: tokens restantes do usuário.
- `X-User-RateLimit-Reset`: segundos até reset.
- `Retry-After`: segundos de espera (ao receber 429).

#### Limpeza de Cache
- Stores de rate limit são varridos a cada 60 segundos — entradas expiradas são deletadas.

### Token Rate Limits (Custos de IA)

O `TokenRateLimitService` controla o consumo de tokens de LLM por workspace:

| Limite | Janela |
|--------|--------|
| 50.000 tokens/workspace | 1 minuto |
| 10.000 tokens/usuário | 1 minuto |
| 20.000 tokens/agente | 1 minuto |

#### Verificação em Duas Camadas
1. Cache em memória (rápido) — verifica uso na janela corrente.
2. Banco de dados (fallback) — consulta `analyticsEvents` para uso real.

#### Registro de Uso
- Cada uso de tokens é registrado em `analyticsEvents` com tipo `agent_run` ou `chat_message`.
- O registro inclui: `tokens`, `source` (`agent` | `chat` | `deploy`), `metadata`.

---

## Domínio: Prompt Sandbox

### Propósito
Camada de segurança que protege contra prompt injection e manipulação maliciosa dos prompts enviados aos agentes/modelos de IA.

### Regras de Validação

#### Comprimento Máximo
- Prompts maiores que **128.000 caracteres** são rejeitados antes de qualquer outra validação.

#### Padrões de Injeção (apenas agentes `custom`)
Detecta e bloqueia:
- `ignore (all) previous instructions`
- `disregard (all) previous orders`
- `forget (all) what you know`
- `system prompt`
- `instructions:`
- Tokens especiais: `<|...|>`
- Tentativas de separar prompts via `\\n\\n`
- Comentários JS: `/* ... */`, `//`
- Caractere `#` (podem ser usados para comentários)
- Blocos de código: ` ``` ``` `

**Nota**: A verificação de padrões de injection só é aplicada para `agentType === 'custom'`. Outros tipos (`assistant`, `tool`, `supervisor`) não são verificados contra esses padrões.

#### Comandos Proibidos (todos os tipos)
Detecta strings literais no prompt (case-insensitive):
`rm -rf`, `sudo`, `system(`, `exec(`, `eval(`, `_process`, `require(`, `import `, `child_process`, `fs.`, `readFile`, `writeFile`, `delete`, `drop`, `truncate`, `alter`, `grant`, `revoke`

#### Sanitização Automática
Mesmo sem erros, o service sanitiza:
- 3+ newlines consecutivos → 2 newlines.
- Blocos de código ` ``` ``` ` → `[code removed]`.
- Caracteres de controle (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F, 0x7F-0x9F) → removidos.

#### Deep Sanitize (adicional)
- Remove tags HTML/XML.
- Remove URLs (substituídas por `[URL removed]`).
- Remove possíveis tokens/API keys (`sk_...`, `gh_...`, `ey...` com 20+ chars) → `[REDACTED]`.
- Normaliza espaços múltiplos.
- Trunca para 100.000 chars com aviso `[truncated]`.

#### Detecção de Referências a Arquivos
Detecta referências a arquivos sensíveis:
- `.env`, `.config`, `.json`, `.yaml`, `.yml`, `.toml`, `.ini`, `.cfg`
- Scripts: `.sh`, `.bash`, `.zsh`, `.fish`
- Código: `.py`, `.js`, `.ts`, `.tsx`, `.jsx`
- Caminhos: `/etc/`, `/home/`, `C:\`, `.git/`, `package.json`

---

## Fluxo de Dados entre Domínios

### Diagrama de Dependências

```
Auth → [User + Workspace] (criação automática no registro)
  │
  ├─> Users (profile, onboarding, tour)
  │
  └─> [JWT: userId + workspaceId] → todos os outros domínios

Workspaces (isolamento de dados)
  └─> Projects
        ├─> Deploys
        │     ├─> DeployLogs
        │     └─> DeployEnvVars
        ├─> AgentIds (referência via jsonb)
        └─> AnalyticsEvents (por projeto)

Agents (por workspace)
  ├─> AgentRuns (execuções)
  ├─> InboxMessages (mensagens enviadas pelo agente)
  ├─> Conversations (agente vinculado)
  └─> AnalyticsEvents (agent_action)

Chat/Sessions
  ├─> ChatMessages
  └─> (opcional) Projects

Conversations
  ├─> Messages (com toolCalls + attachments)
  └─> (opcional) Agents

Automations
  └─> AutomationRuns

Analytics
  ├─> AnalyticsEvents (source: deploys, agents, chat)
  ├─> DailyMetrics (agregação diária)
  └─> AnalyticsSnapshots (snapshots periódicos)

Notifications
  ├─> NotificationPreferences
  └─> WebSocket (real-time via wsManager)

Status
  ├─> Services
  ├─> Incidents (por service)
  └─> UptimeChecks (por service)

Settings
  ├─> WorkspaceSettings (key-value)
  ├─> ApiKeys
  └─> Webhooks

Marketplace
  ├─> MarketplaceItems
  └─> MarketplaceInstalls (por workspace)

Logs (transversal)
  ├─> Por workspace
  ├─> Por project (opcional)
  └─> Por agent (opcional)
```

### Fluxo Principal: Deploy

```
User → POST /deploys
  → [verifica projeto existe no workspace]
  → INSERT deploys (status=queued, triggeredBy=userId)
  → [pipeline externo: queued → building → deploying → success/failed]
  → [idealmente: dispara analytics event 'deploy']
  → [idealmente: cria notification para o user]
  → [idealmente: dispara webhook se configurado]
```

### Fluxo Principal: Agent Run

```
User → POST /agents/:id/run
  → [agentRateLimit: 30 req/min]
  → [verifica agente ativo]
  → INSERT agentRun (status=running)
  → [executa lógica do agente]
  → UPDATE agentRun (status=completed/error)
  → updateStats(agentId)
  → [idealmente: INSERT analyticsEvent 'agent_run']
  → [idealmente: INSERT inboxMessage se agent gera relatório]
```

### Fluxo Principal: Notification em Tempo Real

```
Sistema → notificationService.create({ userId, type, title, body })
  → INSERT notifications
  → wsManager.sendToUser(userId, 'notification', data)
  → [Cliente WebSocket recebe evento em tempo real]
```

---

## Matriz de Permissões

| Recurso | Público | Autenticado | Restrição Adicional |
|---------|---------|-------------|---------------------|
| `POST /auth/register` | ✓ | — | Rate limit: 10/min IP |
| `POST /auth/login` | ✓ | — | Rate limit: 10/min IP |
| `POST /auth/refresh` | ✓ | — | Rate limit: 10/min IP |
| `POST /auth/logout` | — | ✓ | Rate limit: 10/min IP |
| `GET /auth/me` | — | ✓ | — |
| `PATCH /auth/me` | — | ✓ | — |
| `GET /profile` | — | ✓ | Apenas próprio perfil |
| `PATCH /profile` | — | ✓ | Apenas próprio perfil |
| `DELETE /profile` | — | ✓ | Próprio usuário |
| `GET /projects` | — | ✓ | Apenas workspace do JWT |
| `POST /projects` | — | ✓ | Apenas workspace do JWT |
| `GET /agents` | — | ✓ | Apenas workspace do JWT |
| `POST /agents/:id/run` | — | ✓ | agentRateLimit: 30/min |
| `GET /deploys` | — | ✓ | Apenas workspace do JWT |
| `POST /deploys` | — | ✓ | Apenas workspace do JWT |
| `GET /chat/sessions` | — | ✓ | Apenas workspace do JWT |
| `GET /notifications` | — | ✓ | Apenas userId do JWT |
| `GET /inbox` | — | ✓ | Apenas workspace do JWT |
| `GET /analytics` | — | ✓ | Apenas workspace do JWT |
| `GET /logs` | — | ✓ | Apenas workspace do JWT |
| `GET /status` | — | ✓ | Apenas workspace do JWT |
| `GET /marketplace` | — | ✓ | Público, mas install por workspace |
| `GET /settings` | — | ✓ | Apenas workspace do JWT |
| `GET /health` | ✓ | — | Sem autenticação |

---

## Enums Consolidados

### Users
- `role`: `Frontend`, `Backend`, `Design`, `Data`, `Admin`
- `theme`: `dark`, `light`
- `plan`: `free`, `pro`, `enterprise`

### Projects
- `status`: `active`, `draft`
- `role`: `Frontend`, `Backend`, `Design`, `Data`

### Agents
- `type`: `assistant`, `custom`, `tool`, `supervisor`
- `status`: `active`, `inactive`, `error`
- `category`: `dev`, `review`, `qa`, `deploy`, `custom`
- `agentRunStatus`: `running`, `completed`, `error`, `timeout`

### Deploys
- `environment`: `preview`, `staging`, `production`
- `status`: `queued`, `building`, `deploying`, `success`, `failed`, `cancelled`
- `logLevel`: `info`, `warn`, `error`

### Automations
- `triggerType`: `schedule`, `webhook`, `event`, `manual`
- `runStatus` (informal): `running`, `success`, `error`, `cancelled`

### Notifications
- `type`: `deploy`, `agent`, `system`, `alert`, `billing`
- `channel`: `in_app`, `email`, `push`

### Inbox
- `type`: `info`, `warning`, `error`, `success`, `action`

### Analytics
- `snapshotPeriod`: `daily`, `weekly`, `monthly`

### Status
- `serviceType`: `api`, `database`, `worker`, `external`
- `serviceStatus`: `operational`, `degraded`, `partial_outage`, `major_outage`, `maintenance`
- `incidentSeverity`: `minor`, `major`, `critical`
- `incidentStatus`: `investigating`, `identified`, `monitoring`, `resolved`
- `checkStatus`: `up`, `down`, `degraded`

### Logs
- `level`: `debug`, `info`, `warn`, `error`, `fatal`

### Marketplace
- `category`: `agent`, `template`, `integration`, `plugin`

### TokenBlacklist
- `tokenType`: `access`, `refresh`
- `reason`: `logout`, `expired`, `revoked`

---

## Pontos de Atenção / Débitos Técnicos Identificados

1. **Chat mock**: O service `chat.service.ts` usa respostas simuladas — integração real com LLM (Claude) não está implementada.
2. **Agent run mock**: `agents.service.ts` simula execução com delay aleatório e respostas pré-definidas.
3. **Automation actions mock**: `automations.service.ts` não executa as actions reais — apenas registra o run como `success`.
4. **DeployEnvVars sem criptografia**: O campo se chama `valueEncrypted` mas o service não criptografa — salva em plaintext.
5. **Deploy pipeline ausente**: O serviço cria o deploy mas não há pipeline real que mude o status de `queued → building → deploying → success/failed`.
6. **Token blacklist não verificado**: A tabela `tokenBlacklist` existe mas não há middleware que verifique os tokens contra ela nas requisições.
7. **isActive como string**: Campo `agents.isActive` é `varchar(1)` armazenando `'1'`/`'0'` em vez de `boolean` nativo.
8. **Modelo default inconsistente**: `chatSessions.model` tem default `'gpt-4-turbo'` no schema DB, mas o service usa `'claude-sonnet-4-20250514'`.
9. **Forgot/Reset Password sem implementação**: Endpoints existem mas não enviam email nem validam token.
10. **Analytics snapshots sem cron**: A tabela `analyticsSnapshots` existe mas não há job que a popule automaticamente.
11. **Rating no Marketplace**: O cálculo de rating usa média simples par-a-par (não uma média ponderada por número de votos).
12. **WorkspaceId órfão**: Se o dono do workspace deletar a conta, `workspaces.ownerId` fica com UUID inválido (não há FK).
13. **Token rate limit com SQL incorreto**: `TokenRateLimitService` usa `from_timestamp()` — função que não existe no PostgreSQL padrão (deveria ser `to_timestamp()`).
