---
name: whatsapp-automation
description: Automatiza o WhatsApp Web via browser. Navega em conversas, le mensagens, responde clientes e gerencia interacoes. CDP direto - sem API.
allowed-tools:
  - mcp__browser__create_automation_session
  - mcp__browser__navigate_to
  - mcp__browser__click_element
  - mcp__browser__type_text
  - mcp__browser__wait_for_element
  - mcp__browser__extract_text
  - mcp__browser__get_page_text
  - mcp__browser__scroll_to
  - mcp__browser__press_key
  - mcp__browser__close_automation_session
model: sonnet
---

# Skill: WhatsApp Web Automation

Automatiza o WhatsApp Web diretamente pelo browser usando CDP. Navega em conversas, le mensagens, responde clientes e gerencia interacoes.

## Quando Usar
- Fazer follow-up de clientes pelo WhatsApp
- Responder mensagens automaticamente
- Ler conversas e historico de mensagens
- Enviar mensagens para contatos
- Monitorar respostas de clientes

## Requisitos
- Usuario deve estar logado no WhatsApp Web (https://web.whatsapp.com)
- Sessao do WhatsApp Web deve estar ativa (QR code ja escaneado)

## URLs e Seletores
- Base: https://web.whatsapp.com
- Lista conversas: #pane-side (sidebar esquerda)
- Item conversa: .zoWT4, .X7YCr (contatos na lista)
- Chat ativo: #main [data-testid="conversation-panel-messages"]
- Mensagens: [data-testid="msg-container"]
- Input mensagem: [data-testid="chat-footer"] [contenteditable="true"]
- Botao enviar: [data-testid="send-button"] ou [data-testid="send"]
- Buscar contato: [data-testid="chat-list-search"] .selectable-text
- Nome contato: [data-testid="conversation-panel-header"] span[title]
- Timestamp mensagem: .xlli3

## Processo: Abrir WhatsApp Web
1. `create_automation_session` - inicia browser
2. `navigate_to` https://web.whatsapp.com
3. `page_ready` - espera carregar
4. Verificar se precisa escanear QR code:
   - Se aparecer canvas/div com QR: alertar usuario para escanear
   - Se ja logado: pronto para navegar

## Processo: Listar Conversas
1. `wait_for_element` #pane-side (sidebar)
2. `get_page_text` ou `extract_html` do sidebar
3. Parsear lista de conversas:
   - Nome do contato
   - Ultima mensagem preview
   - Timestamp
   - Badge de nao lido (se existir)

## Processo: Abrir Conversa
**Opcao A: Pelo nome do contato**
1. Clicar no campo de busca: [data-testid="chat-list-search"]
2. Digitar nome do contato: `type_text`
3. Aguardar aparecer resultado
4. Clicar no contato: `click_element` .zoWT4 .zoWT4 .X7YCr

**Opcao B: Pela lista**
1. Scroll na lista se necessario
2. `click_element` no item da conversa desejada

## Processo: Ler Mensagens da Conversa
1. Aguardar chat carregar: `wait_for_element` [data-testid="conversation-panel-messages"]
2. `extract_text` ou `get_page_text` do container de mensagens
3. Parsear mensagens:
   - Remetente (cliente/eu)
   - Conteudo da mensagem
   - Timestamp
   - Status (enviada/lida/entregue)

## Processo: Enviar Mensagem
1. `wait_for_element` [data-testid="chat-footer"] [contenteditable="true"]
2. Clicar no input: `click_element`
3. Digitar mensagem: `type_text` com o texto
4. Enviar: `click_element` [data-testid="send-button"]
   - OU `press_key` Enter
5. `wait_for_element` nova mensagem no chat (confirmacao)

## Processo: Scroll para Carregar Mais Mensagens
1. `scroll_to` topo do chat
2. Aguardar carregar mensagens antigas
3. Repetir se necessario

## Processo: Identificar Mensagens Nao Lidas
1. Ler lista de conversas do sidebar
2. Procurar por badges de contagem (unread count)
3. Mapear conversas com mensagens pendentes
4. Retornar lista: [{nome, ultimaMsg, unreadCount}]

## Processo: Fechar Sessao
1. `close_automation_session` - fecha browser
2. Limpa recursos

## Fluxo Completo: Follow-up WhatsApp
1. Abrir WhatsApp Web
2. Listar conversas nao lidas
3. Para cada conversa:
   a. Abrir conversa
   b. Ler mensagens recentes
   c. Analisar contexto (cliente/resposta/proposta/etc)
   d. Se necessario: enviar resposta pre-definida
   e. Voltar para lista
4. Fechar sessao

## Observacoes Importantes
- WhatsApp Web pode desconectar se inativo por muito tempo
- Rate limits: NAO enviar muitas mensagens rapidamente (risco de ban)
- Sempre aguardar entre acoes (1-2s minimo)
- Se QR code aparecer: usuario precisa escanear manualmente
- Nao e possivel logar automaticamente (requer interacao humana no QR)

## Exemplos de Uso
- "Checa o WhatsApp e me diz quais conversas tenho nao lidas"
- "Manda follow-up para o cliente Joao sobre o projeto X"
- "Le as ultimas 10 mensagens da conversa com Maria"
- "Responde para o cliente: O projeto esta pronto para revisao"