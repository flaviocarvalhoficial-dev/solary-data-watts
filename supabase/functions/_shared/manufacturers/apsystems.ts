// supabase/functions/_shared/manufacturers/apsystems.ts
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

export class APsystemsClient {
    private baseUrl = 'https://api.apsystemsema.com:9282';
    private appId: string;
    private appSecret: string;

    constructor(appId: string, appSecret: string) {
        this.appId = appId.trim().replace(/"/g, "");
        this.appSecret = appSecret.trim().replace(/"/g, "");
    }

    private async hmacSha256(data: string) {
        const encoder = new TextEncoder();
        const keyBuf = encoder.encode(this.appSecret);
        const dataBuf = encoder.encode(data);
        const cryptoKey = await crypto.subtle.importKey(
            "raw", keyBuf, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
        );
        const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, dataBuf);
        return encode(sigBuf);
    }

    private createNonce() {
        return crypto.randomUUID().replace(/-/g, "");
    }

    private createTimestamp() {
        return Date.now().toString();
    }

    async createHeaders(path: string, method: string) {
        const timestamp = this.createTimestamp();
        const nonce = this.createNonce();
        const signatureMethod = "HmacSHA256";

        const stringToSign = [timestamp, nonce, this.appId, path, method, signatureMethod].join('/');
        const signature = await this.hmacSha256(stringToSign);

        return {
            "X-CA-AppId": this.appId,
            "X-CA-Timestamp": timestamp,
            "X-CA-Nonce": nonce,
            "X-CA-Signature-Method": signatureMethod,
            "X-CA-Signature": signature,
            "Content-Type": "application/json",
            "Accept": "application/json"
        };
    }

    async fetch(path: string, method = "GET") {
        const headers = await this.createHeaders(path, method);
        const url = `${this.baseUrl}${path}`;
        const response = await fetch(url, { method, headers });
        const data = await response.json().catch(() => ({}));

        if (data.code !== "0" && data.code !== "SUCCESS") {
            const rawError = JSON.stringify(data);
            const errorMsg = data.msg || data.message || `Code: ${data.code || 'None'} | ${rawError}`;
            const error = new Error(`APsystems API Error: ${errorMsg}`);
            (error as any).code = data.code;
            throw error;
        }

        return data.data;
    }

    async getSystemSummary(sid: string) {
        return this.fetch(`/installer/api/v2/systems/summary/${sid}`);
    }
}
