-- Lead Generation System Tables
-- Comprehensive tables for lead capture, scoring, nurturing, and conversion tracking

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  source TEXT,
  campaign TEXT,
  metadata JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  qualified BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('hot', 'warm', 'cold')),
  score_factors JSONB,
  status TEXT DEFAULT 'new',
  assigned_to TEXT,
  assigned_at TIMESTAMPTZ,
  crm_id TEXT,
  crm_provider TEXT,
  crm_synced_at TIMESTAMPTZ,
  revenue DECIMAL(10, 2),
  revenue_recorded_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_qualified ON leads(qualified);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

-- Lead activities table
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(activity_type);

-- Email interactions table
CREATE TABLE IF NOT EXISTS email_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  email_id TEXT,
  opened BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_interactions_lead ON email_interactions(lead_id);

-- Lead sessions table
CREATE TABLE IF NOT EXISTS lead_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  session_id TEXT,
  duration INTEGER, -- seconds
  page_views INTEGER DEFAULT 0,
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_sessions_lead ON lead_sessions(lead_id);

-- Email queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  template TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT,
  body TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_email_queue_lead ON email_queue(lead_id);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT,
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_tenant ON email_templates(tenant_id);

-- Nurturing sequences table
CREATE TABLE IF NOT EXISTS nurturing_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  steps JSONB NOT NULL,
  trigger TEXT,
  trigger_score INTEGER,
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nurturing_sequences_tenant ON nurturing_sequences(tenant_id);

-- Nurturing enrollments table
CREATE TABLE IF NOT EXISTS nurturing_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES nurturing_sequences(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  tenant_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_nurturing_enrollments_lead ON nurturing_enrollments(lead_id);
CREATE INDEX IF NOT EXISTS idx_nurturing_enrollments_sequence ON nurturing_enrollments(sequence_id);

-- Nurturing schedule table
CREATE TABLE IF NOT EXISTS nurturing_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES nurturing_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped', 'failed')),
  completed_at TIMESTAMPTZ,
  failure_reason TEXT,
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nurturing_schedule_due ON nurturing_schedule(scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_nurturing_schedule_lead ON nurturing_schedule(lead_id);

-- CRM sync log table
CREATE TABLE IF NOT EXISTS crm_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_crm_sync_log_lead ON crm_sync_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_log_provider ON crm_sync_log(provider);

-- Conversions table
CREATE TABLE IF NOT EXISTS conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('signup', 'trial', 'purchase', 'demo', 'download', 'custom')),
  value DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}',
  attribution JSONB,
  converted_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_conversions_lead ON conversions(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversions_type ON conversions(type);
CREATE INDEX IF NOT EXISTS idx_conversions_date ON conversions(converted_at);

-- Lead touchpoints table
CREATE TABLE IF NOT EXISTS lead_touchpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  source TEXT,
  type TEXT,
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_touchpoints_lead ON lead_touchpoints(lead_id);

-- Marketing costs table
CREATE TABLE IF NOT EXISTS marketing_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  campaign TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('advertising', 'content', 'event', 'tool', 'other')),
  metadata JSONB DEFAULT '{}',
  tenant_id TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_costs_source ON marketing_costs(source);
CREATE INDEX IF NOT EXISTS idx_marketing_costs_campaign ON marketing_costs(campaign);
CREATE INDEX IF NOT EXISTS idx_marketing_costs_date ON marketing_costs(date);

-- Campaign costs table
CREATE TABLE IF NOT EXISTS campaign_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign TEXT NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_costs_campaign ON campaign_costs(campaign);

-- ROI tracking table
CREATE TABLE IF NOT EXISTS roi_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  campaign TEXT,
  source TEXT,
  revenue DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  roi DECIMAL(10, 2),
  roas DECIMAL(10, 2),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_roi_tracking_lead ON roi_tracking(lead_id);
CREATE INDEX IF NOT EXISTS idx_roi_tracking_campaign ON roi_tracking(campaign);

-- Revenue events table
CREATE TABLE IF NOT EXISTS revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_revenue_events_lead ON revenue_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_date ON revenue_events(recorded_at);

-- A/B Tests table
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('landing_page', 'email', 'campaign', 'form')),
  variations JSONB NOT NULL,
  traffic_split INTEGER[],
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_tenant ON ab_tests(tenant_id);

-- A/B Test assignments table
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  variation_id TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id TEXT,
  UNIQUE(test_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_test ON ab_test_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_visitor ON ab_test_assignments(visitor_id);

-- A/B Test conversions table
CREATE TABLE IF NOT EXISTS ab_test_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  variation_id TEXT NOT NULL,
  conversion_type TEXT NOT NULL,
  value DECIMAL(10, 2) DEFAULT 0,
  converted_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_test ON ab_test_conversions(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_variation ON ab_test_conversions(variation_id);

-- Autopilot workflows table
CREATE TABLE IF NOT EXISTS autopilot_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger TEXT NOT NULL CHECK (trigger IN ('lead_captured', 'lead_scored', 'lead_qualified', 'lead_unqualified', 'conversion', 'schedule')),
  conditions JSONB DEFAULT '{}',
  actions JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  tenant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_autopilot_workflows_trigger ON autopilot_workflows(trigger, enabled);
CREATE INDEX IF NOT EXISTS idx_autopilot_workflows_tenant ON autopilot_workflows(tenant_id);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES autopilot_workflows(id) ON DELETE CASCADE,
  context JSONB DEFAULT '{}',
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_date ON workflow_executions(executed_at);

-- RLS Policies (if using RLS)
-- Note: Adjust policies based on your multi-tenant requirements

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurturing_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurturing_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurturing_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopilot_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (tenant isolation)
-- Users can only access their tenant's data
CREATE POLICY "Users can view their tenant's leads" ON leads
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can insert their tenant's leads" ON leads
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can update their tenant's leads" ON leads
  FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', true));

-- Similar policies for other tables...
-- (Add comprehensive RLS policies based on your security requirements)
