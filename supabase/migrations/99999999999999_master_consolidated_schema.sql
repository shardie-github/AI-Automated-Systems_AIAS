-- ============================================================================
-- MASTER CONSOLIDATED SCHEMA MIGRATION
-- ============================================================================
-- This migration consolidates all previous migrations into a single,
-- coherent schema that can bootstrap a fresh database.
--
-- Migration Strategy:
-- - Single canonical migration for fresh database setup
-- - All historical migrations archived in migrations_archive/
-- - New changes should be added as incremental migrations
--
-- Generated: 2025-01-31
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- ============================================================================
-- HELPER FUNCTIONS (Created early for use in RLS policies)
-- ============================================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Alternative updated_at function (for compatibility)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  bio text,
  location text,
  website text,
  referral_code text UNIQUE,
  total_xp int DEFAULT 0,
  total_referrals int DEFAULT 0,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- User settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  email_notifications_enabled boolean DEFAULT true,
  push_notifications_enabled boolean DEFAULT true,
  sms_notifications_enabled boolean DEFAULT false,
  notification_types jsonb DEFAULT '{"system": true, "security": true, "marketing": false, "product_updates": true, "community": true, "billing": true}'::jsonb,
  theme varchar(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language varchar(10) DEFAULT 'en',
  timezone varchar(50) DEFAULT 'UTC',
  date_format varchar(20) DEFAULT 'YYYY-MM-DD',
  time_format varchar(10) DEFAULT '24h',
  profile_visibility varchar(20) DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private', 'friends')),
  analytics_opt_in boolean DEFAULT true,
  data_sharing_enabled boolean DEFAULT false,
  beta_features_enabled boolean DEFAULT false,
  experimental_features_enabled boolean DEFAULT false,
  custom_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- User apps table
CREATE TABLE IF NOT EXISTS public.user_apps (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  app text NOT NULL,
  connected boolean DEFAULT false,
  meta jsonb,
  updated_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (user_id, app)
);

-- ============================================================================
-- MULTI-TENANT TABLES
-- ============================================================================

-- Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subdomain text UNIQUE NOT NULL,
  domain text,
  plan_id uuid REFERENCES subscription_plans(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
  settings jsonb DEFAULT '{}',
  limits jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly decimal(10,2),
  price_yearly decimal(10,2),
  features jsonb NOT NULL DEFAULT '[]',
  limits jsonb NOT NULL DEFAULT '{}',
  tier text NOT NULL CHECK (tier IN ('starter', 'professional', 'enterprise', 'custom')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Tenant members table
CREATE TABLE IF NOT EXISTS public.tenant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer', 'billing')),
  permissions jsonb DEFAULT '{}',
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz,
  joined_at timestamptz DEFAULT NOW(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'removed')),
  last_active timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Tenant usage tracking
CREATE TABLE IF NOT EXISTS public.tenant_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  usage_count integer DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- GAMIFICATION & COMMUNITY TABLES
-- ============================================================================

-- Badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id bigserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT NOW()
);

-- User badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id bigint NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Streaks table
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  days int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  body text NOT NULL,
  image_url text,
  tags text[],
  is_pinned boolean DEFAULT false,
  view_count int DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id bigserial PRIMARY KEY,
  post_id bigint NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  parent_id bigint REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
  post_id bigint REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id, emoji)
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL CHECK (challenge_type IN ('weekly', 'monthly', 'seasonal', 'special')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  xp_reward int DEFAULT 50,
  badge_id bigint REFERENCES public.badges(id),
  requirements jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW()
);

-- Challenge participants table
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id bigserial PRIMARY KEY,
  challenge_id bigint NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress jsonb DEFAULT '{}',
  completed_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Leaderboard entries table
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period text NOT NULL CHECK (period IN ('weekly', 'monthly', 'all_time')),
  period_start timestamptz NOT NULL,
  xp_earned int DEFAULT 0,
  rank int,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, period, period_start)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'system', 'streak_reminder', 'challenge_started', 'challenge_completed', 'badge_earned', 'level_up', 'comment_reply', 'reaction', 'referral_reward', 'milestone')),
  title text NOT NULL,
  message text NOT NULL,
  action jsonb,
  link text,
  read boolean DEFAULT false,
  read_at timestamptz,
  archived boolean DEFAULT false,
  archived_at timestamptz,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  channels text[] DEFAULT '{}',
  scheduled_for timestamptz,
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  push_sent boolean DEFAULT false,
  push_sent_at timestamptz,
  sms_sent boolean DEFAULT false,
  sms_sent_at timestamptz,
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  notification_type varchar(50) NOT NULL CHECK (notification_type IN ('system', 'security', 'marketing', 'product_updates', 'community', 'billing', 'achievement', 'reminder', 'alert')),
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  in_app_enabled boolean DEFAULT true,
  frequency varchar(20) DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily', 'weekly', 'never')),
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, tenant_id, notification_type)
);

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- User follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('post_created', 'comment_added', 'badge_earned', 'level_up', 'challenge_completed', 'streak_milestone', 'referral_sent')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id bigserial PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text NOT NULL UNIQUE,
  email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'rewarded')),
  converted_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- Moderation flags table
CREATE TABLE IF NOT EXISTS public.moderation_flags (
  id bigserial PRIMARY KEY,
  flagged_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id bigint REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id bigint REFERENCES public.comments(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT NOW(),
  CONSTRAINT one_target CHECK ((post_id IS NOT NULL)::int + (comment_id IS NOT NULL)::int = 1)
);

-- Subscription tiers table
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('free', 'starter', 'pro', 'enterprise')),
  xp_multiplier decimal(3,2) DEFAULT 1.0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- User points table
CREATE TABLE IF NOT EXISTS public.user_points (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points int DEFAULT 0,
  total_earned int DEFAULT 0,
  total_spent int DEFAULT 0,
  updated_at timestamptz DEFAULT NOW()
);

-- Point transactions table
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount int NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'expired', 'bonus')),
  reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW()
);

-- Onboarding quests table
CREATE TABLE IF NOT EXISTS public.onboarding_quests (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_type text NOT NULL CHECK (quest_type IN ('profile_setup', 'first_post', 'first_journal', 'first_reaction', 'invite_friend')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, quest_type)
);

-- Milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type text NOT NULL CHECK (milestone_type IN ('streak_7', 'streak_30', 'streak_100', 'level_10', 'level_25', 'level_50', 'xp_1000', 'xp_10000', 'first_badge', 'badge_collector')),
  achieved_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, milestone_type)
);

-- Segments table
CREATE TABLE IF NOT EXISTS public.segments (
  id bigserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  description text
);

-- User segments table
CREATE TABLE IF NOT EXISTS public.user_segments (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  segment_id bigint REFERENCES public.segments(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (user_id, segment_id)
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  kind text NOT NULL,
  score numeric NOT NULL DEFAULT 0,
  rationale jsonb,
  cta jsonb,
  created_at timestamptz DEFAULT NOW(),
  dismissed boolean DEFAULT false,
  accepted boolean DEFAULT false
);

-- Support diagnostics table
CREATE TABLE IF NOT EXISTS public.support_diagnostics (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  hypothesis text NOT NULL,
  confidence numeric NOT NULL,
  evidence jsonb,
  status text DEFAULT 'open' CHECK (status IN ('open', 'muted', 'resolved')),
  created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- EVENTS & TELEMETRY TABLES
-- ============================================================================

-- App events table (primary event tracking table)
CREATE TABLE IF NOT EXISTS public.app_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  app text DEFAULT 'web',
  type text NOT NULL,
  path text,
  meta jsonb,
  created_at timestamptz DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  device text,
  locale text,
  country text
);

-- Signals table
CREATE TABLE IF NOT EXISTS public.signals (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  window text NOT NULL,
  k text NOT NULL,
  v numeric NOT NULL,
  meta jsonb,
  computed_at timestamptz DEFAULT NOW()
);

-- Conversion events table
CREATE TABLE IF NOT EXISTS public.conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  session_id text NOT NULL,
  properties jsonb,
  created_at timestamptz DEFAULT NOW()
);

-- User activations table
CREATE TABLE IF NOT EXISTS public.user_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  signup_date timestamptz NOT NULL,
  first_workflow_created_at timestamptz,
  time_to_activation_hours numeric,
  workflows_created integer DEFAULT 0,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- PMF metrics snapshots table
CREATE TABLE IF NOT EXISTS public.pmf_metrics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL UNIQUE,
  activation_rate numeric,
  seven_day_retention numeric,
  thirty_day_retention numeric,
  nps numeric,
  time_to_activation_hours numeric,
  workflows_per_user numeric,
  monthly_active_users integer,
  weekly_active_users integer,
  created_at timestamptz DEFAULT NOW()
);

-- NPS surveys table
CREATE TABLE IF NOT EXISTS public.nps_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  score integer CHECK (score >= 0 AND score <= 10),
  feedback text,
  created_at timestamptz DEFAULT NOW()
);

-- Affiliate clicks table
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id text NOT NULL,
  product text NOT NULL,
  session_id text,
  user_id uuid REFERENCES auth.users(id),
  referrer_url text,
  created_at timestamptz DEFAULT NOW()
);

-- Affiliate conversions table
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_click_id uuid REFERENCES affiliate_clicks(id),
  conversion_value numeric,
  commission numeric,
  created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS & METRICS TABLES
-- ============================================================================

