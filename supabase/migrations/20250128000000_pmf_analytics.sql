-- PMF Analytics and Conversion Tracking Tables
-- Tracks activation rate, retention, NPS, and conversion funnel metrics

-- Conversion Events Table
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Activation Tracking
CREATE TABLE IF NOT EXISTS user_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  signup_date TIMESTAMPTZ NOT NULL,
  first_workflow_created_at TIMESTAMPTZ,
  time_to_activation_hours NUMERIC,
  workflows_created INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PMF Metrics Snapshot (daily aggregation)
CREATE TABLE IF NOT EXISTS pmf_metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL UNIQUE,
  activation_rate NUMERIC,
  seven_day_retention NUMERIC,
  thirty_day_retention NUMERIC,
  nps NUMERIC,
  time_to_activation_hours NUMERIC,
  workflows_per_user NUMERIC,
  monthly_active_users INTEGER,
  weekly_active_users INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NPS Surveys
CREATE TABLE IF NOT EXISTS nps_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  score INTEGER CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate Clicks Tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id TEXT NOT NULL,
  product TEXT NOT NULL,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  referrer_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate Conversions
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_click_id UUID REFERENCES affiliate_clicks(id),
  conversion_value NUMERIC,
  commission NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_event_type ON conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activations_signup_date ON user_activations(signup_date);
CREATE INDEX IF NOT EXISTS idx_user_activations_first_workflow ON user_activations(first_workflow_created_at);
CREATE INDEX IF NOT EXISTS idx_pmf_metrics_date ON pmf_metrics_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_user_id ON nps_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON affiliate_clicks(product);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at);

