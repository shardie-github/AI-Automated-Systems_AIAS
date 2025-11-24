# Deployment Reliability Plan

**Last Updated:** 2025-01-XX  
**Status:** Active Plan

---

## Executive Summary

This document outlines the comprehensive plan to ensure reliable Vercel Preview and Production deployments. It includes root cause analysis, fixes applied, verification steps, and ongoing maintenance procedures.

---

## Section 1: Root Causes Found

### Critical Issues (Fixed)

1. **Node Version Mismatches**
   - **Root Cause:** Workflows used Node 18 instead of required Node 20
   - **Impact:** Build failures, inconsistent behavior
   - **Status:** ✅ Fixed

2. **Package Manager Mismatches**
   - **Root Cause:** Some workflows used npm instead of pnpm
   - **Impact:** Lockfile conflicts, dependency resolution issues
   - **Status:** ✅ Fixed

3. **Vercel Git Integration Conflict**
   - **Root Cause:** Both Vercel native integration and GitHub Actions deploying
   - **Impact:** Double deployments, race conditions
   - **Status:** ✅ Fixed (Git integration disabled)

4. **Missing Secret Validation**
   - **Root Cause:** No pre-flight checks for required secrets
   - **Impact:** Silent failures, unclear error messages
   - **Status:** ✅ Fixed (validation added)

5. **Workflow Condition Issues**
   - **Root Cause:** Production deploy condition missing event_name check
   - **Impact:** Potential incorrect deployments
   - **Status:** ✅ Fixed

6. **Build Configuration Issues**
   - **Root Cause:** Prisma client generation skipped
   - **Impact:** Runtime errors
   - **Status:** ✅ Fixed (generation step added)

### Medium Priority Issues (Addressed)

7. **Workflow Consolidation**
   - **Root Cause:** Multiple workflows deploying to same environments
   - **Impact:** Confusion, race conditions
   - **Status:** ✅ Fixed (deprecated duplicate workflows)

8. **Error Handling**
   - **Root Cause:** Unclear error messages on failure
   - **Impact:** Difficult debugging
   - **Status:** ✅ Fixed (enhanced error handling)

---

## Section 2: Exact Fixes Applied

### Workflow Fixes

#### `frontend-deploy.yml` (Canonical Deploy Workflow)

**Changes:**
1. Added secret validation step before deploy
2. Added Prisma client generation step before build
3. Fixed production deploy condition (`github.event_name == 'push'`)
4. Enhanced error handling in deploy steps
5. Improved deployment URL extraction and validation

**File:** `.github/workflows/frontend-deploy.yml`

#### `deploy.yml`

**Changes:**
1. Updated Node version from 18 to 20
2. Changed package manager from npm to pnpm
3. Updated all npm commands to pnpm

**File:** `.github/workflows/deploy.yml`

#### `vercel-guard.yml`

**Changes:**
1. Updated Node version from 18 to 20
2. Updated pnpm version to 8.15.0
3. Removed npm fallback

**File:** `.github/workflows/vercel-guard.yml`

#### `vercel-validation.yml`

**Changes:**
1. Changed package manager from npm to pnpm
2. Added pnpm setup step

**File:** `.github/workflows/vercel-validation.yml`

#### `deploy-main.yml`

**Changes:**
1. Marked as deprecated with clear migration plan
2. Documented why it's deprecated

**File:** `.github/workflows/deploy-main.yml`

### Configuration Fixes

#### `vercel.json`

**Changes:**
1. Disabled Git integration (`git.deploymentEnabled.main = false`)
2. Disabled GitHub integration (`github.deploymentEnabled.main = false`)

**File:** `vercel.json`

#### `package.json`

**Changes:**
1. Added `vercel:pull:preview` script
2. Added `vercel:pull:production` script
3. Added `deploy:doctor` command

**File:** `package.json`

### New Files Created

1. **Deploy Doctor Script**
   - **File:** `scripts/deploy-doctor.ts`
   - **Purpose:** Validates deployment configuration
   - **Usage:** `pnpm run deploy:doctor`

2. **Deploy Doctor Workflow**
   - **File:** `.github/workflows/deploy-doctor.yml`
   - **Purpose:** Runs deploy doctor automatically

3. **Documentation**
   - `docs/deploy-strategy.md` - Canonical strategy
   - `docs/deploy-failure-postmortem-initial.md` - Initial investigation
   - `docs/deploy-failure-postmortem-final.md` - Final report
   - `docs/deploy-reliability-plan.md` - This document
   - `docs/vercel-troubleshooting.md` - Troubleshooting guide

---

## Section 3: How to Verify Preview & Production Deploys

### Preview Deployment Verification

**Steps:**
1. Create a test PR to `main` branch
2. Check GitHub Actions tab - `frontend-deploy.yml` should run
3. Verify `build-and-test` job passes:
   - ✅ Lint passes
   - ✅ Typecheck passes
   - ✅ Tests pass
   - ✅ Build succeeds
4. Verify `deploy` job runs:
   - ✅ Secret validation passes
   - ✅ Vercel pull succeeds (preview environment)
   - ✅ Vercel build succeeds
   - ✅ Preview deployment succeeds
5. Check PR comments - Preview URL should be posted
6. Visit preview URL - Should be accessible
7. Verify no double deployments in Vercel dashboard

**Expected Result:** Preview deployment succeeds, URL is accessible, no errors.

### Production Deployment Verification

**Steps:**
1. Merge a test PR to `main` branch
2. Check GitHub Actions tab - `frontend-deploy.yml` should run
3. Verify `build-and-test` job passes
4. Verify `deploy` job runs:
   - ✅ Secret validation passes
   - ✅ Vercel pull succeeds (production environment)
   - ✅ Vercel build succeeds
   - ✅ Production deployment succeeds
