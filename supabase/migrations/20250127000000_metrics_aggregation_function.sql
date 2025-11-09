-- ===========================================
-- Metrics Aggregation RPC Function
-- Optimizes metrics query using SQL DISTINCT ON
-- ===========================================

/**
 * Get latest metrics per source efficiently
 * Uses DISTINCT ON for optimal performance
 */
CREATE OR REPLACE FUNCTION get_latest_metrics_per_source(limit_count INT DEFAULT 100)
RETURNS TABLE(
  source TEXT,
  metric JSONB,
  ts TIMESTAMPTZ
) AS $$
  SELECT DISTINCT ON (source) 
    source,
    metric,
    ts
  FROM metrics_log
  ORDER BY source, ts DESC
  LIMIT limit_count;
$$ LANGUAGE sql STABLE;

/**
 * Get metrics trends (7-day moving averages) efficiently
 * Pre-aggregates data for faster retrieval
 */
CREATE OR REPLACE FUNCTION get_metrics_trends(days_back INT DEFAULT 7)
RETURNS TABLE(
  source TEXT,
  average NUMERIC,
  min_value NUMERIC,
  max_value NUMERIC,
  count_samples BIGINT
) AS $$
  WITH numeric_metrics AS (
    SELECT 
      source,
      (jsonb_each_text(metric)).value::NUMERIC AS value
    FROM metrics_log
    WHERE ts >= NOW() - (days_back || ' days')::INTERVAL
      AND (jsonb_each_text(metric)).value ~ '^[0-9]+\.?[0-9]*$' -- Only numeric values
  )
  SELECT 
    source,
    AVG(value) AS average,
    MIN(value) AS min_value,
    MAX(value) AS max_value,
    COUNT(*) AS count_samples
  FROM numeric_metrics
  GROUP BY source;
$$ LANGUAGE sql STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_latest_metrics_per_source(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_metrics_per_source(INT) TO anon;
GRANT EXECUTE ON FUNCTION get_metrics_trends(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_metrics_trends(INT) TO anon;

-- Add comments
COMMENT ON FUNCTION get_latest_metrics_per_source(INT) IS 'Get latest metric per source efficiently using DISTINCT ON';
COMMENT ON FUNCTION get_metrics_trends(INT) IS 'Calculate 7-day moving averages for metrics efficiently';
