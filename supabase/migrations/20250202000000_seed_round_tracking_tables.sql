-- Seed Round Tracking Tables
-- Customer Health, LOIs, Investors, Case Studies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customer Health Scores Table
CREATE TABLE IF NOT EXISTS customer_health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('Starter', 'Pro', 'Enterprise')),
  
  -- Health Score Components
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  status TEXT NOT NULL CHECK (status IN ('green', 'yellow', 'red')),
  
  -- Usage Metrics (40% weight)
  active_users_percentage INTEGER NOT NULL DEFAULT 0,
  workflows_running INTEGER NOT NULL DEFAULT 0,
  feature_adoption_percentage INTEGER NOT NULL DEFAULT 0,
  
  -- Engagement Metrics (30% weight)
  support_tickets_per_month INTEGER NOT NULL DEFAULT 0,
  qbr_attendance BOOLEAN NOT NULL DEFAULT false,
  response_time_hours INTEGER NOT NULL DEFAULT 0,
  
  -- Value Metrics (20% weight)
  roi_achieved BOOLEAN NOT NULL DEFAULT false,
  goals_met BOOLEAN NOT NULL DEFAULT false,
  
  -- Satisfaction Metrics (10% weight)
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  csat_score DECIMAL(3,1) CHECK (csat_score >= 0 AND csat_score <= 10),
  
  -- Metadata
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LOIs (Letters of Intent) Table
CREATE TABLE IF NOT EXISTS lois (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('Starter', 'Pro', 'Enterprise')),
  
  -- LOI Details
  monthly_commitment DECIMAL(10,2) NOT NULL,
  annual_value DECIMAL(10,2) NOT NULL,
  timeline_months INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'signed', 'expired')) DEFAULT 'draft',
  
  -- Requirements (stored as JSON array)
  requirements JSONB DEFAULT '[]'::jsonb,
  
  -- Dates
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_sent TIMESTAMPTZ,
  date_signed TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Investors Table
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  firm TEXT,
  title TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  
  -- Investor Classification
  type TEXT NOT NULL CHECK (type IN ('vc', 'angel', 'strategic')),
  tier TEXT NOT NULL CHECK (tier IN ('tier1', 'tier2', 'tier3')),
  check_size TEXT,
  
  -- Focus Areas (JSON array)
  focus_areas JSONB DEFAULT '[]'::jsonb,
  portfolio_companies JSONB DEFAULT '[]'::jsonb,
  
  -- Status Tracking
  status TEXT NOT NULL CHECK (status IN (
    'not_contacted', 'warm_intro', 'cold_outreach', 'meeting_scheduled',
    'meeting_completed', 'interested', 'passed', 'committed'
  )) DEFAULT 'not_contacted',
  source TEXT NOT NULL CHECK (source IN ('warm_intro', 'cold_outreach', 'event', 'referral')),
  
  -- Dates
  date_contacted TIMESTAMPTZ,
  date_meeting TIMESTAMPTZ,
  date_follow_up TIMESTAMPTZ,
  
  -- Deal Information
  deal_amount DECIMAL(12,2),
  deal_status TEXT CHECK (deal_status IN ('pending', 'committed', 'declined')),
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case Studies Table
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL,
  use_case TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('Starter', 'Pro', 'Enterprise')),
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('draft', 'in_review', 'approved', 'published')) DEFAULT 'draft',
  date_published TIMESTAMPTZ,
  
  -- Challenge (JSON)
  challenge JSONB NOT NULL,
  
  -- Solution (JSON)
  solution JSONB NOT NULL,
  
  -- Results (JSON)
  results JSONB NOT NULL,
  
  -- Testimonial (JSON)
  testimonial JSONB,
  
  -- Lessons Learned (JSON)
  lessons_learned JSONB,
  
  -- Next Steps (JSON array)
  next_steps JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata (JSON)
  metadata JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_health_customer_id ON customer_health_scores(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_health_status ON customer_health_scores(status);
CREATE INDEX IF NOT EXISTS idx_customer_health_score ON customer_health_scores(health_score);

CREATE INDEX IF NOT EXISTS idx_lois_status ON lois(status);
CREATE INDEX IF NOT EXISTS idx_lois_tier ON lois(tier);
CREATE INDEX IF NOT EXISTS idx_lois_date_created ON lois(date_created);

CREATE INDEX IF NOT EXISTS idx_investors_status ON investors(status);
CREATE INDEX IF NOT EXISTS idx_investors_type ON investors(type);
CREATE INDEX IF NOT EXISTS idx_investors_tier ON investors(tier);

CREATE INDEX IF NOT EXISTS idx_case_studies_status ON case_studies(status);
CREATE INDEX IF NOT EXISTS idx_case_studies_tier ON case_studies(tier);
CREATE INDEX IF NOT EXISTS idx_case_studies_industry ON case_studies(industry);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_health_updated_at BEFORE UPDATE ON customer_health_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lois_updated_at BEFORE UPDATE ON lois
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security)
ALTER TABLE customer_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE lois ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can do everything
CREATE POLICY "Admin full access customer_health" ON customer_health_scores
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access lois" ON lois
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access investors" ON investors
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access case_studies" ON case_studies
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Comments for documentation
COMMENT ON TABLE customer_health_scores IS 'Tracks customer health scores for retention and churn prevention';
COMMENT ON TABLE lois IS 'Letters of Intent for Seed Round fundraising';
COMMENT ON TABLE investors IS 'Investor outreach and deal tracking for Seed Round';
COMMENT ON TABLE case_studies IS 'Customer success stories for sales and marketing';