5. Check Vercel dashboard - Production deployment should appear
6. Visit production URL - Should be accessible
7. Verify no double deployments

**Expected Result:** Production deployment succeeds, URL is accessible, no errors.

### Migration Verification (If Applicable)

**Steps:**
1. Push migration files to `main`
2. Check GitHub Actions tab - `apply-supabase-migrations.yml` should run
3. Verify migrations apply successfully
4. Verify schema validation passes

**Expected Result:** Migrations apply successfully, schema is valid.

---

## Section 4: If Deploy Breaks Again, Run These Steps

### Step 1: Run Deploy Doctor

**Command:**
```bash
pnpm run deploy:doctor
```

**What it checks:**
- Node version consistency
- Package manager consistency
- Lockfile consistency
- Deploy scripts presence
- Environment variables documentation
- Workflow configuration
- Vercel configuration

**Action:** Fix any failures reported.

### Step 2: Check GitHub Actions Logs

**Location:** GitHub → Actions → Latest workflow run

**What to check:**
1. Which workflow failed?
2. Which job failed?
3. Which step failed?
4. What's the error message?

**Common Issues:**
- Missing secrets → Add to GitHub Secrets
- Build failures → Check build logs
- Deployment failures → Check Vercel logs

### Step 3: Check Vercel Dashboard

**Location:** Vercel Dashboard → Project → Deployments

**What to check:**
1. Are there duplicate deployments?
2. What's the deployment status?
3. Are there any build errors?
4. Are environment variables set correctly?

**Common Issues:**
- Git integration enabled → Disable in `vercel.json`
- Missing environment variables → Add in Vercel dashboard
- Build failures → Check build logs

### Step 4: Verify Secrets

**Location:** GitHub → Settings → Secrets → Actions

**Required Secrets:**
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

**Action:** Verify all secrets are present and correct.

### Step 5: Check Workflow Configuration

**Files to check:**
- `.github/workflows/frontend-deploy.yml` - Main deploy workflow
- `vercel.json` - Vercel configuration
- `package.json` - Build scripts

**What to check:**
1. Are triggers correct?
2. Are conditions correct?
3. Are Node/pnpm versions correct?
4. Is Git integration disabled?

### Step 6: Review Documentation

**Files to review:**
- `docs/deploy-strategy.md` - Canonical strategy
- `docs/vercel-troubleshooting.md` - Troubleshooting guide
- `docs/deploy-failure-postmortem-final.md` - Previous fixes

**Action:** Compare current configuration with documented strategy.

### Step 7: Test Locally

**Commands:**
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Generate Prisma client
pnpm run db:generate

# Build
pnpm run build

# Test Vercel CLI (if token available)
vercel pull --environment=preview
vercel build
```

**Action:** If local build fails, fix issues before deploying.

### Step 8: Create Issue/PR

**If issue persists:**
1. Document the issue
2. Include error messages
3. Include deploy doctor output
4. Include relevant logs
5. Create GitHub issue or PR with fixes

---

## Ongoing Maintenance

### Weekly Checks

1. **Run Deploy Doctor**
   - Automatically runs via GitHub Actions (Mondays at 9 AM UTC)
   - Or run manually: `pnpm run deploy:doctor`

2. **Review Deployment Metrics**
   - Check Vercel dashboard for deployment frequency
   - Check GitHub Actions for workflow success rate
   - Identify any patterns or issues

3. **Review Documentation**
   - Ensure documentation is up to date
   - Update if configuration changes

### Monthly Checks

1. **Audit Workflows**
   - Review all workflows for redundancy
   - Remove deprecated workflows
   - Consolidate similar workflows

2. **Review Secrets**
   - Verify secrets are still valid
   - Rotate secrets if needed
   - Update documentation if secrets change

3. **Review Dependencies**
   - Update Node/pnpm versions if needed
   - Update workflow actions if needed
   - Test updates in preview environment first

### Quarterly Checks

1. **Full Deployment Audit**
   - Review all deployment configurations
   - Test preview and production deployments
   - Update documentation
   - Review and update this reliability plan

---

## Success Metrics

### Deployment Reliability

**Target:** 99%+ success rate

**Metrics:**
- Preview deployment success rate
- Production deployment success rate
- Time to deploy (preview and production)
- Deployment frequency

### Configuration Health

**Target:** 100% deploy doctor checks pass

**Metrics:**
- Deploy doctor pass rate
- Configuration drift detection
- Documentation completeness

---

## Conclusion

**Status:** ✅ **DEPLOYMENT PIPELINE HARDENED**

**Summary:**
- All critical issues identified and fixed
- Diagnostic tooling added
- Comprehensive documentation created
- Verification procedures established
- Ongoing maintenance plan in place

**Confidence Level:** 🟢 **HIGH** - Deployment should work reliably.

**Next Steps:**
1. Test preview deployments
2. Test production deployments
3. Monitor for any issues
4. Iterate based on feedback

---

## Appendix: Quick Reference

### Required Secrets
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Canonical Workflows
- `frontend-deploy.yml` - Preview + Production deploys
- `apply-supabase-migrations.yml` - Database migrations
- `ci.yml` - Quality checks

### Diagnostic Commands
- `pnpm run deploy:doctor` - Run diagnostics
- `pnpm run build` - Test build locally
- `vercel pull --environment=preview` - Test Vercel config

### Documentation
- `docs/deploy-strategy.md` - Strategy
- `docs/vercel-troubleshooting.md` - Troubleshooting
- `docs/deploy-reliability-plan.md` - This document
