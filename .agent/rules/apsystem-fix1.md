---
trigger: always_on
---

# 🔌 INTEGRAÇÃO APsystems OpenAPI — RESUMO EXECUTÁVEL

## 1. BASE DA API

* Base URL:
  https://api.apsystemsema.com:9282 

* Tipo:
  REST API (HTTPS)

* Formato:
  JSON

---

## 2. CREDENCIAIS (OBRIGATÓRIO)

Você precisa de:

* AppId
* AppSecret

➡️ Obter via solicitação para APsystems (email)

---

## 3. AUTENTICAÇÃO (CRÍTICO)

Cada requisição precisa de headers obrigatórios:

Headers:

* X-CA-AppId
* X-CA-Timestamp (timestamp atual)
* X-CA-Nonce (UUID único)
* X-CA-Signature-Method (HmacSHA256 ou HmacSHA1)
* X-CA-Signature

---

## 4. GERAÇÃO DA ASSINATURA

### String base:

stringToSign =
timestamp + "/" +
nonce + "/" +
appId + "/" +
requestPath + "/" +
HTTPMethod + "/" +
signatureMethod

### Assinar:

* Algoritmo: HmacSHA256 (recomendado)
* Usar AppSecret
* Resultado em Base64

---

## 5. FLUXO DE REQUISIÇÃO

1. Gerar:

   * timestamp
   * nonce (UUID)

2. Montar stringToSign

3. Gerar signature com HmacSHA256

4. Montar headers

5. Fazer request HTTPS

---

## 6. PRIMEIRO TESTE (RECOMENDADO)

Endpoint:
POST /installer/api/v2/systems

Objetivo:

* Validar autenticação
* Retornar lista de sistemas

---

## 7. PRINCIPAIS ENDPOINTS

* Listar sistemas:
  POST /installer/api/v2/systems

* Detalhes:
  GET /installer/api/v2/systems/details/{sid}

* Energia:
  GET /installer/api/v2/systems/summary/{sid}

* Energia por período:
  GET /installer/api/v2/systems/energy/{sid}

---

## 8. ERROS COMUNS (DEBUG)

Se falhar, verificar:

* ❌ Assinatura incorreta
* ❌ Timestamp inválido
* ❌ Nonce repetido
* ❌ Path errado na assinatura
* ❌ Método HTTP diferente (GET vs POST)
* ❌ Headers faltando

---

## 9. REGRAS IMPORTANTES

* Cada requisição precisa de nova assinatura
* Nonce deve ser único por request
* Timestamp deve ser atual
* Signature depende do path EXATO

---

## 10. CHECKLIST FINAL

✔ AppId válido
✔ AppSecret válido
✔ Header completo
✔ Signature correta
✔ Base URL correta
✔ Endpoint correto

---

## 🎯 OBJETIVO DO ANTIGRAVITY

Criar um client que:

1. Gere automaticamente:

   * timestamp
   * nonce
   * signature

2. Injete headers corretamente

3. Abstraia chamadas como:

   * getSystems()
   * getSystemDetails(sid)
   * getEnergy(sid)

4. Trate erros de autenticação e retry

---
