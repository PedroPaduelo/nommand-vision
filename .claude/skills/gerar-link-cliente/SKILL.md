---
name: gerar-link-cliente
description: Gera links publicos HTTPS para enviar qualquer conteudo a clientes (demos, videos, PDFs, apresentacoes). Cria pagina HTML profissional, sobe servidor local e cria dominio EasyPanel.
allowed-tools:
  - Read
  - Write
  - Edit
  - mcp__mcp-easypanel__easypanel_create_domain
  - mcp__mcp-easypanel__easypanel_list_domains
  - Bash
model: sonnet
---

# Gerar Link para Cliente

Gera links publicos HTTPS para enviar qualquer conteudo a clientes (demos, videos, PDFs, apresentacoes). Cria pagina HTML profissional, sobe servidor local e cria dominio EasyPanel.

## Como funciona

1. **Criar Pagina HTML**
   - Criar arquivo index.html com o conteudo
   - Estilo profissional e limpo
   - Suporte a videos, PDFs, links externos

2. **Subir Servidor**
   - Iniciar servidor HTTP na porta livre (3000-9000)
   - Usar npx serve ou python http.server

3. **Criar Dominio**
   - Usar easypanel_create_domain
   - Nome limpio em kebab-case
   - Vinculado a porta do servidor

4. **Retornar Link**
   - URL completa: https://[nome].ddw1sl.easypanel.host

## Exemplos de Uso

- "Gera link para demo do projeto X"
- "Cria link para video de apresentação"
- "Faz link para PDF do orçamento"

## Observacoes
- Sempre usar porta livre
- Deletar dominio quando nao usado
- Arquivos temporarios em /tmp ou pasta do projeto