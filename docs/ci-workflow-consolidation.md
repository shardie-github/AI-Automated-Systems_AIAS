# CI/CD Workflow Consolidation Plan

**Last Updated:** 2025-01-31  
**Purpose:** Plan to consolidate 37 CI/CD workflows into essential, maintainable set

---

## Executive Summary

The repository currently has **37 workflow files**, many of which are redundant, obsolete, or can be consolidated. This document outlines the consolidation plan to reduce to **~10 essential workflows**.

**Current:** 37 workflows  
**Target:** ~10 workflows  
**Reduction:** ~73% reduction

---

## Current Workflow Inventory

### ✅ Essential Workflows (Keep)

1. **`ci.yml`** - Core CI (lint, typecheck, test, build)
2. **`frontend-deploy.yml`** - Frontend deployment (CANONICAL)
3. **`apply-supabase-migrations.yml`** - Database migrations (UPDATED with staging testing)
4. **`security.yml`** - Security scanning (UPDATED with comprehensive audit)

### ⚠️ Redundant Workflows (Consolidate)

5. **`deploy-main.yml`** - Duplicate of `frontend-deploy.yml`
6. **`deploy.yml`** - Duplicate of `frontend-deploy.yml`
7. **`vercel-guard.yml`** - Can merge into `frontend-deploy.yml`
8. **`vercel-validation.yml`** - Can merge into `frontend-deploy.yml`

### 🔴 Obsolete Workflows (Remove)

9. **`ai-audit.yml`** - AI-powered audits (experimental, remove)
10. **`benchmarks.yml`** - Performance benchmarks (move to separate repo or remove)
11. **`canary-deploy.yml`** - Canary deployments (not used, remove)
12. **`check-backup-evidence.yml`** - Backup checks (merge into monitoring)
13. **`code-hygiene.yml`** - Code quality (merge into `ci.yml`)
14. **`daily-analytics.yml`** - Analytics (move to cron job or separate service)
15. **`data-quality-self-healing.yml`** - Self-healing (experimental, remove)
16. **`deploy-doctor.yml`** - Deployment checks (merge into `frontend-deploy.yml`)
17. **`docs-guard.yml`** - Documentation checks (merge into `ci.yml`)
18. **`docs-pdf.yml`** - PDF generation (remove or make manual)
19. **`env-smoke-test.yml`** - Environment tests (merge into `ci.yml`)
20. **`env-sync.yml`** - Environment sync (remove, use manual process)
21. **`full-matrix-ci.yml`** - Matrix testing (merge into `ci.yml` if needed)
22. **`futurecheck.yml`** - Future-proofing (remove)
23. **`meta-audit.yml`** - Meta audits (remove)
24. **`mobile.yml`** - Mobile testing (remove or move to separate repo)
25. **`nightly-etl-self-healing.yml`** - ETL automation (remove or move to cron)
26. **`performance-pr.yml`** - Performance PR checks (merge into `ci.yml`)
27. **`performance.yml`** - Performance monitoring (keep if actively used)
28. **`preflight-self-healing.yml`** - Preflight automation (remove)
29. **`quality-gates.yml`** - Quality gates (merge into `ci.yml`)
30. **`regenerate-supabase-types.yml`** - Type generation (merge into migration workflow)
31. **`release-pr.yml`** - Release PRs (keep if used for releases)
32. **`supabase-delta-apply-self-healing.yml`** - Delta migrations (remove, use main workflow)
33. **`supabase-weekly-maintenance.yml`** - Weekly maintenance (merge into migration workflow)
34. **`system-health-self-healing.yml`** - System health (remove or move to monitoring)
35. **`systems-metrics.yml`** - Metrics collection (keep if actively used)
36. **`telemetry.yml`** - Telemetry (keep if actively used)
37. **`ui-ingest.yml`** - UI ingestion (remove or move to separate service)
38. **`unified-agent.yml`** - Unified agent (experimental, remove)
39. **`watcher-cron.yml`** - Watcher cron (remove or move to separate service)
40. **`weekly-maint.yml`** - Weekly maintenance (merge into migration workflow)

---

## Consolidation Plan

### Phase 1: Merge Redundant Workflows

**Action:** Merge duplicate deployment workflows into `frontend-deploy.yml`

**Workflows to Merge:**
- `deploy-main.yml` → `frontend-deploy.yml`
- `deploy.yml` → `frontend-deploy.yml`
- `vercel-guard.yml` → `frontend-deploy.yml`
- `vercel-validation.yml` → `frontend-deploy.yml`
- `deploy-doctor.yml` → `frontend-deploy.yml`

**Result:** Single canonical deployment workflow

### Phase 2: Merge Quality Checks

**Action:** Merge quality check workflows into `ci.yml`

**Workflows to Merge:**
- `code-hygiene.yml` → `ci.yml`
- `quality-gates.yml` → `ci.yml`
- `docs-guard.yml` → `ci.yml`
- `env-smoke-test.yml` → `ci.yml`
- `performance-pr.yml` → `ci.yml` (as optional job)

**Result:** Enhanced `ci.yml` with all quality checks

### Phase 3: Merge Migration Workflows

**Action:** Consolidate migration-related workflows

**Workflows to Merge:**
- `regenerate-supabase-types.yml` → `apply-supabase-migrations.yml`
- `supabase-weekly-maintenance.yml` → `apply-supabase-migrations.yml`
- `supabase-delta-apply-self-healing.yml` → Remove (use main workflow)

