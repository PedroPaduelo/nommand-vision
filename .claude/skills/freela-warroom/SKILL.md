---
name: freela-warroom
description: Pipeline completo de prospecção freelancer: scrape de projetos em plataformas, análise/classificação, geração de propostas personalizadas, resumos financeiros e dashboard interativo para tomada de decisão.
allowed-tools:
  - mcp__browser__create_automation_session
  - mcp__browser__navigate_to
  - mcp__browser__smart_wait
  - mcp__browser__evaluate_in_page
  - mcp__browser__extract_text
  - mcp__browser__close_automation_session
  - mcp__mcp-easypanel__easypanel_create_domain
  - mcp__mcp-easypanel__easypanel_list_domains
  - mcp__mcp-easypanel__easypanel_delete_domain
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - WebFetch
model: opus
---

# Skill: Freela War Room

## Objetivo
Pipeline de ponta a ponta para prospecção de projetos freelancer em plataformas como 99freelas.com.br (adaptável para outras). Faz scrape, análise, classificação, geração de propostas matadoras, resumos financeiros e monta um dashboard interativo para o freelancer e seu time tomarem decisão.

---

## PIPELINE COMPLETO (6 etapas)

### ETAPA 1 — Scrape de Projetos (Coleta em massa)

**Input:** URL da plataforma com filtros de categoria
**Output:** Lista bruta de todos os projetos disponíveis

**Processo:**
1. Abrir sessão de browser automation (`create_automation_session`)
2. Navegar até a URL de listagem de projetos
3. Aguardar carregamento (`smart_wait` com `network_idle`)
4. Identificar paginação (total de páginas)
5. Usar `evaluate_in_page` com `fetch()` + `DOMParser` para scrape paralelo em lotes:
   - Lotes de 5-10 páginas por vez
   - Delay de 600-800ms entre requests (evitar rate limit 503)
   - Usar `credentials: 'include'` nos fetch para manter sessão autenticada
6. Para cada projeto extrair: título, URL/slug, categoria, skills, número de propostas

**Código-padrão para scrape de listagem:**
```javascript
(async function() {
  const results = [];
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    await new Promise(r => setTimeout(r, 700));
    const resp = await fetch(BASE_URL + '&page=' + page, {credentials: 'include'});
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // extrair projetos da page
    doc.querySelectorAll('.item-projeto, .project-item, [class*=project]').forEach(el => {
      results.push({
        titulo: el.querySelector('h1,h2,h3,a')?.textContent?.trim(),
        url: el.querySelector('a')?.href,
        // ... outros campos
      });
    });
  }
  return JSON.stringify(results);
})()
```

**IMPORTANTE:**
- Nunca tirar screenshots para ler conteúdo. Usar `extract_text` ou `evaluate_in_page`
- Se receber 503, aumentar delay e reduzir tamanho do lote
- Envolver código em IIFE para evitar redeclaração de variáveis

---

### ETAPA 2 — Scrape Detalhado (Entrar em cada projeto)

**Input:** Lista de slugs/URLs dos projetos selecionados
**Output:** Descrição completa de cada projeto

**Processo:**
1. Para cada projeto, fazer fetch da página individual
2. Extrair: descrição completa, skills, nível, budget, número de propostas/interessados
3. Processar em lotes de 3-5 projetos por vez com delay de 800ms

**Código-padrão:**
```javascript
(async function() {
  const urls = ['/project/slug-1', '/project/slug-2', ...];
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    await new Promise(r => setTimeout(r, 800));
    const resp = await fetch('https://www.99freelas.com.br' + urls[i], {credentials: 'include'});
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const descEl = doc.querySelector('.project-description');
    const desc = descEl ? descEl.innerHTML.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().substring(0,2500) : '';
    const txt = doc.body.textContent;
    const props = (txt.match(/(\d+)\s*propost/i)||[])[1]||'?';
    const lvl = (txt.match(/(Iniciante|Intermediário|Especialista)/i)||[])[1]||'?';
    const budget = (txt.match(/R\$\s*[\d.,]+/)||[])[0]||'N/I';
    results.push({slug: urls[i].split('/project/')[1], desc, props, lvl, budget});
  }
  return JSON.stringify(results);
})()
```

---

