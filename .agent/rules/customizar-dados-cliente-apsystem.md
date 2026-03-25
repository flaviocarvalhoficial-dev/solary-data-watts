---
trigger: always_on
---

# 🔥 FOUNDRY TASK — APSYSTEMS CLIENT SYNC ENGINE (MVP)

## ESTADO
LOCKED → Você NÃO pode avançar sem cumprir cada etapa.

---

## MISSÃO
Implementar sincronização completa de sistemas (clientes) da APsystems para o banco local.

Você NÃO está construindo uma integração genérica.
Você está construindo um pipeline determinístico, auditável e reproduzível.

---

## ESCOPO (NÃO EXPANDIR)
Você só pode implementar:

1. Cliente HTTP autenticado (com assinatura)
2. Listagem paginada de systems
3. Persistência via UPSERT
4. Logging completo
5. Rotina de sincronização

Você NÃO pode:
- adicionar features extras
- consumir endpoints de energia ainda
- criar abstrações desnecessárias

---

## BLOCO 1 — CLIENT APSYSTEMS

### OBJETIVO
Construir função única e reutilizável:

```ts
apsFetch({ path, method, body }): Promise<any>