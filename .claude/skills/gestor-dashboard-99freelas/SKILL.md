---
name: gestor-dashboard-99freelas
description: Gestao do dashboard em tempo real do 99Freelas. Atualiza metricas, registra todas as interacoes com clientes, calcula conversoes e exibe dados financeiros para acompanhamento em TV.
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - mcp__mcp-easypanel__easypanel_list_domains
  - mcp__mcp-easypanel__easypanel_create_domain
model: sonnet
---

# Skill: Gestor Dashboard 99Freelas

Gestão do dashboard em tempo real do 99Freelas. Registra TODAS as interações com clientes e atualiza métricas para acompanhamento em TV.

## O que faz
- Atualiza dashboard em tempo real
- Registra cada interação com cliente
- Calcula métricas de conversão
- Mostra status de cada proposta
- Exibe dados financeiros
- Gera alertas de oportunidades
- **Cria domínio público EasyPanel para acesso externo**

## Criar Domínio Público

### Passo a Passo
1. Verificar se servidor está rodando na porta 4899
2. Listar domínios existentes com `easypanel_list_domains`
3. Se não existir "dashboard-99freelas":
   - Criar com `easypanel_create_domain`
   - subdomain: "dashboard-99freelas"
   - port: 4899
4. Retornar URL pública: `https://dashboard-99freelas.ddw1sl.easypanel.host`

### Comando
"Cria domínio público para o dashboard 99Freelas"

### Ferramentas Necessárias
- easypanel_list_domains
- easypanel_create_domain

## Dados que Registra

### Toda Interação com Cliente
```json
{
  "data": "2026-03-04T11:45:00Z",
  "cliente": "Konecta J.",
  "projeto": "Chatbot WhatsApp Jurídico",
  "canal": "99freelas|whatsapp",
  "tipo": "PROPOSTA_ENVIADA|RESPOSTA_CLIENTE|FOLLOW_UP|DEMO_ENVIADA|CONTRATACAO|RECUSA",
  "mensagem": "Texto da interação...",
  "valor": "R$ 1.764,71",
  "status": "AGUARDANDO|NEGOCIANDO|FECHADO|PERDIDO"
}
```

### Métricas Calculadas
- Total de propostas enviadas
- Propostas pendentes (sem resposta)
- Clientes que responderam
- Taxa de resposta (%)
- Em negociação
- Projetos fechados (R$)
- Projetos perdidos
- Pipeline total (R$)

## Atualização do Dashboard

### 1. Ler dados-projetos.json
```javascript
const projetos = JSON.parse(fs.readFileSync('dados-projetos.json'))
```

### 2. Calcular Métricas
```javascript
const metricas = {
  propostasEnviadas: projetos.filter(p => p.propostaEnviada).length,
  aguardandoResposta: projetos.filter(p => !p.clienteRespondeu && p.propostaEnviada).length,
  clientesResponderam: projetos.filter(p => p.clienteRespondeu).length,
  taxaResposta: (clientesResponderam / propostasEnviadas * 100).toFixed(1),
  emNegociacao: projetos.filter(p => p.status === 'NEGOCIANDO').length,
  fechados: projetos.filter(p => p.status === 'FECHADO'),
  perdidos: projetos.filter(p => p.status === 'PERDIDO').length,
  pipelineTotal: projetos.filter(p => p.status === 'AGUARDANDO' || p.status === 'NEGOCIANDO')
    .reduce((acc, p) => acc + parseValor(p.valor), 0)
}
```

### 3. Atualizar dashboard.json
```json
{
  "ultimaAtualizacao": "2026-03-04T11:45:00Z",
  "metricas": {
    "propostasEnviadas": 45,
    "aguardandoResposta": 32,
    "clientesResponderam": 13,
    "taxaResposta": "28.9%",
    "emNegociacao": 5,
    "fechados": 2,
    "perdidos": 6,
    "pipelineTotal": "R$ 45.230,50"
  },
  "ultimasInteracoes": [...],
  "oportunidadesQuentes": [...],
  "alertas": [...]
}
```

## Dashboard HTML para TV

### Acesso Público
**URL:** https://dashboard-99freelas.ddw1sl.easypanel.host

**Características:**
- Auto-refresh a cada 30 segundos
- Design responsivo para TV
- Métricas em tempo real
- Alertas visuais pulsantes
- Últimas interações
- Oportunidades quentes destacadas

## Tipos de Alerta

### Oportunidade Quente
- Cliente respondeu em < 2h
- Perguntou sobre prazo/orçamento
- Pediu demo/call

### Follow-up Necessário
- Proposta enviada há 48h sem resposta
- Cliente respondeu há 24h sem follow-up

### Risco de Perder
- Cliente disse "vou com outro"
- Pediu só para "comparar"

## Como usar
"Atualiza o dashboard com a última interação"
"Gera relatório do dia"
"Quais oportunidades quentes temos agora?"
"Mostra métricas de conversão"
"Cria domínio público para o dashboard"