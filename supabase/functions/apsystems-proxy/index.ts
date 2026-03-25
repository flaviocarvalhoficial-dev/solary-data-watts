import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getHmacSignature(secret: string, stringToSign: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(stringToSign);

    const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, msgData);
    const hashArray = new Uint8Array(signature);
    return btoa(String.fromCharCode(...hashArray));
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { action, system_id } = await req.json();

        const appId = Deno.env.get('APSYSTEMS_APP_ID');
        const appSecret = Deno.env.get('APSYSTEMS_APP_SECRET');

        if (!appId || !appSecret) {
            throw new Error('APsystems credentials not configured in Supabase');
        }

        let path = '';
        if (action === 'list') {
            path = '/user/api/v2/systems';
        } else if (action === 'stats' && system_id) {
            path = `/user/api/v2/systems/${system_id}/stats`;
        } else {
            throw new Error('Invalid action or missing system_id');
        }

        const timestamp = Date.now().toString();
        const nonce = crypto.randomUUID().split('-')[0];
        const baseUrl = 'https://api.apsystemsema.com:9282';

        const stringToSign = `GET\n${path}\n${timestamp}\n${nonce}`;
        const signature = await getHmacSignature(appSecret, stringToSign);

        console.log(`Calling APsystems: ${action} | ${path}`);
        const response = await fetch(`${baseUrl}${path}`, {
            method: 'GET',
            headers: {
                'X-CA-Key': appId,
                'X-CA-Timestamp': timestamp,
                'X-CA-Nonce': nonce,
                'X-CA-Signature': signature,
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`APsystems API error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error(`Edge Function Error: ${error.message}`);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
