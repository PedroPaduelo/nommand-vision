const fs = require('fs');
const path = require('path');

const agents = [
  {
    id: '01-codewriter',
    title: 'CodeWriter',
    icon: '✍️',
    category: 'Desenvolvimento',
    categoryColor: '#3b82f6',
    description: 'Escreve código de alta qualidade a partir de especificações e requisitos. Suporta múltiplas linguagens e frameworks.',
    responsibilities: [
      'Gerar código limpo e manutenível',
      'Seguir padrões do projeto (ESLint, Prettier)',
      'Criar testes unitários junto com o código',
      'Documentar funções e componentes',
      'Refatorar quando necessário'
    ],
    tech: ['TypeScript', 'JavaScript', 'React', 'Vue', 'Node.js', 'Python', 'SQL'],
    flows: [
      'Recebe especificação em linguagem natural',
      'Analisa contexto do projeto (arquivos existentes)',
      'Gera código + testes + tipagem',
      'Valida sintaxe e formatação',
      'Retorna arquivos prontos para commit'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "Crie uma API REST para usuários com autenticação JWT", "projectId": "uuid" }',
    prev: null,
    next: '02-codereviewer.html'
  },
  {
    id: '02-codereviewer',
    title: 'CodeReviewer',
    icon: '🔍',
    category: 'Code Review',
    categoryColor: '#8b5cf6',
    description: 'Revisa código, identifica issues e sugere melhorias baseadas em boas práticas e segurança.',
    responsibilities: [
      'Verificar boas práticas (SOLID, DRY, KISS)',
      'Detectar vulnerabilidades (XSS, SQLi, path traversal)',
      'Analisar performance (queries N+1, memory leaks)',
      'Checar cobertura de testes',
      'Sugerir melhorias de legibilidade'
    ],
    tech: ['ESLint', 'SonarQube', 'Snyk', 'CodeClimate', 'Semgrep'],
    flows: [
      'Recebe diff ou arquivo para revisão',
      'Executa análise estática (SAST)',
      'Verifica dependências vulneráveis',
      'Gera comentários e sugestões',
      'Retorna relatório de issues'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "diff --git a/src/auth.ts b/src/auth.ts ...", "projectId": "uuid" }',
    prev: '01-codewriter.html',
    next: '03-qa-tester.html'
  },
  {
    id: '03-qa-tester',
    title: 'QA Tester',
    icon: '🧪',
    category: 'QA',
    categoryColor: '#10b981',
    description: 'Executa testes automatizados, identifica bugs e valida funcionalidades antes do deploy.',
    responsibilities: [
      'Testes unitários (funções isoladas)',
      'Testes de integração (API + banco)',
      'Testes E2E (fluxo completo)',
      'Validação de regressão',
      'Relatórios de cobertura'
    ],
    tech: ['Jest', 'Vitest', 'Playwright', 'Cypress', 'Puppeteer', 'Supertest'],
    flows: [
      'Recebe comando para testar feature ou projeto',
      'Executa suite de testes configurada',
      'Captura falhas e screenshots',
      'Gera relatório detalhado',
      'Notifica equipe em caso de falha crítica'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "testar checkout flow", "projectId": "uuid" }',
    prev: '02-codereviewer.html',
    next: '04-deployer.html'
  },
  {
    id: '04-deployer',
    title: 'Deployer',
    icon: '🚀',
    category: 'Deploy',
    categoryColor: '#f59e0b',
    description: 'Automatiza o processo de deploy para staging e produção com CI/CD completo.',
    responsibilities: [
      'Build de artifacts (bundle, minificação)',
      'Executar testes automatizados',
      'Deploy multi-ambiente (preview, staging, prod)',
      'Health check pós-deploy',
      'Rollback automático em falha'
    ],
    tech: ['Docker', 'EasyPanel', 'GitHub Actions', 'Shell scripts', 'Kubernetes'],
    flows: [
      'Recebe trigger (push, webhook, botão)',
      'Instala dependencies (npm ci)',
      'Roda testes e build',
      'Stream de logs em tempo real',
      'Deploy + health check',
      'Atualiza status no banco'
    ],
    endpoint: 'POST /api/deploys',
    example: '{ "projectId": "uuid", "environment": "production", "branch": "main" }',
    prev: '03-qa-tester.html',
    next: '05-security-audit.html'
  },
  {
    id: '05-security-audit',
    title: 'Security Audit',
    icon: '🔒',
    category: 'Segurança',
    categoryColor: '#ef4444',
    description: 'Escaneia vulnerabilidades, analisa dependências e identifica riscos de segurança.',
    responsibilities: [
      'Scan de vulnerabilidades (SAST/SCA)',
      'Verificar dependências desatualizadas',
      'Detectar secrets vazados (API keys, tokens)',
      'Análise de configuração (CORS, CSP, headers)',
      'Relatório de correções prioritárias'
    ],
    tech: ['npm audit', 'Snyk', 'OWASP ZAP', 'GitLeaks', 'Trivy', 'Dependabot'],
    flows: [
      'Recebe projeto ou diff',
      'Escaneia código estático (SAST)',
      'Analisa dependências (SCA)',
      'Busca por secrets expostos',
      'Gera relatório com severidades'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "scan full project", "projectId": "uuid" }',
    prev: '04-deployer.html',
    next: '06-db-migration.html'
  },
  {
    id: '06-db-migration',
    title: 'DB Migration',
    icon: '🗄️',
    category: 'Database',
    categoryColor: '#06b6d4',
    description: 'Gera e executa migrações de banco de dados, gerenciando schema changes e seed data.',
    responsibilities: [
      'Criar migrações a partir de mudanças no schema',
      'Executar up/down de forma segura',
      'Seed de dados iniciais ou de teste',
      'Rollback automático em caso de erro',
      'Documentar mudanças no schema'
    ],
    tech: ['Drizzle Kit', 'Prisma Migrate', 'Alembic', 'Flyway', 'Knex'],
    flows: [
      'Recebe descrição da mudança ou diff de schema',
      'Gera SQL de migração (CREATE/ALTER/DROP)',
      'Mostra preview para aprovação',
      'Executa em transação',
      ' registra em histórico',
      'Rollback se necessário'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "adicionar coluna email a usuarios", "projectId": "uuid" }',
    prev: '05-security-audit.html',
    next: '07-docs-generator.html'
  },
  {
    id: '07-docs-generator',
    title: 'Docs Generator',
    icon: '📚',
    category: 'Documentação',
    categoryColor: '#8b5cf6',
    description: 'Gera documentação automática de código, APIs e componentes.',
    responsibilities: [
      'Extrair docstrings e comentários',
      'Gerar API docs (OpenAPI/Swagger)',
      'Documentar componentes (props, exemplos)',
      'Criar guias de uso passo a passo',
      'Publicar em formato HTML/Markdown'
    ],
    tech: ['TypeDoc', 'JSDoc', 'Swagger', 'Storybook', 'DocFX'],
    flows: [
      'Analisa repositório ou pasta src/',
      'Extrai tipos, interfaces, comentários',
      'Gera estrutura de documentação',
      'Exporta HTML, Markdown ou PDF',
      'Publica em docs/ ou site'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "generate API docs", "projectId": "uuid" }',
    prev: '06-db-migration.html',
    next: '08-refactor.html'
  },
  {
    id: '08-refactor',
    title: 'Refactor',
    icon: '🔧',
    category: 'Refatoração',
    categoryColor: '#3b82f6',
    description: 'Analisa código legado e aplica refatorações para melhorar legibilidade e manutenibilidade.',
    responsibilities: [
      'Identificar code smells',
      'Reduzir complexidade ciclomática',
      'Extrair métodos e componentes',
      'Separar responsabilidades (SRP)',
      'Renomear identificadores pouco claros'
    ],
    tech: ['ESLint rules', 'SonarQube', 'CodeMetrics', 'AST parsing'],
    flows: [
      'Analisa arquivo ou módulo',
      'Detecta code smells e opportunities',
      'Gera proposta de refatoração',
      'Aplica mudanças em branch separada',
      'Testa e valida resultado'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "refactor AuthService para SOLID", "projectId": "uuid" }',
    prev: '07-docs-generator.html',
    next: '09-test-generator.html'
  },
  {
    id: '09-test-generator',
    title: 'Test Generator',
    icon: '🧬',
    category: 'Testes',
    categoryColor: '#10b981',
    description: 'Gera testes unitários, integração e E2E automaticamente a partir do código.',
    responsibilities: [
      'Gerar skeleton de testes unitários',
      'Criar mocks e stubs para dependências',
      'Escrever testes de integração',
      'Gerar testes E2E com cenários comuns',
      'Atingir cobertura >80%'
    ],
    tech: ['Jest', 'Vitest', 'Testing Library', 'Playwright', 'Cypress', 'Sinon'],
    flows: [
      'Recebe função, componente ou endpoint',
      'Analisa assinatura e lógica',
      'Gera testes para casos comuns',
      'Adiciona mocks de dependências',
      'Executa e verifica cobertura'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "generate tests for UserService", "projectId": "uuid" }',
    prev: '08-refactor.html',
    next: '10-performance.html'
  },
  {
    id: '10-performance',
    title: 'Performance',
    icon: '⚡',
    category: 'Performance',
    categoryColor: '#06b6d4',
    description: 'Analisa performance, identifica bottlenecks e aplica otimizações em queries e código.',
    responsibilities: [
      'Query optimization e indexação',
      'Análise de bundle size',
      'Identificar memory leaks',
      'Implementar cache strategies',
      'Otimizar lazy loading'
    ],
    tech: ['Lighthouse', 'Chrome DevTools', 'EXplain analyze', 'WebPageTest', 'BundlePhobia'],
    flows: [
      'Captura baseline metrics',
      'Executa profiling (CPU, Memory, Network)',
      'Identifica gargalos (slow queries, huge bundles)',
      'Aplica otimizações',
      'Mede novamente e compara'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "analisar performance da página inicial", "projectId": "uuid" }',
    prev: '09-test-generator.html',
    next: '11-analytics.html'
  },
  {
    id: '11-analytics',
    title: 'Analytics',
    icon: '📊',
    category: 'Analytics',
    categoryColor: '#6366f1',
    description: 'Gera relatórios, dashboards e insights sobre uso do sistema e comportamento dos usuários.',
    responsibilities: [
      'Coletar métricas de uso (pageviews, events)',
      'Calcular custos de tokens e recursos',
      'Gerar timeseries de activity',
      'Criar painéis em tempo real',
      'Alertar sobre anomalias'
    ],
    tech: ['PostgreSQL analytics', 'Grafana', 'Metabase', 'ClickHouse', 'TimescaleDB'],
    flows: [
      'Consulta dados agregados do banco',
      'Processa métricas (tokens, custos, execuções)',
      'Gera gráficos e tabelas',
      'Envia relatórios por email',
      'Atualiza cache de dashboards'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "relatório de uso de agentes na última semana", "projectId": "uuid" }',
    prev: '10-performance.html',
    next: '12-monitor.html'
  },
  {
    id: '12-monitor',
    title: 'Monitor',
    icon: '👁️',
    category: 'Monitoramento',
    categoryColor: '#ec4899',
    description: 'Monitora saúde do sistema, logs e dispara alertas automáticos em caso de anomalias.',
    responsibilities: [
      'Health check de serviços (DB, Redis, APIs)',
      'Análise de logs (errors, warnings)',
      'Detecção de anomalias (spike de erros, latência)',
      'Disparar alertas (Slack, Email, SMS)',
      'Dashboard de status em tempo real'
    ],
    tech: ['Prometheus', 'Grafana', 'Sentry', 'Datadog', 'UptimeRobot'],
    flows: [
      'Coleta métricas do sistema',
      'Verifica thresholds definidos',
      'Detecta anomalias com ML básico',
      'Classifica severidade',
      'Envia notificação via Inbox'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "monitorar API latency", "projectId": "uuid" }',
    prev: '11-analytics.html',
    next: '13-notifier.html'
  },
  {
    id: '13-notifier',
    title: 'Notifier',
    icon: '🔔',
    category: 'Notificações',
    categoryColor: '#6366f1',
    description: 'Envia notificações, emails e alertas baseados em eventos do sistema.',
    responsibilities: [
      'Enviar emails transacionais',
      'Notificações in-app (Inbox)',
      'Alertas via Slack/Discord',
      'SMS/WhatsApp para críticos',
      'Gerenciar preferências de notificação'
    ],
    tech: ['Resend', 'SendGrid', 'Slack Webhook', 'Twilio', 'Firebase Cloud Messaging'],
    flows: [
      'Recebe evento (erro, deploy, agent run)',
      'Avalia regras de notificação',
      'Renderiza template (email, push)',
      'Envia via provider',
      'Registra status de entrega'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "notificar deploy concluído", "projectId": "uuid" }',
    prev: '12-monitor.html',
    next: '14-integration.html'
  },
  {
    id: '14-integration',
    title: 'Integration',
    icon: '🔗',
    category: 'Integração',
    categoryColor: '#0ea5e9',
    description: 'Gerencia integrações com APIs externas, webhooks e sincronização de dados.',
    responsibilities: [
      'Configurar conectores (GitHub, Stripe, Slack)',
      'Sincronizar dados entre sistemas',
      'Processar webhooks recebidos',
      'Gerenciar retry e dead-letter queues',
      'Monitorar saúde das integrações'
    ],
    tech: ['GitHub API', 'Stripe API', 'Slack API', 'REST', 'GraphQL', 'Webhooks'],
    flows: [
      'Recebe evento ou polling request',
      'Autentica com API externa (OAuth, API key)',
      'Envia/recebe dados',
      'Transforma payloads',
      'Armazena resultado'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "sincronizar issues do GitHub", "projectId": "uuid" }',
    prev: '13-notifier.html',
    next: '15-orchestrator.html'
  },
  {
    id: '15-orchestrator',
    title: 'Orchestrator',
    icon: '🎼',
    category: 'Orquestração',
    categoryColor: '#f59e0b',
    description: 'Orquestra múltiplos agentes, coordena fluxos complexos e pipelines de trabalho.',
    responsibilities: [
      'Definir sequência de agentes',
      'Passar contexto entre stages',
      'Tratar erros e retries',
      'Paralelizar quando possível',
      'Agregar resultados finais'
    ],
    tech: ['BullMQ', 'Temporal', 'Airflow', 'Step Functions', 'Custom DAG'],
    flows: [
      'Recebe workflow definition',
      'Cria tarefas para cada agente',
      'Executa em ordem ou paralelo',
      'Passa output como input próximo',
      'Finaliza com resultado consolidado'
    ],
    endpoint: 'POST /api/agents/:id/run',
    example: '{ "input": "workflow: code-review -> test -> deploy", "projectId": "uuid" }',
    prev: '14-integration.html',
    next: null
  }
];

