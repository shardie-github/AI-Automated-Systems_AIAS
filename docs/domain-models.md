# Domain Models Documentation

**Generated:** 2025-01-31  
**Purpose:** Complete domain model extraction and documentation

---

## Overview

This document describes all domain models in the AIAS Platform, their relationships, and business logic.

---

## Core Domain Models

### 1. User Management

#### User (`auth.users`)
- **Source:** Supabase Auth
- **Purpose:** Core user identity
- **Key Fields:**
  - `id` (UUID, primary key)
  - `email`
  - `created_at`
  - `updated_at`

#### Profile (`profiles`)
- **Purpose:** Extended user profile information
- **Key Fields:**
  - `id` (UUID, references `auth.users`)
  - `email`
  - `display_name`
  - `avatar_url`
  - `bio`
  - `location`
  - `website`
  - `referral_code` (unique)
  - `total_xp` (gamification)
  - `total_referrals`
  - `created_at`, `updated_at`

**Relationships:**
- One-to-one with `auth.users`
- One-to-many with `user_roles`
- One-to-many with `user_settings`

#### User Role (`user_roles`)
- **Purpose:** Role-based access control
- **Key Fields:**
  - `id` (UUID, primary key)
  - `user_id` (references `auth.users`)
  - `role` (enum: 'admin', 'moderator', 'user')
  - `created_at`

**Business Logic:**
- Users can have multiple roles
- Roles determine access permissions
- Admin role grants full access

#### User Settings (`user_settings`)
- **Purpose:** User preferences and configuration
- **Key Fields:**
  - `id` (UUID, primary key)
  - `user_id` (references `auth.users`)
  - `tenant_id` (references `tenants`, nullable)
  - `email_notifications_enabled`
  - `push_notifications_enabled`
  - `sms_notifications_enabled`
  - `notification_types` (JSONB)
  - `theme` ('light', 'dark', 'system')
  - `language`
  - `timezone`
  - `profile_visibility` ('public', 'private', 'friends')
  - `analytics_opt_in`
  - `beta_features_enabled`
  - `custom_settings` (JSONB)
  - `created_at`, `updated_at`

**Business Logic:**
- Settings are tenant-scoped (can differ per tenant)
- Default values provided for new users
- Custom settings allow extensibility

---

### 2. Multi-Tenancy

#### Tenant (`tenants`)
- **Purpose:** Organization/workspace container
- **Key Fields:**
  - `id` (UUID, primary key)
  - `name`
  - `subdomain` (unique)
  - `domain` (custom domain, nullable)
  - `plan_id` (references `subscription_plans`)
  - `status` ('active', 'suspended', 'cancelled', 'trial')
  - `settings` (JSONB)
  - `limits` (JSONB)
  - `created_at`, `updated_at`

**Business Logic:**
- Each tenant is isolated (RLS policies)
- Subdomain used for tenant identification
- Status controls access and billing

#### Tenant Member (`tenant_members`)
- **Purpose:** User membership in tenants
- **Key Fields:**
  - `id` (UUID, primary key)
  - `tenant_id` (references `tenants`)
  - `user_id` (references `auth.users`)
  - `role` ('admin', 'member', 'viewer', 'billing')
  - `permissions` (JSONB)
  - `invited_by` (references `auth.users`)
  - `invited_at`
  - `joined_at`
  - `status` ('active', 'pending', 'suspended', 'removed')
  - `last_active`
  - `created_at`, `updated_at`

**Business Logic:**
- Users can belong to multiple tenants
- Roles determine permissions within tenant
- Invitation system for onboarding

#### Tenant Usage (`tenant_usage`)
- **Purpose:** Track tenant resource consumption
- **Key Fields:**
  - `id` (UUID, primary key)
  - `tenant_id` (references `tenants`)
  - `period_start`, `period_end`
  - `api_calls` (count)
  - `storage_bytes` (bytes)
  - `compute_seconds` (seconds)
  - `workflow_executions` (count)
  - `agent_executions` (count)
  - `created_at`, `updated_at`

**Business Logic:**
- Tracks usage for billing and limits
- Aggregated by time period
- Used for quota enforcement

