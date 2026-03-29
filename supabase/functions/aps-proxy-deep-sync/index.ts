import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { APsystemsClient } from '../_shared/manufacturers/apsystems.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_MONTHLY_LIMIT = 1000;

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders, status: 200 });
    }

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

        // MIDDLEWARE: Check MONTHLY Quota (1000/mo)
        const { data: quotaCheck } = await supabase.rpc('check_apsystems_monthly_quota', { max_limit: MAX_MONTHLY_LIMIT });
        const isAllowed = quotaCheck && (quotaCheck as any)[0]?.allowed;
        const currentCount = (quotaCheck as any)[0]?.current_count;

        if (!isAllowed) {
            return new Response(JSON.stringify({
                success: false,
                error: "RATE_LIMIT_EXCEEDED",
                message: `Limite MENSAL atingido (${currentCount}/${MAX_MONTHLY_LIMIT}).`,
                monthlyLimit: MAX_MONTHLY_LIMIT,
                currentCount
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429
            });
        }

        let path = "";
        if (action === 'stats') path = `/installer/api/v2/systems/summary/${system_id}`;
        else if (action === 'energy') {
            const query = [`energy_level=${energy_level}`, date_range ? `date_range=${date_range}` : ''].filter(Boolean).join('&');
            path = `/installer/api/v2/systems/energy/${system_id}?${query}`;
        }
        else if (action === 'details') path = `/installer/api/v2/systems/details/${system_id}`;
        else if (action === 'meters') path = `/installer/api/v2/systems/meters/${system_id}`;
        else if (action === 'meter_summary') path = `/installer/api/v2/systems/${system_id}/devices/meter/summary/${eid}`;
        else if (action === 'snap') {
            const result = await client.getSystemSummary(system_id);
            return new Response(JSON.stringify({ success: true, data: result }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (path) {
            const apiResponse = await client.fetch(path);
            const executionTime = Date.now() - startTime;

            // LOGGING
            await supabase.from('apsystems_api_logs').insert({
                action: action || path,
                system_id: system_id || null,
                code: "0",
                message: "SUCCESS",
                payload: body,
                success: true,
                execution_time_ms: executionTime
            });

            return new Response(JSON.stringify({
                success: true,
                data: { code: "0", msg: "SUCCESS", data: apiResponse },
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

        return new Response(JSON.stringify({
            success: false,
            error: err.message,
            data: { code: err.code || "-1", msg: err.message }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: err.code === '2005' ? 429 : 500
        });
    }
});
