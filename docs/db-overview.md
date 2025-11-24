# Database Schema Overview

This document provides a high-level overview of the Supabase database schema, including all tables, functions, triggers, and RLS policies.

**Last Updated:** 2025-01-31  
**Migration Strategy:** Single master migration (`99999999999999_master_consolidated_schema.sql`)

---

## Core Extensions

- `pgcrypto` - Cryptographic functions
- `pg_trgm` - Trigram matching for text search
- `uuid-ossp` - UUID generation
- `vector` - Vector similarity search (for AI embeddings)

---

## Schema Organization

### 1. Authentication & User Management

**Tables:**
- `auth.users` (Supabase managed)
- `profiles` - User profile data (display_name, avatar_url, bio, etc.)
- `user_roles` - Role assignments (admin, moderator, user)
- `user_settings` - User preferences and settings
- `user_apps` - Declared apps-in-use from OAuth connections

**Key Functions:**
- `handle_new_user()` - Creates profile and default role on signup
- `is_admin(user_id)` - Check if user is admin
- `has_role(user_id, role)` - Check user role

---

### 2. Multi-Tenant Architecture

**Tables:**
- `tenants` - Tenant/organization records
- `tenant_members` - User-tenant relationships with roles
- `tenant_usage` - Usage tracking per tenant
- `tenant_integrations` - Tenant-specific integration configs

**Key Functions:**
- `create_tenant(name, subdomain, plan_id)` - Create new tenant
- `is_tenant_member(tenant_id, user_id)` - Check membership
- `get_tenant_member_role(tenant_id, user_id)` - Get user's role in tenant
- `track_usage(tenant_id, metric_type, increment)` - Track usage
- `check_tenant_limit(tenant_id, metric_type)` - Check usage limits

---

### 3. Gamification & Community

**Tables:**
- `badges` - Badge definitions
- `user_badges` - User badge awards
- `streaks` - User streak tracking
- `posts` - Community posts
- `comments` - Post comments (threaded)
- `reactions` - Post reactions (emoji)
- `journal_entries` - User journal entries
- `challenges` - Challenge definitions
- `challenge_participants` - Challenge participation
- `leaderboard_entries` - Leaderboard rankings
- `notifications` - User notifications
- `user_follows` - User follow relationships
- `activities` - Activity feed
- `referrals` - Referral tracking
- `moderation_flags` - Content moderation

**Key Functions:**
- `generate_referral_code()` - Generate unique referral code
- `update_leaderboard()` - Update leaderboard on XP change

---

### 4. Events & Telemetry

**Tables:**
- `events` - Core event tracking (legacy)
- `telemetry_events` - Telemetry events
- `app_events` - Application events
- `conversion_events` - Conversion funnel events
- `sessions` - User session tracking
- `signals` - Feature snapshots/heuristics
- `segments` - User segments/cohorts
- `user_segments` - User-segment assignments

**Key Functions:**
- `upsert_events(rows)` - Bulk upsert events
- `recompute_metrics_daily(start, end)` - Recompute daily metrics

---

### 5. Analytics & Metrics

**Tables:**
- `metrics_daily` - Daily aggregated metrics
- `metrics_log` - Performance metrics log
- `performance_metrics` - Application performance metrics
- `business_metrics` - Business intelligence metrics
- `system_metrics` - System health metrics
- `pmf_metrics_snapshots` - Product-market-fit snapshots
- `user_activations` - User activation tracking

**Key Functions:**
- `get_latest_metrics_per_source(limit)` - Get latest metrics
- `get_metrics_trends(days_back)` - Calculate trends
- `calculate_activation_rate(days_back)` - Calculate activation rate
- `calculate_retention_rate(days_after, days_back)` - Calculate retention
- `calculate_nps(days_back)` - Calculate NPS
- `update_pmf_metrics_snapshot()` - Update PMF snapshot