### ETAPA 3 — Classificação e Análise

**Input:** Dados detalhados de todos os projetos
**Output:** Arquivo `analise-projetos.md` com classificação em tiers

**Processo:**
1. Analisar cada projeto considerando:
   - Escopo (claro vs vago)
   - Viabilidade técnica
   - Relação esforço/retorno
   - Nível de concorrência (número de propostas)
   - Potencial de recorrência
   - Alinhamento com skills do freelancer
2. Classificar em 3 tiers:
   - **TIER 1 (Excelentes):** Alta viabilidade, bom escopo, boa relação esforço/retorno
   - **TIER 2 (Bons):** Viáveis mas mais competitivos ou complexos
   - **TIER 3 (Evitar):** Baixo retorno, alto risco, escopo problemático
3. Gerar TOP 5 prioridades com justificativa
4. Salvar como `analise-projetos.md` na raiz do projeto

---

### ETAPA 4 — Coleta de Dados Financeiros

**Input:** Lista de projetos selecionados (Tier 1 + Tier 2)
**Output:** Valor médio das propostas e duração média por projeto

**Processo:**
1. Acessar a página de propostas de cada projeto (`/project/bid/SLUG`)
2. Extrair via fetch com credentials:
   - Valor médio das propostas (regex: `Valor médio das propostas:\s*<b>R\$\s*([\d.,]+)</b>`)
   - Duração média estimada (regex: `Duração média estimada:\s*<b>(\d+)\s*(dias?|semanas?|meses?)</b>`)
3. Calcular valor/hora aproximado (baseado em 6h/dia útil)

**Código-padrão:**
```javascript
(async function() {
  const slugs = ['slug-1', 'slug-2', ...];
  const results = [];
  for (let i = 0; i < slugs.length; i++) {
    await new Promise(r => setTimeout(r, 800));
    const resp = await fetch('https://www.99freelas.com.br/project/bid/' + slugs[i], {credentials: 'include'});
    const html = await resp.text();
    const valorMatch = html.match(/Valor m[eé]dio das propostas:\s*<b>R\$\s*([\d.,]+)<\/b>/i);
    const duracaoMatch = html.match(/Dura[çc][aã]o m[eé]dia estimada:\s*<b>(\d+)\s*(dias?|semanas?|meses?)<\/b>/i);
    results.push({
      slug: slugs[i],
      valor: valorMatch ? valorMatch[1] : 'N/D',
      duracao: duracaoMatch ? duracaoMatch[1] + ' ' + duracaoMatch[2] : 'N/D'
    });
  }
  return JSON.stringify(results);
})()
```

---

### ETAPA 5 — Geração de Propostas e Resumos Financeiros

**Input:** Dados completos dos projetos + dados financeiros
**Output:** Pasta `propostas/proposta-XX/` com `proposta.md` e `resumo-financeiro.md`

**Estrutura de pastas:**
```
propostas/
  proposta-01/
    proposta.md
    resumo-financeiro.md
  proposta-02/
    proposta.md
    resumo-financeiro.md
  ...
```

**Formato do proposta.md:**
```markdown
# Proposta — [Nome do Projeto]

## Análise do Projeto
- O que o cliente quer (mostrando que leu tudo)
- Pontos críticos identificados
- O que a maioria dos freelancers vai errar/ignorar

## Proposta
[Texto em primeira pessoa, como o freelancer escreveria]
- Começa mostrando que entendeu o problema REAL
- Cita detalhes específicos do projeto
- Mostra experiência relevante sem ser genérico
- Oferece insight/sugestão técnica que agrega valor
- Termina com call-to-action para uma call

## Dados do Projeto
- URL: [link]
- Propostas: X
- Nível: X
- Budget indicado: X
```

**Formato do resumo-financeiro.md:**
```markdown
# Resumo Financeiro — [Nome do Projeto]

## Dados do Mercado
- Valor médio das propostas: R$ X
- Duração média estimada: X dias
- Número de propostas: X
- Nível do projeto: X

## Análise de Viabilidade
- Esforço real estimado: X dias
- Valor/hora aproximado: R$ X (6h/dia útil)
- Concorrência: X propostas (alta/média/baixa)

## Veredito
[COMPENSA ✅ / NÃO COMPENSA ❌ / DEPENDE ⚠️]
[Justificativa em 2-3 linhas]
```

