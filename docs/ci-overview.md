# CI/CD Overview

**Last Updated:** 2025-01-XX  
**Purpose:** Complete guide to CI/CD workflows, required checks, and branch protection

---

## Executive Summary

The AIAS Platform uses **GitHub Actions** for all CI/CD operations. The repository has **37 workflow files**, many of which are redundant or obsolete. This document identifies essential workflows and recommends consolidation.

---

## Essential Workflows

### ✅ Core CI (`ci.yml`)

**Purpose:** Run quality checks on every PR and push

**Triggers:**
- Pull requests to `main` or `develop`
- Push to `main` or `develop`

**Jobs:**
1. **Lint** - ESLint code linting
2. **Type Check** - TypeScript type checking
3. **Format Check** - Prettier formatting check
4. **Test** - Unit tests (Vitest)
5. **Build** - Next.js build verification
6. **E2E Tests** (non-blocking) - Playwright E2E tests
7. **Security Scan** (non-blocking) - Dependency security audit

**Status:** ✅ Active and Required

**Branch Protection:** Should be required for `main` branch

---

### ✅ Frontend Deployment (`frontend-deploy.yml`)

**Purpose:** Deploy frontend to Vercel (preview + production)

**Triggers:**
- Pull requests (preview deployments)
- Push to `main` (production deployment)
- Manual (`workflow_dispatch`)

**Jobs:**
1. **Build and Test** - Lint, typecheck, test, build
2. **Deploy** - Deploy to Vercel (preview or production)

**Status:** ✅ Active and Required

**Branch Protection:** Not required (deployment workflow)

---

### ✅ Database Migrations (`apply-supabase-migrations.yml`)

**Purpose:** Apply Supabase database migrations

**Triggers:**
- Push to `main` with migration changes
- Manual (`workflow_dispatch`)
- Daily schedule (2 AM UTC)

**Jobs:**
1. **Apply Migrations** - Apply pending Supabase migrations
2. **Validate Schema** - Validate database schema after migration

**Status:** ✅ Active and Required

**Branch Protection:** Not required (runs independently)

---

## Redundant Workflows (To Remove/Consolidate)

### ⚠️ `deploy-main.yml`

**Purpose:** Deploy to production + run migrations

**Status:** ⚠️ **Redundant**

**Reason:** Duplicates `frontend-deploy.yml` functionality

**Recommendation:** 
- **Option 1:** Remove (use `frontend-deploy.yml` + `apply-supabase-migrations.yml`)
- **Option 2:** Keep but rename to `deploy-production.yml` and make it the canonical production deploy

**Action:** Consolidate into `frontend-deploy.yml` or remove

---

### ⚠️ `auto-deploy-vercel.yml`

**Purpose:** Auto-deploy to Vercel on main

**Status:** ⚠️ **Redundant**

**Reason:** Duplicates `frontend-deploy.yml` functionality

**Recommendation:** Remove (use `frontend-deploy.yml` instead)

**Action:** Delete this workflow

---

### ⚠️ `preview-pr.yml`

**Purpose:** Preview deployments for PRs

**Status:** ⚠️ **Partially Redundant**

**Reason:** `frontend-deploy.yml` already handles PR previews

**Recommendation:** 
- **Option 1:** Remove (use `frontend-deploy.yml`)
- **Option 2:** Keep but enable for all PRs (currently manual only)

**Action:** Remove or consolidate into `frontend-deploy.yml`

---

### ⚠️ `supabase-migrate.yml`

**Purpose:** Apply Supabase migrations

**Status:** ⚠️ **Redundant**

**Reason:** Duplicates `apply-supabase-migrations.yml`

**Recommendation:** Remove (use `apply-supabase-migrations.yml`)

**Action:** Delete this workflow

---

## Optional/Advanced Workflows

### 🔵 `regenerate-supabase-types.yml`

**Purpose:** Regenerate TypeScript types from Supabase schema

**Status:** 🔵 Optional

**Recommendation:** Keep if types need regular regeneration

**Action:** Keep if needed, otherwise remove

---

### 🔵 `env-smoke-test.yml`

**Purpose:** Validate environment variables

**Status:** 🔵 Optional

**Recommendation:** Keep if environment validation is critical

**Action:** Keep if needed, otherwise remove

---

### 🔵 `security.yml`

**Purpose:** Security scanning

**Status:** 🔵 Optional

**Recommendation:** Keep if security scanning is important (already in `ci.yml`)

**Action:** Consolidate into `ci.yml` or remove

---

## Self-Healing/Automation Workflows

### 🟡 `data-quality-self-healing.yml`

**Purpose:** Automated data quality checks

**Status:** 🟡 Advanced/Automation

**Recommendation:** Keep if data quality automation is needed

**Action:** Keep if actively used, otherwise archive

---

### 🟡 `preflight-self-healing.yml`

**Purpose:** Pre-deployment checks

**Status:** 🟡 Advanced/Automation

**Recommendation:** Keep if pre-deployment automation is needed

**Action:** Keep if actively used, otherwise archive

---

### 🟡 `system-health-self-healing.yml`

**Purpose:** System health monitoring

**Status:** 🟡 Advanced/Automation

**Recommendation:** Keep if system health automation is needed

**Action:** Keep if actively used, otherwise archive

---

## Other Workflows (Audit Needed)

The following workflows exist but need audit to determine if they're actively used:

- `ai-audit.yml` - AI-powered code audits
- `benchmarks.yml` - Performance benchmarks
- `canary-deploy.yml` - Canary deployments
- `code-hygiene.yml` - Code quality checks
- `daily-analytics.yml` - Analytics aggregation
- `docs-guard.yml` - Documentation checks
- `env-sync.yml` - Environment sync
- `full-matrix-ci.yml` - Matrix testing
- `futurecheck.yml` - Future-proofing checks
- `meta-audit.yml` - Meta audits
- `mobile.yml` - Mobile testing
- `nightly-etl-self-healing.yml` - ETL automation
- `performance-pr.yml` - Performance PR checks
- `performance.yml` - Performance monitoring
- `quality-gates.yml` - Quality gates
- `supabase-delta-apply-self-healing.yml` - Delta migrations
- `supabase-weekly-maintenance.yml` - Weekly maintenance
- `systems-metrics.yml` - Metrics collection
- `telemetry.yml` - Telemetry
- `ui-ingest.yml` - UI ingestion
- `unified-agent.yml` - Unified agent
- `vercel-guard.yml` - Vercel validation
- `vercel-validation.yml` - Vercel validation
- `watcher-cron.yml` - Watcher cron jobs
- `weekly-maint.yml` - Weekly maintenance

**Recommendation:** Audit each workflow to determine:
1. Is it actively used?
2. Does it provide value?
3. Can it be consolidated?

**Action:** Create audit script or manually review each workflow

---

## Recommended Workflow Structure

### Minimal (Essential Only)

```
.github/workflows/
├── ci.yml                          # Core CI (lint, test, build)
├── frontend-deploy.yml             # Frontend deployment (preview + prod)
└── apply-supabase-migrations.yml   # Database migrations
```

### Standard (Recommended)

```
.github/workflows/
├── ci.yml                          # Core CI
├── frontend-deploy.yml             # Frontend deployment
├── apply-supabase-migrations.yml   # Database migrations
├── regenerate-supabase-types.yml   # Type generation (optional)
└── security.yml                    # Security scanning (optional)
```

### Advanced (Current State)

Keep all workflows but organize into categories:
- `core/` - Essential workflows
- `deployment/` - Deployment workflows
- `automation/` - Self-healing/automation
- `monitoring/` - Monitoring and metrics
- `archive/` - Obsolete workflows

---

## Branch Protection Rules

### Required Checks for `main` Branch

**Required Status Checks:**
1. ✅ `lint` (from `ci.yml`)
2. ✅ `type-check` (from `ci.yml`)
3. ✅ `format-check` (from `ci.yml`)
4. ✅ `test` (from `ci.yml`)
5. ✅ `build` (from `ci.yml`)
6. ✅ `test-e2e` (from `ci.yml`) - **Critical flows (blocking)**

**Optional Checks:**
- `security-scan` (non-blocking)

**Settings:**
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require pull request reviews (recommended: 1 approval)
- Do not allow force pushes
- Do not allow deletions

**See:** [Branch Protection Guide](./branch-protection.md) for complete setup instructions

---

## Workflow Concurrency

### Current Concurrency Settings

**`frontend-deploy.yml`:**
```yaml
concurrency:
  group: frontend-deploy-${{ github.ref }}
  cancel-in-progress: true
```

**`apply-supabase-migrations.yml`:**
```yaml
concurrency:
  group: supabase-migrations-${{ github.ref }}
  cancel-in-progress: false
```

**Recommendation:** Keep concurrency groups to prevent overlapping deployments

---

## Workflow Performance

### Current Performance

- **CI Workflow:** ~5-8 minutes
- **Deployment Workflow:** ~3-5 minutes
- **Migration Workflow:** ~2-3 minutes

### Optimization Opportunities

1. **Parallel Jobs:** Already implemented (lint, typecheck, format run in parallel)
2. **Caching:** Already implemented (pnpm cache, Node cache)
3. **Artifact Reuse:** Already implemented (build artifacts uploaded/downloaded)

---

## Troubleshooting

### Workflow Fails

**Check:**
1. Workflow logs in GitHub Actions
2. Required secrets are set
3. Environment variables are configured
4. Dependencies are up to date

### Deployment Fails

**Check:**
1. Vercel token is valid
2. Vercel project is linked
3. Build succeeds locally
4. Environment variables in Vercel

### Migration Fails

**Check:**
1. Supabase access token is valid
2. Supabase project ref is correct
3. Migration SQL is valid
4. Database connection is available

---

## Migration Plan

### Phase 1: Audit (Week 1)

1. Review all 37 workflows
2. Identify actively used workflows
3. Document purpose of each workflow
4. Identify redundant workflows

### Phase 2: Consolidate (Week 2)

1. Remove redundant workflows:
   - `auto-deploy-vercel.yml`
   - `supabase-migrate.yml`
   - `preview-pr.yml` (or consolidate)
2. Consolidate similar workflows
3. Update branch protection rules

### Phase 3: Optimize (Week 3)

1. Optimize workflow performance
2. Add missing checks
3. Improve error handling
4. Add notifications

---

## Conclusion

**Current State:** 37 workflows (many redundant)  
**Target State:** 3-5 essential workflows  
**Action Required:** Audit and consolidate workflows  

**Next Steps:**
1. Audit all workflows
2. Remove redundant workflows
3. Consolidate similar workflows
4. Update branch protection rules
5. Document final workflow structure
