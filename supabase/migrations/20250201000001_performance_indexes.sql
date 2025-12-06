-- Migration: Performance Indexes
-- Purpose: Add missing indexes for frequently queried fields
-- Created: 2025-02-01

-- Index for workflow executions by started_at (analytics queries)
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at 
  ON public.workflow_executions(started_at DESC);

-- Index for workflow executions by user_id and started_at (user analytics)
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_started 
  ON public.workflow_executions(user_id, started_at DESC);

-- Index for profiles by trial_start_date (email cadence queries)
CREATE INDEX IF NOT EXISTS idx_profiles_trial_start_date 
  ON public.profiles(trial_start_date) 
  WHERE trial_start_date IS NOT NULL;

-- Index for profiles by plan_name (filtering by plan)
CREATE INDEX IF NOT EXISTS idx_profiles_plan_name 
  ON public.profiles(plan_name) 
  WHERE plan_name IS NOT NULL;

-- Index for integrations by user_id and status (integration queries)
CREATE INDEX IF NOT EXISTS idx_integrations_user_status 
  ON public.integrations(user_id, status) 
  WHERE status = 'connected';

-- Index for workflows by user_id and enabled (active workflow queries)
CREATE INDEX IF NOT EXISTS idx_workflows_user_enabled 
  ON public.workflows(user_id, enabled) 
  WHERE enabled = true;

-- Composite index for automation_usage lookups (already exists, but ensure it's optimal)
-- This index should already exist from previous migration, but adding comment for clarity
COMMENT ON INDEX IF EXISTS idx_automation_usage_user_month IS 
  'Index for fast monthly usage lookups by user';

-- Index for telemetry/events by user_id and timestamp (analytics)
CREATE INDEX IF NOT EXISTS idx_app_events_user_timestamp 
  ON public.app_events(user_id, created_at DESC) 
  WHERE user_id IS NOT NULL;

-- Index for app_events by type and timestamp (event analytics)
CREATE INDEX IF NOT EXISTS idx_app_events_type_timestamp 
  ON public.app_events(event_type, created_at DESC);
