# Deployment Strategy

**Last Updated:** 2025-01-XX  
**Status:** Canonical Strategy Established

---

## Executive Summary

This document establishes the **canonical deployment strategy** for the AIAS Platform. All deployment workflows and configurations must align with this strategy.

---

## Canonical Hosting Platform

**Platform:** Vercel  
**Method:** GitHub Actions → Vercel CLI  
**Native Git Integration:** **DISABLED** (to avoid conflicts with GitHub Actions)

---

## Deployment Paths

### Preview Deployments (Pull Requests)

**Trigger:** Pull Request opened or updated  
**Workflow:** `.github/workflows/frontend-deploy.yml`  
**Environment:** Vercel Preview  
**Branch:** Any branch (via PR)

**Flow:**
1. PR opened/updated → GitHub Actions triggered
2. Run build/test/lint/typecheck (`build-and-test` job)
3. Pull Vercel preview environment config (`vercel pull --environment=preview`)
4. Build for Vercel (`vercel build`)
5. Deploy preview (`vercel deploy --prebuilt --prod=false`)
6. Comment preview URL on PR

**Required Secrets:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Optional Secrets:**
- `NEXT_PUBLIC_SUPABASE_URL` (for build)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for build)

---

### Production Deployments (Main Branch)

**Trigger:** Push to `main` branch  
**Workflow:** `.github/workflows/frontend-deploy.yml`  
**Environment:** Vercel Production  
**Branch:** `main` only

**Flow:**
1. Push to `main` → GitHub Actions triggered
2. Run build/test/lint/typecheck (`build-and-test` job)
3. Pull Vercel production environment config (`vercel pull --environment=production`)
4. Build for Vercel (`vercel build`)
5. Deploy production (`vercel deploy --prebuilt --prod=true`)

**Required Secrets:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Optional Secrets:**
- `NEXT_PUBLIC_SUPABASE_URL` (for build)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for build)

---

### Database Migrations (Production Only)

**Trigger:** Push to `main` branch (if migrations changed)  
**Workflow:** `.github/workflows/apply-supabase-migrations.yml`  
**Environment:** Supabase Production  
**Branch:** `main` only

**Flow:**
1. Push to `main` with migration changes
2. Apply Supabase migrations (`supabase db push`)
3. Validate schema after migration

**Required Secrets:**
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

**Note:** Migrations run **independently** of frontend deployment. Frontend deploy does **not** wait for migrations.

---

## Canonical Workflows

### Primary Deploy Workflow: `frontend-deploy.yml`

**Purpose:** Deploy frontend to Vercel (preview + production)  
**Status:** ✅ **CANONICAL** - This is the source of truth for deployments

**Jobs:**
1. `build-and-test` - Lint, typecheck, test, build
2. `deploy` - Deploy to Vercel (preview or production based on event)

**Triggers:**
- Pull requests (any branch) → Preview deploy
- Push to `main` → Production deploy
- Manual (`workflow_dispatch`) → Preview or Production

---

### Migration Workflow: `apply-supabase-migrations.yml`

**Purpose:** Apply database migrations  
**Status:** ✅ **CANONICAL** - Source of truth for migrations

**Jobs:**
1. `apply-migrations` - Apply Supabase migrations
2. `validate-schema` - Validate database schema

**Triggers:**
- Push to `main` (if migrations changed)
- Manual (`workflow_dispatch`)
- Scheduled (daily at 2 AM UTC)

---

### CI Workflow: `ci.yml`

**Purpose:** Quality checks (lint, test, typecheck, build)  
**Status:** ✅ **CANONICAL** - Source of truth for CI

**Jobs:**
1. `lint` - ESLint
2. `type-check` - TypeScript
3. `format-check` - Prettier
4. `test` - Unit tests
5. `build` - Build verification
6. `test-e2e` - E2E tests (non-blocking)
7. `security-scan` - Security audit (non-blocking)

**Triggers:**
- Pull requests to `main` or `develop`
- Push to `main` or `develop`

---

## Deprecated/Redundant Workflows

### ❌ `deploy-main.yml`

**Status:** **DEPRECATED** - Will be removed

**Reason:** Duplicates `frontend-deploy.yml` functionality. Migration step should be in separate workflow (`apply-supabase-migrations.yml`).

