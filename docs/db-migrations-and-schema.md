# Database Migrations & Schema Management

**Last Updated:** 2025-01-31  
**Purpose:** Complete guide to database migrations, schema management, and validation

---

## Executive Summary

The AIAS Platform uses **Supabase migrations** as the canonical database schema management system. All database changes are version-controlled SQL files in `supabase/migrations/`. Migrations are applied automatically via CI/CD.

**Canonical System:** Supabase Migrations  
**Legacy System:** Prisma (partially used, being phased out)

---

## Migration System

### Supabase Migrations (Canonical)

**Location:** `supabase/migrations/`  
**Format:** SQL files with timestamped names  
**Count:** 27 migration files  
**Latest:** `99999999999999_master_consolidated_schema.sql`

#### Migration Naming Convention

Migrations use timestamp-based naming:
- Format: `YYYYMMDDHHMMSS_description.sql`
- Example: `20250120000000_privacy_security_automation.sql`
- Consolidated: `99999999999999_master_consolidated_schema.sql` (baseline)

#### Migration Workflow

```mermaid
graph LR
    A[Developer creates migration] --> B[Commit to supabase/migrations/]
    B --> C[CI: Validate migration syntax]
    C --> D[CI: Apply to production DB]
    D --> E[CI: Validate schema]
    E --> F[CI: Regenerate types]
```

**Steps:**
1. Developer creates SQL migration file
2. Commits to `supabase/migrations/`
3. CI applies migrations via Supabase CLI (`apply-supabase-migrations.yml`)
4. Migrations run on push to `main` or manual trigger
5. Schema validation runs after migration
6. TypeScript types regenerated

#### CI Integration

**Workflow:** `.github/workflows/apply-supabase-migrations.yml`

**Triggers:**
- Push to `main` with migration changes
- Manual (`workflow_dispatch`)
- Daily schedule (2 AM UTC)

**Steps:**
1. Setup Supabase CLI
2. Authenticate with Supabase
3. Link project
4. Check pending migrations (dry-run)
5. Apply migrations (`supabase db push`)
6. Validate schema (`db:validate-schema`)
7. Regenerate types (`regenerate-types`)

**Fallback:** If Supabase CLI fails, falls back to direct `psql` connection

---

## Schema Management

### Current Schema

**Database:** Supabase (PostgreSQL)  
**Extensions:**
- `uuid-ossp` - UUID generation
- `pgcrypto` - Cryptographic functions
- `pg_trgm` - Text search
- `vector` - Vector embeddings (for AI features)

### Key Tables

#### Core Tables
- `profiles` - User profiles
- `organizations` - Organizations/tenants
- `tenant_members` - Multi-tenant membership
- `user_roles` - Role-based access control
- `user_settings` - User preferences

#### Business Tables
- `subscriptions` - Stripe subscriptions
- `projects` - User projects
- `workflows` - Automation workflows
- `agents` - AI agents
- `integrations` - Third-party integrations
- `marketplace_items` - Marketplace listings

#### Analytics Tables
- `app_events` - Application events
- `telemetry` - Telemetry data
- `audit_logs` - Audit trail
- `trust_ledger` - Trust/security ledger

#### Content Tables
- `blog_posts` - Blog posts
- `comments` - Comments
- `lead_generation` - Lead gen data

### Row Level Security (RLS)

**Status:** ✅ **IMPLEMENTED**

RLS policies enforce multi-tenant isolation and access control at the database level. All tables have RLS enabled with appropriate policies.

**Key Policies:**
- Users can only access their own data
- Tenant members can only access their tenant's data
- Admins have elevated access
- Public tables have read-only access for anon users

**Validation:** RLS policies are tested in health check endpoint (`/api/healthz`)

---

## Migration Best Practices

### ✅ Current Practices
- Timestamped migration files
- SQL-based (explicit, version-controlled)
- CI-applied (no local CLI required)
- Dry-run capability
- Schema validation after migration

### ⚠️ Areas for Improvement

#### 1. Migration Testing
**Current:** Migrations applied directly to production  
**Recommended:** Add staging database for migration testing

**Action Items:**
- [ ] Set up staging Supabase project
- [ ] Test migrations in staging before production
- [ ] Add migration testing to CI

#### 2. Rollback Strategy
**Current:** No documented rollback procedures  
**Recommended:** Document rollback procedures

**Action Items:**
- [ ] Document rollback procedures for each migration type
- [ ] Create rollback migration templates
- [ ] Test rollback procedures

#### 3. Migration Validation
**Current:** Schema validation runs but is non-blocking  
**Recommended:** Make validation blocking

**Action Items:**
- [ ] Make schema validation blocking in CI
- [ ] Add migration syntax validation
- [ ] Add migration dependency checking

#### 4. Migration Consolidation
**Current:** 27 migration files, some may be redundant  
**Recommended:** Consolidate redundant migrations

**Action Items:**
- [ ] Audit migration history
- [ ] Identify redundant migrations
- [ ] Consolidate into baseline migration

---

## Schema Validation

### Validation Script

**Location:** `scripts/db-schema-validator.ts`  
**Command:** `pnpm run db:validate-schema`

**Validates:**
- Required tables exist
- Required columns exist
- RLS policies are enabled
- Indexes are present
- Foreign keys are correct

