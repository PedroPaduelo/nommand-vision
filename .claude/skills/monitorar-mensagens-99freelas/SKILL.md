---
name: monitorar-mensagens-99freelas
description: Monitora a caixa de entrada do 99Freelas, detecta respostas de clientes, interage quando necessario e atualiza o dashboard (dados-projetos.json). Processo completo com browser automation.
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - mcp__browser__create_automation_session
  - mcp__browser__navigate_to
  - mcp__browser__click_element
  - mcp__browser__type_text
  - mcp__browser__wait_for_element
  - mcp__browser__extract_text
  - mcp__browser__get_page_text
  - mcp__browser__enable_console_capture
  - mcp__browser__get_console_logs
  - mcp__browser__close_automation_session
model: sonnet
---

# Skill: Monitorar Mensagens 99Freelas

Monitora a caixa de entrada do 99Freelas, detecta respostas de clientes, interage quando necessario e atualiza o dashboard.

## Processo Resumido
1. Abrir browser → https://www.99freelas.com.br/messages
2. Checar "Nao Lidas" (.directory-item.directory-unread .unread-count)
3. Para cada conversa nao lida: abrir, ler mensagens, identificar tipo de resposta
4. Se cliente respondeu: interagir conforme tipo (INTERESSE/CONTRATACAO/DUVIDA)
5. Atualizar dados-projetos.json com clienteRespondeu=true e dados da mensagem
6. Dashboard atualiza automaticamente via auto-refresh

## URLs
- Inbox: https://www.99freelas.com.br/messages
- Conversa: https://www.99freelas.com.br/messages/inbox/{talkId}
- Textarea resposta: .send-message-textarea.elastic-textarea
- Botao enviar: .btn-enviar-texto

## Passo a Passo Detalhado

### 1. Abrir Browser e Navegar
- `create_automation_session` com URL https://www.99freelas.com.br/messages
- `wait_for_element` .directory-item (lista de conversas)
- `enable_console_capture` para monitorar erros

### 2. Identificar Conversas Não Lidas
- Procurar por elementos `.directory-item.directory-unread`
- Extrair `.unread-count` para contar mensagens
- Montar lista: [{talkId, nomeCliente, unreadCount}]

### 3. Processar Cada Conversa Não Lida
Para cada conversa:
1. Clicar na conversa: `click_element` no .directory-item
2. `wait_for_element` .message-list
3. Ler mensagens com `extract_text` ou `get_page_text`
4. Identificar tipo de resposta:
   - INTERESSE: "quero saber mais", "me interessa", etc
   - CONTRATACAO: "quero contratar", "quero fechar", etc
   - DUVIDA: perguntas sobre projeto/orçamento
   - RECUSA: "não tenho interesse", "obrigado", etc
5. Interagir conforme tipo:
   - INTERESSE: agradecer, oferecer mais detalhes
   - CONTRATACAO: dar próximos passos, pedir contato
   - DUVIDA: responder pergunta, oferecer call
   - RECUSA: agradecer, marcar como perdido
6. Atualizar dados-projetos.json:
   - clienteRespondeu: true
   - tipoResposta: "INTERESSE|CONTRATACAO|DUVIDA|RECUSA"
   - mensagemCliente: texto da resposta
   - dataResposta: timestamp
7. Voltar para lista: clicar em "Messages" ou `navigate_to` inbox

### 4. Tipos de Interação

#### INTERESSE (cliente demonstrou interesse)
"Obrigado pelo retorno! Posso te dar mais detalhes sobre o projeto. Quando podemos conversar?"

#### CONTRATACAO (cliente quer fechar)
"Ótimo! Vamos fechar então. Meu WhatsApp é [SEU_WHATSAPP] para combinarmos os próximos passos. Pode me passar seus dados para contrato?"

#### DUVIDA (cliente tem perguntas)
[Responder pergunta específica do cliente] "Mais alguma dúvida? Posso te explicar melhor qualquer parte do projeto."

#### RECUSA (cliente não quer)
"Sem problemas! Se mudar de ideia ou precisar de algo no futuro, estou à disposição. Bom sorte!"

### 5. Atualizar dados-projetos.json
Ler o arquivo JSON, encontrar o projeto pelo talkId ou nomeCliente, e atualizar:
```json
{
  "clienteRespondeu": true,
  "tipoResposta": "INTERESSE",
  "mensagemCliente": "Texto da resposta...",
  "dataResposta": "2026-03-04T10:30:00",
  "respostaEnviada": "Texto da resposta enviada...",
  "statusFollowUp": "AGUARDANDO_RESPOSTA"
}
```

## Observações Importantes
- Sempre aguardar entre ações (1-2s)
- Verificar se logou corretamente (pode pedir login)
- Se encontrar muitas conversas, processar em lotes de 5-10
- Salvar checkpoint após cada conversa processada
- Logs de console podem mostrar erros de rede/captcha

## Exemplos de Uso
"Monitore as mensagens do 99Freelas e me diga quem respondeu"
"Cheque se tem respostas novas e interaja com os clientes"
"Faça follow-up das conversas não lidas"