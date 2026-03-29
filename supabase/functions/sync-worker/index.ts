// supabase/functions/sync-worker/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { sleep, fetchWithRetry } from '../_shared/utils.ts';
import { apiCircuitBreaker } from '../_shared/circuitBreaker.ts';
import { APsystemsClient } from '../_shared/manufacturers/apsystems.ts';

const BATCH_SIZE = 5;
const DELAY_MS = 2000;
const MAX_MONTHLY_LIMIT = 1000;

serve(async (req) => {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const appId = Deno.env.get('APSYSTEMS_APP_ID');
    const appSecret = Deno.env.get('APSYSTEMS_APP_SECRET');

    if (!appId || !appSecret) {
        return new Response('Credentials missing', { status: 500 });
    }

    const apsClient = new APsystemsClient(appId, appSecret);

    // 1. Verificar Cota Mensal
    const { data: quotaCheck } = await supabase.rpc('check_apsystems_monthly_quota', { max_limit: MAX_MONTHLY_LIMIT });
    const isAllowed = quotaCheck && (quotaCheck as any)[0]?.allowed;

    if (!isAllowed) {
        console.warn(`[WORKER] Monthly quota reached. Skipping execution.`);
        return new Response('Monthly quota reached', { status: 200 });
    }

    // 2. Buscar Jobs Pendentes (Alias 'system' para garantir consistência)
    const { data: jobs, error: fetchError } = await supabase
        .from('sync_jobs')
        .select('*, system:systems(id, sid, platform)')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .order('priority', { ascending: false })
        .limit(BATCH_SIZE);

    if (fetchError) {
        console.error(`[WORKER] Error fetching jobs:`, fetchError);
        return new Response(JSON.stringify(fetchError), { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
        console.log(`[WORKER] No pending jobs found at ${new Date().toISOString()}`);
        return new Response('No pending jobs', { status: 200 });
    }

    console.log(`[WORKER] Processing ${jobs.length} jobs...`);

    for (const job of jobs) {
        // Suporte para relação objeto ou array (Supabase Join)
        const system = Array.isArray((job as any).system) ? (job as any).system[0] : (job as any).system;

        if (!system) {
            console.error(`[WORKER ERROR] Job ${job.id} has NO system linked! system_id=${job.system_id}`);
            // Marca como falha para não travar a fila se o link estiver quebrado
            await supabase.from('sync_jobs').update({ status: 'failed', last_error: 'System record not found' }).eq('id', job.id);
            continue;
        }

        // Marcar como Running
        await supabase.from('sync_jobs').update({
            status: 'running',
            started_at: new Date().toISOString()
        }).eq('id', job.id);

        try {
            console.log(`[WORKER] Syncing SID: ${system.sid}...`);

            // Executar com Circuit Breaker e Retry
            const snapshot = await apiCircuitBreaker.execute(async () => {
                return await fetchWithRetry(async () => {
                    return await apsClient.getSystemSummary(system.sid);
                });
            });

            // Mapeamento robusto dos campos (APsystems varia entre versões)
            const todayEnergy = parseFloat(snapshot.energy_today || snapshot.todayEnergy || snapshot.today || '0');
            const lifetimeEnergy = parseFloat(snapshot.last_generation || snapshot.lifetimeGeneration || snapshot.lifetime || '0');

            console.log(`[WORKER] SUCCESS for ${system.sid} -> Today: ${todayEnergy}, Total: ${lifetimeEnergy}`);

            // Atualizar infra (systems) e negócio (clients)
            await supabase.from('systems').update({
                last_generation: lifetimeEnergy,
                energy_today: todayEnergy,
                last_sync: new Date().toISOString(),
                sync_status: 'IDLE',
                sync_error: null
            }).eq('id', system.id);

            const { error: cliErr } = await supabase.from('clients').update({
                energy_today: todayEnergy,
                last_generation: lifetimeEnergy,
                last_api_sync: new Date().toISOString(),
                api_status: 'Normal'
            }).eq('system_id', system.sid);

            if (cliErr) console.warn(`[WORKER] Client update error for ${system.sid}:`, cliErr.message);

            // Finalizar Job
            await supabase.from('sync_jobs').update({
                status: 'done',
                finished_at: new Date().toISOString(),
                last_error: null
            }).eq('id', job.id);

        } catch (err: any) {
            console.error(`[WORKER ERROR] Job ${job.id} FAILED:`, err.message);

            const newAttempts = job.attempts + 1;
            const isBlocked = err.message.includes('2005');
            const shouldRetry = newAttempts < (job.max_attempts || 3) && !isBlocked;

            await supabase.from('sync_jobs').update({
                status: (shouldRetry || isBlocked) ? 'pending' : 'failed',
                attempts: newAttempts,
                last_error: err.message,
                scheduled_at: isBlocked
                    ? new Date(Date.now() + 24 * 3600000).toISOString() // 24h se bloqueado
                    : new Date(Date.now() + Math.pow(4, newAttempts) * 60000).toISOString(),
                finished_at: (shouldRetry || isBlocked) ? null : new Date().toISOString()
            }).eq('id', job.id);

            if (isBlocked) {
                console.warn("[WORKER] Daily limit hit. Stopping batch.");
                break;
            }
        }

        await sleep(DELAY_MS);
    }

    return new Response(`Batch processed`, { status: 200 });
});
