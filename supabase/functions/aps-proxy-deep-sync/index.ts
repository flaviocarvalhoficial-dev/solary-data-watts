import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hmacSha256(key: string, data: string) {
    const encoder = new TextEncoder();
    const keyBuf = encoder.encode(key);
    const dataBuf = encoder.encode(data);
    const cryptoKey = await crypto.subtle.importKey(
        "raw", keyBuf, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, dataBuf);
    return encode(sigBuf);
}

function normalizePath(path: string): string {
    return path.replace(/\/{2,}/g, "/").replace(/\/$/, "");
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const { action, system_id, page = 1, size = 100 } = await req.json();
        const appId = Deno.env.get('APSYSTEMS_APP_ID')?.trim().replace(/"/g, "") || '';
        const appSecret = Deno.env.get('APSYSTEMS_APP_SECRET')?.trim().replace(/"/g, "") || '';

        if (!appId || !appSecret) throw new Error("Credentials missing.");

        let rawPath = "";
        let method = "GET";
        if (action === 'list') {
            rawPath = "/installer/api/v2/systems";
            method = "POST";
        } else if (action === 'stats') {
            rawPath = `/installer/api/v2/systems/summary/${system_id}`;
            method = "GET";
        } else if (action === 'details') {
            rawPath = `/installer/api/v2/systems/details/${system_id}`;
            method = "GET";
        }

        const path = normalizePath(rawPath);
        const timestamp = Date.now().toString();
        const nonce = crypto.randomUUID().replace(/-/g, "");
        const signatureMethod = "HmacSHA256";

        const stringToSign = [timestamp, nonce, appId, path, method, signatureMethod].join('/');

        const signature = await hmacSha256(appSecret, stringToSign);

        const baseUrl = 'https://api.apsystemsema.com:9282';
        const finalUrl = `${baseUrl}${path}`;

        const headers = {
            "X-CA-AppId": appId,
            "X-CA-Key": appId, // Legacy compatibility
            "X-CA-Timestamp": timestamp,
            "X-CA-Nonce": nonce,
            "X-CA-Signature-Method": signatureMethod,
            "X-CA-Signature": signature,
            "Content-Type": "application/json",
            "Accept": "application/json"
        };

        const response = await fetch(finalUrl, {
            method,
            headers,
            body: method === "POST" ? JSON.stringify({ page, size }) : undefined,
        });

        const data = await response.json();

        return new Response(JSON.stringify({
            success: true,
            data,
            audit: {
                appId,
                rawPath,
                path,
                method,
                stringToSign,
                signature,
                code: data?.code
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({
            success: false,
            error: err.message,
            stack: err.stack
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
