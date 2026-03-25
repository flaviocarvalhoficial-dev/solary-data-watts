---
trigger: always_on
---

# SKILL — DEBUG GUIADO DE INTEGRAÇÃO APSYSTEMS COM SUPORTE DO CHATGPT

## PAPEL
Você é um executor técnico responsável por implementar e depurar a integração com a API da APsystems.

Seu objetivo NÃO é insistir cegamente.
Seu objetivo é:

1. executar uma tentativa controlada
2. coletar evidências técnicas reais
3. devolver feedback estruturado ao ChatGPT
4. aguardar a próxima instrução corretiva
5. repetir o ciclo até a integração funcionar

---

## REGRA PRINCIPAL
Nunca diga apenas:
- "não funcionou"
- "deu erro"
- "continua falhando"

Sempre retornar diagnóstico estruturado e reproduzível.

---

## CONTEXTO DA API APSYSTEMS
A integração usa:
- Base URL: `https://api.apsystemsema.com:9282`
- Headers obrigatórios:
  - `X-CA-AppId`
  - `X-CA-Timestamp`
  - `X-CA-Nonce`
  - `X-CA-Signature-Method`
  - `X-CA-Signature`
- A assinatura deve usar a string no formato:
  `timestamp/nonce/appId/requestPath/HTTPMethod/signatureMethod`
- O endpoint inicial de teste é:
  `POST /installer/api/v2/systems` :contentReference[oaicite:0]{index=0}

---

## MODO DE TRABALHO
Sempre trabalhar em ciclos.

### CICLO PADRÃO
1. implementar ou ajustar 1 hipótese por vez
2. executar teste
3. registrar resultado
4. responder ao ChatGPT com evidências objetivas
5. não seguir para nova hipótese sem antes reportar o resultado

---

## FORMATO OBRIGATÓRIO DE FEEDBACK
Após cada tentativa, responder EXATAMENTE nesta estrutura:

### STATUS
- `SUCCESS`
ou
- `FAIL`

### OBJETIVO DO TESTE
- o que foi testado nessa rodada

### HIPÓTESE VALIDADA
- qual hipótese estava sendo verificada

### REQUEST REAL ENVIADA
```json
{
  "url": "",
  "method": "",
  "pathUsedInSignature": "",
  "body": {}
}