**Regras críticas para propostas:**
- Tom pessoal e direto — NÃO é documento formal
- Cada proposta deve ser ÚNICA — mostrar conhecimento profundo do projeto específico
- Citar detalhes do briefing do cliente (nomes de tecnologias, funcionalidades)
- Identificar pontos que outros freelancers vão ignorar
- Oferecer algo de valor (insight técnico, sugestão de arquitetura, melhoria)
- Se o freelancer tem produto pronto relevante, mencionar explicitamente
- Sempre terminar com CTA para call de 15 minutos

**Paralelização:** Usar agentes (Task tool) para gerar propostas em lotes de 4-5 simultaneamente.

---

### ETAPA 6 — Dashboard Interativo

**Input:** Todos os dados coletados
**Output:** `index.html` + `dados-projetos.json` servidos via HTTP

**Processo:**

1. **Gerar JSON consolidado** (`dados-projetos.json`):
   - Array de objetos, um por projeto
   - Campos: id, nome, valorMedio, duracaoMedia, propostas, nivel, valorHora, veredito, url, proposta (HTML), resumoFinanceiro (HTML)
   - Converter markdown para HTML básico (h1/h2/h3, strong, ul/li, p, a, code, pre)

2. **Criar dashboard HTML** (`index.html`):
   - Single-page, zero dependências externas, dark mode
   - Header com stats agregados (total compensam/dependem/não compensam, valor total potencial)
   - Filtros por veredito (Todos, Compensa, Depende, Não Compensa)
   - Tabela ordenável com colunas: #, Projeto, Valor Médio, Duração, Propostas, Nível, R$/Hora, Veredito
   - Cores por concorrência: verde (≤10), amarelo (≤25), vermelho (>25)
   - Badges coloridos por veredito
   - Clique na linha abre painel lateral com 3 abas:
     - 📝 Proposta (com botão "Copiar proposta")
     - 🔍 Análise
     - 💰 Financeiro
   - ESC ou clique no overlay fecha o painel
   - Responsivo (mobile-first)
   - Carrega dados via `fetch('dados-projetos.json')`

3. **Servir via HTTP:**
   - Verificar portas em uso: `netstat -tlnp`
   - Escolher porta livre na faixa 3000-9000
   - Criar domínio EasyPanel: `easypanel_create_domain`
   - Iniciar servidor desvinculado: `nohup python3 -m http.server PORTA --bind 0.0.0.0 > ./server.log 2>&1 &`
   - Confirmar que está rodando: `netstat -tlnp | grep PORTA`
   - Informar URL ao usuário

4. **Git (opcional, sob demanda):**
   - Criar .gitignore (server.log, .claude/, .mcp.json, node_modules/)
   - Commit com mensagem descritiva
   - Push para GitHub (requer token do usuário)

---

## ADAPTAÇÃO PARA OUTRAS PLATAFORMAS

Este pipeline é desenhado para 99freelas.com.br mas pode ser adaptado para:
- **Workana:** Mudar seletores CSS e regexes de extração
- **Freelancer.com:** API REST disponível (pode pular browser scraping)
- **GetNinjas:** Estrutura similar ao 99freelas
- **Upwork:** Requer autenticação OAuth mais complexa

Para adaptar, mudar apenas:
1. URLs base e seletores CSS na Etapa 1-2
2. Regexes de extração na Etapa 4
3. Manter Etapas 3, 5, 6 iguais (são agnósticas à plataforma)

---

## CHECKLIST DE EXECUÇÃO

- [ ] Browser session criada e autenticada
- [ ] Listagem completa scraped (todas as páginas)
- [ ] Projetos classificados em tiers (analise-projetos.md)
- [ ] Projetos Tier 1 + Tier 2 scraped em detalhe
- [ ] Dados financeiros coletados (/bid/ de cada projeto)
- [ ] Pastas proposta-XX/ criadas
- [ ] proposta.md gerado para cada projeto
- [ ] resumo-financeiro.md gerado para cada projeto
- [ ] dados-projetos.json consolidado
- [ ] index.html do dashboard criado
- [ ] Servidor HTTP rodando e domínio criado
- [ ] URL do dashboard informada ao usuário