**Usage:**
```bash
# Validate current schema
pnpm run db:validate-schema

# Validate migrations
pnpm run db:validate-migrations
```

### Required Tables

The validator checks for these core tables:
- `users` / `profiles`
- `organizations` / `tenants`
- `tenant_members`
- `user_settings`
- `subscriptions`
- `projects`
- `workflows`
- `agents`
- `integrations`
- `app_events`
- `telemetry`
- `audit_logs`

---

## Legacy: Prisma Schema

### Current State

**Location:** `apps/web/prisma/schema.prisma`  
**Status:** ⚠️ **PARTIALLY USED** (Legacy)

**Usage:**
- Still used in some scripts:
  - `ops/billing/stripe.ts`
  - `apps/web/prisma/seed.ts`
  - `scripts/master-omega-prime/validate-schema.ts`
- Not used in main application code
- Database access primarily via Supabase client

### Migration Plan

**Phase 1: Audit** (Week 1)
- [ ] Identify all Prisma usage
- [ ] Document Prisma dependencies
- [ ] Create migration plan

**Phase 2: Migrate** (Week 2-3)
- [ ] Migrate `ops/billing/stripe.ts` to Supabase client
- [ ] Migrate seed scripts to Supabase client
- [ ] Remove Prisma dependencies where possible

**Phase 3: Archive** (Week 4)
- [ ] Archive Prisma schema to `docs/archive/prisma-schema.prisma`
- [ ] Remove Prisma from `package.json` (if unused)
- [ ] Document Prisma as legacy

---

## Database Connection

### Connection Strings

**Current Setup:**
- `DATABASE_URL`: Primary connection (used by Prisma if active)
- `DIRECT_URL`: Direct connection (for migrations)
- Supabase client uses `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`

**Format:**
```
postgresql://postgres:{service-role-key}@db.{project-ref}.supabase.co:5432/postgres?sslmode=require
```

**Recommendation:**
- Use Supabase connection strings directly
- Keep `DATABASE_URL` for legacy code
- Primary access via Supabase client, not direct Postgres

### Environment Variables

**Required:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)
- `NEXT_PUBLIC_SUPABASE_URL` - Public URL (client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key (client-side)

**Optional:**
- `DATABASE_URL` - Direct Postgres connection (for migrations)
- `DIRECT_URL` - Direct connection URL

---

## Backup & Recovery

### Current State

**Supabase Free Tier:**
- ❌ No automated backups
- ✅ Manual exports available
- ⚠️ **Risk:** Data loss if database corrupted

**Supabase Pro Tier:**
- ✅ Daily automated backups
- ✅ 7-day retention
- ✅ Point-in-time recovery (Team tier)

### Backup Strategy

**Recommended:**
1. **Automated:** Upgrade to Supabase Pro for daily backups
2. **Manual:** Weekly `pg_dump` exports (store in S3/GCS)
3. **Point-in-Time Recovery:** Supabase Team tier ($599/month)

**Action Items:**
- [ ] Upgrade to Supabase Pro before production launch
- [ ] Document manual backup procedures
- [ ] Test restore procedures
- [ ] Set up automated backup notifications

---

## Migration Troubleshooting

### Common Issues

#### 1. Migration Fails in CI
**Symptoms:** Migration workflow fails  
**Causes:**
- Syntax errors in migration SQL
- Missing dependencies
- RLS policy conflicts

**Solutions:**
- Check migration SQL syntax
- Verify migration dependencies
- Review RLS policies

#### 2. Schema Validation Fails
**Symptoms:** Schema validation script fails  
**Causes:**
- Missing tables/columns
- RLS policies not enabled
- Indexes missing

**Solutions:**
- Check migration was applied correctly
- Verify RLS policies
- Add missing indexes

#### 3. Type Generation Fails
**Symptoms:** TypeScript types not regenerated  
**Causes:**
- Supabase CLI not authenticated
- Project not linked
- Network issues

**Solutions:**
- Verify Supabase credentials
- Re-link project
- Check network connectivity

---

## Best Practices

### Creating Migrations

1. **Use Timestamps:** Always use timestamp-based naming
2. **Be Atomic:** Each migration should be a single logical change
3. **Test Locally:** Test migrations locally before committing
4. **Document Changes:** Add comments explaining complex changes
5. **Consider Rollback:** Think about how to rollback if needed

### Example Migration

```sql
-- Migration: Add user preferences table
-- Date: 2025-01-31
-- Description: Adds user_preferences table for storing user settings

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_key text NOT NULL,
  preference_value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, preference_key)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
```

---

## Conclusion

The AIAS Platform uses **Supabase migrations** as the canonical database schema management system. Migrations are version-controlled, CI-applied, and validated. The system is production-ready with minor improvements recommended for testing and rollback procedures.

**Key Takeaways:**
1. ✅ Supabase migrations are canonical
2. ⚠️ Prisma is legacy (being phased out)
3. ✅ RLS policies enforce security
4. ⚠️ Need staging database for migration testing
5. ⚠️ Need documented rollback procedures

**Next Steps:**
1. Set up staging database
2. Document rollback procedures
3. Migrate remaining Prisma usage
4. Enhance migration testing

---

**Last Updated:** 2025-01-31  
**Maintainer:** Platform Team
