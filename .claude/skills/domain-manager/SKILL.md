---
name: domain-manager
description: Gerenciamento de portas e domínios externos no EasyPanel. Use SEMPRE antes de iniciar qualquer servidor de desenvolvimento (npm run dev, vite, next dev, etc). Garante que nenhuma porta em uso seja conflitada e que o domínio público seja criado automaticamente.
allowed-tools:
  - Bash
  - Read
  - mcp__mcp-easypanel__easypanel_list_domains
  - mcp__mcp-easypanel__easypanel_create_domain
  - mcp__mcp-easypanel__easypanel_delete_domain
---

---
name: domain-manager
description: Gerenciamento de portas e domínios externos no EasyPanel. Use SEMPRE antes de iniciar qualquer servidor de desenvolvimento (npm run dev, vite, next dev, etc). Garante que nenhuma porta em uso seja conflitada e que o domínio público seja criado automaticamente.
allowed-tools: Bash, Read, mcp__mcp-easypanel__easypanel_list_domains, mcp__mcp-easypanel__easypanel_create_domain, mcp__mcp-easypanel__easypanel_delete_domain
---

# Gerenciamento de Portas e Domínios Externos

> Regra obrigatoria para QUALQUER projeto que suba um servidor de desenvolvimento neste ambiente.

---

## Contexto do Ambiente

Este ambiente roda no **EasyPanel** (projeto: `lab-myke`, servico: `lab-myke-2`).
Dominio base: `*.ddw1sl.easypanel.host`

Todos os servicos sao expostos externamente via dominios EasyPanel que apontam para portas internas do container.

---

## REGRA DE OURO

**NUNCA** inicie um servidor em uma porta que ja esta em uso.
**SEMPRE** crie um dominio externo para o projeto antes de informar a URL ao usuario.

---

## Procedimento Obrigatorio (Passo a Passo)

### 1. Verificar portas em uso

Antes de iniciar QUALQUER servidor, execute:

```bash
ss -tlnp
```

Isso mostra todas as portas TCP em escuta. **Nenhuma dessas portas pode ser reutilizada.**

### 2. Verificar dominios ja configurados

Use a tool `easypanel_list_domains` para listar todos os dominios ativos e suas portas.

As portas ja ocupadas pelo ambiente base (NAO USE ESTAS):

| Porta | Servico | Fixo |
|-------|---------|------|
| 8443 | Code Server (IDE) | Sim |
| 6080 | noVNC (Desktop remoto) | Sim |
| 5900 | VNC Server (interno) | Sim |
| 22 | SSH | Sim |

Portas de projetos ativos mudam - SEMPRE consulte `ss -tlnp` antes.

### 3. Escolher uma porta livre

- Escolha uma porta que NAO aparece na saida do `ss -tlnp`
- Faixa recomendada: **3000-9000**
- Evite portas muito comuns (80, 443, 8080) se ja estiverem em uso
- Se o framework tem porta padrao (ex: Vite=5173, Next=3000), verifique se esta livre. Se nao, use a flag de porta alternativa:
  - Vite: `--port XXXX`
  - Next.js: `-p XXXX`
  - Express/Node: altere a variavel PORT no .env ou no codigo

### 4. Criar o dominio externo

Use a tool `easypanel_create_domain` com:
- `subdomain`: nome curto e descritivo do projeto (ex: `meu-app`, `dashboard`, `api-vendas`)
- `port`: a porta que voce escolheu no passo 3

**Regras para nome do subdominio:**
- Use o nome do projeto, limpo, sem prefixos como "lab-" ou "myke-"
- Use kebab-case
- Seja descritivo mas curto
- Exemplos bons: `loja-admin`, `chat-api`, `portfolio`
- Exemplos ruins: `lab-myke-loja-admin`, `app`, `teste123`

### 5. Iniciar o servidor na porta escolhida

Inicie o servidor apontando para a porta que voce reservou:

```bash
# Exemplos:
npm run dev -- --port 4000
npx next dev -p 4000
PORT=4000 node server.js
npx vite --port 4000
```

### 6. Informar a URL publica ao usuario

Apos criar o dominio e iniciar o servidor, informe:

```
Projeto rodando em: https://{subdominio}.ddw1sl.easypanel.host
Porta interna: {porta}
```

---

## Quando um projeto e encerrado

Se o usuario pedir para parar/remover um projeto:

1. Pare o processo do servidor
2. Delete o dominio com `easypanel_delete_domain` usando o ID do dominio
3. Confirme que a porta foi liberada

---

## Checklist Rapido

```
[ ] Rodei ss -tlnp para ver portas ocupadas
[ ] Listei dominios ativos no EasyPanel
[ ] Escolhi porta livre na faixa 3000-9000
[ ] Criei dominio com nome limpo e descritivo
[ ] Iniciei o servidor na porta correta
[ ] Informei a URL publica ao usuario
```

---

## Exemplo Completo

O usuario pede: "Cria um projeto Next.js pra mim"

1. `ss -tlnp` → porta 3000 esta ocupada, 4000 esta livre
2. `easypanel_list_domains` → confirma que nao tem dominio na 4000
3. `easypanel_create_domain(subdomain="nextjs-app", port=4000)`
4. `npx next dev -p 4000`
5. Responde: "Projeto rodando em https://nextjs-app.ddw1sl.easypanel.host"

---

> **Lembre-se:** O usuario acessa TUDO por dominio externo HTTPS. Ele NAO tem acesso direto as portas. Sem dominio = sem acesso.