**Action:** Remove after confirming `frontend-deploy.yml` handles all cases.

---

### ❌ `deploy.yml`

**Status:** **DEPRECATED** - Will be removed

**Reason:** Docker-based deployment, not Vercel. Uses wrong Node version (18) and package manager (npm).

**Action:** Remove if not needed for other deployment targets.

---

## Vercel Configuration

### Git Integration Strategy

**Decision:** **DISABLE** Vercel's native Git integration

**Reason:** 
- GitHub Actions provides more control
- Avoids double deployments
- Better integration with CI/CD pipeline

**Action Required:**
1. Update `vercel.json` to disable Git integration:
   ```json
   {
     "git": {
       "deploymentEnabled": {
         "main": false,
         "preview": false
       }
     },
     "github": {
       "deploymentEnabled": {
         "main": false,
         "preview": false
       }
     }
   }
   ```

2. Or remove Git/GitHub config entirely (Vercel CLI deployments don't need it)

---

### Build Configuration

**File:** `vercel.json`

**Current:**
```json
{
  "buildCommand": "pnpm run db:generate && pnpm run build"
}
```

**Issue:** Workflows run `pnpm run build` directly, skipping `db:generate`.

**Decision:** 
- **Option 1:** Update workflows to run `pnpm run db:generate && pnpm run build`
- **Option 2:** Remove `buildCommand` from `vercel.json` (let workflows handle it)

**Recommendation:** Option 2 - Let workflows control build process.

---

## Environment Variables

### Required for Deploy

**GitHub Secrets (CI):**
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

**Vercel Environment Variables (Runtime):**
- All `NEXT_PUBLIC_*` variables (public)
- All server-side variables (private)

**Note:** Vercel env vars are pulled via `vercel pull` in workflows.

---

## Node.js and Package Manager

**Node Version:** `20` (as specified in `package.json` engines)  
**Package Manager:** `pnpm@8.15.0` (as specified in `package.json`)

**All workflows must use:**
- Node 20
- pnpm 8.15.0
- `pnpm install --frozen-lockfile`

---

## Branch Protection

### Required Checks for `main` Branch

**From `ci.yml`:**
- ✅ `lint`
- ✅ `type-check`
- ✅ `format-check`
- ✅ `test`
- ✅ `build`

**Optional (Non-Blocking):**
- `test-e2e`
- `security-scan`

**Deployment Workflows:**
- `frontend-deploy` - Not required (deployment workflow)
- `apply-supabase-migrations` - Not required (migration workflow)

---

## Concurrency Control

**Strategy:** Cancel in-progress deployments when new commit pushed

**Implementation:**
```yaml
concurrency:
  group: frontend-deploy-${{ github.ref }}
  cancel-in-progress: true
```

**Reason:** Prevents multiple deployments from same branch, saves resources.

---

## Rollback Strategy

**Method 1: Vercel Dashboard**
1. Go to Deployments
2. Find previous successful deployment
3. Click "Promote to Production"

**Method 2: Git Revert**
1. Revert commit in Git
2. Push to `main`
3. New deployment automatically created

**Method 3: Vercel CLI**
```bash
vercel rollback [deployment-url]
```

---

## Verification Checklist

Before considering deployment strategy complete:

- [ ] `frontend-deploy.yml` is the only workflow deploying to Vercel
- [ ] `deploy-main.yml` is removed or disabled
- [ ] `deploy.yml` is removed or disabled (if not needed)
- [ ] Vercel Git integration is disabled
- [ ] All workflows use Node 20 + pnpm
- [ ] All workflows validate required secrets before deploy
- [ ] Preview deploys work for PRs
- [ ] Production deploys work for `main` pushes
- [ ] Migrations run independently of frontend deploy

---

## Conclusion

**Canonical Deploy Workflow:** `frontend-deploy.yml`  
**Canonical Migration Workflow:** `apply-supabase-migrations.yml`  
**Canonical CI Workflow:** `ci.yml`  
**Hosting Platform:** Vercel  
**Deployment Method:** GitHub Actions → Vercel CLI  
**Vercel Git Integration:** Disabled

**Next Steps:**
1. Fix all workflows to align with this strategy
2. Remove redundant workflows
3. Disable Vercel Git integration
4. Add validation and error handling
5. Test preview and production deployments
