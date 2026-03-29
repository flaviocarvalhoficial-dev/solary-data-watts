// supabase/functions/sync-enqueue/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders, status: 200 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const body = await req.json().catch(() => ({}));
        console.log(`[ENQUEUE DEBUG] Body received:`, JSON.stringify(body));

        const { system_ids, platform = 'APsystems' } = body;

        if (!system_ids || !Array.isArray(system_ids)) {
            console.error(`[ENQUEUE ERROR] Invalid system_ids:`, system_ids);
            return new Response(JSON.stringify({
                success: false,
                error: "Invalid request: system_ids must be an array",
                received: body
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            });
        }

        // 1. Filtrar sistemas que já tenham um job pendente ou rodando
        const { data: existingJobs, error: selectError } = await supabase
            .from('sync_jobs')
            .select('system_id')
            .in('status', ['pending', 'running'])
            .in('system_id', system_ids);

        if (selectError) {
            console.error(`[ENQUEUE ERROR] Failed to check existing jobs:`, selectError);
            throw new Error(`Database check failed: ${selectError.message}`);
        }

        const existingIds = new Set(existingJobs?.map(j => j.system_id) || []);
        const newIds = system_ids.filter(id => !existingIds.has(id));

        if (newIds.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: "All systems already have active jobs.",
                enqueued: 0
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 2. Inserir novos jobs
        const jobsToInsert = newIds.map(id => ({
            system_id: id,
            status: 'pending',
            priority: 0,
            scheduled_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
            .from('sync_jobs')
            .insert(jobsToInsert);

        if (insertError) {
            console.error(`[ENQUEUE ERROR] Failed to insert jobs:`, insertError);
            throw new Error(`Database insert failed: ${insertError.message}`);
        }

        return new Response(JSON.stringify({
            success: true,
            message: `${newIds.length} systems enqueued successfully.`,
            enqueued: newIds.length
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (err: any) {
        console.error(`[ENQUEUE CRITICAL]`, err);
        return new Response(JSON.stringify({
            success: false,
            error: err.message,
            details: err.details || "Check function logs for details"
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
});
