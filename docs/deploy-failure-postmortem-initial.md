# Deployment Failure Postmortem - Initial Investigation

**Date:** 2025-01-XX  
**Investigator:** Post-Merge Deployment Forensic Engineer  
**Status:** Initial Analysis Complete

---

## Executive Summary

After examining the repository's CI/CD configuration, **multiple critical failure modes** have been identified that prevent reliable Vercel Preview and Production deployments. This document catalogs all suspected failure points based on configuration analysis.

---

## Failure Mode 1: Workflow Not Triggering

### Root Causes Identified

#### 1.1 Conflicting Deploy Workflows

**Issue:** Multiple workflows attempt to deploy to the same environments:

- `deploy.yml` - Docker-based deployment (not Vercel)
- `deploy-main.yml` - Vercel production deploy on `main` push
- `frontend-deploy.yml` - Vercel preview + production deploy on PRs and `main` push

**Problem:** Both `deploy-main.yml` and `frontend-deploy.yml` trigger on `main` push, causing:
- Race conditions
- Duplicate deployments
- Unclear which workflow is canonical

**Evidence:**
```yaml
# deploy-main.yml
on:
  push:
    branches: [main]

# frontend-deploy.yml  
on:
  push:
    branches: [main]
```

#### 1.2 Branch Filter Mismatches

**Issue:** `deploy.yml` triggers on `develop` branch, but other workflows only use `main`:

```yaml
# deploy.yml
on:
  push:
    branches: [main, develop]  # Includes develop
  pull_request:
    branches: [main]            # Only main PRs

# frontend-deploy.yml
on:
  pull_request:
    branches: ['**']            # All PRs (good)
  push:
    branches: [main]            # Only main (good)
```

**Impact:** Inconsistent behavior between workflows.

#### 1.3 Path Filters Preventing Triggers

**Issue:** `vercel-validation.yml` only runs when `vercel.json` changes:

```yaml
on:
  push:
    branches: [main, master]
    paths:
      - 'vercel.json'
      - '.vercel/**'
```

**Impact:** If Vercel config changes aren't in these paths, validation never runs.

---

## Failure Mode 2: Workflow Runs But Deploy Step Skipped

### Root Causes Identified

#### 2.1 Conditional Logic Issues

**Issue:** `frontend-deploy.yml` deploy job condition may skip on some events:

```yaml
if: |
  (github.event_name == 'pull_request') || 
  (github.ref == 'refs/heads/main')
```

**Problem:** This condition is correct, but the job also has separate steps for preview vs production that use `if:` conditions:

```yaml
- name: Deploy to Vercel (Preview)
  if: github.event_name == 'pull_request'  # ✅ Correct

- name: Deploy to Vercel (Production)
  if: github.ref == 'refs/heads/main'       # ⚠️ Missing event_name check
```

**Impact:** Production deploy step could run on PRs if branch name matches `main` (unlikely but possible).

#### 2.2 Job Dependency Chain

**Issue:** `deploy.yml` has complex dependency chain that may skip deploy:

```yaml
deploy-production:
  needs: [build-and-push]
  if: github.ref == 'refs/heads/main' || (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'production')
```

**Problem:** If `build-and-push` job is skipped (only runs on push/workflow_dispatch), deploy never runs.

**Evidence:**
```yaml
build-and-push:
  if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'
```

