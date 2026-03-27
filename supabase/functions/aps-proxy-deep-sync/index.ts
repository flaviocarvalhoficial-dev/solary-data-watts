import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_MONTHLY_LIMIT = 1000;

class APsystemsClient {
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

    private async createHeaders(path: string, method: string) {
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

    async buildCustomerSnapshot(systemBase: any, fetchFn: Function) {
        const sid = systemBase.sid;
        try {
            const summary = await fetchFn(`/installer/api/v2/systems/summary/${sid}`);
            let meterSummary = null;
            // Otimização RADICAL: Pegar meters apenas se estritamente necessário
            // Para economizar quota de 1.000/mês

            return {
                sid: sid,
                generation: summary ? {
                    today: parseFloat(summary.today) || 0,
                    month: parseFloat(summary.month) || 0,
                    year: parseFloat(summary.year) || 0,
                    lifetime: parseFloat(summary.lifetime) || 0
                } : null,
                meter: null, // Pular por padrão para poupar quota
                inverterGroups: []
            };
        } catch (error: any) {
            throw error;
        }
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    const startTime = Date.now();
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const appId = Deno.env.get('APSYSTEMS_APP_ID');
        const appSecret = Deno.env.get('APSYSTEMS_APP_SECRET');

        if (!appId || !appSecret) throw new Error("Credentials missing.");

        const client = new APsystemsClient(appId, appSecret);
        const body = await req.json().catch(() => ({}));
        const { action, system_id, eid, energy_level = 'daily', date_range = '' } = body;

        // MIDDLEWARE: Check and Update MONTHLY Quota (1000/mo)
        const { data: quotaCheck, error: quotaError } = await supabase.rpc('check_apsystems_monthly_quota', { max_limit: MAX_MONTHLY_LIMIT });

        if (quotaError) console.error("[QUOTA ERROR]", quotaError);

        const isAllowed = quotaCheck && (quotaCheck as any)[0]?.allowed;
        const currentCount = (quotaCheck as any)[0]?.current_count;

        if (!isAllowed) {
            return new Response(JSON.stringify({
                success: false,
                error: "RATE_LIMIT_EXCEEDED",
                message: `Limite MENSAL da API Watts atingido (${currentCount}/${MAX_MONTHLY_LIMIT}). O sistema parou para evitar cobranças extras.`,
                monthlyLimit: MAX_MONTHLY_LIMIT,
                currentCount
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429
            });
        }

        let path = "";
        let method = "GET";

        if (action === 'stats') path = `/installer/api/v2/systems/summary/${system_id}`;
        else if (action === 'energy') {
            const query = [`energy_level=${energy_level}`, date_range ? `date_range=${date_range}` : ''].filter(Boolean).join('&');
            path = `/installer/api/v2/systems/energy/${system_id}?${query}`;
        }
        else if (action === 'details') path = `/installer/api/v2/systems/details/${system_id}`;
        else if (action === 'meters') path = `/installer/api/v2/systems/meters/${system_id}`;
        else if (action === 'meter_summary' && system_id && eid) path = `/installer/api/v2/systems/${system_id}/devices/meter/summary/${eid}`;
        else if (action === 'snap' && system_id) {
            const result = await client.buildCustomerSnapshot({ sid: system_id }, async (p: string) => {
                const headers = await (client as any).createHeaders(p, "GET");
                const res = await fetch(`https://api.apsystemsema.com:9282${p}`, { headers });
                const json = await res.json();
                if (json.code !== "0") throw new Error(`API Error ${json.code}: ${json.msg}`);
                return json.data;
            });
            return new Response(JSON.stringify({ success: true, data: result }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (path) {
            const headers = await (client as any).createHeaders(path, method);
            const response = await fetch(`https://api.apsystemsema.com:9282${path}`, { method, headers });
            const rawText = await response.text();
            let apiResponse;
            try { apiResponse = JSON.parse(rawText); } catch (e) { apiResponse = { code: "-1", msg: "Invalid JSON", raw: rawText }; }

            const executionTime = Date.now() - startTime;
            const success = apiResponse.code === "0" || apiResponse.code === "SUCCESS";

            // LOGGING: Detailed API audit
            await supabase.from('apsystems_api_logs').insert({
                action: action || path,
                system_id: system_id || null,
                code: String(apiResponse.code),
                message: apiResponse.msg || apiResponse.message || 'No message',
                payload: body,
                success,
                execution_time_ms: executionTime
            });

            return new Response(JSON.stringify({
                success: true,
                data: apiResponse,
                quota: { current: currentCount, limit: MAX_MONTHLY_LIMIT }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: false, error: "Action not supported" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        });

    } catch (err: any) {
        await supabase.from('apsystems_api_logs').insert({
            action: 'CRITICAL_EDGE_FAILURE',
            message: err.message,
            success: false,
            timestamp: new Date().toISOString()
        });

        return new Response(JSON.stringify({ success: false, error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
});
