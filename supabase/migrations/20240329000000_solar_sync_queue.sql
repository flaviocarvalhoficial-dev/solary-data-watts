-- Migration: Solar Sync Queue (sync_jobs and solar_cache)
-- 2024-03-29 00:00:00

-- Tabela de fila de sincronização
CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id   UUID NOT NULL REFERENCES public.systems(id) ON DELETE CASCADE,
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

-- Index para performance do worker
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status_scheduled ON public.sync_jobs(status, scheduled_at);

-- Tabela de cache de dados solar
CREATE TABLE IF NOT EXISTS public.solar_cache (
  cache_key  TEXT PRIMARY KEY,
  data       JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS (opcional para tabelas de sistema, mas recomendado por padrão no Supabase)
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_cache ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (apenas service_role por padrão enviaria os jobs, mas vamos permitir leitura para dash)
CREATE POLICY "Allow authenticated read sync_jobs" ON public.sync_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read solar_cache" ON public.solar_cache FOR SELECT TO authenticated USING (true);

-- Função para limpar cache antigo (TTL)
-- Exemplo: limpar entradas com mais de 24h
CREATE OR REPLACE FUNCTION clean_expired_solar_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.solar_cache WHERE updated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