**Views:**
- `metrics_dashboard` - Aggregated metrics view

---

### 6. AI & Embeddings

**Tables:**
- `ai_embeddings` - Vector embeddings for semantic search
- `ai_health_metrics` - AI deployment health metrics
- `ai_insights` - AI-generated insights
- `ai_agents` - AI agent definitions
- `agent_interactions` - AI agent interaction logs

**Key Functions:**
- `search_embeddings(query_embedding, threshold, count, namespace)` - Vector search
- `hybrid_search(query_text, query_embedding, threshold, count, namespace)` - Hybrid semantic + keyword search

---

### 7. Workflows & Automation

**Tables:**
- `automation_workflows` - Workflow definitions
- `workflow_definitions` - Alternative workflow definitions table
- `workflow_executions` - Workflow execution history
- `workflow_steps` - Individual workflow step executions
- `step_executions` - Alternative step executions table
- `workflow_templates` - Workflow templates
- `autopilot_workflows` - Autopilot workflow definitions

**Key Functions:**
- `log_automation_event(action, workflow_id, execution_id, metadata)` - Log automation events

---

### 8. Lead Generation & CRM

**Tables:**
- `leads` - Lead records
- `lead_activities` - Lead activity tracking
- `lead_sources` - Lead source definitions
- `lead_sessions` - Lead session tracking
- `lead_touchpoints` - Lead touchpoint tracking
- `email_interactions` - Email interaction tracking
- `email_queue` - Email sending queue
- `email_templates` - Email templates
- `nurturing_sequences` - Email nurturing sequences
- `nurturing_enrollments` - Lead nurturing enrollments
- `nurturing_schedule` - Nurturing schedule
- `crm_sync_log` - CRM synchronization log
- `conversions` - Conversion tracking
- `marketing_costs` - Marketing cost tracking
- `campaign_costs` - Campaign cost tracking
- `roi_tracking` - ROI tracking
- `revenue_events` - Revenue event tracking
- `ab_tests` - A/B test definitions
- `ab_test_assignments` - A/B test assignments
- `ab_test_conversions` - A/B test conversions

**Key Functions:**
- `calculate_lead_score(lead_id)` - Calculate lead score
- `check_appointment_conflicts(start_time, end_time, organizer_id)` - Check conflicts

---

### 9. Privacy & Compliance

**Tables:**
- `privacy_consents` - Privacy consent records
- `data_subjects` - GDPR/CCPA data subjects
- `data_subject_requests` - Data subject rights requests
- `consent_records` - Detailed consent records
- `data_processing_activities` - GDPR Article 30 records
- `compliance_reports` - Compliance reports
- `compliance_metrics` - Compliance metrics

**Key Functions:**
- `has_valid_consent(user_id, purpose)` - Check consent validity
- `get_user_data_purposes(user_id)` - Get user data processing purposes
- `handle_data_subject_access_request(subject_id, request_type)` - Handle DSR
- `anonymize_personal_data(subject_id)` - Anonymize data

---

### 10. Security & Audit

**Tables:**
- `audit_log` - Audit log (legacy)
- `audit_logs` - Comprehensive audit logs
- `security_events` - Security event logging
- `threat_detections` - Threat detection records
- `failed_attempts` - Failed login attempts
- `failed_login_attempts` - Alternative failed login table
- `security_policies` - Security policy definitions
- `rate_limits` - Rate limiting records

**Key Functions:**
- `check_failed_login_attempts(email, ip_address)` - Check login attempts
- `record_failed_login_attempt(email, ip_address, user_agent)` - Record attempt
- `clear_failed_login_attempts(email, ip_address)` - Clear on success
- `log_audit_event(user_id, action, resource_type, resource_id, metadata)` - Log audit event
- `check_rate_limit(identifier, endpoint, max_requests, window_seconds)` - Check rate limit

**Triggers:**
- Audit triggers on critical tables (data_subjects, consent_records, etc.)