-- Metrics log table
CREATE TABLE IF NOT EXISTS public.metrics_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ts timestamptz DEFAULT NOW(),
  source text NOT NULL,
  metric jsonb NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  endpoint text,
  response_time_ms integer,
  status_code integer,
  request_size_bytes integer,
  response_size_bytes integer,
  user_id uuid,
  session_id text,
  timestamp timestamptz DEFAULT NOW()
);

-- Business metrics table
CREATE TABLE IF NOT EXISTS public.business_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_name text NOT NULL,
  metric_value decimal,
  dimensions jsonb,
  timestamp timestamptz DEFAULT NOW(),
  period_start timestamptz,
  period_end timestamptz
);

-- System metrics table
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value decimal,
  metric_unit text,
  tags jsonb,
  timestamp timestamptz DEFAULT NOW(),
  source text NOT NULL
);

-- Metrics daily table (legacy, kept for compatibility)
CREATE TABLE IF NOT EXISTS public.metrics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL,
  sessions integer NOT NULL DEFAULT 0,
  add_to_carts integer NOT NULL DEFAULT 0,
  orders integer NOT NULL DEFAULT 0,
  revenue_cents integer NOT NULL DEFAULT 0,
  refunds_cents integer NOT NULL DEFAULT 0,
  aov_cents integer NOT NULL DEFAULT 0,
  cac_cents integer NOT NULL DEFAULT 0,
  conversion_rate numeric NOT NULL DEFAULT 0,
  gross_margin_cents integer NOT NULL DEFAULT 0,
  traffic integer NOT NULL DEFAULT 0
);

-- Spend table (legacy, kept for compatibility)
CREATE TABLE IF NOT EXISTS public.spend (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  campaign_id text,
  adset_id text,
  date date NOT NULL,
  spend_cents integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  conv integer NOT NULL DEFAULT 0
);

-- ============================================================================
-- AI & EMBEDDINGS TABLES
-- ============================================================================

-- AI embeddings table
CREATE TABLE IF NOT EXISTS public.ai_embeddings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace text NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- AI health metrics table
CREATE TABLE IF NOT EXISTS public.ai_health_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id text NOT NULL,
  environment text NOT NULL,
  timestamp timestamptz NOT NULL,
  metrics jsonb NOT NULL,
  patterns jsonb NOT NULL,
  recommendations text[] DEFAULT '{}',
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz DEFAULT NOW()
);

-- AI insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id text NOT NULL,
  environment text NOT NULL,
  insights jsonb NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- AI agents table
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  capabilities text[] DEFAULT '{}',
  model text NOT NULL,
  training_data text[] DEFAULT '{}',
  personality jsonb DEFAULT '{}',
  pricing jsonb DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'training', 'error')),
  metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Agent interactions table
CREATE TABLE IF NOT EXISTS public.agent_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES ai_agents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  input_text text NOT NULL,
  output_text text,
  processing_time decimal(10,3),
  cost decimal(10,4),
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- WORKFLOWS & AUTOMATION TABLES
-- ============================================================================

-- Workflows table (referenced by workflow_executions)
CREATE TABLE IF NOT EXISTS public.workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  definition jsonb NOT NULL DEFAULT '{}',
  config jsonb DEFAULT '{}',
  template_id text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
  created_by uuid REFERENCES auth.users(id),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Automation workflows table
CREATE TABLE IF NOT EXISTS public.automation_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_config jsonb NOT NULL,
  steps jsonb NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
  category text NOT NULL,
  tags text[],
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_data jsonb,
  output_data jsonb,
  results jsonb DEFAULT '{}',
  error text,
  error_message text,
  started_at timestamptz DEFAULT NOW(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- Step executions table
CREATE TABLE IF NOT EXISTS public.step_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id text NOT NULL,
  step_name text,
  step_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  input_data jsonb,
  output_data jsonb,
  error_message text,
  started_at timestamptz DEFAULT NOW(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- Workflow templates table
CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  price decimal(10,2) DEFAULT 0,
  nodes jsonb NOT NULL DEFAULT '[]',
  connections jsonb NOT NULL DEFAULT '[]',
  preview_url text,
  downloads integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0,
  tags text[] DEFAULT '{}',
  author_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Autopilot workflows table
CREATE TABLE IF NOT EXISTS public.autopilot_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger text NOT NULL CHECK (trigger IN ('lead_captured', 'lead_scored', 'lead_qualified', 'lead_unqualified', 'conversion', 'schedule')),
  conditions jsonb DEFAULT '{}',
  actions jsonb NOT NULL,
  enabled boolean DEFAULT true,
  tenant_id text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- LEAD GENERATION & CRM TABLES
-- ============================================================================

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  last_name text,
  company text,
  phone text,
  source text,
  campaign text,
  metadata jsonb DEFAULT '{}',
  score integer DEFAULT 0,
  qualified boolean DEFAULT false,
  priority text CHECK (priority IN ('hot', 'warm', 'cold')),
  score_factors jsonb,
  status text DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'contacted', 'converted', 'lost')),
  assigned_to uuid REFERENCES auth.users(id),
  assigned_at timestamptz,
  crm_id text,
  crm_provider text,
  crm_synced_at timestamptz,
  revenue decimal(10, 2),
  revenue_recorded_at timestamptz,
  converted_at timestamptz,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Lead activities table
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_data jsonb DEFAULT '{}',
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW()
);

-- Lead sources table
CREATE TABLE IF NOT EXISTS public.lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  config jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW()
);

-- Lead sessions table
CREATE TABLE IF NOT EXISTS public.lead_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  session_id text,
  duration integer,
  page_views integer DEFAULT 0,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW()
);

-- Lead touchpoints table
CREATE TABLE IF NOT EXISTS public.lead_touchpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  source text,
  type text,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW()
);

-- Email interactions table
CREATE TABLE IF NOT EXISTS public.email_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  email_id text,
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  replied boolean DEFAULT false,
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW()
);

-- Email queue table
CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  template text NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  subject text,
  body text,
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  type text,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Nurturing sequences table
CREATE TABLE IF NOT EXISTS public.nurturing_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  steps jsonb NOT NULL,
  trigger text,
  trigger_score integer,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Nurturing enrollments table
CREATE TABLE IF NOT EXISTS public.nurturing_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  sequence_id uuid REFERENCES nurturing_sequences(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT NOW(),
  completed_at timestamptz,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE
);

-- Nurturing schedule table
CREATE TABLE IF NOT EXISTS public.nurturing_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  sequence_id uuid REFERENCES nurturing_sequences(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  scheduled_at timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped', 'failed')),
  completed_at timestamptz,
  failure_reason text,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW()
);

-- CRM sync log table
CREATE TABLE IF NOT EXISTS public.crm_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  provider text NOT NULL,
  success boolean DEFAULT false,
  error_message text,
  synced_at timestamptz DEFAULT NOW(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE
);

-- Conversions table
CREATE TABLE IF NOT EXISTS public.conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('signup', 'trial', 'purchase', 'demo', 'download', 'custom')),
  value decimal(10, 2) DEFAULT 0,
  currency text DEFAULT 'USD',
  metadata jsonb DEFAULT '{}',
  attribution jsonb,
  converted_at timestamptz DEFAULT NOW(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE
);

-- Marketing costs table
CREATE TABLE IF NOT EXISTS public.marketing_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  campaign text,
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  date date NOT NULL,
  type text CHECK (type IN ('advertising', 'content', 'event', 'tool', 'other')),
  metadata jsonb DEFAULT '{}',
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  recorded_at timestamptz DEFAULT NOW()
);

-- Campaign costs table
CREATE TABLE IF NOT EXISTS public.campaign_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign text NOT NULL,
  total_cost decimal(10, 2) NOT NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- ROI tracking table
CREATE TABLE IF NOT EXISTS public.roi_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  campaign text,
  source text,
  revenue decimal(10, 2),
  cost decimal(10, 2),
  roi decimal(10, 2),
  roas decimal(10, 2),
  calculated_at timestamptz DEFAULT NOW(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE
);

-- Revenue events table
CREATE TABLE IF NOT EXISTS public.revenue_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  metadata jsonb DEFAULT '{}',
  recorded_at timestamptz DEFAULT NOW(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE
);

-- A/B tests table
CREATE TABLE IF NOT EXISTS public.ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('landing_page', 'email', 'campaign', 'form')),
  variations jsonb NOT NULL,
  traffic_split integer[],
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- A/B test assignments table
CREATE TABLE IF NOT EXISTS public.ab_test_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES ab_tests(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  variation_id text NOT NULL,
  assigned_at timestamptz DEFAULT NOW(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE(test_id, visitor_id)
);

-- A/B test conversions table
CREATE TABLE IF NOT EXISTS public.ab_test_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES ab_tests(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  variation_id text NOT NULL,
  conversion_type text NOT NULL,
  value decimal(10, 2) DEFAULT 0,
  converted_at timestamptz DEFAULT NOW(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE
);

-- ============================================================================
-- PRIVACY & COMPLIANCE TABLES
-- ============================================================================

-- Privacy consents table
CREATE TABLE IF NOT EXISTS public.privacy_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_id text UNIQUE NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}',
  jurisdiction text NOT NULL DEFAULT 'EU',
  consent_version text NOT NULL DEFAULT '2.1',
  ip_address inet,
  user_agent text,
  data_processing_purposes text[],
  retention_period integer NOT NULL DEFAULT 365,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Data subjects table
CREATE TABLE IF NOT EXISTS public.data_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_id text REFERENCES privacy_consents(consent_id),
  email text UNIQUE,
  phone text,
  external_id text,
  data_residency_region text DEFAULT 'US',
  consent_status text DEFAULT 'pending' CHECK (consent_status IN ('pending', 'granted', 'withdrawn', 'expired')),
  consent_version text,
  consent_timestamp timestamptz,
  data_categories text[],
  processing_basis text NOT NULL DEFAULT 'consent',
  data_retention_until timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Consent records table
CREATE TABLE IF NOT EXISTS public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_subject_id uuid REFERENCES data_subjects(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  purpose text NOT NULL,
  granted boolean NOT NULL,
  consent_method text,
  ip_address inet,
  user_agent text,
  consent_timestamp timestamptz DEFAULT NOW(),
  expires_at timestamptz,
  withdrawn_at timestamptz,
  version text DEFAULT '1.0'
);

-- Data subject requests table
CREATE TABLE IF NOT EXISTS public.data_subject_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_subject_id uuid REFERENCES data_subjects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  description text,
  request_data jsonb,
  response_data jsonb,
  verification_method text,
  verification_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  completed_at timestamptz,
  due_date timestamptz
);