**Result:** Single migration workflow with all features

### Phase 4: Remove Obsolete Workflows

**Action:** Delete experimental/unused workflows

**Workflows to Remove:**
- `ai-audit.yml`
- `benchmarks.yml` (or move to separate repo)
- `canary-deploy.yml`
- `data-quality-self-healing.yml`
- `futurecheck.yml`
- `meta-audit.yml`
- `mobile.yml` (or move to separate repo)
- `preflight-self-healing.yml`
- `unified-agent.yml`

### Phase 5: Move to Separate Services

**Action:** Move scheduled/cron jobs to separate services or GitHub Actions scheduled workflows

**Workflows to Move/Consolidate:**
- `daily-analytics.yml` → Scheduled workflow or separate service
- `nightly-etl-self-healing.yml` → Scheduled workflow or separate service
- `watcher-cron.yml` → Scheduled workflow or separate service
- `weekly-maint.yml` → Scheduled workflow

---

## Final Workflow Structure

### Core Workflows (5)

1. **`ci.yml`** - Core CI
   - Lint, typecheck, format check
   - Unit tests
   - Build verification
   - E2E tests (optional)
   - Code quality checks
   - Documentation checks
   - Environment validation

2. **`frontend-deploy.yml`** - Frontend Deployment
   - Build and test
   - Deploy to Vercel (preview + production)
   - Deployment validation
   - Smoke tests

3. **`apply-supabase-migrations.yml`** - Database Migrations
   - Test migrations in staging (PRs)
   - Apply migrations to production
   - Schema validation
   - Type regeneration
   - Weekly maintenance

4. **`security.yml`** - Security Scanning
   - Dependency vulnerability scan
   - Code security scan (SAST)
   - Comprehensive security audit
   - License checks

5. **`release.yml`** - Release Management (if needed)
   - Release PR creation
   - Version bumping
   - Changelog generation

### Optional Workflows (3-5)

6. **`performance.yml`** - Performance Monitoring (if actively used)
7. **`systems-metrics.yml`** - Metrics Collection (if actively used)
8. **`telemetry.yml`** - Telemetry (if actively used)

### Scheduled Workflows (2-3)

9. **`scheduled-maintenance.yml`** - Weekly/Daily Maintenance
   - Database backups
   - Analytics aggregation
   - ETL jobs
   - Health checks

10. **`scheduled-monitoring.yml`** - Monitoring & Alerts
    - System health checks
    - Performance monitoring
    - Error tracking

---

## Migration Steps

### Step 1: Backup Current Workflows

```bash
# Create backup directory
mkdir -p .github/workflows-backup

# Backup all workflows
cp .github/workflows/*.yml .github/workflows-backup/
```

### Step 2: Update Core Workflows

1. **Enhance `ci.yml`:**
   - Add code hygiene checks
   - Add documentation checks
   - Add environment validation
   - Add performance PR checks (optional)

2. **Enhance `frontend-deploy.yml`:**
   - Add deployment validation
   - Add smoke tests
   - Add Vercel guard checks

3. **Enhance `apply-supabase-migrations.yml`:**
   - Already updated with staging testing
   - Add type regeneration step
   - Add weekly maintenance

4. **Enhance `security.yml`:**
   - Add comprehensive security audit
   - Keep existing scans

### Step 3: Create Consolidated Workflows

Create new consolidated workflows:
- `scheduled-maintenance.yml` - Combine all scheduled jobs
- `release.yml` - If release workflow needed

### Step 4: Remove Obsolete Workflows

Delete obsolete workflows after verification:
```bash
# Remove obsolete workflows
rm .github/workflows/ai-audit.yml
rm .github/workflows/benchmarks.yml
# ... etc
```

### Step 5: Test & Verify

1. Test each consolidated workflow
2. Verify no functionality lost
3. Update documentation
4. Notify team

---

## Risk Mitigation

### Risks

1. **Functionality Loss:** Some workflows may have unique features
2. **Breaking Changes:** Consolidation may break existing processes
3. **Team Confusion:** Team may not know which workflow to use

### Mitigation

1. **Audit First:** Review each workflow before removing
2. **Test Thoroughly:** Test consolidated workflows
3. **Document Changes:** Update documentation
4. **Gradual Rollout:** Remove workflows gradually, not all at once

---

## Checklist

### Pre-Consolidation
- [ ] Audit all 37 workflows
- [ ] Identify unique features in each
- [ ] Document consolidation plan
- [ ] Backup all workflows

### Consolidation
- [ ] Merge redundant workflows
- [ ] Enhance core workflows
- [ ] Create consolidated scheduled workflows
- [ ] Test consolidated workflows

### Post-Consolidation
- [ ] Remove obsolete workflows
- [ ] Update documentation
- [ ] Notify team
- [ ] Monitor for issues

---

## Expected Results

### Before
- 37 workflow files
- Many redundant workflows
- Unclear which workflow to use
- High maintenance burden

### After
- ~10 workflow files
- Clear purpose for each workflow
- Easy to understand
- Low maintenance burden

### Benefits
- ✅ Reduced complexity
- ✅ Easier maintenance
- ✅ Clearer CI/CD process
- ✅ Faster CI runs (less duplication)

---

## Conclusion

**Status:** ⚠️ **Consolidation plan ready**  
**Next Steps:** Execute consolidation gradually, starting with redundant workflows

**Timeline:** 1-2 weeks for full consolidation

---

**Last Updated:** 2025-01-31