function generateAgentPage(agent) {
  const prevLink = agent.prev ? `<a href="${agent.prev}" class="nav-back">← Anterior</a>` : '';
  const nextLink = agent.next ? `<a href="${agent.next}" class="nav-back">Próximo: ${agents.find(a => a.id === agent.next.replace('.html',''))?.title} →</a>` : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${agent.title} - Nommand Vision</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    .hero-agent { text-align: center; padding: 40px 20px; }
    .hero-agent h1 { font-size: 2.5rem; margin: 0 0 10px 0; color: ${agent.categoryColor}; }
    .hero-agent .icon { font-size: 4rem; margin-bottom: 16px; display: block; }
    .hero-agent .subtitle { font-size: 1.1rem; color: var(--muted); }
    .badge-category { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: ${agent.categoryColor}; color: white; margin-bottom: 20px; }
    .app-container { max-width: 940px; margin: 0 auto; padding: 24px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 24px 0; }
    .info-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
    .info-card h3 { margin: 0 0 12px 0; color: var(--accent); font-size: 0.9rem; text-transform: uppercase; }
    .info-card ul { margin: 0; padding-left: 20px; }
    .info-card li { margin: 6px 0; color: var(--fg-secondary); font-size: 0.9rem; }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-top: 20px; }
    .nav-back { display: inline-flex; align-items: center; gap: 8px; color: ${agent.categoryColor}; text-decoration: none; padding: 10px 20px; border: 1px solid ${agent.categoryColor}; border-radius: 8px; margin: 5px; }
    .nav-back:hover { background: ${agent.categoryColor}; color: white; }
    .code-block { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; padding: 12px; font-family: monospace; color: var(--accent-glow); overflow-x: auto; margin: 8px 0; }
  </style>