---

### 11. Trust & Guardian

**Tables:**
- `trust_ledger_roots` - Trust ledger hash roots
- `guardian_preferences` - Guardian trust preferences
- `guardian_events` - Guardian event logs
- `trust_badges` - Trust badge definitions

**Key Functions:**
- `get_guardian_summary(user_id, days)` - Get guardian summary

---

### 12. Billing & Subscriptions

**Tables:**
- `subscription_plans` - Subscription plan definitions
- `revenue_streams` - Revenue stream tracking
- `subscription_tiers` - User subscription tiers

---

### 13. Marketplace & Integrations

**Tables:**
- `marketplace_items` - Marketplace items (templates, agents, integrations)
- `integrations` - Integration definitions
- `api_services` - API service definitions
- `api_usage` - API usage tracking
- `api_logs` - API request logs

---

### 14. Appointments & Meetings

**Tables:**
- `appointments` - Appointment records
- `appointment_reminders` - Appointment reminders
- `meetings` - Meeting records
- `meeting_notes` - Meeting notes and transcriptions

---

### 15. Design & Projects

**Tables:**
- `design_projects` - Design project records
- `design_versions` - Design version history

---

### 16. Community & Social

**Tables:**
- `community_posts` - Community forum posts
- `expert_profiles` - Expert user profiles
- `communication_channels` - Communication channel configs

---

### 17. Notifications & Preferences

**Tables:**
- `notifications` - User notifications (duplicate with gamification)
- `notification_preferences` - Granular notification preferences
- `push_subscriptions` - Push notification subscriptions

**Key Functions:**
- `get_or_create_user_settings(user_id, tenant_id)` - Get/create settings
- `mark_notifications_read(user_id, notification_ids)` - Mark as read
- `get_unread_notification_count(user_id, tenant_id)` - Get unread count

---

### 18. Blog & Content

**Tables:**
- `blog_comments` - Blog post comments

**Key Functions:**
- `get_blog_post_comment_count(post_slug)` - Get comment count

---

### 19. Chat & Conversations

**Tables:**
- `chat_conversations` - Chat conversation records
- `chat_messages` - Chat messages

---

### 20. Orchestrator & Monitoring

**Tables:**
- `orchestrator_reports` - Orchestrator cycle reports
- `dependency_reports` - Dependency health reports
- `cost_forecasts` - Cost forecasting data
- `security_audits` - Security audit reports

**Key Functions:**
- `get_latest_orchestrator_report()` - Get latest report
- `get_table_rls_status()` - Get RLS status for all tables

---

### 21. Storage & Realtime

**Storage Buckets:**
- `public` - Public file storage
- `private` - Private file storage

**Realtime Publications:**
- `supabase_realtime` - Realtime publication for profiles, posts, journal_entries, app_events

---

## Common Patterns

### RLS Policy Patterns

1. **Owner-only access:** `auth.uid() = user_id`
2. **Tenant isolation:** `EXISTS (SELECT 1 FROM tenant_members WHERE tenant_id = X AND user_id = auth.uid())`
3. **Admin access:** `public.is_admin(auth.uid())`
4. **Service role:** `auth.role() = 'service_role'`
5. **Public read:** `true` (for SELECT)

### Common Functions

- `update_updated_at_column()` - Trigger function for updated_at timestamps
- `handle_updated_at()` - Alternative updated_at trigger function

### Common Indexes

- User ID indexes on all user-related tables
- Tenant ID indexes on all tenant-related tables
- Created_at DESC indexes for chronological queries
- Composite indexes for common query patterns

---

## Notes

- Some tables have duplicate definitions across migrations (e.g., `events` vs `telemetry_events` vs `app_events`)
- Some functions are defined multiple times with slight variations
- RLS policies are consolidated in `20250129000000_consolidated_rls_policies_and_functions.sql`
- The master migration consolidates all of these into a single coherent schema