-- Data processing activities table
CREATE TABLE IF NOT EXISTS public.data_processing_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  purpose text NOT NULL,
  legal_basis text NOT NULL,
  data_categories text[],
  data_subjects text[],
  recipients text[],
  third_country_transfers boolean DEFAULT false,
  retention_period integer,
  technical_measures jsonb,
  organizational_measures jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Compliance reports table
CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('gdpr', 'ccpa', 'sox', 'hipaa', 'pci')),
  status text NOT NULL CHECK (status IN ('compliant', 'non_compliant', 'partial', 'pending')),
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  issues jsonb DEFAULT '[]',
  recommendations text[] DEFAULT '{}',
  generated_at timestamptz DEFAULT NOW(),
  valid_until timestamptz NOT NULL
);

-- Compliance metrics table
CREATE TABLE IF NOT EXISTS public.compliance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  value numeric NOT NULL,
  target_value numeric,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Trust badges table
CREATE TABLE IF NOT EXISTS public.trust_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  issuer text NOT NULL,
  category text NOT NULL,
  level text NOT NULL,
  status text DEFAULT 'verified' CHECK (status IN ('verified', 'pending', 'expired')),
  verification_date date,
  expiry_date date,
  created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- SECURITY & AUDIT TABLES
-- ============================================================================

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  timestamp timestamptz DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW(),
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Security events table
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source_ip inet,
  user_id uuid REFERENCES auth.users(id),
  resource_type text,
  resource_id text,
  action text NOT NULL,
  details jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT NOW(),
  resolved_at timestamptz,
  status text DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive'))
);

-- Threat detections table
CREATE TABLE IF NOT EXISTS public.threat_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  ip_address inet,
  threat_type text NOT NULL,
  risk_score integer NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  details jsonb,
  mitigated boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW()
);

-- Failed login attempts table
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  ip_address inet NOT NULL,
  user_agent text,
  attempt_count integer DEFAULT 1,
  last_attempt timestamptz DEFAULT NOW(),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- Security policies table
CREATE TABLE IF NOT EXISTS public.security_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  policy_type text NOT NULL CHECK (policy_type IN ('access_control', 'data_protection', 'audit', 'compliance')),
  rules jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Rate limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamptz DEFAULT NOW() NOT NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  UNIQUE(identifier, endpoint)
);

-- ============================================================================
-- TRUST & GUARDIAN TABLES
-- ============================================================================

-- Trust ledger roots table
CREATE TABLE IF NOT EXISTS public.trust_ledger_roots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  hash_root text NOT NULL,
  event_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Guardian preferences table
CREATE TABLE IF NOT EXISTS public.guardian_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  trust_level text NOT NULL DEFAULT 'balanced' CHECK (trust_level IN ('strict', 'balanced', 'relaxed')),
  auto_adjust boolean DEFAULT true,
  risk_weights jsonb DEFAULT '{}',
  disabled_scopes text[] DEFAULT ARRAY[]::TEXT[],
  disabled_data_classes text[] DEFAULT ARRAY[]::TEXT[],
  sensitive_contexts text[] DEFAULT ARRAY[]::TEXT[],
  private_mode_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Guardian events table
CREATE TABLE IF NOT EXISTS public.guardian_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  scope text NOT NULL,
  data_class text NOT NULL,
  risk_level text NOT NULL,
  risk_score numeric NOT NULL,
  action_taken text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  fingerprint text NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- MARKETPLACE & INTEGRATIONS TABLES
-- ============================================================================

-- Marketplace items table
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('template', 'agent', 'integration', 'app')),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price decimal(10,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  author_id uuid REFERENCES auth.users(id),
  downloads integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0,
  reviews integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  preview_url text,
  documentation_url text,
  requirements text[] DEFAULT '{}',
  compatibility text[] DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected', 'archived')),
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Integrations table
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('shopify', 'wave', 'stripe', 'gmail', 'slack', 'notion')),
  shop text,
  business_id text,
  status text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  configuration jsonb DEFAULT '{}',
  capabilities text[] DEFAULT '{}',
  pricing jsonb DEFAULT '{}',
  documentation_url text,
  support_info jsonb DEFAULT '{}',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  active boolean DEFAULT true,
  connected_at timestamptz DEFAULT NOW(),
  disconnected_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Tenant integrations table
CREATE TABLE IF NOT EXISTS public.tenant_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE,
  configuration jsonb DEFAULT '{}',
  credentials jsonb DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_sync timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(tenant_id, integration_id)
);

-- API services table
CREATE TABLE IF NOT EXISTS public.api_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  endpoint text NOT NULL,
  method text NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  pricing jsonb DEFAULT '{}',
  documentation_url text,
  sdk_languages text[] DEFAULT '{}',
  rate_limits jsonb DEFAULT '{}',
  authentication jsonb DEFAULT '{}',
  examples jsonb DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'beta', 'deprecated')),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- API usage table
CREATE TABLE IF NOT EXISTS public.api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  api_service_id uuid REFERENCES api_services(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer,
  response_time decimal(10,3),
  cost decimal(10,4),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW()
);

-- API logs table
CREATE TABLE IF NOT EXISTS public.api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text NOT NULL,
  path text NOT NULL,
  status_code integer,
  response_time_ms integer,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  request_body jsonb,
  response_body jsonb,
  error_message text,
  created_at timestamptz DEFAULT NOW()
);

-- Revenue streams table
CREATE TABLE IF NOT EXISTS public.revenue_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('subscription', 'usage', 'one_time', 'commission', 'licensing')),
  name text NOT NULL,
  description text,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  period text,
  item_id uuid,
  item_type text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- APPOINTMENTS & MEETINGS TABLES
-- ============================================================================

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  meeting_type text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  organizer_id uuid REFERENCES auth.users(id),
  location text,
  meeting_url text,
  participants jsonb,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Appointment reminders table
CREATE TABLE IF NOT EXISTS public.appointment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type text NOT NULL,
  timing_hours integer NOT NULL,
  sent_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at timestamptz DEFAULT NOW()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  organizer_id uuid REFERENCES auth.users(id),
  participants jsonb,
  meeting_url text,
  recording_url text,
  created_at timestamptz DEFAULT NOW()
);

-- Meeting notes table
CREATE TABLE IF NOT EXISTS public.meeting_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  transcription text,
  summary text,
  action_items jsonb,
  insights jsonb,
  format text DEFAULT 'text' CHECK (format IN ('text', 'markdown', 'structured', 'ai_enhanced')),
  ai_enhanced boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- DESIGN & PROJECTS TABLES
-- ============================================================================

-- Design projects table
CREATE TABLE IF NOT EXISTS public.design_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  project_type text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'completed', 'archived')),
  owner_id uuid REFERENCES auth.users(id),
  collaborators jsonb,
  ai_assistance boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Design versions table
CREATE TABLE IF NOT EXISTS public.design_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES design_projects(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  design_data jsonb NOT NULL,
  ai_enhanced boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- COMMUNITY & SOCIAL TABLES
-- ============================================================================

-- Community posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('question', 'tip', 'showcase', 'announcement')),
  tags text[] DEFAULT '{}',
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  views integer DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Expert profiles table
CREATE TABLE IF NOT EXISTS public.expert_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  name text NOT NULL,
  title text,
  company text,
  bio text,
  avatar_url text,
  expertise text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  rating decimal(3,2) DEFAULT 0,
  projects integer DEFAULT 0,
  followers integer DEFAULT 0,
  verified boolean DEFAULT false,
  availability text DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  hourly_rate decimal(10,2),
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Communication channels table
CREATE TABLE IF NOT EXISTS public.communication_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'slack', 'teams', 'discord', 'webhook')),
  configuration jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- BLOG & CONTENT TABLES
-- ============================================================================

-- Blog comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES blog_comments(id) ON DELETE CASCADE,
  approved boolean DEFAULT false,
  moderation_score decimal(3, 2),
  moderation_reasons text[],
  systems_thinking_insight text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  tenant_id text
);

-- ============================================================================
-- CHAT & CONVERSATIONS TABLES
-- ============================================================================

-- Chat conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- ORCHESTRATOR & MONITORING TABLES
-- ============================================================================

-- Orchestrator reports table
CREATE TABLE IF NOT EXISTS public.orchestrator_reports (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cycle integer NOT NULL,
  timestamp timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  report jsonb NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Dependency reports table
CREATE TABLE IF NOT EXISTS public.dependency_reports (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  report jsonb NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Cost forecasts table
CREATE TABLE IF NOT EXISTS public.cost_forecasts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  forecast jsonb NOT NULL,
  trends jsonb,
  created_at timestamptz DEFAULT NOW()
);

-- Security audits table
CREATE TABLE IF NOT EXISTS public.security_audits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  audit jsonb NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- DEMO & TUTORIAL TABLES
-- ============================================================================

-- Demo environments table
CREATE TABLE IF NOT EXISTS public.demo_environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('workflow', 'agent', 'integration', 'app')),
  configuration jsonb DEFAULT '{}',
  data jsonb DEFAULT '{}',
  permissions text[] DEFAULT '{}',
  time_limit integer DEFAULT 60,
  max_users integer DEFAULT 10,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Interactive tutorials table
