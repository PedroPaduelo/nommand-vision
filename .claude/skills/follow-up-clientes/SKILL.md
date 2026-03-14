---
name: follow-up-clientes
description: Estratégia e execução de follow-up para os projetos com proposta enviada sem resposta. Prioriza por valor, valor/hora e relevância. Executa follow-up via 99Freelas messages ou WhatsApp.
model: sonnet
---

# Follow-up de Clientes

Estratégia e execução de follow-up para projetos com proposta enviada sem resposta. Prioriza por valor, valor/hora e relevância.

## Processo

1. **Identificar Projetos Pendentes**
   - Ler dados-projetos.json
   - Filtrar projetos com statusFollowUp="AGUARDANDO" ou "SEM_RESPOSTA"
   - Ordenar por valor (maior primeiro) ou data (mais antigo primeiro)

2. **Definir Prioridade**
   - Valor > R$1000: ALTA
   - Valor R$500-R$1000: MEDIA
   - Valor < R$500: BAIXA

3. **Escolher Canal**
   - Se cliente respondeu antes → WhatsApp
   - Se nunca respondeu → 99Freelas messages

4. **Executar Follow-up**
   - Abrir conversa no 99Freelas ou WhatsApp
   - Enviar mensagem de follow-up
   - Registrar data do follow-up

5. **Mensagens de Follow-up**
   - "Olá! Só passando para saber se还是有 alguma dúvida sobre o projeto. Estou à disposição!"
   - "Oi! Passingando para saber se você teve tempo de analisar a proposta. Alguma questão?"
   - "Olá! Apenas confirmando interesse no projeto. Quando podemos conversar?"

## Atualizar Status
```json
{
  "ultimoFollowUp": "2026-03-04T10:00:00",
  "qtdFollowUp": 2,
  "statusFollowUp": "EM_ANDAMENTO"
}
```

## Exemplos
"Faça follow-up dos clientes pendentes"
"Qual o próximo cliente para follow-up?"
"Manda follow-up para projetos acima de R$1000"