-- Function to calculate activation rate
CREATE OR REPLACE FUNCTION calculate_activation_rate(days_back INTEGER DEFAULT 30)
RETURNS NUMERIC AS $$
DECLARE
  total_signups INTEGER;
  activated_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_signups
  FROM user_activations
  WHERE signup_date >= NOW() - (days_back || ' days')::INTERVAL;
  
  SELECT COUNT(*) INTO activated_users
  FROM user_activations
  WHERE signup_date >= NOW() - (days_back || ' days')::INTERVAL
    AND first_workflow_created_at IS NOT NULL;
  
  IF total_signups = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((activated_users::NUMERIC / total_signups::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate retention rate
CREATE OR REPLACE FUNCTION calculate_retention_rate(days_after INTEGER, days_back INTEGER DEFAULT 30)
RETURNS NUMERIC AS $$
DECLARE
  cohort_size INTEGER;
  retained_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO cohort_size
  FROM user_activations
  WHERE signup_date >= NOW() - (days_back || ' days')::INTERVAL
    AND signup_date < NOW() - ((days_back - days_after) || ' days')::INTERVAL;
  
  SELECT COUNT(*) INTO retained_users
  FROM user_activations ua
  WHERE ua.signup_date >= NOW() - (days_back || ' days')::INTERVAL
    AND ua.signup_date < NOW() - ((days_back - days_after) || ' days')::INTERVAL
    AND ua.last_active_at >= NOW() - ((days_after - 1) || ' days')::INTERVAL;
  
  IF cohort_size = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((retained_users::NUMERIC / cohort_size::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate NPS
CREATE OR REPLACE FUNCTION calculate_nps(days_back INTEGER DEFAULT 30)
RETURNS NUMERIC AS $$
DECLARE
  total_responses INTEGER;
  promoters INTEGER;
  detractors INTEGER;
  nps_score NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_responses
  FROM nps_surveys
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL;
  
  SELECT COUNT(*) INTO promoters
  FROM nps_surveys
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND score >= 9;
  
  SELECT COUNT(*) INTO detractors
  FROM nps_surveys
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND score <= 6;
  
  IF total_responses = 0 THEN
    RETURN 0;
  END IF;
  
  nps_score := ((promoters::NUMERIC / total_responses::NUMERIC) - (detractors::NUMERIC / total_responses::NUMERIC)) * 100;
  
  RETURN ROUND(nps_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update PMF metrics snapshot
CREATE OR REPLACE FUNCTION update_pmf_metrics_snapshot()
RETURNS VOID AS $$
DECLARE
  activation_rate_val NUMERIC;
  seven_day_retention_val NUMERIC;
  thirty_day_retention_val NUMERIC;
  nps_val NUMERIC;
  time_to_activation_val NUMERIC;
  workflows_per_user_val NUMERIC;
  mau INTEGER;
  wau INTEGER;
BEGIN
  -- Calculate metrics
  activation_rate_val := calculate_activation_rate(30);
  seven_day_retention_val := calculate_retention_rate(7, 30);
  thirty_day_retention_val := calculate_retention_rate(30, 60);
  nps_val := calculate_nps(30);
  
  -- Calculate time to activation (average hours)
  SELECT AVG(EXTRACT(EPOCH FROM (first_workflow_created_at - signup_date)) / 3600)
  INTO time_to_activation_val
  FROM user_activations
  WHERE first_workflow_created_at IS NOT NULL
    AND signup_date >= NOW() - '30 days'::INTERVAL;
  
  -- Calculate workflows per user
  SELECT AVG(workflows_created)
  INTO workflows_per_user_val
  FROM user_activations
  WHERE signup_date >= NOW() - '30 days'::INTERVAL;
  
  -- Calculate MAU and WAU
  SELECT COUNT(DISTINCT user_id) INTO mau
  FROM user_activations
  WHERE last_active_at >= NOW() - '30 days'::INTERVAL;
  
  SELECT COUNT(DISTINCT user_id) INTO wau
  FROM user_activations
  WHERE last_active_at >= NOW() - '7 days'::INTERVAL;
  
  -- Insert or update snapshot
  INSERT INTO pmf_metrics_snapshots (
    snapshot_date,
    activation_rate,
    seven_day_retention,
    thirty_day_retention,
    nps,
    time_to_activation_hours,
    workflows_per_user,
    monthly_active_users,
    weekly_active_users
  ) VALUES (
    CURRENT_DATE,
    activation_rate_val,
    seven_day_retention_val,
    thirty_day_retention_val,
    nps_val,
    time_to_activation_val,
    workflows_per_user_val,
    mau,
    wau
  )
  ON CONFLICT (snapshot_date) DO UPDATE SET
    activation_rate = EXCLUDED.activation_rate,
    seven_day_retention = EXCLUDED.seven_day_retention,
    thirty_day_retention = EXCLUDED.thirty_day_retention,
    nps = EXCLUDED.nps,
    time_to_activation_hours = EXCLUDED.time_to_activation_hours,
    workflows_per_user = EXCLUDED.workflows_per_user,
    monthly_active_users = EXCLUDED.monthly_active_users,
    weekly_active_users = EXCLUDED.weekly_active_users,
    created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user_activations updated_at
CREATE OR REPLACE FUNCTION update_user_activations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_activations_updated_at
  BEFORE UPDATE ON user_activations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activations_updated_at();

-- RLS Policies
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pmf_metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
CREATE POLICY "Users can view own conversion events" ON conversion_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activations" ON user_activations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own NPS surveys" ON nps_surveys
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access" ON conversion_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access activations" ON user_activations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access pmf" ON pmf_metrics_snapshots
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access nps" ON nps_surveys
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access affiliate" ON affiliate_clicks
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access conversions" ON affiliate_conversions
  FOR ALL USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE conversion_events IS 'Tracks conversion funnel events (homepage_view, signup_click, signup_complete, etc.)';
COMMENT ON TABLE user_activations IS 'Tracks user activation metrics (signup date, first workflow creation, etc.)';
COMMENT ON TABLE pmf_metrics_snapshots IS 'Daily snapshots of PMF metrics for dashboard';
COMMENT ON TABLE nps_surveys IS 'Net Promoter Score surveys';
COMMENT ON TABLE affiliate_clicks IS 'Tracks affiliate link clicks';
COMMENT ON TABLE affiliate_conversions IS 'Tracks affiliate conversions and commissions';