CREATE TABLE IF NOT EXISTS public.interactive_tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  steps jsonb NOT NULL DEFAULT '[]',
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration integer DEFAULT 30,
  prerequisites text[] DEFAULT '{}',
  outcomes text[] DEFAULT '{}',
  resources jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Note: Indexes are created after tables to ensure all tables exist

-- Core User Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_tenant_id ON user_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_tenant ON user_settings(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_apps_user_id ON user_apps(user_id);

-- Multi-Tenant Indexes
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_tier ON subscription_plans(tier);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_role ON tenant_members(role);
CREATE INDEX IF NOT EXISTS idx_tenant_members_status ON tenant_members(status);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_tenant_active ON tenant_members(user_id, tenant_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_tenant_usage_tenant_id ON tenant_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_metric_type ON tenant_usage(metric_type);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_period ON tenant_usage(period_start, period_end);

-- Gamification Indexes
CREATE INDEX IF NOT EXISTS idx_badges_code ON badges(code);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_id ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_period ON leaderboard_entries(period, period_start);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_moderation_flags_post_id ON moderation_flags(post_id);
CREATE INDEX IF NOT EXISTS idx_moderation_flags_comment_id ON moderation_flags(comment_id);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_user_id ON subscription_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_quests_user_id ON onboarding_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_segments_code ON segments(code);
CREATE INDEX IF NOT EXISTS idx_user_segments_user_id ON user_segments(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_diagnostics_user_id ON support_diagnostics(user_id);

-- Events & Telemetry Indexes
CREATE INDEX IF NOT EXISTS idx_app_events_user_id ON app_events(user_id);
CREATE INDEX IF NOT EXISTS idx_app_events_type ON app_events(type);
CREATE INDEX IF NOT EXISTS idx_app_events_created_at ON app_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON signals(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_event_type ON conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activations_signup_date ON user_activations(signup_date);
CREATE INDEX IF NOT EXISTS idx_user_activations_first_workflow ON user_activations(first_workflow_created_at);
CREATE INDEX IF NOT EXISTS idx_pmf_metrics_date ON pmf_metrics_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_user_id ON nps_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON affiliate_clicks(product);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at);

-- Analytics & Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_metrics_log_source ON metrics_log(source);
CREATE INDEX IF NOT EXISTS idx_metrics_log_ts ON metrics_log(ts DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_service ON performance_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_type ON business_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_business_metrics_timestamp ON business_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_daily_day ON metrics_daily(day);
CREATE INDEX IF NOT EXISTS idx_spend_platform_dt ON spend(platform, date);
CREATE INDEX IF NOT EXISTS idx_events_name_time ON events(event_name, occurred_at);

-- AI & Embeddings Indexes
CREATE INDEX IF NOT EXISTS ai_embeddings_embedding_idx ON ai_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS ai_embeddings_namespace_idx ON ai_embeddings(namespace);
CREATE INDEX IF NOT EXISTS ai_embeddings_metadata_idx ON ai_embeddings USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_deployment ON ai_health_metrics(deployment_id, environment);
CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_timestamp ON ai_health_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_severity ON ai_health_metrics(severity);
CREATE INDEX IF NOT EXISTS idx_ai_insights_deployment ON ai_insights(deployment_id, environment);
CREATE INDEX IF NOT EXISTS idx_ai_insights_timestamp ON ai_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agents_tenant_id ON ai_agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON ai_agents(status);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_agent_id ON agent_interactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_tenant_id ON agent_interactions(tenant_id);

-- Workflows & Automation Indexes
CREATE INDEX IF NOT EXISTS idx_workflows_tenant_id ON workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_status ON automation_workflows(status);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_category ON automation_workflows(category);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_created_by ON automation_workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_created ON workflow_executions(workflow_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_step_executions_execution_id ON step_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tenant_id ON workflow_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_autopilot_workflows_trigger ON autopilot_workflows(trigger, enabled);
CREATE INDEX IF NOT EXISTS idx_autopilot_workflows_tenant ON autopilot_workflows(tenant_id);

-- Lead Generation & CRM Indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_qualified ON leads(qualified);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_email_interactions_lead ON email_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_sessions_lead ON lead_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_email_queue_lead ON email_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_tenant ON email_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nurturing_sequences_tenant ON nurturing_sequences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nurturing_enrollments_lead ON nurturing_enrollments(lead_id);
CREATE INDEX IF NOT EXISTS idx_nurturing_enrollments_sequence ON nurturing_enrollments(sequence_id);
CREATE INDEX IF NOT EXISTS idx_nurturing_schedule_due ON nurturing_schedule(scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_nurturing_schedule_lead ON nurturing_schedule(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_log_lead ON crm_sync_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_log_provider ON crm_sync_log(provider);
CREATE INDEX IF NOT EXISTS idx_conversions_lead ON conversions(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversions_type ON conversions(type);
CREATE INDEX IF NOT EXISTS idx_conversions_date ON conversions(converted_at);
CREATE INDEX IF NOT EXISTS idx_lead_touchpoints_lead ON lead_touchpoints(lead_id);
CREATE INDEX IF NOT EXISTS idx_marketing_costs_source ON marketing_costs(source);
CREATE INDEX IF NOT EXISTS idx_marketing_costs_campaign ON marketing_costs(campaign);
CREATE INDEX IF NOT EXISTS idx_marketing_costs_date ON marketing_costs(date);
CREATE INDEX IF NOT EXISTS idx_campaign_costs_campaign ON campaign_costs(campaign);
CREATE INDEX IF NOT EXISTS idx_roi_tracking_lead ON roi_tracking(lead_id);
CREATE INDEX IF NOT EXISTS idx_roi_tracking_campaign ON roi_tracking(campaign);
CREATE INDEX IF NOT EXISTS idx_revenue_events_lead ON revenue_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_date ON revenue_events(recorded_at);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_tenant ON ab_tests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_test ON ab_test_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_visitor ON ab_test_assignments(visitor_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_test ON ab_test_conversions(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_variation ON ab_test_conversions(variation_id);

-- Privacy & Compliance Indexes
CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_id ON privacy_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_consents_consent_id ON privacy_consents(consent_id);
CREATE INDEX IF NOT EXISTS idx_data_subjects_user_id ON data_subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_data_subjects_email ON data_subjects(email);
CREATE INDEX IF NOT EXISTS idx_data_subjects_consent_status ON data_subjects(consent_status);
CREATE INDEX IF NOT EXISTS idx_data_subjects_region ON data_subjects(data_residency_region);
CREATE INDEX IF NOT EXISTS idx_consent_records_subject_id ON consent_records(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_type ON consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_records_timestamp ON consent_records(consent_timestamp);
CREATE INDEX IF NOT EXISTS idx_dsr_subject_id ON data_subject_requests(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_dsr_type ON data_subject_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_dsr_status ON data_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_dsr_created_at ON data_subject_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_tenant_id ON compliance_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports(type);
CREATE INDEX IF NOT EXISTS idx_trust_badges_badge_id ON trust_badges(badge_id);

-- Security & Audit Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_ts ON audit_log(ts DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_source_ip ON security_events(source_ip);
CREATE INDEX IF NOT EXISTS idx_threat_detections_user_id ON threat_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_failed_logins_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_logins_created_at ON failed_login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, endpoint);

-- Trust & Guardian Indexes
CREATE INDEX IF NOT EXISTS idx_trust_ledger_roots_user_id ON trust_ledger_roots(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_ledger_roots_date ON trust_ledger_roots(date);
CREATE INDEX IF NOT EXISTS idx_guardian_preferences_user_id ON guardian_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_guardian_events_user_id ON guardian_events(user_id);
CREATE INDEX IF NOT EXISTS idx_guardian_events_created_at ON guardian_events(created_at);
CREATE INDEX IF NOT EXISTS idx_guardian_events_risk_level ON guardian_events(risk_level);
CREATE INDEX IF NOT EXISTS idx_guardian_events_scope ON guardian_events(scope);

-- Marketplace & Integrations Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_items_type ON marketplace_items(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_tenant_id ON tenant_integrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_services_method ON api_services(method);
CREATE INDEX IF NOT EXISTS idx_api_usage_tenant_id ON api_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_service_id ON api_usage(api_service_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_tenant_id ON revenue_streams(tenant_id);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_type ON revenue_streams(type);

-- Appointments & Meetings Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_organizer_id ON appointments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment_id ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_meetings_organizer_id ON meetings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_meeting_id ON meeting_notes(meeting_id);

-- Design & Projects Indexes
CREATE INDEX IF NOT EXISTS idx_design_projects_owner_id ON design_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_design_versions_project_id ON design_versions(project_id);

-- Community & Social Indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(type);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_user_id ON expert_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_channels_tenant_id ON communication_channels(tenant_id);

-- Blog & Content Indexes
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_slug ON blog_comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON blog_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_comments_tenant ON blog_comments(tenant_id);

-- Chat & Conversations Indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- Orchestrator Indexes
CREATE INDEX IF NOT EXISTS idx_orchestrator_reports_cycle ON orchestrator_reports(cycle);
CREATE INDEX IF NOT EXISTS idx_orchestrator_reports_timestamp ON orchestrator_reports(timestamp DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================
-- Note: Helper functions (has_role, is_admin, update_updated_at_column, handle_updated_at) 
-- are already defined in the HELPER FUNCTIONS section above

-- Tenant Management Functions
CREATE OR REPLACE FUNCTION public.create_tenant(
  p_name TEXT,
  p_subdomain TEXT,
  p_plan_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  INSERT INTO tenants (name, subdomain, plan_id)
  VALUES (p_name, p_subdomain, p_plan_id)
  RETURNING id INTO new_tenant_id;
  
  -- Add creator as tenant admin
  INSERT INTO tenant_members (tenant_id, user_id, role, permissions)
  VALUES (new_tenant_id, auth.uid(), 'admin', '{"all": true}')
  ON CONFLICT (tenant_id, user_id) DO NOTHING;
  
  RETURN new_tenant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_tenant_member(
  p_tenant_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'member',
  p_permissions JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_member_id UUID;
BEGIN
  INSERT INTO tenant_members (tenant_id, user_id, role, permissions, invited_by)
  VALUES (p_tenant_id, p_user_id, p_role, p_permissions, auth.uid())
  RETURNING id INTO new_member_id;
  
  RETURN new_member_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_tenant_member(
  p_tenant_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE tenant_members 
  SET status = 'removed', updated_at = NOW()
  WHERE tenant_id = p_tenant_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_tenant_member_role(
  p_tenant_id UUID,
  p_user_id UUID,
  p_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE tenant_members 
  SET role = p_role, updated_at = NOW()
  WHERE tenant_id = p_tenant_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(
  p_tenant_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_members 
    WHERE tenant_id = p_tenant_id 
    AND user_id = p_user_id 
    AND status = 'active'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_tenant_member_role(
  p_tenant_id UUID,
  p_user_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_role TEXT;
BEGIN
  SELECT role INTO member_role
  FROM tenant_members 
  WHERE tenant_id = p_tenant_id 
  AND user_id = p_user_id 
  AND status = 'active';
  
  RETURN COALESCE(member_role, 'none');
END;
$$;

CREATE OR REPLACE FUNCTION public.track_usage(
  p_tenant_id UUID,
  p_metric_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO tenant_usage (tenant_id, metric_type, usage_count, period_start, period_end)
  VALUES (
    p_tenant_id,
    p_metric_type,
    p_increment,
    date_trunc('month', NOW()),
    date_trunc('month', NOW()) + INTERVAL '1 month'
  )
  ON CONFLICT (tenant_id, metric_type, period_start)
  DO UPDATE SET usage_count = tenant_usage.usage_count + p_increment;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_tenant_limit(
  p_tenant_id UUID,
  p_metric_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_usage INTEGER;
  limit_value INTEGER;
  tenant_limits JSONB;
BEGIN
  SELECT COALESCE(SUM(usage_count), 0)
  INTO current_usage
  FROM tenant_usage
  WHERE tenant_id = p_tenant_id
    AND metric_type = p_metric_type
    AND period_start = date_trunc('month', NOW());
  
  SELECT limits INTO tenant_limits
  FROM tenants
  WHERE id = p_tenant_id;
  
  limit_value := (tenant_limits->>p_metric_type)::INTEGER;
  
  IF limit_value = -1 THEN
    RETURN TRUE;
  END IF;
  
  RETURN current_usage < limit_value;
END;
$$;

-- AI & Embeddings Functions
CREATE OR REPLACE FUNCTION public.search_embeddings(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  filter_namespace TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  namespace TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ai_embeddings.id,
    ai_embeddings.namespace,
    ai_embeddings.content,
    ai_embeddings.metadata,
    1 - (ai_embeddings.embedding <=> query_embedding) AS similarity
  FROM ai_embeddings
  WHERE
    (filter_namespace IS NULL OR ai_embeddings.namespace = filter_namespace)
    AND 1 - (ai_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY ai_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

CREATE OR REPLACE FUNCTION public.hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  filter_namespace TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  namespace TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  rank FLOAT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH semantic_search AS (
    SELECT
      ai_embeddings.id,
      ai_embeddings.namespace,
      ai_embeddings.content,
      ai_embeddings.metadata,
      1 - (ai_embeddings.embedding <=> query_embedding) AS similarity,
      0.7 AS weight
    FROM ai_embeddings
    WHERE
      (filter_namespace IS NULL OR ai_embeddings.namespace = filter_namespace)
      AND 1 - (ai_embeddings.embedding <=> query_embedding) > match_threshold
  ),
  keyword_search AS (
    SELECT
      ai_embeddings.id,
      ai_embeddings.namespace,
      ai_embeddings.content,
      ai_embeddings.metadata,
      ts_rank(to_tsvector('english', ai_embeddings.content), plainto_tsquery('english', query_text)) AS similarity,
      0.3 AS weight
    FROM ai_embeddings
    WHERE
      (filter_namespace IS NULL OR ai_embeddings.namespace = filter_namespace)
      AND to_tsvector('english', ai_embeddings.content) @@ plainto_tsquery('english', query_text)
  ),
  combined_search AS (
    SELECT * FROM semantic_search
    UNION ALL
    SELECT * FROM keyword_search
  )
  SELECT
    id,
    namespace,
    content,
    metadata,
    similarity,
    (similarity * weight) AS rank
  FROM combined_search
  ORDER BY rank DESC
  LIMIT match_count;
$$;

-- Guardian Functions
CREATE OR REPLACE FUNCTION public.get_guardian_summary(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  summary JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_events', COUNT(*),
    'high_risk_events', COUNT(*) FILTER (WHERE risk_level = 'high'),
    'medium_risk_events', COUNT(*) FILTER (WHERE risk_level = 'medium'),
    'low_risk_events', COUNT(*) FILTER (WHERE risk_level = 'low'),
    'avg_risk_score', AVG(risk_score),
    'most_common_scope', MODE() WITHIN GROUP (ORDER BY scope),
    'most_common_data_class', MODE() WITHIN GROUP (ORDER BY data_class)
  ) INTO summary
  FROM guardian_events
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  RETURN COALESCE(summary, '{}'::jsonb);
END;
$$;

-- Analytics Functions
CREATE OR REPLACE FUNCTION public.upsert_events(_rows jsonb)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _r jsonb; _ins int := 0;
BEGIN
  FOR _r IN SELECT * FROM jsonb_array_elements(_rows)
  LOOP
    INSERT INTO public.events AS e(id, occurred_at, user_id, event_name, props)
    VALUES (
      COALESCE((_r->>'id')::uuid, gen_random_uuid()),
      COALESCE((_r->>'occurred_at')::timestamptz, now()),
      NULLIF(_r->>'user_id','')::uuid,
      _r->>'event_name',
      COALESCE((_r->'props')::jsonb, '{}'::jsonb)
    )
    ON CONFLICT (id) DO UPDATE
      SET occurred_at = EXCLUDED.occurred_at,
          user_id     = EXCLUDED.user_id,
          event_name  = EXCLUDED.event_name,
          props       = EXCLUDED.props;
    _ins := _ins + 1;
  END LOOP;
  RETURN COALESCE(_ins,0);
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_spend(_rows jsonb)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _r jsonb; _ins int := 0;
BEGIN
  FOR _r IN SELECT * FROM jsonb_array_elements(_rows)
  LOOP
    INSERT INTO public.spend AS s(id, platform, campaign_id, adset_id, date, spend_cents, clicks, impressions, conv)
    VALUES (
      COALESCE((_r->>'id')::uuid, gen_random_uuid()),
      _r->>'platform',
      _r->>'campaign_id',
      _r->>'adset_id',
      (_r->>'date')::date,
      COALESCE((_r->>'spend_cents')::int,0),
      COALESCE((_r->>'clicks')::int,0),
      COALESCE((_r->>'impressions')::int,0),
      COALESCE((_r->>'conv')::int,0)
    )
    ON CONFLICT (id) DO UPDATE
      SET platform    = EXCLUDED.platform,
          campaign_id = EXCLUDED.campaign_id,
          adset_id    = EXCLUDED.adset_id,
          date        = EXCLUDED.date,
          spend_cents = EXCLUDED.spend_cents,
          clicks      = EXCLUDED.clicks,
          impressions = EXCLUDED.impressions,
          conv        = EXCLUDED.conv;
    _ins := _ins + 1;
  END LOOP;
  RETURN COALESCE(_ins,0);
END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_metrics_daily(_start date, _end date)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.metrics_daily WHERE day BETWEEN _start AND _end;
  INSERT INTO public.metrics_daily(day, sessions, add_to_carts, orders, revenue_cents, refunds_cents, aov_cents, cac_cents, conversion_rate, gross_margin_cents, traffic)
  SELECT d::date, 0,0,
    COALESCE((SELECT count(*) FROM public.events e WHERE e.event_name='order_completed' AND e.occurred_at::date=d),0),
    COALESCE((SELECT sum((e.props->>'revenue_cents')::int) FROM public.events e WHERE e.event_name='order_completed' AND e.occurred_at::date=d),0),
    COALESCE((SELECT sum((e.props->>'refunds_cents')::int) FROM public.events e WHERE e.event_name='order_refunded'  AND e.occurred_at::date=d),0),
    0,
    COALESCE((SELECT sum(spend_cents) FROM public.spend s WHERE s.date=d),0),
    0,
    0,
    COALESCE((SELECT sum(clicks) FROM public.spend s WHERE s.date=d),0)
  FROM generate_series(_start, _end, '1 day') d;
  UPDATE public.metrics_daily
     SET aov_cents = CASE WHEN orders>0 THEN revenue_cents/GREATEST(orders,1) ELSE 0 END,
         conversion_rate = CASE WHEN traffic>0 THEN orders::numeric/traffic ELSE 0 END
   WHERE day BETWEEN _start AND _end;
END;
$$;

CREATE OR REPLACE FUNCTION public.system_healthcheck()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v jsonb;
BEGIN
  SELECT jsonb_build_object(
    'events', (SELECT count(*) FROM public.events),
    'spend_days', (SELECT count(DISTINCT date) FROM public.spend),
    'metrics_days', (SELECT count(*) FROM public.metrics_daily)
  ) INTO v;
  RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_latest_metrics_per_source(limit_count INT DEFAULT 100)
RETURNS TABLE (
  source TEXT,
  metric JSONB,
  ts TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT source, metric, ts
  FROM metrics_log
  ORDER BY ts DESC
  LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION public.get_metrics_trends(days_back INT DEFAULT 7)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trends JSONB;
BEGIN
  SELECT jsonb_build_object(
    'period_days', days_back,
    'total_metrics', COUNT(*),
    'sources', jsonb_agg(DISTINCT source),
    'earliest', MIN(ts),
    'latest', MAX(ts)
  ) INTO trends
  FROM metrics_log
  WHERE ts >= NOW() - (days_back || ' days')::INTERVAL;
  
  RETURN COALESCE(trends, '{}'::jsonb);
END;
$$;

-- PMF Analytics Functions
CREATE OR REPLACE FUNCTION public.calculate_activation_rate(days_back INTEGER DEFAULT 30)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.calculate_retention_rate(days_after INTEGER, days_back INTEGER DEFAULT 30)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.calculate_nps(days_back INTEGER DEFAULT 30)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_pmf_metrics_snapshot()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  activation_rate_val := calculate_activation_rate(30);
  seven_day_retention_val := calculate_retention_rate(7, 30);
  thirty_day_retention_val := calculate_retention_rate(30, 60);
  nps_val := calculate_nps(30);
  
  SELECT AVG(EXTRACT(EPOCH FROM (first_workflow_created_at - signup_date)) / 3600)
  INTO time_to_activation_val
  FROM user_activations
  WHERE first_workflow_created_at IS NOT NULL
    AND signup_date >= NOW() - '30 days'::INTERVAL;
  
  SELECT AVG(workflows_created)
  INTO workflows_per_user_val
  FROM user_activations
  WHERE signup_date >= NOW() - '30 days'::INTERVAL;
  
  SELECT COUNT(DISTINCT user_id) INTO mau
  FROM user_activations
  WHERE last_active_at >= NOW() - '30 days'::INTERVAL;
  
  SELECT COUNT(DISTINCT user_id) INTO wau
  FROM user_activations
  WHERE last_active_at >= NOW() - '7 days'::INTERVAL;
  
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
$$;

CREATE OR REPLACE FUNCTION public.update_user_activations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- User Settings Functions
CREATE OR REPLACE FUNCTION public.get_or_create_user_settings(
  p_user_id UUID,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings_id UUID;
BEGIN
  INSERT INTO user_settings (user_id, tenant_id)
  VALUES (p_user_id, p_tenant_id)
  ON CONFLICT (user_id, tenant_id) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO settings_id;
  
  RETURN settings_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF p_notification_ids IS NULL THEN
    UPDATE notifications
    SET read = true, read_at = NOW()
    WHERE user_id = p_user_id AND read = false;
  ELSE
    UPDATE notifications
    SET read = true, read_at = NOW()
    WHERE user_id = p_user_id AND id = ANY(p_notification_ids);
  END IF;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unread_notification_count(
  p_user_id UUID,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM notifications
  WHERE user_id = p_user_id
    AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
    AND read = false
    AND archived = false;
  
  RETURN COALESCE(unread_count, 0);
END;
$$;

-- Blog Functions
CREATE OR REPLACE FUNCTION public.update_blog_comments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_blog_post_comment_count(post_slug_param TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  comment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO comment_count
  FROM blog_comments
  WHERE post_slug = post_slug_param
    AND status = 'approved';
  
  RETURN COALESCE(comment_count, 0);
END;
$$;

-- Security Functions
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_events (
    event_type,
    severity,
    user_id,
    resource_type,
    resource_id,
    action,
    details,
    created_at
  ) VALUES (
    'data_change',
    'medium',
    COALESCE(current_setting('app.current_user_id', true)::uuid, auth.uid()),
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    TG_OP,
    jsonb_build_object(
      'old_data', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      'new_data', CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    ),
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.check_failed_login_attempts(
  p_email TEXT,
  p_ip_address INET
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
  blocked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT 
    attempt_count,
    blocked_until
  INTO 
    attempt_count,
    blocked_until
  FROM failed_login_attempts
  WHERE email = p_email OR ip_address = p_ip_address
  ORDER BY last_attempt DESC
  LIMIT 1;
  
  IF blocked_until IS NOT NULL AND blocked_until > NOW() THEN
    RETURN FALSE;
  END IF;
  
  IF attempt_count >= 5 THEN
    UPDATE failed_login_attempts
    SET blocked_until = NOW() + INTERVAL '15 minutes'
    WHERE email = p_email OR ip_address = p_ip_address;
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_failed_login_attempt(
  p_email TEXT,
  p_ip_address INET,
  p_user_agent TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO failed_login_attempts (email, ip_address, user_agent, attempt_count)
  VALUES (p_email, p_ip_address, p_user_agent, 1)
  ON CONFLICT (email, ip_address) 
  DO UPDATE SET 
    attempt_count = failed_login_attempts.attempt_count + 1,
    last_attempt = NOW(),
    user_agent = p_user_agent;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_failed_login_attempts(
  p_email TEXT,
  p_ip_address INET
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM failed_login_attempts
  WHERE email = p_email OR ip_address = p_ip_address;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_data_subject_access_request(
  p_data_subject_id UUID,
  p_request_type TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id UUID;
BEGIN
  INSERT INTO data_subject_requests (
    data_subject_id,
    request_type,
    due_date
  ) VALUES (
    p_data_subject_id,
    p_request_type,
    NOW() + INTERVAL '30 days'
  ) RETURNING id INTO request_id;
  
  RETURN request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.anonymize_personal_data(
  p_data_subject_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE data_subjects
  SET 
    email = 'anonymized_' || id::text || '@example.com',
    phone = NULL,
    external_id = 'anonymized_' || id::text
  WHERE id = p_data_subject_id;
  
  UPDATE consent_records
  SET 
    ip_address = '0.0.0.0',
    user_agent = 'anonymized'
  WHERE data_subject_id = p_data_subject_id;
  
  INSERT INTO security_events (
    event_type,
    severity,
    resource_type,
    resource_id,
    action,
    details
  ) VALUES (
    'data_anonymization',
    'high',
    'data_subjects',
    p_data_subject_id::text,
    'anonymize',
    jsonb_build_object('data_subject_id', p_data_subject_id)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_performance_metric(
  p_service_name TEXT,
  p_endpoint TEXT,
  p_response_time_ms INTEGER,
  p_status_code INTEGER,
  p_request_size_bytes INTEGER,
  p_response_size_bytes INTEGER,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO performance_metrics (
    service_name,
    endpoint,
    response_time_ms,
    status_code,
    request_size_bytes,
    response_size_bytes,
    user_id,
    session_id
  ) VALUES (
    p_service_name,
    p_endpoint,
    p_response_time_ms,
    p_status_code,
    p_request_size_bytes,
    p_response_size_bytes,
    p_user_id,
    p_session_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_business_metric(
  p_metric_type TEXT,
  p_metric_name TEXT,
  p_metric_value DECIMAL,
  p_dimensions JSONB DEFAULT NULL,
  p_period_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO business_metrics (
    metric_type,
    metric_name,
    metric_value,
    dimensions,
    period_start,
    period_end
  ) VALUES (
    p_metric_type,
    p_metric_name,
    p_metric_value,
    p_dimensions,
    p_period_start,
    p_period_end
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_tenant_id UUID,
  p_action TEXT,
  p_resource TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'low'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    tenant_id,
    action,
    resource,
    resource_type,
    resource_id,
    details,
    metadata,
    ip_address,
    user_agent,
    severity,
    timestamp
  ) VALUES (
    p_user_id,
    p_tenant_id,
    p_action,
    p_resource,
    p_resource_type,
    p_resource_id,
    p_details,
    p_metadata,
    p_ip_address,
    p_user_agent,
    p_severity,
    NOW()
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMPTZ;
BEGIN
  window_start := date_trunc('second', NOW() - (p_window_seconds || ' seconds')::INTERVAL);
  
  SELECT request_count INTO current_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND window_start >= window_start;
  
  IF current_count IS NULL THEN
    INSERT INTO rate_limits (identifier, endpoint, request_count, window_start)
    VALUES (p_identifier, p_endpoint, 1, date_trunc('second', NOW()))
    ON CONFLICT (identifier, endpoint) DO UPDATE
      SET request_count = 1,
          window_start = date_trunc('second', NOW());
    RETURN TRUE;
  END IF;
  
  IF current_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  UPDATE rate_limits
  SET request_count = request_count + 1
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND window_start >= window_start;
  
  RETURN TRUE;
END;
$$;

-- Lead Generation Functions
CREATE OR REPLACE FUNCTION public.calculate_lead_score(p_lead_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Calculate score based on various factors
  -- This is a simplified version - adjust based on your scoring logic
  SELECT 
    CASE 
      WHEN qualified THEN 100
      WHEN score > 0 THEN score
      ELSE 0
    END
  INTO score
  FROM leads
  WHERE id = p_lead_id;
  
  RETURN COALESCE(score, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.check_appointment_conflicts(
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_organizer_id UUID,
  p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM appointments
  WHERE organizer_id = p_organizer_id
    AND status NOT IN ('cancelled', 'completed')
    AND (
      (start_time <= p_start_time AND end_time > p_start_time)
      OR (start_time < p_end_time AND end_time >= p_end_time)
      OR (start_time >= p_start_time AND end_time <= p_end_time)
    )
    AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id);
  
  RETURN conflict_count = 0;
END;
$$;

-- Automation Functions
CREATE OR REPLACE FUNCTION public.log_automation_event(
  p_workflow_id UUID,
  p_event_type TEXT,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO app_events (type, meta)
  VALUES (p_event_type, jsonb_build_object('workflow_id', p_workflow_id, 'details', p_details));
END;
$$;

CREATE OR REPLACE FUNCTION public.has_valid_consent(
  p_user_id UUID,
  p_consent_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  consent_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM consent_records cr
    JOIN data_subjects ds ON ds.id = cr.data_subject_id
    WHERE ds.user_id = p_user_id
      AND cr.consent_type = p_consent_type
      AND cr.granted = true
      AND (cr.expires_at IS NULL OR cr.expires_at > NOW())
      AND cr.withdrawn_at IS NULL
  ) INTO consent_exists;
  
  RETURN COALESCE(consent_exists, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_data_purposes(p_user_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  purposes TEXT[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT purpose)
  INTO purposes
  FROM consent_records cr
  JOIN data_subjects ds ON ds.id = cr.data_subject_id
  WHERE ds.user_id = p_user_id
    AND cr.granted = true
    AND (cr.expires_at IS NULL OR cr.expires_at > NOW())
    AND cr.withdrawn_at IS NULL;
  
  RETURN COALESCE(purposes, ARRAY[]::TEXT[]);
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables and create policies for data access control

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.moderation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.onboarding_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.support_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pmf_metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.metrics_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.autopilot_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nurturing_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nurturing_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nurturing_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crm_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketing_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaign_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roi_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ab_test_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.privacy_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.data_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.data_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.compliance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trust_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.threat_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trust_ledger_roots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guardian_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guardian_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenant_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.design_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.design_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orchestrator_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dependency_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cost_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.demo_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interactive_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_sources ENABLE ROW LEVEL SECURITY;

-- Core User Policies
-- Profiles: Users can view/edit their own profile
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User Roles: Users can view their own roles, admins can manage
DROP POLICY IF EXISTS "user_roles_own" ON public.user_roles;
CREATE POLICY "user_roles_own" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles_admin" ON public.user_roles;
CREATE POLICY "user_roles_admin" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- User Settings: Users can manage their own settings
DROP POLICY IF EXISTS "user_settings_own" ON public.user_settings;
CREATE POLICY "user_settings_own" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Apps: Users can manage their own apps
DROP POLICY IF EXISTS "user_apps_own" ON public.user_apps;
CREATE POLICY "user_apps_own" ON public.user_apps
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Multi-Tenant Policies
-- Subscription Plans: Public read, admin write
DROP POLICY IF EXISTS "subscription_plans_public_read" ON subscription_plans;
CREATE POLICY "subscription_plans_public_read" ON subscription_plans
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "subscription_plans_admin_write" ON subscription_plans;
CREATE POLICY "subscription_plans_admin_write" ON subscription_plans
  FOR ALL USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Tenant Members: Users can view their own memberships, tenant admins can manage
DROP POLICY IF EXISTS "tenant_members_own" ON tenant_members;
CREATE POLICY "tenant_members_own" ON tenant_members
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "tenant_members_admin" ON tenant_members;
CREATE POLICY "tenant_members_admin" ON tenant_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = tenant_members.tenant_id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'admin'
      AND tm.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = tenant_members.tenant_id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'admin'
      AND tm.status = 'active'
    )
  );

-- Tenant Usage: Tenant members can view
DROP POLICY IF EXISTS "tenant_usage_tenant_members" ON tenant_usage;
CREATE POLICY "tenant_usage_tenant_members" ON tenant_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE tenant_id = tenant_usage.tenant_id 
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- AI Embeddings Policies
DROP POLICY IF EXISTS "ai_embeddings_read" ON ai_embeddings;
CREATE POLICY "ai_embeddings_read" ON ai_embeddings
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "ai_embeddings_service" ON ai_embeddings;
CREATE POLICY "ai_embeddings_service" ON ai_embeddings
  FOR ALL USING (auth.role() = 'service_role');

-- Workflow Executions: Users can view their own
DROP POLICY IF EXISTS "workflow_executions_own" ON workflow_executions;
CREATE POLICY "workflow_executions_own" ON workflow_executions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM automation_workflows aw
      WHERE aw.id = workflow_executions.workflow_id
      AND aw.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "workflow_executions_service" ON workflow_executions;
CREATE POLICY "workflow_executions_service" ON workflow_executions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Notifications: Users can view/manage their own
DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_service" ON notifications;
CREATE POLICY "notifications_service" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Chat Conversations: Users can view/manage their own
DROP POLICY IF EXISTS "chat_conversations_own" ON chat_conversations;
CREATE POLICY "chat_conversations_own" ON chat_conversations
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Chat Messages: Users can view messages in their conversations
DROP POLICY IF EXISTS "chat_messages_own" ON chat_messages;
CREATE POLICY "chat_messages_own" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = chat_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chat_messages_insert" ON chat_messages;
CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = chat_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Blog Comments: Public read approved, authenticated can create
DROP POLICY IF EXISTS "blog_comments_read" ON blog_comments;
CREATE POLICY "blog_comments_read" ON blog_comments
  FOR SELECT USING (status = 'approved' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "blog_comments_create" ON blog_comments;
CREATE POLICY "blog_comments_create" ON blog_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "blog_comments_update_own" ON blog_comments;
CREATE POLICY "blog_comments_update_own" ON blog_comments
  FOR UPDATE USING (author_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Conversion Events: Users can view their own, service role full access
DROP POLICY IF EXISTS "conversion_events_own" ON conversion_events;
CREATE POLICY "conversion_events_own" ON conversion_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "conversion_events_service" ON conversion_events;
CREATE POLICY "conversion_events_service" ON conversion_events
  FOR ALL USING (auth.role() = 'service_role');

-- Privacy Consents: Users can view/manage their own
DROP POLICY IF EXISTS "privacy_consents_own" ON privacy_consents;
CREATE POLICY "privacy_consents_own" ON privacy_consents
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Security Events: Admins can view all
DROP POLICY IF EXISTS "security_events_admin" ON security_events;
CREATE POLICY "security_events_admin" ON security_events
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "security_events_service" ON security_events;
CREATE POLICY "security_events_service" ON security_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Failed Login Attempts: Admins and service role only
DROP POLICY IF EXISTS "failed_login_attempts_admin" ON failed_login_attempts;
CREATE POLICY "failed_login_attempts_admin" ON failed_login_attempts
  FOR ALL USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "failed_login_attempts_service" ON failed_login_attempts;
CREATE POLICY "failed_login_attempts_service" ON failed_login_attempts
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Guardian Events: Users can view their own
DROP POLICY IF EXISTS "guardian_events_own" ON guardian_events;
CREATE POLICY "guardian_events_own" ON guardian_events
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "guardian_events_service" ON guardian_events;
CREATE POLICY "guardian_events_service" ON guardian_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Guardian Preferences: Users can manage their own
DROP POLICY IF EXISTS "guardian_preferences_own" ON guardian_preferences;
CREATE POLICY "guardian_preferences_own" ON guardian_preferences
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trust Ledger Roots: Users can view their own
DROP POLICY IF EXISTS "trust_ledger_roots_own" ON trust_ledger_roots;
CREATE POLICY "trust_ledger_roots_own" ON trust_ledger_roots
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "trust_ledger_roots_insert" ON trust_ledger_roots;
CREATE POLICY "trust_ledger_roots_insert" ON trust_ledger_roots
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Integrations: Users can manage their own
DROP POLICY IF EXISTS "integrations_own" ON integrations;
CREATE POLICY "integrations_own" ON integrations
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- API Logs: Users can view their own, service role can insert
DROP POLICY IF EXISTS "api_logs_own" ON api_logs;
CREATE POLICY "api_logs_own" ON api_logs
  FOR SELECT USING (
    auth.uid() = user_id OR
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
  );

DROP POLICY IF EXISTS "api_logs_service" ON api_logs;
CREATE POLICY "api_logs_service" ON api_logs
  FOR INSERT WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
  );

-- Metrics Log: Service role full access, authenticated read
DROP POLICY IF EXISTS "metrics_log_service" ON metrics_log;
CREATE POLICY "metrics_log_service" ON metrics_log
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "metrics_log_read" ON metrics_log;
CREATE POLICY "metrics_log_read" ON metrics_log
  FOR SELECT USING (auth.role() = 'authenticated');

-- App Events: Users can view their own, service role can insert
DROP POLICY IF EXISTS "app_events_own" ON app_events;
CREATE POLICY "app_events_own" ON app_events
  FOR SELECT USING (
    auth.uid() = user_id OR
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
  );

DROP POLICY IF EXISTS "app_events_service" ON app_events;
CREATE POLICY "app_events_service" ON app_events
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
  );

-- Orchestrator Reports: Service role full access, authenticated read
DROP POLICY IF EXISTS "orchestrator_reports_service" ON orchestrator_reports;
CREATE POLICY "orchestrator_reports_service" ON orchestrator_reports
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "orchestrator_reports_read" ON orchestrator_reports;
CREATE POLICY "orchestrator_reports_read" ON orchestrator_reports
  FOR SELECT USING (auth.role() = 'authenticated');

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_tenant_member_role(UUID, UUID) TO authenticated, anon;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers for tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_apps_updated_at
  BEFORE UPDATE ON user_apps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_members_updated_at
  BEFORE UPDATE ON tenant_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON user_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_embeddings_updated_at
  BEFORE UPDATE ON ai_embeddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON ai_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_workflows_updated_at
  BEFORE UPDATE ON automation_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON workflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_autopilot_workflows_updated_at
  BEFORE UPDATE ON autopilot_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nurturing_sequences_updated_at
  BEFORE UPDATE ON nurturing_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_costs_updated_at
  BEFORE UPDATE ON campaign_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON ab_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_consents_updated_at
  BEFORE UPDATE ON privacy_consents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_subjects_updated_at
  BEFORE UPDATE ON data_subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_policies_updated_at
  BEFORE UPDATE ON security_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guardian_preferences_updated_at
  BEFORE UPDATE ON guardian_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_items_updated_at
  BEFORE UPDATE ON marketplace_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_integrations_updated_at
  BEFORE UPDATE ON tenant_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_services_updated_at
  BEFORE UPDATE ON api_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_notes_updated_at
  BEFORE UPDATE ON meeting_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_projects_updated_at
  BEFORE UPDATE ON design_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expert_profiles_updated_at
  BEFORE UPDATE ON expert_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_channels_updated_at
  BEFORE UPDATE ON communication_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW EXECUTE FUNCTION update_blog_comments_updated_at();

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_environments_updated_at
  BEFORE UPDATE ON demo_environments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interactive_tutorials_updated_at
  BEFORE UPDATE ON interactive_tutorials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activations_updated_at
  BEFORE UPDATE ON user_activations
  FOR EACH ROW EXECUTE FUNCTION update_user_activations_updated_at();

-- Audit triggers for critical tables
CREATE TRIGGER audit_data_subjects_trigger
  AFTER INSERT OR UPDATE OR DELETE ON data_subjects
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_consent_records_trigger
  AFTER INSERT OR UPDATE OR DELETE ON consent_records
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_data_subject_requests_trigger
  AFTER INSERT OR UPDATE OR DELETE ON data_subject_requests
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_tenants_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tenants
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- SEED DATA
-- ============================================================================
-- Idempotent seed data for initial setup

-- Default Security Policies
INSERT INTO security_policies (name, description, policy_type, rules) VALUES
('Default Access Control', 'Default access control policy', 'access_control', '{"max_failed_attempts": 5, "lockout_duration": 900, "require_mfa": false}'),
('Data Protection Policy', 'GDPR/CCPA data protection policy', 'data_protection', '{"retention_period": 2555, "anonymization_required": true, "consent_required": true}'),
('Audit Policy', 'Comprehensive audit logging policy', 'audit', '{"log_all_changes": true, "retention_period": 2555, "include_metadata": true}'),
('Compliance Policy', 'Regulatory compliance policy', 'compliance', '{"gdpr_compliant": true, "ccpa_compliant": true, "sox_compliant": true}')
ON CONFLICT (name) DO NOTHING;

-- Default Subscription Plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, limits, tier) VALUES
('Starter', 'Perfect for small teams getting started', 29.00, 290.00, 
 '["5 Workflows", "1,000 Executions/month", "1GB Storage", "Basic Support"]',
 '{"workflows": 5, "executions": 1000, "storage": 1, "users": 5, "apiCalls": 10000, "aiProcessing": 100, "customAgents": 1, "integrations": 5}',
 'starter'),
('Professional', 'Advanced features for growing teams', 99.00, 990.00,
 '["25 Workflows", "10,000 Executions/month", "10GB Storage", "Priority Support", "Advanced Analytics"]',
 '{"workflows": 25, "executions": 10000, "storage": 10, "users": -1, "apiCalls": 50000, "aiProcessing": 1000, "customAgents": 5, "integrations": 20}',
 'professional'),
('Enterprise', 'Full-featured solution for large organizations', 299.00, 2990.00,
 '["Unlimited Workflows", "100,000 Executions/month", "100GB Storage", "24/7 Support", "Custom Integrations", "White-label Options"]',
 '{"workflows": -1, "executions": 100000, "storage": 100, "users": -1, "apiCalls": 500000, "aiProcessing": 10000, "customAgents": 50, "integrations": -1}',
 'enterprise')
ON CONFLICT DO NOTHING;

-- Sample Integrations (idempotent)
INSERT INTO integrations (name, description, category, provider, configuration, capabilities, pricing) VALUES
('Salesforce CRM', 'Seamless integration with Salesforce for lead management and automation', 'crm', 'Salesforce',
 '{"authType": "oauth2", "scopes": ["api", "refresh_token"], "endpoints": [{"name": "leads", "url": "/api/v1/leads", "method": "GET"}]}',
 '["lead_management", "contact_sync", "opportunity_tracking", "custom_objects"]',
 '{"free": true}'),
('Slack', 'Connect your workflows to Slack for notifications and team collaboration', 'communication', 'Slack',
 '{"authType": "oauth2", "scopes": ["chat:write", "channels:read"], "endpoints": [{"name": "send_message", "url": "/api/chat.postMessage", "method": "POST"}]}',
 '["send_messages", "create_channels", "user_management", "file_sharing"]',
 '{"free": true}'),
('Google Calendar', 'Calendar integration for appointment scheduling and event management', 'calendar', 'Google',
 '{"authType": "oauth2", "scopes": ["https://www.googleapis.com/auth/calendar"], "endpoints": [{"name": "events", "url": "/calendar/v3/events", "method": "GET"}]}',
 '["event_management", "availability_checking", "meeting_scheduling", "recurring_events"]',
 '{"free": true}'),
('HubSpot', 'Comprehensive CRM integration with marketing automation', 'crm', 'HubSpot',
 '{"authType": "api_key", "endpoints": [{"name": "contacts", "url": "/crm/v3/objects/contacts", "method": "GET"}]}',
 '["contact_management", "deal_tracking", "email_marketing", "lead_scoring"]',
 '{"free": true}'),
('Zapier', 'Connect to 5000+ apps through Zapier integration', 'automation', 'Zapier',
 '{"authType": "api_key", "endpoints": [{"name": "triggers", "url": "/v1/triggers", "method": "GET"}]}',
 '["app_connections", "trigger_automation", "data_transformation", "webhook_management"]',
 '{"free": false, "price": 19.99, "currency": "USD", "period": "month"}')
ON CONFLICT DO NOTHING;

-- Sample API Services (idempotent)
INSERT INTO api_services (name, description, endpoint, method, pricing, documentation_url, sdk_languages, rate_limits, authentication) VALUES
('AI Text Generation', 'Generate human-like text using advanced AI models', '/api/v1/ai/generate', 'POST',
 '{"freeTier": {"requests": 100, "period": "month"}, "paidTiers": [{"name": "Basic", "price": 0.01, "requests": 1000, "features": ["gpt-3.5-turbo"]}, {"name": "Pro", "price": 0.05, "requests": 10000, "features": ["gpt-4", "claude-3"]}]}',
 'https://docs.aias.com/api/text-generation',
 '["javascript", "python", "curl", "php", "ruby"]',
 '{"requests": 100, "period": "minute", "burst": 200}',
 '{"type": "api_key", "required": true}'),
('Lead Scoring', 'AI-powered lead qualification and scoring', '/api/v1/leads/score', 'POST',
 '{"freeTier": {"requests": 50, "period": "month"}, "paidTiers": [{"name": "Starter", "price": 0.25, "requests": 500, "features": ["basic_scoring"]}, {"name": "Advanced", "price": 0.50, "requests": 2000, "features": ["advanced_scoring", "custom_models"]}]}',
 'https://docs.aias.com/api/lead-scoring',
 '["javascript", "python", "curl"]',
 '{"requests": 50, "period": "minute"}',
 '{"type": "api_key", "required": true}'),
('Workflow Execution', 'Execute automation workflows via API', '/api/v1/workflows/execute', 'POST',
 '{"freeTier": {"requests": 10, "period": "month"}, "paidTiers": [{"name": "Basic", "price": 0.10, "requests": 100, "features": ["basic_workflows"]}, {"name": "Pro", "price": 0.20, "requests": 1000, "features": ["advanced_workflows", "ai_processing"]}]}',
 'https://docs.aias.com/api/workflow-execution',
 '["javascript", "python", "curl", "php"]',
 '{"requests": 20, "period": "minute"}',
 '{"type": "api_key", "required": true}')
ON CONFLICT DO NOTHING;

-- Sample AI Embeddings (idempotent)
INSERT INTO ai_embeddings (namespace, content, metadata) VALUES
('docs', 'This is a sample documentation about AI automation', '{"type": "doc", "category": "ai"}'),
('api', 'API endpoint for user authentication and authorization', '{"type": "api", "method": "POST"}'),
('code', 'React component for displaying user dashboard with real-time updates', '{"type": "component", "framework": "react"}')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This master migration consolidates all previous migrations into a single,
-- coherent schema that can bootstrap a fresh database.
--
-- Migration completed: 2025-01-31
-- Total tables: ~100+
-- Total functions: ~50+
-- Total indexes: ~200+
-- Total RLS policies: ~100+
-- Total triggers: ~50+