**Impact:** PRs never trigger deploy in `deploy.yml` (but this workflow doesn't deploy to Vercel anyway).

---

## Failure Mode 3: Workflow Runs But Fails

### Root Causes Identified

#### 3.1 Node Version Mismatches

**Critical Issue:** Multiple workflows use wrong Node version:

| Workflow | Node Version | Required | Status |
|----------|--------------|----------|--------|
| `deploy.yml` | 18 | 20 | ❌ Wrong |
| `vercel-guard.yml` | 18 | 20 | ❌ Wrong |
| `vercel-validation.yml` | 20 | 20 | ✅ Correct |
| `frontend-deploy.yml` | 20 | 20 | ✅ Correct |
| `deploy-main.yml` | 20 | 20 | ✅ Correct |
| `ci.yml` | 20 | 20 | ✅ Correct |

**Impact:** Builds may fail or produce inconsistent results.

#### 3.2 Package Manager Mismatches

**Critical Issue:** Workflows use wrong package manager:

| Workflow | Package Manager | Required | Status |
|----------|----------------|----------|--------|
| `deploy.yml` | npm | pnpm | ❌ Wrong |
| `vercel-validation.yml` | npm | pnpm | ❌ Wrong |
| `vercel-guard.yml` | pnpm (fallback npm) | pnpm | ⚠️ Fallback |
| `frontend-deploy.yml` | pnpm | pnpm | ✅ Correct |
| `deploy-main.yml` | pnpm | pnpm | ✅ Correct |
| `ci.yml` | pnpm | pnpm | ✅ Correct |

**Impact:** 
- Lockfile mismatches (`package-lock.json` vs `pnpm-lock.yaml`)
- Dependency resolution differences
- Build failures

#### 3.3 Missing Environment Variables

**Issue:** No validation that required secrets exist before deploy:

**Required Secrets (from workflows):**
- `VERCEL_TOKEN` - Required by all Vercel workflows
- `VERCEL_ORG_ID` - Required by all Vercel workflows  
- `VERCEL_PROJECT_ID` - Required by all Vercel workflows
- `SUPABASE_ACCESS_TOKEN` - Required by `deploy-main.yml`
- `SUPABASE_PROJECT_REF` - Required by `deploy-main.yml`

**Problem:** Workflows fail silently or with unclear errors if secrets are missing.

**Evidence:** No pre-flight checks in workflows to validate secrets exist.

#### 3.4 Vercel CLI Command Issues

**Issue:** `deploy-main.yml` uses package.json scripts that may not handle errors correctly:

```yaml
- name: Vercel Pull & Build
  run: |
    pnpm run vercel:pull
    pnpm run vercel:build
```

**Problem:** Scripts in `package.json`:
```json
"vercel:pull": "vercel pull --yes --environment=preview --token $VERCEL_TOKEN",
"vercel:build": "vercel build --token $VERCEL_TOKEN",
```

**Issues:**
1. `vercel:pull` always uses `--environment=preview` (hardcoded)
2. No error handling if commands fail
3. Token passed via env var, not CLI flag (may not work)

**Impact:** Production deployments may pull wrong environment config.

---

## Failure Mode 4: Vercel Project Misconfiguration

### Root Causes Identified

#### 4.1 Vercel Git Integration Conflict

**Critical Issue:** `vercel.json` enables both Git and GitHub integrations:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "preview": true
    }
  },
  "github": {
    "deploymentEnabled": {
      "main": true,
      "preview": true
    }
  }
}
```

**Problem:** This means:
1. Vercel's native Git integration will auto-deploy on pushes
2. GitHub Actions workflows also deploy via CLI
3. **Result:** Double deployments or conflicts

**Impact:**
- Race conditions
- Unclear which deployment is "real"
- Wasted resources
- Confusion in deployment logs

#### 4.2 Missing Vercel Project Configuration

**Issue:** No `.vercel/project.json` file found in repository.

**Impact:** 
- Workflows must rely on `VERCEL_PROJECT_ID` secret
- No way to verify project is correctly linked
- Harder to debug project misconfiguration

#### 4.3 Environment Variable Pull Strategy

**Issue:** `frontend-deploy.yml` pulls environment based on event:

```yaml
if [ "${{ github.event_name }}" == "pull_request" ]; then
  npx vercel@latest pull --yes --environment=preview --token="${{ secrets.VERCEL_TOKEN }}"
else
  npx vercel@latest pull --yes --environment=production --token="${{ secrets.VERCEL_TOKEN }}"
fi
```

**Problem:** `deploy-main.yml` always pulls preview:

```yaml
pnpm run vercel:pull  # Always uses --environment=preview
```

**Impact:** Production deployments may use wrong environment variables.

---

## Failure Mode 5: Build Configuration Issues

### Root Causes Identified

#### 5.1 Build Command Mismatch

**Issue:** `vercel.json` specifies build command:

```json
{
  "buildCommand": "pnpm run db:generate && pnpm run build"
}
```

**Problem:** 
- Workflows run `pnpm run build` directly
- May skip `db:generate` step
- Prisma client may not be generated

**Impact:** Build failures if Prisma client is missing.

#### 5.2 Missing Build Environment Variables

**Issue:** Build steps may require env vars that aren't set:

```yaml
- name: Build application
  run: pnpm run build
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL || 'postgresql://localhost:5432/test' }}
```

**Problem:** 
- Fallback DATABASE_URL may not work for Prisma generation
- Missing `NEXT_PUBLIC_*` variables may cause build failures
- No validation that required vars exist

---

## Summary of Critical Issues

### 🔴 Critical (Blocks All Deploys)

1. **Vercel Git Integration Conflict** - Double deployments
2. **Node Version Mismatches** - Build failures
3. **Package Manager Mismatches** - Dependency issues
4. **Conflicting Deploy Workflows** - Race conditions

### 🟡 High Priority (Causes Intermittent Failures)

5. **Missing Secret Validation** - Unclear failures
6. **Wrong Environment Pull** - Production uses preview config
7. **Build Command Mismatch** - Prisma generation skipped
8. **Conditional Logic Issues** - Deploy steps skipped

### 🟢 Medium Priority (Causes Confusion)

9. **Path Filters** - Validation doesn't run
10. **Branch Filter Mismatches** - Inconsistent behavior
11. **Missing Project Config** - Harder to debug

---

## Next Steps

1. **Establish Canonical Deploy Strategy** - Decide which workflow is source of truth
2. **Fix Node/Package Manager Issues** - Standardize on Node 20 + pnpm
3. **Resolve Vercel Git Integration** - Disable native integration or remove Actions
4. **Consolidate Workflows** - Remove duplicates, keep one canonical deploy
5. **Add Validation** - Pre-flight checks for secrets and config
6. **Fix Build Configuration** - Align vercel.json with workflow commands

---

## Assumptions Made

Since we don't have access to GitHub Actions logs:

1. **Assumed failures are configuration-based** - Not runtime errors
2. **Assumed secrets exist** - But may be misconfigured
3. **Assumed Vercel project is linked** - But may be wrong project/org
4. **Assumed workflows are enabled** - But may be disabled in GitHub UI

**Note:** These assumptions will be validated during fix implementation.
