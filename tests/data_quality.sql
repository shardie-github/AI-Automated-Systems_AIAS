-- ===========================================
-- DATA QUALITY CHECKS
-- ===========================================
-- Template SQL for data quality validation
-- Run via: psql -f tests/data_quality.sql
-- Or via: tsx scripts/agents/run_data_quality.ts
-- ===========================================

-- Check 1: NOT NULL constraints
SELECT 
    'events.name' AS check_name,
    COUNT(*) AS violation_count
FROM public.events
WHERE name IS NULL

UNION ALL

SELECT 
    'spend.platform' AS check_name,
    COUNT(*) AS violation_count
FROM public.spend
WHERE platform IS NULL

UNION ALL

SELECT 
    'spend.amount' AS check_name,
    COUNT(*) AS violation_count
FROM public.spend
WHERE amount IS NULL

UNION ALL

SELECT 
    'metrics_daily.date' AS check_name,
    COUNT(*) AS violation_count
FROM public.metrics_daily
WHERE date IS NULL;

-- Check 2: Freshness (metrics should be computed within last 24 hours for yesterday)
SELECT 
    'metrics_daily_freshness' AS check_name,
    CASE 
        WHEN MAX(computed_at) < NOW() - INTERVAL '24 hours' THEN 1
        ELSE 0
    END AS violation_count
FROM public.metrics_daily
WHERE date = CURRENT_DATE - INTERVAL '1 day';

-- Check 3: Duplicates (spend should be unique per platform+date)
SELECT 
    'spend_duplicates' AS check_name,
    COUNT(*) - COUNT(DISTINCT (platform, date)) AS violation_count
FROM public.spend;

-- Check 4: Negative amounts (spend should be positive)
SELECT 
    'spend_negative_amounts' AS check_name,
    COUNT(*) AS violation_count
FROM public.spend
WHERE amount < 0;

-- Check 5: Future dates (should not have future dates)
SELECT 
    'spend_future_dates' AS check_name,
    COUNT(*) AS violation_count
FROM public.spend
WHERE date > CURRENT_DATE;

SELECT 
    'metrics_daily_future_dates' AS check_name,
    COUNT(*) AS violation_count
FROM public.metrics_daily
WHERE date > CURRENT_DATE;

-- Check 6: Data completeness (metrics_daily should have recent data)
SELECT 
    'metrics_daily_missing_recent' AS check_name,
    CASE 
        WHEN MAX(date) < CURRENT_DATE - INTERVAL '2 days' THEN 1
        ELSE 0
    END AS violation_count
FROM public.metrics_daily;
