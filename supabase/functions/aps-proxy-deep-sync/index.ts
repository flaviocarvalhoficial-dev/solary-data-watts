import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

        // Formato: timestamp/nonce/appId/requestPath/method/signatureMethod
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

    private async request(path: string, method: string = "GET", body?: any) {
        const headers = await this.createHeaders(path, method);
        const url = `${this.baseUrl}${path}`;

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API Error (${response.status}): ${text.substring(0, 100)}`);
        }

        const data = await response.json();
        if (data.code !== "0") {
            throw new Error(`APsystems Error (${data.code}): ${data.msg || 'Unknown error'}`);
        }

        return data.data;
    }

    async getAllSystems(pageSize: number = 50) {
        let allSystems: any[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            console.log(`Fetching systems page ${page}...`);
            const data = await this.request("/installer/api/v2/systems", "POST", {
                page,
                size: pageSize,
                sort: "sid"
            });

            if (data && data.systems && data.systems.length > 0) {
                allSystems = allSystems.concat(data.systems);
                if (data.systems.length < pageSize) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                hasMore = false;
            }
        }

        return allSystems;
    }

    async getSystemSummary(sid: string) {
        return this.request(`/installer/api/v2/systems/summary/${sid}`);
    }

    async getSystemMeters(sid: string) {
        return this.request(`/installer/api/v2/systems/meters/${sid}`);
    }

    async getMeterSummary(sid: string, eid: string) {
        return this.request(`/installer/api/v2/systems/${sid}/devices/meter/summary/${eid}`);
    }

    async getInverters(sid: string) {
        return this.request(`/installer/api/v2/systems/inverters/${sid}`);
    }

    async buildCustomerSnapshot(systemBase: any) {
        const sid = systemBase.sid;
        console.log(`Building snapshot for system ${sid}...`);

        try {
            const [summary, meters, inverters] = await Promise.all([
                this.getSystemSummary(sid).catch(e => { console.error(`Err summary ${sid}:`, e.message); return null; }),
                this.getSystemMeters(sid).catch(e => { console.error(`Err meters ${sid}:`, e.message); return null; }),
                this.getInverters(sid).catch(e => { console.error(`Err inverters ${sid}:`, e.message); return null; })
            ]);

            let meterSummary = null;
            if (meters && meters.eid) {
                meterSummary = await this.getMeterSummary(sid, meters.eid).catch(e => {
                    console.error(`Err meter summary ${sid}/${meters.eid}:`, e.message);
                    return null;
                });
            }

            return {
                sid: sid,
                capacity: parseFloat(systemBase.capacity) || 0,
                type: systemBase.type,
                timezone: systemBase.timezone,
                statusLight: systemBase.light,
                ecus: systemBase.ecu || [],
                generation: summary ? {
                    today: parseFloat(summary.today) || 0,
                    month: parseFloat(summary.month) || 0,
                    year: parseFloat(summary.year) || 0,
                    lifetime: parseFloat(summary.lifetime) || 0
                } : null,
                meter: meterSummary ? {
                    today: {
                        consumed: parseFloat(meterSummary.consumed) || 0,
                        produced: parseFloat(meterSummary.produced) || 0,
                        imported: parseFloat(meterSummary.imported) || 0,
                        exported: parseFloat(meterSummary.exported) || 0
                    }
                } : null,
                inverterGroups: inverters || []
            };
        } catch (error: any) {
            console.error(`Failed to build snapshot for ${sid}:`, error.message);
            return {
                sid,
                error: error.message
            };
        }
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const appId = Deno.env.get('APSYSTEMS_APP_ID');
        const appSecret = Deno.env.get('APSYSTEMS_APP_SECRET');

        if (!appId || !appSecret) {
            throw new Error("Credentials missing in environment variables.");
        }

        const client = new APsystemsClient(appId, appSecret);
        const body = await req.json().catch(() => ({}));
        const { action, system_id, eid, energy_level = 'daily', date_range = '', page = 1, size = 100 } = body;

        // NEW: Removed 'sync_all' and 'list' to avoid rate limits (2005)
        // All systems now come from the local 'systems' table (XLS).

        // LEGACY & COMPATIBILITY LAYER - REFOCUSED ON ENERGY ONLY
        let path = "";
        let method = "GET";
        let baseUrl = 'https://api.apsystemsema.com:9282';
        let requestBody = undefined;

        if (action === 'stats') {
            path = `/installer/api/v2/systems/summary/${system_id}`;
            method = "GET";
        } else if (action === 'energy') {
            path = `/installer/api/v2/systems/energy/${system_id}`;
            const query = [`energy_level=${energy_level}`, date_range ? `date_range=${date_range}` : ''].filter(Boolean).join('&');
            path = `${path}?${query}`;
            method = "GET";
        } else if (action === 'details') {
            path = `/installer/api/v2/systems/details/${system_id}`;
            method = "GET";
        } else if (action === 'meters') {
            path = `/installer/api/v2/systems/meters/${system_id}`;
            method = "GET";
        } else if (action === 'meter_summary' && system_id && eid) {
            path = `/installer/api/v2/systems/${system_id}/devices/meter/summary/${eid}`;
            method = "GET";
        } else if (action === 'snap' && system_id) {
            const data = await client.buildCustomerSnapshot({ sid: system_id });
            return new Response(JSON.stringify({ success: true, data }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (path) {
            const timestamp = Date.now().toString();
            const nonce = crypto.randomUUID().replace(/-/g, "");
            const signatureMethod = "HmacSHA256";

            // Signature logic for proxy request
            const appIdClean = appId.trim().replace(/"/g, "");
            const stringToSign = [timestamp, nonce, appIdClean, path.trim(), method.trim(), signatureMethod].join('/');

            console.log(`[PROXY DEBUG] Action: ${action}, Path: ${path}, Method: ${method}`);
            console.log(`[PROXY DEBUG] StringToSign: ${stringToSign}`);

            const encoder = new TextEncoder();
            const keyBuf = encoder.encode(appSecret.trim().replace(/"/g, ""));
            const dataBuf = encoder.encode(stringToSign);
            const cryptoKey = await crypto.subtle.importKey("raw", keyBuf, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
            const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, dataBuf);
            const signature = encode(sigBuf);

            const headers = {
                "X-CA-AppId": appIdClean,
                "X-CA-Timestamp": timestamp,
                "X-CA-Nonce": nonce,
                "X-CA-Signature-Method": signatureMethod,
                "X-CA-Signature": signature,
                "Content-Type": "application/json",
                "Accept": "application/json"
            };

            const finalUrl = `${baseUrl}${path}${action === 'registration' && system_id ? `?userId=${system_id}` : ''}`;

            console.log(`[PROXY DEBUG] Final URL: ${finalUrl}`);

            const response = await fetch(finalUrl, {
                method,
                headers,
                body: requestBody ? JSON.stringify(requestBody) : undefined,
            });

            const rawText = await response.text();
            console.log(`[PROXY DEBUG] Status: ${response.status}, Raw Response: ${rawText.substring(0, 200)}`);

            let data;
            try {
                data = JSON.parse(rawText);
            } catch (e) {
                data = { error: "Invalid JSON response", raw: rawText };
            }

            return new Response(JSON.stringify({ success: true, data }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            success: false,
            error: "Action not supported or missing parameters"
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        });

    } catch (err: any) {
        return new Response(JSON.stringify({
            success: false,
            error: err.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
});