</head>
<body>
  <div class="app-container">
    <a href="index.html" class="nav-back">← Voltar ao Índice</a>

    <div class="hero-agent">
      <span class="icon">${agent.icon}</span>
      <h1>${agent.title}</h1>
      <span class="badge-category">${agent.category}</span>
      <p class="subtitle">${agent.description}</p>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <h3>📋 Descrição</h3>
        <p>${agent.description}</p>
      </div>
      <div class="info-card">
        <h3>🎯 Responsabilidades</h3>
        <ul>
          ${agent.responsibilities.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
      <div class="info-card">
        <h3>🔧 Tecnologias</h3>
        <ul>
          ${agent.tech.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>
      <div class="info-card">
        <h3>⚡ Como Usar</h3>
        <ul>
          <li>Acesse a página Agentes</li>
          <li>Selecione ${agent.title}</li>
          <li>Forneça input ou contexto</li>
          <li>Execute e aguarde resultado</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <h2>🔄 Fluxo de Execução</h2>
      <ol>
        ${agent.flows.map(f => `<li><strong>${f.split(':')[0]}:</strong> ${f.includes(':') ? f.split(':')[1] : f}</li>`).join('')}
      </ol>
    </div>

    <div class="card">
      <h2>📡 API Endpoint</h2>
      <div class="code-block"><code>${agent.endpoint}</code></div>
      <p><strong>Exemplo de requisição:</strong></p>
      <div class="code-block"><code>${agent.example}</code></div>
    </div>

    <div class="card">
      <h2>📊 Dados Coletados</h2>
      <ul>
        <li><strong>Entrada:</strong> Prompt, arquivos, contexto do projeto</li>
        <li><strong>Saída:</strong> Resultado processado (código, relatório, etc.)</li>
        <li><strong>Métricas:</strong> Total de execuções, taxa de sucesso, tempo médio, tokens usados</li>
        <li><strong>Logs:</strong> Histórico completo de cada execução</li>
      </ul>
    </div>

    <div style="margin-top: 40px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
      ${prevLink}
      ${nextLink}
    </div>
  </div>
</body>
</html>`;
}

// Gerar todas as páginas
agents.forEach(agent => {
  const filePath = path.join(__dirname, `agent-${agent.id}.html`);
  fs.writeFileSync(filePath, generateAgentPage(agent));
  console.log(`✅ Generated: agent-${agent.id}.html`);
});

console.log('✅ All agent pages generated!');