#### Subscription Plan (`subscription_plans`)
- **Purpose:** Define subscription tiers
- **Key Fields:**
  - `id` (UUID, primary key)
  - `name`
  - `description`
  - `price_monthly`, `price_yearly`
  - `features` (JSONB array)
  - `limits` (JSONB object)
  - `tier` ('starter', 'professional', 'enterprise', 'custom')
  - `active` (boolean)
  - `created_at`, `updated_at`

**Business Logic:**
- Plans define feature access and limits
- Limits enforced at tenant level
- Custom plans for enterprise customers

---

### 3. Workflows

#### Workflow (`workflows`)
- **Purpose:** Automation workflow definition
- **Key Fields:**
  - `id` (UUID, primary key)
  - `tenant_id` (references `tenants`)
  - `name`
  - `description`
  - `definition` (JSONB - workflow structure)
  - `status` ('draft', 'active', 'paused', 'archived')
  - `trigger_type` ('manual', 'scheduled', 'webhook', 'event')
  - `trigger_config` (JSONB)
  - `created_by` (references `auth.users`)
  - `created_at`, `updated_at`

**Business Logic:**
- Workflows are tenant-scoped
- Definition contains nodes and edges
- Status controls execution

#### Workflow Execution (`workflow_executions`)
- **Purpose:** Track workflow run instances
- **Key Fields:**
  - `id` (UUID, primary key)
  - `workflow_id` (references `workflows`)
  - `tenant_id` (references `tenants`)
  - `status` ('pending', 'running', 'completed', 'failed', 'cancelled')
  - `input` (JSONB)
  - `output` (JSONB)
  - `error` (text, nullable)
  - `started_at`, `completed_at`
  - `created_at`, `updated_at`

**Business Logic:**
- One workflow can have many executions
- Tracks execution history
- Used for debugging and analytics

#### Workflow Template (`workflow_templates`)
- **Purpose:** Pre-built workflow templates
- **Key Fields:**
  - `id` (UUID, primary key)
  - `name`
  - `description`
  - `category`
  - `definition` (JSONB)
  - `public` (boolean)
  - `created_by` (references `auth.users`)
  - `created_at`, `updated_at`

**Business Logic:**
- Templates speed up workflow creation
- Public templates available to all users
- Private templates for specific tenants

---

### 4. AI Agents

#### Agent (`agents`)
- **Purpose:** AI agent definition
- **Key Fields:**
  - `id` (UUID, primary key)
  - `tenant_id` (references `tenants`)
  - `name`
  - `description`
  - `model` ('gpt-4', 'claude', 'gemini', etc.)
  - `prompt` (text)
  - `config` (JSONB)
  - `status` ('draft', 'active', 'paused')
  - `created_by` (references `auth.users`)
  - `created_at`, `updated_at`

**Business Logic:**
- Agents are tenant-scoped
- Config contains model-specific settings
- Status controls availability

#### Agent Execution (`agent_executions`)
- **Purpose:** Track agent run instances
- **Key Fields:**
  - `id` (UUID, primary key)
  - `agent_id` (references `agents`)
  - `tenant_id` (references `tenants`)
  - `input` (JSONB)
  - `output` (JSONB)
  - `tokens_used` (integer)
  - `cost` (decimal)
  - `status` ('pending', 'running', 'completed', 'failed')
  - `started_at`, `completed_at`
  - `created_at`, `updated_at`

**Business Logic:**
- Tracks token usage for billing
- Records cost per execution
- Used for analytics and optimization

---

### 5. Analytics & Telemetry

#### Telemetry (`telemetry`)
- **Purpose:** User behavior tracking
- **Key Fields:**
  - `id` (UUID, primary key)
  - `tenant_id` (references `tenants`, nullable)
  - `user_id` (references `auth.users`, nullable)
  - `event_type` (text)
  - `event_data` (JSONB)
  - `session_id` (text)
  - `ip_address` (text)
  - `user_agent` (text)
  - `created_at`

**Business Logic:**
- Anonymous tracking supported
- Tenant-scoped for multi-tenant analytics
- Used for product analytics

#### Metrics (`metrics`)
- **Purpose:** Aggregated performance metrics
- **Key Fields:**
  - `id` (UUID, primary key)
  - `tenant_id` (references `tenants`, nullable)
  - `metric_type` (text)
  - `metric_value` (decimal)
  - `dimensions` (JSONB)
  - `period_start`, `period_end`
  - `created_at`, `updated_at`

