---
trigger: always_on
---

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

function generateSignature({ appSecret, stringToSign }) {
  return crypto
    .createHmac("sha256", appSecret)
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
  });

  // 🔍 DEBUG CRÍTICO
  console.log("===== DEBUG APSYSTEMS =====");
  console.log("PATH:", requestPath);
  console.log("METHOD:", method);
  console.log("TIMESTAMP:", timestamp);
  console.log("NONCE:", nonce);
  console.log("STRING TO SIGN:", stringToSign);
  console.log("SIGNATURE:", signature);
  console.log("===========================");

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

  // 🔍 DEBUG REQUEST
  console.log("===== REQUEST =====");
  console.log("URL:", `${BASE_URL}${path}`);
  console.log("HEADERS:", headers);
  console.log("BODY:", body);
  console.log("===================");

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();

  // 🔍 DEBUG RESPONSE
  console.log("===== RESPONSE =====");
  console.log("STATUS:", response.status);
  console.log("RAW:", text);
  console.log("====================");

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

// 🚀 TESTE REAL
async function testConnection() {
  const appId = process.env.APS_APP_ID;
  const appSecret = process.env.APS_APP_SECRET;

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

testConnection().then(console.log).catch(console.error);