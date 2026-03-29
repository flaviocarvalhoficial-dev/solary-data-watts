---
trigger: always_on
---

---
name: solar-api-integration
description: >
  Use this skill whenever a project precisa integrar com APIs de fabricantes de inversores solares
  (Solis/Ginlong, Growatt, FusionSolar/Huawei, SolarEdge, Fronius, Enphase, APsystems, Deye, Sofar)
  ou qualquer API de terceiros com rate limiting restritivo. Triggers: "integrar com API solar",
  "buscar dados de inversor", "erro 2005", "rate limit API", "throttling requisições",
  "loop de clientes API", "fila de requisições", "sync dados de plantas solares",
  "Edge Function com múltiplos clientes", "polling API fabricante". Também usar quando o usuário
  menciona erros como 2005, 429, "too many requests", "frequent request", ou quando precisa
  escalar coleta de dados para N clientes via API com chave compartilhada ou por cliente.
---

# Solar API Integration Skill

Guia completo para integrar com APIs de fabricantes de inversores solares (e APIs restritivas em geral),
garantindo escalabilidade, resiliência e conformidade com os limites de cada fabricante.

---

## 1. Diagnóstico Rápido de Erros

### Tabela de Erros Comuns por Fabricante

| Código | Fabricante     | Significado                          | Solução                        |
|--------|---------------|--------------------------------------|--------------------------------|
| 2005   | Solis/Ginlong  | Requisição frequente / token inválido por abuso | Throttle + backoff exponencial |
| 429    | Maioria        | Too Many Requests                    | Respeitar Retry-After header   |
| 10011  | Growatt        | Freq limit exceeded                  | Delay mínimo de 1s por planta  |
| -1     | FusionSolar    | Sistema ocupado / rate limit         | Fila com delay 5s              |
| 401    | Qualquer       | Token expirado por excesso de tentativas | Renovar token + backoff     |

### Checklist de Diagnóstico

```
[ ] O erro acontece imediatamente ou após N requisições?
[ ] Está usando a mesma chave API para todos os clientes?
[ ] As requisições são disparadas de forma assíncrona/paralela?
[ ] A documentação menciona "Frequency Limit" ou "Rate Limit"?
[ ] Existe um endpoint de Batch/múltiplas plantas?
```

---

## 2. Arquitetura Recomendada por Escala

### Pequena escala (< 20 clientes) — Loop com Delay

Adequado para Edge Functions simples. **Atenção ao timeout** (Supabase: 150s, Vercel: 60s).

```typescript
// utils/throttle.ts
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchWithThrottle<T>(
  items: T[],
  fetchFn: (item: T) => Promise<any>,
  delayMs: number = 2000
): Promise<{ success: any[]; failed: T[] }> {
  const success = [];
  const failed = [];

  for (const item of items) {
    try {
      const result = await fetchFn(item);
      success.push(result);
    } catch (err) {
      failed.push(item);
      console.error(`Failed for item:`, item, err);
    }
    await sleep(delayMs);
  }

  return { success, failed };
}
```

### Média escala (20–200 clientes) — Fila com Worker (Recomendado para SaaS)

Use uma tabela de jobs no Supabase + `pg_cron` ou `Inngest`.

```sql
-- Tabela de fila de sincronização
CREATE TABLE sync_jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id),
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | running | done | failed
  priority    INT DEFAULT 0,
  attempts    INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  last_error  TEXT,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at  TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_status_scheduled ON sync_jobs(status, scheduled_at);
```

```typescript
// supabase/functions/sync-worker/index.ts
import { createClient } from '@supabase/supabase-js';
import { sleep } from '../utils/throttle.ts';

const BATCH_SIZE = 5;       // Processar N clientes por vez
const DELAY_MS   = 2000;    // Delay entre cada requisição ao fabricante

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Pega próximos jobs pendentes
  const { data: jobs } = await supabase
    .from('sync_jobs')
    .select('*, clients(*)')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('priority', { ascending: false })
    .limit(BATCH_SIZE);

  if (!jobs?.length) return new Response('No jobs', { status: 200 });

  for (const job of jobs) {
    // Marca como running
    await supabase
      .from('sync_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', job.id);

    try {
      await syncClient(job.clients);

      await supabase
        .from('sync_jobs')
        .update({ status: 'done', finished_at: new Date().toISOString() })
        .eq('id', job.id);
    } catch (err) {
      const newAttempts = job.attempts + 1;
      const shouldRetry = newAttempts < job.max_attempts;

      // Backoff exponencial: 2min, 8min, 30min
      const backoffMs = Math.pow(4, newAttempts) * 60_000;
      const retryAt = new Date(Date.now() + backoffMs).toISOString();

      await supabase.from('sync_jobs').update({
        status:      shouldRetry ? 'pending' : 'failed',
        attempts:    newAttempts,
        last_error:  err.message,
        scheduled_at: shouldRetry ? retryAt : undefined,
      }).eq('id', job.id);
    }

    await sleep(DELAY_MS); // Respeita rate limit entre clientes
  }

  return new Response('Done', { status: 200 });
});
```

### Grande escala (200+ clientes) — Inngest ou BullMQ

