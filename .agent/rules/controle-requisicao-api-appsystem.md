---
trigger: always_on
---

# 📘 PRD — Sistema de Controle de Consumo da API (APsystems)

*(Módulo Crítico do Solary Date)*

---

## 🧭 1. VISÃO GERAL

Este módulo é responsável por garantir que o sistema:

* Não ultrapasse o limite diário da API APsystems
* Não faça chamadas desnecessárias
* Escale para +200 clientes com segurança
* Utilize cache inteligente
* Execute sincronizações de forma distribuída e controlada

Esse módulo passa a ser CORE da arquitetura do sistema.

---

## 🎯 2. OBJETIVO

Eliminar completamente o erro:

APsystems (2005): Limite diário excedido

E garantir:

* estabilidade
* previsibilidade
* eficiência
* rastreabilidade

---

## 🚨 3. PROBLEMA ATUAL

Hoje o sistema:

* faz chamadas sem controle
* não reutiliza dados já sincronizados
* não tem fila
* não tem limite interno
* não trata erro 2005 corretamente

Resultado:

* bloqueio da API
* falha de relatórios
* perda de confiança

---

## 🧠 4. SOLUÇÃO PROPOSTA

Implementar 5 pilares:

1. Rate Limit Interno
2. Cache Diário
3. Fila de Processamento
4. Lock de Recursos
5. Retry Inteligente

---

## 🧱 5. ARQUITETURA

```plaintext
User Request
   ↓
Controller
   ↓
Sync Service
   ↓
[Cache Check] → retorna dados
   ↓
[Queue]
   ↓
Worker
   ↓
RateLimitGuard
   ↓
APsystems API
   ↓
Cache + Logs + Metrics
```

---

## ⚙️ 6. MÓDULOS DO SISTEMA

### 🔹 Módulo 1 — RateLimitGuard

Responsabilidade:
Controlar se pode ou não chamar a API.

Funções:

* verificar uso diário
* bloquear integração
* registrar consumo
* impedir chamadas quando limite atingido

---

### 🔹 Módulo 2 — Cache Inteligente

Responsabilidade:
Evitar chamadas desnecessárias.

Regras:

* 1 sync por dia por cliente/usina
* usar cache se já sincronizado
* permitir “forçar atualização” (com cuidado)

---

### 🔹 Módulo 3 — Fila (Queue)

Responsabilidade:
Organizar execução.

Regras:

* batch (ex: 10 por vez)
* concorrência controlada
* prioridade (manual > automático)
* evitar execução massiva

---

### 🔹 Módulo 4 — Lock de Recursos

Responsabilidade:
Evitar duplicidade.

Exemplo:

* não sincronizar o mesmo cliente 2x ao mesmo tempo

---

### 🔹 Módulo 5 — Retry Inteligente

Regras:

* erro 2005 (limite): parar tudo e reagendar para o próximo dia
* timeout: retry com delay
* auth error: bloquear até correção
* erro irreversível: falha final

---

### 🔹 Módulo 6 — Logs e Observabilidade

Registrar:

* chamadas
* erros
* tempo de resposta
* uso diário
* origem da requisição

---

## 🗄️ 7. BANCO DE DADOS

Tabelas obrigatórias:

* api_integration_usage_daily
* api_sync_jobs
* api_sync_cache
* api_sync_logs
* api_resource_locks

---

## 🔄 8. FLUXOS

### 🔹 Fluxo 1 — Sincronização Manual

```plaintext
Usuário clica sincronizar
   ↓
Verifica cache
   ↓
Se existir → retorna
   ↓
Se não:
   ↓
Enfileira job
   ↓
Worker executa
```

---

### 🔹 Fluxo 2 — Sincronização Automática

```plaintext
Scheduler diário
   ↓
Cria jobs
   ↓
Queue distribui
   ↓
Worker executa com controle
```

---

### 🔹 Fluxo 3 — Erro 2005

```plaintext
Recebe erro
   ↓
Bloqueia integração
   ↓
Para chamadas
   ↓
Reagenda para amanhã
```

---

## 📊 9. STATUS DO SISTEMA

```ts
synced_today
cache_used
pending_sync
syncing
blocked_daily_limit
scheduled_for_retry
failed
auth_error
```

---

## 🖥️ 10. EXPERIÊNCIA DO USUÁRIO

Mostrar:

* última atualização
* origem dos dados (API ou cache)
* status da integração
* próxima sincronização

Exemplos:

* Dados atualizados hoje às 14:32
* Usando dados salvos
* Sincronização reagendada para amanhã

---

## 🧪 11. CRITÉRIOS DE ACEITAÇÃO

* Nunca ultrapassar limite da API
* Nunca repetir sync desnecessário
* Cache funcionando corretamente
* Retry inteligente ativo
* Sem duplicidade de execução
* Logs completos

---

## ✅ 12. CHECKLIST DE IMPLEMENTAÇÃO (AÇÃO DIRETA)

### 🧩 Fase 1 — Base

* Criar tabelas no banco
* Criar estrutura de services
* Criar wrapper da API

---

### 🧩 Fase 2 — Controle

* Implementar RateLimitGuard
* Implementar contador diário
* Implementar bloqueio por limite

---

### 🧩 Fase 3 — Cache

* Criar tabela de cache
* Criar lógica de leitura
* Criar lógica de escrita
* Validar cache por data

---

### 🧩 Fase 4 — Fila

* Implementar queue
* Criar worker
* Controlar concorrência
* Implementar batch

---

### 🧩 Fase 5 — Lock

* Criar lock por cliente/usina
* Evitar duplicidade

---

### 🧩 Fase 6 — Retry

* Implementar retry com backoff
* Tratar erro 2005 corretamente
* Reagendar jobs

---

### 🧩 Fase 7 — Logs

* Criar logs estruturados
* Registrar erros da API
* Monitorar uso

---

### 🧩 Fase 8 — UI

* Exibir status
* Exibir origem (cache/api)
* Exibir bloqueio
* Exibir próxima execução

---

## 🚀 13. DECISÃO ESTRATÉGICA

Para cenário com mais de 200 clientes:

O sistema não deve depender da API em tempo real.

Ele deve ser orientado a:

* sincronização
* cache

Benefícios:

* mais rápido
* mais estável
* escalável

---

## 🔥 PRÓXIMO PASSO

Evoluções recomendadas:

* integração com PRD do Solary Date
* estrutura pronta para Antigravity e Lovable
* design do dashboard (UX/UI)
* estratégia de sincronização por volume

Escolha:

* vamos integrar com o PRD
  ou
* quero a arquitetura visual do sistema
