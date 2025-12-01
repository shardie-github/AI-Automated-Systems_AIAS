-- ============================================================================
-- LIVING SYSTEM ECOSYSTEM MIGRATION
-- ============================================================================
-- This migration creates the core infrastructure for a connected Vercel/Supabase
-- living system where every frontend action results in structured Supabase transactions.
--
-- Key Components:
-- 1. activity_log: Comprehensive engagement tracking (clicks, scrolls, views, etc.)
-- 2. positioning_feedback: Community-driven positioning clarity input
-- 3. KPI Views: Three quantifiable metrics for "All-Cylinder Firing Check"
-- 4. RLS Policies: Security layer for all new tables
-- 5. Functions: Impact score calculation and real-time metrics
--
-- Generated: 2025-02-03
-- ============================================================================

-- ============================================================================
-- ACTIVITY LOG TABLE
-- ============================================================================
-- Tracks all user engagement: clicks, scrolls, views, interactions
-- Supports both authenticated and anonymous users
CREATE TABLE IF NOT EXISTS public.activity_log (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text, -- For anonymous tracking
  activity_type text NOT NULL CHECK (activity_type IN (
    'page_view',
    'click',
    'scroll',
    'form_submit',
    'sign_up',
    'login',
    'post_view',
    'post_created',
    'comment_added',
    'reaction',
    'share',
    'download',
    'video_play',
    'video_complete',
    'search',
    'filter',
    'sort',
    'navigation',
    'time_on_page',
    'engagement_signal'
  )),
  entity_type text, -- e.g., 'post', 'page', 'component'
  entity_id text, -- ID of the entity being interacted with
  metadata jsonb DEFAULT '{}'::jsonb, -- Additional context (page_url, referrer, etc.)
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_session_id ON public.activity_log(session_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_activity_type ON public.activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);

-- ============================================================================
-- POSITIONING FEEDBACK TABLE
-- ============================================================================
-- Community-driven input for positioning clarity
-- Each submission triggers impact score calculation
CREATE TABLE IF NOT EXISTS public.positioning_feedback (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_type text NOT NULL CHECK (feedback_type IN (
    'value_proposition',
    'target_persona',
    'pain_point',
    'solution_clarity',
    'messaging',
    'feature_request',
    'general'
  )),
  feedback_text text NOT NULL,
  impact_score numeric(5,2) DEFAULT 0, -- Calculated by function
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_positioning_feedback_user_id ON public.positioning_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_positioning_feedback_type ON public.positioning_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_positioning_feedback_impact_score ON public.positioning_feedback(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_positioning_feedback_created_at ON public.positioning_feedback(created_at DESC);

-- ============================================================================
-- KPI VIEWS: "All-Cylinder Firing Check"
-- ============================================================================

-- KPI 1: New Users This Week (Threshold: > 50)
-- Measures growth momentum
CREATE OR REPLACE VIEW public.kpi_new_users_week AS
SELECT 
  COUNT(*) as new_users_count,
  COUNT(*) > 50 as threshold_met,
  NOW() as checked_at
FROM public.profiles
WHERE created_at > NOW() - INTERVAL '7 days';

-- KPI 2: Average Post Views (Threshold: > 100)
-- Measures content engagement
CREATE OR REPLACE VIEW public.kpi_avg_post_views AS
SELECT 
  COALESCE(AVG(view_count), 0) as avg_post_views,
  COALESCE(AVG(view_count), 0) > 100 as threshold_met,
  COUNT(*) as total_posts,
  NOW() as checked_at
FROM public.posts
WHERE created_at > NOW() - INTERVAL '30 days';

-- KPI 3: Actions Completed in Last Hour (Threshold: > 20)
-- Measures real-time engagement velocity
CREATE OR REPLACE VIEW public.kpi_actions_last_hour AS
SELECT 
  COUNT(*) as actions_count,
  COUNT(*) > 20 as threshold_met,
  NOW() as checked_at
FROM public.activity_log
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND activity_type IN ('form_submit', 'post_created', 'comment_added', 'reaction', 'share');

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Calculate Impact Score for Positioning Feedback
-- Factors: feedback length, user engagement history, feedback type
CREATE OR REPLACE FUNCTION public.calculate_impact_score(
  p_user_id uuid,
  p_feedback_text text,
  p_feedback_type text
)
RETURNS numeric(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score numeric(5,2) := 0;
  v_text_length int;
  v_user_activity_count int;
  v_user_posts_count int;
BEGIN
  -- Base score from text length (0-30 points)
  v_text_length := LENGTH(p_feedback_text);
  v_score := LEAST(v_text_length / 10, 30);
  
  -- User engagement bonus (0-40 points)
  SELECT COUNT(*) INTO v_user_activity_count
  FROM public.activity_log
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '30 days';
  
  v_score := v_score + LEAST(v_user_activity_count / 5, 40);
  
  -- Content creation bonus (0-30 points)
  SELECT COUNT(*) INTO v_user_posts_count
  FROM public.posts
  WHERE user_id = p_user_id;
  
  v_score := v_score + LEAST(v_user_posts_count * 5, 30);
  
  -- Feedback type multiplier
  CASE p_feedback_type
    WHEN 'value_proposition' THEN v_score := v_score * 1.5;
    WHEN 'target_persona' THEN v_score := v_score * 1.3;
    WHEN 'pain_point' THEN v_score := v_score * 1.2;
    ELSE v_score := v_score * 1.0;
  END CASE;
  
  -- Cap at 100
  RETURN LEAST(v_score, 100);
END;
$$;

-- Function: Trigger to auto-calculate impact score on insert
CREATE OR REPLACE FUNCTION public.trigger_calculate_impact_score()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.impact_score := public.calculate_impact_score(
    NEW.user_id,
    NEW.feedback_text,
    NEW.feedback_type
  );
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS calculate_impact_score_trigger ON public.positioning_feedback;
CREATE TRIGGER calculate_impact_score_trigger
  BEFORE INSERT OR UPDATE ON public.positioning_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_calculate_impact_score();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positioning_feedback ENABLE ROW LEVEL SECURITY;

-- Activity Log Policies
-- Users can view their own activities
CREATE POLICY "activity_log_select_own" ON public.activity_log
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Service role can insert (for anonymous tracking)
CREATE POLICY "activity_log_insert_service" ON public.activity_log
  FOR INSERT
  WITH CHECK (true); -- Allow anonymous inserts via service role

-- Authenticated users can insert their own activities
CREATE POLICY "activity_log_insert_own" ON public.activity_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all
CREATE POLICY "activity_log_select_admin" ON public.activity_log
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Positioning Feedback Policies
-- Users can view their own feedback
CREATE POLICY "positioning_feedback_select_own" ON public.positioning_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own feedback
CREATE POLICY "positioning_feedback_insert_own" ON public.positioning_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "positioning_feedback_update_own" ON public.positioning_feedback
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "positioning_feedback_select_admin" ON public.positioning_feedback
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Public read access to aggregated metrics (for dashboard)
-- Note: Views are public by default, but we ensure they're accessible

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.activity_log IS 'Comprehensive engagement tracking for all user interactions. Supports both authenticated and anonymous users. Every frontend action should result in an activity_log entry.';
COMMENT ON TABLE public.positioning_feedback IS 'Community-driven positioning clarity input. Each submission automatically calculates an impact score based on user engagement and feedback quality.';
COMMENT ON VIEW public.kpi_new_users_week IS 'KPI 1: New users in the last 7 days. Threshold: > 50 users. Part of "All-Cylinder Firing Check".';
COMMENT ON VIEW public.kpi_avg_post_views IS 'KPI 2: Average post views in the last 30 days. Threshold: > 100 views. Part of "All-Cylinder Firing Check".';
COMMENT ON VIEW public.kpi_actions_last_hour IS 'KPI 3: Actions completed in the last hour. Threshold: > 20 actions. Part of "All-Cylinder Firing Check".';
COMMENT ON FUNCTION public.calculate_impact_score IS 'Calculates impact score (0-100) for positioning feedback based on text length, user engagement history, and content creation activity.';
