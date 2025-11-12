-- ===========================================
-- SELF-HEALING SQL PACK
-- ===========================================
-- This migration creates core tables, functions, and indexes needed for
-- ETL automation, metrics computation, and system health checks.
-- All statements are idempotent (IF NOT EXISTS) and safe to re-run.
-- ===========================================

-- ===========================================
-- EXTENSIONS (IF NOT EXISTS)
-- ===========================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ===========================================
-- CORE TABLES (IF NOT EXISTS)
-- ===========================================

-- Events table (generic event tracking)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spend table (advertising spend tracking)
CREATE TABLE IF NOT EXISTS public.spend (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CAD',
    date DATE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(platform, date)
);

-- Metrics daily table (aggregated daily metrics)
CREATE TABLE IF NOT EXISTS public.metrics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    revenue DECIMAL(10, 2) DEFAULT 0,
    spend DECIMAL(10, 2) DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    users_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- ===========================================
-- INDEXES (IF NOT EXISTS)
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_events_name_time ON public.events(name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_spend_platform_dt ON public.spend(platform, date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_day ON public.metrics_daily(date DESC);

-- ===========================================
-- ENABLE RLS
-- ===========================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_daily ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES (Guarded in DO block)
-- ===========================================

DO $$
BEGIN
    -- Events: Service role can insert/select, authenticated users can select
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'events' 
        AND policyname = 'events_service_role_all'
    ) THEN
        CREATE POLICY "events_service_role_all" ON public.events
            FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'events' 
        AND policyname = 'events_authenticated_select'
    ) THEN
        CREATE POLICY "events_authenticated_select" ON public.events
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    -- Spend: Service role can insert/select, authenticated users can select
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'spend' 
        AND policyname = 'spend_service_role_all'
    ) THEN
        CREATE POLICY "spend_service_role_all" ON public.spend
            FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'spend' 
        AND policyname = 'spend_authenticated_select'
    ) THEN
        CREATE POLICY "spend_authenticated_select" ON public.spend
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    -- Metrics daily: Service role can insert/select, authenticated users can select
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'metrics_daily' 
        AND policyname = 'metrics_daily_service_role_all'
    ) THEN
        CREATE POLICY "metrics_daily_service_role_all" ON public.metrics_daily
            FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'metrics_daily' 
        AND policyname = 'metrics_daily_authenticated_select'
    ) THEN
        CREATE POLICY "metrics_daily_authenticated_select" ON public.metrics_daily
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- ===========================================
-- UPSERT FUNCTIONS
-- ===========================================

-- Upsert events function
CREATE OR REPLACE FUNCTION public.upsert_events(event_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.events (name, properties, timestamp)
    VALUES (
        event_data->>'name',
        COALESCE(event_data->'properties', '{}'::jsonb),
        COALESCE((event_data->>'timestamp')::timestamptz, now())
    )
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$;

-- Upsert spend function
CREATE OR REPLACE FUNCTION public.upsert_spend(spend_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    spend_id UUID;
BEGIN
    INSERT INTO public.spend (platform, amount, currency, date, metadata)
    VALUES (
        spend_data->>'platform',
        (spend_data->>'amount')::decimal,
        COALESCE(spend_data->>'currency', 'CAD'),
        (spend_data->>'date')::date,
        COALESCE(spend_data->'metadata', '{}'::jsonb)
    )
    ON CONFLICT (platform, date) 
    DO UPDATE SET
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        metadata = EXCLUDED.metadata
    RETURNING id INTO spend_id;
    
    RETURN spend_id;
END;
$$;

-- Recompute metrics daily function
CREATE OR REPLACE FUNCTION public.recompute_metrics_daily(
    start_date DATE,
    end_date DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    rec RECORD;
    days_processed INTEGER := 0;
BEGIN
    FOR rec IN 
        SELECT 
            date_series::date AS day,
            COALESCE(SUM(s.amount), 0) AS total_spend,
            COUNT(DISTINCT e.id) AS events_count
        FROM generate_series(start_date, end_date, '1 day'::interval) AS date_series
        LEFT JOIN public.spend s ON s.date = date_series::date
        LEFT JOIN public.events e ON DATE(e.timestamp) = date_series::date
        GROUP BY date_series::date
    LOOP
        INSERT INTO public.metrics_daily (date, spend, events_count, computed_at)
        VALUES (rec.day, rec.total_spend, rec.events_count, now())
        ON CONFLICT (date) 
        DO UPDATE SET
            spend = EXCLUDED.spend,
            events_count = EXCLUDED.events_count,
            computed_at = now();
        
        days_processed := days_processed + 1;
    END LOOP;
    
    RETURN days_processed;
END;
$$;

-- System healthcheck function
CREATE OR REPLACE FUNCTION public.system_healthcheck()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    health JSONB;
BEGIN
    SELECT jsonb_build_object(
        'status', 'healthy',
        'timestamp', now(),
        'tables', (
            SELECT jsonb_agg(jsonb_build_object(
                'name', table_name,
                'exists', true
            ))
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('events', 'spend', 'metrics_daily')
        ),
        'events_count', (SELECT COUNT(*) FROM public.events),
        'spend_count', (SELECT COUNT(*) FROM public.spend),
        'metrics_count', (SELECT COUNT(*) FROM public.metrics_daily),
        'latest_metric_date', (SELECT MAX(date) FROM public.metrics_daily)
    ) INTO health;
    
    RETURN health;
END;
$$;
