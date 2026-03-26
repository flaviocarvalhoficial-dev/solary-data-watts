---
trigger: always_on
---

```md
# 🚀 INTEGRAÇÃO COMPLETA APsystems API — EXECUTAR NO ANTIGRAVITY

Você deve criar uma integração completa com a API da APsystems (EMA OpenAPI) para coletar dados de sistemas fotovoltaicos e estruturar esses dados para uso em um app (dashboard + relatórios).

---

## 🎯 OBJETIVO

Construir um client funcional que:

1. Autentica via assinatura HmacSHA256
2. Lista todos os sistemas (clientes)
3. Para cada sistema:
   - Coleta resumo de geração
   - Coleta dados de consumo (meter)
   - Coleta inversores
4. Estrutura os dados em um objeto único por cliente
5. Retorna tudo pronto para salvar no banco ou exibir no dashboard

---

## 🔐 AUTENTICAÇÃO (OBRIGATÓRIO)

Base URL:
https://api.apsystemsema.com:9282

Headers obrigatórios em TODAS as requisições:

- X-CA-AppId
- X-CA-Timestamp
- X-CA-Nonce
- X-CA-Signature-Method (HmacSHA256)
- X-CA-Signature

---

## 🔧 COMO GERAR A ASSINATURA

stringToSign:

timestamp + "/" + nonce + "/" + appId + "/" + requestPath + "/" + httpMethod + "/" + signatureMethod

Gerar assinatura:

HmacSHA256(stringToSign, appSecret) → Base64

---

## 🧠 ESTRUTURA DO CLIENT

Criar classe:

APsystemsClient

Funções obrigatórias:

- createNonce()
- createTimestamp()
- createSignature()
- createHeaders()
- request()

---

## 📡 ENDPOINTS QUE DEVEM SER IMPLEMENTADOS

### 1. LISTAR SISTEMAS
POST /installer/api/v2/systems

Body:
{
  page: 1,
  size: 50,
  sort: "sid"
}

Retorna:
- sid
- capacity
- type
- timezone
- ecu[]
- light

---

### 2. DETALHES DO SISTEMA
GET /installer/api/v2/systems/details/{sid}

---

### 3. RESUMO DE GERAÇÃO (PRINCIPAL)
GET /installer/api/v2/systems/summary/{sid}

Retorna:
- today
- month
- year
- lifetime

---

### 4. ENERGIA POR PERÍODO (GRÁFICOS)
GET /installer/api/v2/systems/energy/{sid}

Query params:
- energy_level (hourly, daily, monthly, yearly)
- date_range

---

### 5. INVERSORES
GET /installer/api/v2/systems/inverters/{sid}

Retorna:
- eid
- inverter[]
  - uid
  - type

---

### 6. MEDIDORES
GET /installer/api/v2/systems/meters/{sid}

---

### 7. RESUMO DO MEDIDOR (CRÍTICO)
GET /installer/api/v2/systems/{sid}/devices/meter/summary/{eid}

Retorna:
- consumed
- produced
- imported
- exported

---

## 🔁 FUNÇÃO PRINCIPAL: GET ALL SYSTEMS

Implementar paginação automática:

Loop até buscar todos os sistemas

---

## 🧠 FUNÇÃO PRINCIPAL: BUILD CUSTOMER SNAPSHOT

Para cada sistema:

1. Buscar summary
2. Buscar meters
3. Se existir meter:
   → buscar meter summary
4. Buscar inversores

---

## 📦 FORMATO FINAL DO OBJETO

Retornar:

{
  sid,
  capacity,
  type,
  timezone,
  statusLight,
  ecus,
  generation: {
    today,
    month,
    year,
    lifetime
  },
  meter: {
    today: {
      consumed,
      produced,
      imported,
      exported
    }
  },
  inverterGroups
}

---

## ⚠️ REGRAS IMPORTANTES

- Sempre validar: response.code === 0
- Tratar erros da API
- Tratar ausência de meter (nem todo sistema tem)
- Converter valores numéricos de string → number
- Respeitar rate limit da API

---

## 🔄 FLUXO FINAL

1. getAllSystems()
2. loop systems:
   → buildCustomerSnapshot()
3. retornar array final

---

## 🎯 RESULTADO ESPERADO

Um array com TODOS os clientes estruturados:

[
  {
    sid: "...",
    generation: {...},
    meter: {...},
    inverterGroups: [...]
  }
]

---

## 🚀 PRIORIDADE

FOCAR APENAS EM:

- systems
- summary
- meter
- energy (opcional)

NÃO implementar features extras agora.

---

## 🧩 OBJETIVO FINAL

Esse módulo será usado para:

- geração automática de relatórios
- dashboards
- cruzamento de dados (geração vs consumo)

---

EXECUTE ISSO AGORA:
- Criar client completo
- Criar funções
- Testar fluxo
- Retornar JSON final estruturado
```