**Business Logic:**
- Pre-aggregated for performance
- Time-series data
- Used for dashboards and alerts

#### PMF Analytics (`pmf_analytics`)
- **Purpose:** Product-Market Fit metrics
- **Key Fields:**
  - `id` (UUID, primary key)
  - `tenant_id` (references `tenants`)
  - `user_id` (references `auth.users`)
  - `survey_type` ('activation', 'retention', 'satisfaction')
  - `responses` (JSONB)
  - `score` (decimal)
  - `created_at`, `updated_at`

**Business Logic:**
- Tracks user satisfaction
- Used for product decisions
- Tenant-scoped analysis

---

### 6. Billing & Payments

#### Subscription (`subscriptions`)
- **Purpose:** Active user subscriptions
- **Key Fields:**
  - `id` (UUID, primary key)
  - `tenant_id` (references `tenants`)
  - `plan_id` (references `subscription_plans`)
  - `stripe_subscription_id` (text, unique)
  - `stripe_customer_id` (text)
  - `status` ('active', 'canceled', 'past_due', 'trialing')
  - `current_period_start`, `current_period_end`
  - `cancel_at_period_end` (boolean)
  - `created_at`, `updated_at`

**Business Logic:**
- Managed via Stripe webhooks
- Status syncs with Stripe
- Supports cancellation at period end

#### Payment (`payments`)
- **Purpose:** Payment transaction records
- **Key Fields:**
  - `id` (UUID, primary key)
  - `tenant_id` (references `tenants`)
  - `subscription_id` (references `subscriptions`)
  - `stripe_payment_intent_id` (text)
  - `amount` (decimal)
  - `currency` (text)
  - `status` ('pending', 'succeeded', 'failed', 'refunded')
  - `created_at`, `updated_at`

**Business Logic:**
- Records all payment attempts
- Status syncs with Stripe
- Used for financial reporting

---

## Domain Relationships

```
User (1) ──< (many) UserRole
User (1) ──< (many) UserSettings
User (1) ──< (many) TenantMember
User (1) ──< (many) Workflow (created_by)
User (1) ──< (many) Agent (created_by)

Tenant (1) ──< (many) TenantMember
Tenant (1) ──< (many) TenantUsage
Tenant (1) ──< (many) Workflow
Tenant (1) ──< (many) Agent
Tenant (1) ──< (many) Subscription
Tenant (1) ──< (many) Telemetry

SubscriptionPlan (1) ──< (many) Tenant
SubscriptionPlan (1) ──< (many) Subscription

Workflow (1) ──< (many) WorkflowExecution
Agent (1) ──< (many) AgentExecution
```

---

## Business Rules

### Multi-Tenancy
- All data is tenant-scoped
- RLS policies enforce isolation
- Users can belong to multiple tenants
- Tenant members have roles within tenant

### Workflows
- Workflows belong to a tenant
- Only tenant members can create/edit workflows
- Workflow executions are tenant-scoped
- Templates can be public or private

### Billing
- Subscriptions are tenant-level
- Usage tracked per tenant
- Limits enforced per subscription plan
- Payments recorded per transaction

### Analytics
- Telemetry can be anonymous or user-scoped
- Metrics aggregated per tenant
- PMF analytics user-scoped within tenant

---

## Data Access Patterns

### Read Patterns
- **User Profile:** Single query by user ID
- **Tenant Members:** Query by tenant ID
- **Workflows:** Query by tenant ID, filter by status
- **Executions:** Query by workflow ID, filter by date range

### Write Patterns
- **Create Workflow:** Insert workflow, validate definition
- **Execute Workflow:** Create execution record, update status
- **Track Usage:** Increment tenant usage counters

### Query Optimization
- Indexes on foreign keys
- Indexes on status fields
- Indexes on date ranges (created_at, updated_at)
- JSONB indexes for common query patterns

---

## Future Enhancements

1. **Workflow Versioning:** Track workflow definition history
2. **Agent Templates:** Pre-built agent templates
3. **Advanced Analytics:** Real-time dashboards
4. **Workflow Marketplace:** Public workflow sharing
5. **Agent Marketplace:** Public agent sharing

---

**Document Generated By:** Unified Background Agent v3.0  
**Last Updated:** 2025-01-31
