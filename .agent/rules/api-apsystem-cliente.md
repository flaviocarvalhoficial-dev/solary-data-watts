---
trigger: always_on
---

// APsystems client básico
// Baseado no manual oficial: autenticação por headers + assinatura HmacSHA256

const crypto = require("crypto");

const BASE_URL = "https://api.apsystemsema.com:9282";

function generateNonce() {
  return crypto.randomUUID().replace(/-/g, "");
}

function generateTimestamp() {
  return Date.now().toString();
}

function buildStringToSign({
  timestamp,
  nonce,
  appId,
  requestPath,
  method,
  signatureMethod = "HmacSHA256",
}) {
  return `${timestamp}/${nonce}/${appId}/${requestPath}/${method}/${signatureMethod}`;
}

function generateSignature({
  appSecret,
  stringToSign,
  algorithm = "sha256",
}) {
  return crypto
    .createHmac(algorithm, appSecret)
    .update(stringToSign, "utf8")
    .digest("base64");
}

function buildHeaders({
  appId,
  appSecret,
  requestPath,
  method,
}) {
  const timestamp = generateTimestamp();
  const nonce = generateNonce();
  const signatureMethod = "HmacSHA256";

  const stringToSign = buildStringToSign({
    timestamp,
    nonce,
    appId,
    requestPath,
    method,
    signatureMethod,
  });

  const signature = generateSignature({
    appSecret,
    stringToSign,
    algorithm: "sha256",
  });

  return {
    "X-CA-AppId": appId,
    "X-CA-Timestamp": timestamp,
    "X-CA-Nonce": nonce,
    "X-CA-Signature-Method": signatureMethod,
    "X-CA-Signature": signature,
    "Content-Type": "application/json",
  };
}

async function apsFetch({
  appId,
  appSecret,
  path,
  method = "GET",
  body,
}) {
  const headers = buildHeaders({
    appId,
    appSecret,
    requestPath: path,
    method,
  });

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  return data;
}

// Exemplo 1: listar sistemas
async function getSystems(appId, appSecret) {
  return apsFetch({
    appId,
    appSecret,
    path: "/installer/api/v2/systems",
    method: "POST",
    body: {
      page: 1,
      size: 10,
    },
  });
}

// Exemplo 2: detalhes de um sistema
async function getSystemDetails(appId, appSecret, sid) {
  return apsFetch({
    appId,
    appSecret,
    path: `/installer/api/v2/systems/details/${sid}`,
    method: "GET",
  });
}

// Exemplo 3: resumo de energia do sistema
async function getSystemSummary(appId, appSecret, sid) {
  return apsFetch({
    appId,
    appSecret,
    path: `/installer/api/v2/systems/summary/${sid}`,
    method: "GET",
  });
}

// Exemplo de uso
(async () => {
  const appId = process.env.APS_APP_ID;
  const appSecret = process.env.APS_APP_SECRET;

  try {
    const systems = await getSystems(appId, appSecret);
    console.log("Systems:", systems);

    if (systems?.data?.systems?.length) {
      const sid = systems.data.systems[0].sid;

      const details = await getSystemDetails(appId, appSecret, sid);
      console.log("Details:", details);

      const summary = await getSystemSummary(appId, appSecret, sid);
      console.log("Summary:", summary);
    }
  } catch (error) {
    console.error("Erro na integração APsystems:", error);
  }
})();