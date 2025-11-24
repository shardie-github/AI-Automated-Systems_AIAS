# CI/CD Overview

This document describes the current CI/CD setup, package management, and deployment workflows for the AIAS Platform.

## Current State

### Package Manager
- **Canonical:** pnpm (version 8.15.0)
- **Lockfile:** `pnpm-lock.yaml`
- **Issue:** Multiple lockfiles exist (`package-lock.json`, `bun.lockb`) causing confusion

### Node Version
- **Current:** Inconsistent across workflows
  - `.nvmrc`: 18.17.0
  - `package.json` engines: `>=18.17.0`
  - Some workflows use Node 18, others use Node 20
- **Target:** Standardize on Node 20 LTS

### Frontend Framework
- **Framework:** Next.js 14.2.0
- **Build tool:** Next.js built-in (SWC)
- **Type checking:** TypeScript 5.3.0

## CI Workflows

### 1. Main CI Pipeline (`ci.yml`)
- **Triggers:** PRs and pushes to `main`/`develop`
- **Jobs:**
  - `lint`: ESLint checks
  - `type-check`: TypeScript compilation check
  - `format-check`: Prettier formatting check
  - `test`: Unit tests (Vitest)
  - `build`: Production build
  - `test-e2e`: E2E tests (non-blocking, Playwright)
  - `security-scan`: Security audit (non-blocking)
- **Status:** ✅ Uses pnpm correctly, Node 18

### 2. Vercel Deployment Workflows
Multiple workflows handle Vercel deployments:

#### `auto-deploy-vercel.yml`
- **Triggers:** Push to `main`, manual
- **Issues:**
  - Uses third-party action (`amondnet/vercel-action`)
  - No PR preview deployments
  - Uses pnpm correctly ✅

#### `preview-pr.yml`
- **Triggers:** Manual only (`workflow_dispatch`)
- **Issues:**
  - Uses npm instead of pnpm ❌
  - Not triggered automatically on PRs
  - Node 20 (inconsistent)

#### `deploy-main.yml`
- **Triggers:** Push to `main`, manual
- **Issues:**
  - Uses npm instead of pnpm ❌
  - Node 20 (inconsistent)
  - Combines DB migrations with frontend deploy (should be separate)

### 3. Supabase Migrations (`supabase-migrate.yml`)
- **Triggers:** Push to `main`, manual
- **Status:** ✅ Uses Supabase CLI correctly
- **Issues:**
  - Hardcoded project ref (should use secret)
  - Node 20 (inconsistent)

## Current Problems

1. **Lockfile Confusion:** Multiple lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `bun.lockb`)
2. **Node Version Inconsistency:** Mix of Node 18 and Node 20 across workflows
3. **Package Manager Inconsistency:** Some workflows use npm, others use pnpm
4. **No Unified Frontend CI/CD:** Multiple overlapping workflows for Vercel deployment
5. **Missing PR Preview Deployments:** No automatic preview deployments for PRs
6. **Hardcoded Secrets:** Supabase project ref is hardcoded

## Target State

### Standardized Setup
- **Package Manager:** pnpm 8.15.0 (canonical)
- **Node Version:** 20 LTS (consistent across all workflows)
- **Lockfile:** Only `pnpm-lock.yaml` in version control

### Unified Frontend CI/CD
- **Workflow:** `.github/workflows/frontend-deploy.yml`
- **Features:**
  - PRs → Preview deployments to Vercel
  - `main` branch → Production deployments
  - Build/test/lint/typecheck before deploy
  - Uses official Vercel CLI (not third-party actions)

### Supabase Migrations
- **Workflow:** `.github/workflows/supabase-migrate.yml` (separate, decoupled)
- **Features:**
  - Uses secrets for all configuration
  - Runs independently of frontend deployments
  - Manual trigger or push to `main`

## Required GitHub Secrets

### Frontend Deployment
- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

### Supabase Migrations
- `SUPABASE_ACCESS_TOKEN`: Supabase access token
- `SUPABASE_PROJECT_REF`: Supabase project reference ID

## Check Status

### Required for Merge (PRs)
- ✅ Lint
- ✅ Type Check
- ✅ Format Check
- ✅ Tests
- ✅ Build
- ✅ Preview Deployment (new)

### Non-Blocking
- E2E Tests (continue-on-error)
- Security Scan (continue-on-error)

## Next Steps

1. ✅ Standardize Node version to 20 (main CI/CD workflows)
2. ✅ Remove unused lockfiles
3. ✅ Create unified frontend-deploy.yml
4. ✅ Fix Supabase workflow to use secrets
5. ✅ Update main CI/CD workflows to use pnpm consistently
6. ✅ Document deployment process

## Note on Other Workflows

There are additional specialized workflows (analytics, audits, performance monitoring, etc.) that still use Node 18 and npm. These are not part of the main CI/CD pipeline and can be updated separately if needed. The critical workflows for frontend deployment and database migrations have been standardized.

## Status Summary

✅ **Main CI Pipeline** (`ci.yml`) - Node 20, pnpm  
✅ **Frontend Deployment** (`frontend-deploy.yml`) - Node 20, pnpm, unified workflow  
✅ **Supabase Migrations** (`supabase-migrate.yml`) - Node 20, pnpm, uses secrets  
✅ **Package Management** - pnpm canonical, single lockfile  
✅ **Documentation** - Complete deployment guides created