Para volumes altos, prefira uma plataforma de filas dedicada:

```typescript
// inngest/functions/sync-solar.ts
import { inngest } from './client';
import { sleep } from '../utils/throttle';

export const syncSolarPlant = inngest.createFunction(
  {
    id: 'sync-solar-plant',
    rateLimit: { limit: 1, period: '2s', key: 'event.data.manufacturerKey' },
    retries: 3,
  },
  { event: 'solar/plant.sync.requested' },
  async ({ event, step }) => {
    const data = await step.run('fetch-from-manufacturer', async () => {
      return await fetchManufacturerData(event.data.plantId, event.data.credentials);
    });

    await step.run('save-to-database', async () => {
      return await saveToSupabase(data);
    });
  }
);
```

---

## 3. Backoff Exponencial com Retry

Sempre implementar retry automático. Nunca deixar falhar silenciosamente.

```typescript
// utils/fetchWithRetry.ts
interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: any) => boolean;
}

export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 1000,
    maxDelayMs  = 30_000,
    shouldRetry = (err) => [429, 2005, 500, 503].includes(err?.status ?? err?.code),
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt === maxAttempts || !shouldRetry(err)) throw err;

      // Respeita Retry-After se o header existir
      const retryAfter = err?.headers?.get?.('Retry-After');
      const delay = retryAfter
        ? parseInt(retryAfter) * 1000
        : Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);

      console.warn(`Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw lastError;
}
```

---

## 4. Cache de Dados (Supabase)

Evitar chamadas desnecessárias ao fabricante. Salvar resultado com TTL.

```typescript
// utils/cache.ts
interface CacheOptions {
  ttlMinutes?: number;
  table?: string;
}

export async function getOrFetchWithCache<T>(
  supabase: any,
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttlMinutes = 15, table = 'solar_cache' } = options;

  // Tenta buscar do cache
  const { data: cached } = await supabase
    .from(table)
    .select('data, updated_at')
    .eq('cache_key', cacheKey)
    .single();

  if (cached) {
    const ageMin = (Date.now() - new Date(cached.updated_at).getTime()) / 60_000;
    if (ageMin < ttlMinutes) {
      return cached.data as T; // Cache válido
    }
  }

  // Busca dado fresco
  const freshData = await fetchFn();

  // Salva no cache (upsert)
  await supabase.from(table).upsert({
    cache_key:  cacheKey,
    data:       freshData,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'cache_key' });

  return freshData;
}
```

```sql
-- Tabela de cache
CREATE TABLE solar_cache (
  cache_key  TEXT PRIMARY KEY,
  data       JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TTL automático via pg_cron (limpa entradas com mais de 1h)
SELECT cron.schedule('clean-solar-cache', '0 * * * *', $$
  DELETE FROM solar_cache WHERE updated_at < NOW() - INTERVAL '1 hour';
$$);
```

---

## 5. Configurações de Rate Limit por Fabricante

| Fabricante     | Limite documentado              | Delay Seguro  | Batch disponível |
|---------------|----------------------------------|---------------|-----------------|
| Solis/Ginlong  | 1 req/s por token               | 1.5s          | Sim (até 10 plantas) |
| Growatt        | 1 req/min por planta            | 65s           | Não             |
| FusionSolar    | 5 req/min por conta             | 15s           | Sim (até 100 IDs) |
| SolarEdge      | 300 req/dia por chave           | 5s            | Sim             |
| Fronius        | Sem limite documentado (local)  | 0.5s          | N/A             |
| Enphase        | 10 req/min por token            | 7s            | Sim             |
| Deye/Sunsynk   | Não documentado                 | 3s (empírico) | Não             |

> ⚠️ **Chave compartilhada**: Se todos os N clientes usam a mesma chave API, o limite é global.
> O delay seguro deve ser multiplicado por N. Ideal: cada cliente ter sua própria chave.

---

## 6. Circuit Breaker

Parar automaticamente se o fabricante estiver fora do ar.

```typescript
// utils/circuitBreaker.ts
type CBState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private state: CBState = 'closed';
  private failures = 0;
  private lastFailureTime = 0;

  constructor(
    private readonly threshold = 5,
    private readonly resetTimeoutMs = 60_000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker OPEN — manufacturer API may be down');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'open';
      console.error(`Circuit breaker OPENED after ${this.failures} failures`);
    }
  }
}
```

---

## 7. Estrutura de Projeto Recomendada

```
supabase/
├── functions/
│   ├── sync-worker/        # Worker principal (chamado via pg_cron ou cron externo)
│   │   └── index.ts
│   ├── sync-enqueue/       # Endpoint para enfileirar clientes manualmente
│   │   └── index.ts
│   └── _shared/
│       ├── throttle.ts
│       ├── fetchWithRetry.ts
│       ├── cache.ts
│       ├── circuitBreaker.ts
│       └── manufacturers/
│           ├── solis.ts
│           ├── growatt.ts
│           └── fusionsolar.ts
├── migrations/
│   ├── 001_sync_jobs.sql
│   └── 002_solar_cache.sql
```
---

## 8. Checklist de Implementação

```
[ ] Implementar delay entre requisições (mínimo: conforme tabela do fabr