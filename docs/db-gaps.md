# Database Schema Gaps & Inconsistencies

This document identifies gaps, inconsistencies, and issues found when comparing migrations to actual code usage.

**Generated:** 2025-01-31

---

## ⚠️ Missing Tables Referenced in Code

### 1. `workflows` table
- **Status:** Referenced in `20250302000000_add_workflow_executions_table.sql` but not fully defined
- **Issue:** `workflow_executions` references `workflows(id)` but `workflows` table definition is missing
- **Action Required:** Add `workflows` table definition to master migration

### 2. `user_roles` table dependency
- **Status:** Referenced in RLS policies but created in later migration
- **Issue:** Some migrations reference `user_roles` before it's created
- **Action Required:** Ensure `user_roles` is created early in master migration

---

## ⚠️ Duplicate/Overlapping Tables

### 1. Event Tracking Tables
- **Tables:** `events`, `telemetry_events`, `app_events`
- **Issue:** Three similar tables for event tracking
- **Recommendation:** Consolidate into single `events` table with `type` and `source` columns
- **Action:** Keep `app_events` as primary, mark others as deprecated

### 2. Failed Login Attempts
- **Tables:** `failed_attempts`, `failed_login_attempts`
- **Issue:** Two tables with same purpose
- **Recommendation:** Use `failed_login_attempts` (more complete)
- **Action:** Remove `failed_attempts` from master migration

### 3. Audit Logs
- **Tables:** `audit_log`, `audit_logs`
- **Issue:** Two audit log tables
- **Recommendation:** Use `audit_logs` (more complete schema)
- **Action:** Remove `audit_log` from master migration

### 4. Workflow Definitions
- **Tables:** `automation_workflows`, `workflow_definitions`
- **Issue:** Two tables for workflow definitions
- **Recommendation:** Consolidate into `automation_workflows`
- **Action:** Remove `workflow_definitions` from master migration

### 5. Step Executions
- **Tables:** `step_executions`, `workflow_steps`
- **Issue:** Two tables for workflow step tracking
- **Recommendation:** Use `step_executions` (more consistent naming)
- **Action:** Remove `workflow_steps` from master migration

### 6. Notifications
- **Tables:** `notifications` (in gamification), `notifications` (in user_settings)
- **Issue:** Same table name defined twice with different schemas
- **Recommendation:** Use single `notifications` table with all fields
- **Action:** Merge schemas in master migration

---

## ⚠️ Missing Foreign Key Constraints

### 1. `tenant_members.tenant_id`
- **Issue:** References `tenants(id)` but `tenants` may be created later
- **Action:** Ensure `tenants` is created before `tenant_members`

### 2. `workflow_executions.workflow_id`
- **Issue:** References `workflows(id)` but `workflows` table missing
- **Action:** Create `workflows` table or update foreign key

---

## ⚠️ Inconsistent Column Types

### 1. `workflow_executions.id`
- **Issue:** In `20250302000000_add_workflow_executions_table.sql` it's `TEXT`, but in `20250124000000_orchestrator_tables.sql` it's `UUID`
- **Action:** Standardize to `UUID` (more consistent with other tables)

### 2. `leads.tenant_id`
- **Issue:** Defined as `TEXT` in lead generation migration but should be `UUID` to match `tenants.id`
- **Action:** Change to `UUID` with proper foreign key

---

## ⚠️ Missing Indexes

### 1. `tenant_members(user_id, tenant_id)` composite index
- **Issue:** Frequently queried but no composite index
- **Action:** Add composite index for performance

### 2. `workflow_executions(workflow_id, created_at DESC)`
- **Issue:** Common query pattern but missing composite index
- **Action:** Add composite index

---

## ⚠️ RLS Policy Issues

### 1. Policies referencing non-existent functions
- **Issue:** Some policies reference `public.is_admin()` before function is created
- **Action:** Ensure helper functions are created before policies

### 2. Policies referencing `user_roles` before table exists
- **Issue:** Some policies check `user_roles` before table is created
- **Action:** Create `user_roles` table early in migration

### 3. Inconsistent policy naming
- **Issue:** Some policies use snake_case, others use camelCase
- **Action:** Standardize to snake_case for consistency

---

## ⚠️ Function Security Issues

### 1. Missing `SET search_path`
- **Issue:** Some `SECURITY DEFINER` functions don't set `search_path`
- **Security Risk:** Potential SQL injection via search_path manipulation
- **Action:** Add `SET search_path = public` to all SECURITY DEFINER functions

### 2. Functions without proper grants
- **Issue:** Some functions aren't granted to `authenticated` and `anon` roles
- **Action:** Add `GRANT EXECUTE` statements for all public functions

---

## ⚠️ Missing Triggers

### 1. `updated_at` triggers
- **Issue:** Some tables have `updated_at` columns but no triggers
- **Action:** Add triggers for all tables with `updated_at` columns

---

## ⚠️ Obsolete/Unused Tables

### 1. `spend` table
- **Status:** Defined in early migration but may not be used
- **Action:** Verify usage in codebase before including in master migration

### 2. `metrics_daily` table
- **Status:** Defined but may be superseded by `metrics_log`
- **Action:** Verify usage before including

---

## ⚠️ Missing Seed Data

### 1. Default subscription plans
- **Issue:** Defined in migration but should use `ON CONFLICT DO NOTHING`
- **Action:** Ensure idempotent seed data inserts

### 2. Default badges
- **Issue:** No seed data for badges
- **Action:** Consider adding default badges if needed

---

## ⚠️ Extension Dependencies

### 1. `vector` extension
- **Issue:** Required for `ai_embeddings` but may not be enabled
- **Action:** Ensure `CREATE EXTENSION IF NOT EXISTS vector` is included

### 2. `pg_stat_statements`
- **Issue:** Referenced in enterprise security migration but may not be available
- **Action:** Make extension creation conditional or document requirement

---

## Summary of Actions Required

1. ✅ Create `workflows` table definition
2. ✅ Consolidate duplicate tables (events, audit logs, workflows)
3. ✅ Fix foreign key constraints and column types
4. ✅ Add missing indexes
5. ✅ Fix RLS policy ordering
6. ✅ Add `SET search_path` to all SECURITY DEFINER functions
7. ✅ Add missing triggers
8. ✅ Ensure proper seed data with `ON CONFLICT DO NOTHING`
9. ✅ Document extension requirements

---

## Migration Order Considerations

The master migration should follow this order:

1. Extensions
2. Enums
3. Helper functions (is_admin, has_role, etc.)
4. Core tables (users, profiles, user_roles)
5. Tenant tables
6. Application tables (workflows, events, etc.)
7. Analytics tables
8. Security tables
9. Indexes
10. RLS policies
11. Triggers
12. Seed data
