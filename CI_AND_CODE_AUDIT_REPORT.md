# CI & Code Audit Report: Path to Green CI

**Date:** 2025-01-27  
**Scope:** Complete CI/CD pipeline audit and code structure cleanup plan  
**Goal:** Transform from "25 failed checks every commit" to "green by default"

---

## A. DISCOVER THE CURRENT STATE (CODE + CI)

### CODE & STRUCTURE SNAPSHOT

**High-Level Structure:**
- **Type:** Next.js 14 monorepo with workspaces (`apps/*`, `packages/*`)
- **Main App:** `/app` (Next.js App Router), `/components`, `/lib`
- **Backend:** Supabase functions in `/supabase/functions`
- **Scripts:** 50+ TypeScript scripts in `/scripts`
- **Tests:** Minimal test suite (6 test files, ~200 lines total)
- **Config:** TypeScript strict mode, ESLint with comprehensive rules, Prettier

**Key Directories:**
```
/app          - Next.js pages & API routes (98 files)
/components   - React components (73 files)
/lib          - Shared utilities (59 files)
/scripts      - Operational scripts (65 files)
/tests        - Test suite (6 files, minimal coverage)
/ops          - Operations framework
/ai           - AI agent scripts
/guardian     - Security/guardian framework
```

**Structural Issues Identified:**
1. **Test Coverage Gap:** Only 6 test files for a 98-file app directory
2. **Script Proliferation:** 65 scripts with unclear ownership/purpose
3. **Duplicate Patterns:** Multiple similar API route handlers, error handling patterns
4. **Naming Inconsistencies:** Mix of kebab-case and camelCase in file names
5. **Dead Code Indicators:** Reports suggest unused exports (`ts-prune`), unused dependencies (`knip`)

### CI & CHECKS SNAPSHOT

**Total Workflows:** 40 workflow files in `.github/workflows/`

**Workflows Triggering on PRs (Overlapping):**
1. `ci.yml` - Full CI pipeline (type-check, lint, format-check, security-audit, code-hygiene, unit-tests, e2e-tests, build-analysis, performance-tests, security-scan, docker-build)
2. `pre-merge-validation.yml` - Duplicates type-check, lint, format-check, security-scan
3. `full-matrix-ci.yml` - Runs ops-doctor, matrix-tests, build-analysis, performance-budgets, migration-safety, rls-audit, security-scan
4. `quality-gates.yml` - Bundle size, type coverage, test check
5. `code-hygiene.yml` - Runs on PRs with `continue-on-error: true` (non-blocking)
6. `security.yml` - Dependency scan, code scan, SAST scan
7. `performance-pr.yml` - Performance benchmarks and bundle analysis
8. `preview-pr.yml` - Preview deployment, Lighthouse, accessibility
9. `code-hygiene-check.yml` - Scheduled only (weekly)
10. `futurecheck.yml` - Runs on PRs + pushes + schedule

**Estimated Checks Per PR:** ~25-30 distinct jobs (many duplicates)

**Scheduled/Maintenance Workflows (Should NOT Block PRs):**
- `ai-audit.yml` (weekly)
- `meta-audit.yml` (weekly)
- `daily-analytics.yml` (daily)
- `nightly-etl-self-healing.yml` (nightly)
- `system-health-self-healing.yml` (scheduled)
- `data-quality-self-healing.yml` (scheduled)
- `watcher-cron.yml` (scheduled)
- `benchmarks.yml` (scheduled)
- `telemetry.yml` (scheduled)
- `weekly-maint.yml` (weekly)
- `supabase-weekly-maintenance.yml` (weekly)
- `check-backup-evidence.yml` (scheduled)

**Deployment Workflows (Main Branch Only):**
- `deploy-main.yml`
- `deploy.yml`
- `auto-deploy-vercel.yml`
- `canary-deploy.yml`

### WHY SO MANY FAILING CHECKS (HYPOTHESES)

1. **Duplicate Checks Running:** Type-check, lint, and format-check run in 3+ workflows simultaneously, causing redundant failures and confusion.

2. **Non-Blocking Failures Masked:** `code-hygiene.yml` uses `continue-on-error: true` on PRs, hiding real issues while still showing as "failed" in the UI.

3. **Flaky E2E Tests:** E2E tests run without proper retries or timeouts, likely failing due to timing issues (health check test has `< 500ms` assertion).

4. **Missing Test Infrastructure:** No vitest config found, tests may not be properly configured for CI environment.

5. **Database Dependency in CI:** Build jobs require `DATABASE_URL` secret, which may be missing or misconfigured, causing build failures.

6. **Performance Tests Without Baseline:** Performance benchmarks compare against non-existent baseline, causing false failures.

7. **Security Scans Too Strict:** Multiple security scans (Trivy, npm audit, CodeQL) may flag non-critical issues that block merges.

8. **Bundle Analysis Not Automated:** Bundle size checks have TODO comments and manual review steps, causing inconsistent results.

9. **Type Coverage Check Flaky:** Type coverage check uses `continue-on-error: true` and may fail due to tool installation issues.

10. **Preview Deployments Blocking:** Preview PR workflow may fail due to Vercel/Supabase credential issues, blocking unrelated PRs.

---

## B. DESIGN THE TARGET STATE – CLEAN, COHESIVE, ALWAYS-GREEN PIPELINE

### TARGET CODE PRINCIPLES

1. **Single Source of Truth:** One canonical workflow for each check type (lint, type-check, test, build).
2. **Fast Feedback:** Core checks complete in < 5 minutes; non-critical checks run async or scheduled.
3. **Fail Fast, Fail Clear:** Blocking checks must be deterministic and provide actionable error messages.
4. **Test-Driven Development:** Core business logic must have >80% test coverage; flaky tests are eliminated.
5. **Consistent Naming:** All files use kebab-case; all exports use camelCase; all types use PascalCase.
6. **No Dead Code:** Unused exports, dependencies, and files are removed or documented as intentional.
7. **Type Safety:** Strict TypeScript with no `any` types; type coverage >95%.
8. **Modular Architecture:** Clear separation between app routes, components, lib utilities, and scripts.

### TARGET CI CHECK SET

**Core PR Checks (Must Pass):**
1. **`lint`** - ESLint with React/TypeScript rules
   - Tool: ESLint
   - Runtime: ~2-3 min
   - Purpose: Code style and quality

2. **`type-check`** - TypeScript compilation check
   - Tool: `tsc --noEmit`
   - Runtime: ~1-2 min
   - Purpose: Type safety

3. **`format-check`** - Prettier formatting validation
   - Tool: Prettier
   - Runtime: ~30 sec
   - Purpose: Consistent formatting

4. **`test`** - Unit tests (fast, deterministic)
   - Tool: Vitest
   - Runtime: ~2-3 min
   - Purpose: Core business logic validation

5. **`build`** - Production build verification
   - Tool: Next.js build
   - Runtime: ~3-5 min
   - Purpose: Build succeeds without errors

**Optional PR Checks (Non-Blocking, Informational):**
- `test:e2e` - E2E tests (can be flaky, run async)
- `bundle-size` - Bundle analysis (informational only)
- `security-scan` - Dependency audit (non-blocking for low-severity)

**Scheduled Checks (Nightly/Weekly):**
- `code-hygiene` - Dead code analysis, unused dependencies
- `security-audit` - Deep security scans
- `performance-benchmarks` - Performance regression detection
- `ai-audit` - AI-powered code analysis

### WHAT TO DISABLE / CONSOLIDATE

**Disable Entirely:**
- `pre-merge-validation.yml` - Duplicates `ci.yml`
- `code-hygiene-check.yml` - Redundant with `code-hygiene.yml`
- `futurecheck.yml` - Move to scheduled only
- `preview-pr.yml` - Move to manual trigger or post-merge

**Move to Scheduled:**
- `ai-audit.yml` - Weekly
- `meta-audit.yml` - Weekly
- `code-hygiene.yml` - Weekly (remove PR trigger)
- `performance-pr.yml` - Nightly (remove PR trigger)
- `security.yml` - Weekly deep scan (keep lightweight scan in CI)

**Consolidate:**
- Merge `quality-gates.yml` into `ci.yml` as separate jobs
- Merge `full-matrix-ci.yml` into `ci.yml` (remove redundant jobs)

**Result:** 1 core workflow (`ci.yml`) + 1-2 scheduled workflows + deployment workflows

---

## C. CI WORKFLOWS – CONCRETE REWRITE PLAN

### CURRENT WORKFLOW INVENTORY

| Workflow | Purpose | Action |
|----------|---------|--------|
| `ci.yml` | Main CI pipeline | **KEEP & CLEAN** |
| `pre-merge-validation.yml` | Duplicate checks | **DELETE** |
| `full-matrix-ci.yml` | Matrix tests + ops | **MERGE INTO ci.yml** |
| `quality-gates.yml` | Bundle/type/test gates | **MERGE INTO ci.yml** |
| `code-hygiene.yml` | Dead code analysis | **SCHEDULE ONLY** |
| `code-hygiene-check.yml` | Redundant hygiene | **DELETE** |
| `security.yml` | Security scans | **SPLIT**: Light in CI, Deep scheduled |
| `performance-pr.yml` | PR performance | **SCHEDULE ONLY** |
| `preview-pr.yml` | Preview deployments | **MANUAL TRIGGER** |
| `futurecheck.yml` | Runtime compatibility | **SCHEDULE ONLY** |
| `ai-audit.yml` | AI analysis | **SCHEDULE ONLY** |
| `meta-audit.yml` | Meta architecture | **SCHEDULE ONLY** |
| All `*-self-healing.yml` | Operations | **SCHEDULE ONLY** |
| All `*-maint.yml` | Maintenance | **SCHEDULE ONLY** |
| Deployment workflows | Deploy to prod | **KEEP** (main branch only) |

### PROPOSED WORKFLOW SET

**1. `ci.yml` - Core CI Pipeline**
```yaml
Triggers: pull_request, push to main/develop
Jobs:
  - lint (parallel)
  - type-check (parallel)
  - format-check (parallel)
  - test (depends on lint + type-check)
  - build (depends on test)
  - test:e2e (optional, non-blocking, depends on build)
```

**2. `nightly.yml` - Heavy/Experimental Checks**
```yaml
Triggers: schedule (daily 2 AM UTC), workflow_dispatch
Jobs:
  - code-hygiene (dead code, unused deps)
  - security-audit (deep scans)
  - performance-benchmarks
  - ai-audit
  - meta-audit
```

**3. `deploy.yml` - Production Deployment**
```yaml
Triggers: push to main (tags), workflow_dispatch
Jobs:
  - build
  - docker-build
  - deploy-staging (if develop)
  - deploy-production (if main)
  - smoke-tests
```

**4. `scheduled-maintenance.yml` - Operations**
```yaml
Triggers: schedule (various cron schedules)
Jobs:
  - etl-jobs
  - backup-checks
  - system-health
  - data-quality
  - watchers
```

### MERGE GUARDRAILS

**Branch Protection Rules:**
- PRs to `main` require:
  - ✅ `ci.yml` → All jobs pass (lint, type-check, format-check, test, build)
  - ⚠️ `ci.yml` → `test:e2e` can be skipped/flaky (non-blocking)
  - ❌ No other workflows required

**Failure Handling:**
- Core checks (`lint`, `type-check`, `format-check`, `test`, `build`) must pass
- Non-blocking checks can fail but should be fixed within 7 days
- Flaky tests are marked with `[flaky]` label and excluded from blocking

**Definition of "Green":**
- All core checks pass
- No flaky test failures (or flaky tests are properly marked)
- Build succeeds
- Type checking passes

---

## D. CODE CLEANUP – CLARITY, COHESION, AND TESTABILITY

### CODE COHESION ISSUES

**1. Large/Complex Files:**
- `app/layout.tsx` - Likely contains too much logic
- `lib/api/route-handler.ts` - Handles multiple concerns (caching, validation, error handling)
- `scripts/orchestrate_master.ts` - Orchestrates multiple systems
- `ops/cli.ts` - CLI with many commands

**2. Naming Inconsistencies:**
- Mix of `kebab-case.ts` and `camelCase.ts` in file names
- Some components use `PascalCase.tsx`, others use `kebab-case.tsx`
- API routes inconsistent: `route.ts` vs `Route.ts`

**3. Anti-Patterns:**
- Tests have timing assertions (`expect(duration).toBeLessThan(500)`) - flaky
- Hard-coded timeouts in health checks
- No vitest config file (tests may not be properly configured)
- Scripts use `|| true` to mask failures (`continue-on-error` pattern)

**4. Missing Test Coverage:**
- Only 6 test files for 98 app files
- No tests for core lib utilities (`lib/utils.ts`, `lib/error-handling/`)
- No tests for API routes (except 3)
- No tests for components

### CODE CLEANUP TASKS

1. **Standardize File Naming**
   - Files: `app/**/*.tsx` → kebab-case
   - Components: `components/**/*.tsx` → PascalCase.tsx
   - Utils: `lib/**/*.ts` → kebab-case.ts
   - Scripts: `scripts/**/*.ts` → kebab-case.ts

2. **Extract Route Handler Concerns**
   - Split `lib/api/route-handler.ts` into:
     - `lib/api/handlers.ts` (handler creation)
     - `lib/api/cache.ts` (caching logic)
     - `lib/api/validation.ts` (validation middleware)

3. **Remove Dead Code**
   - Run `ts-prune` and remove unused exports
   - Run `knip` and remove unused dependencies
   - Delete unused scripts (verify with `scripts/` audit)

4. **Fix Flaky Tests**
   - Remove timing assertions from `tests/api/healthz.test.ts`
   - Add proper mocks for async operations
   - Use `vi.useFakeTimers()` for time-dependent tests

5. **Add Vitest Config**
   - Create `vitest.config.ts` with proper test environment
   - Configure coverage thresholds
   - Set up test globals

6. **Consolidate Error Handling**
   - Single error handling utility in `lib/error-handling/`
   - Consistent error types across API routes
   - Remove duplicate error handling code

7. **Extract Component Logic**
   - Move business logic from components to hooks/utilities
   - Create `hooks/` directory for reusable hooks
   - Separate presentational from container components

8. **Document Scripts**
   - Add JSDoc comments to all scripts
   - Create `scripts/README.md` with script purposes
   - Mark scripts as "internal" vs "public API"

9. **Remove Hard-Coded Values**
   - Extract timeouts to config
   - Extract API endpoints to env/config
   - Remove magic numbers

10. **Add Type Safety**
   - Remove `any` types
   - Add proper types for API responses
   - Create shared types in `lib/types/`

### TEST ARCHITECTURE FIXES

**Current Test Structure:**
```
tests/
  api/          - 3 API route tests
  lib/          - 1 lib utility test
  reality/      - Production spec (likely flaky)
  security/     - Red team spec (likely flaky)
```

**Proposed Test Structure:**
```
tests/
  unit/         - Fast, isolated unit tests
    lib/        - Lib utility tests
    components/ - Component tests (with Testing Library)
    hooks/      - Hook tests
  integration/  - Integration tests (API + DB)
    api/        - API route tests
    workflows/  - Workflow execution tests
  e2e/          - End-to-end tests (Playwright)
    critical/   - Critical user flows
    smoke/      - Smoke tests
  fixtures/     - Test fixtures and mocks
  helpers/      - Test utilities
```

**Test Improvements:**

1. **Add Vitest Config**
   - Configure test environment (jsdom for components)
   - Set up coverage reporting
   - Configure test timeouts

2. **Create Test Fixtures**
   - Mock Supabase client
   - Mock Next.js request/response
   - Mock external APIs

3. **Segregate Fast vs Slow Tests**
   - Unit tests: < 1s each
   - Integration tests: < 10s each
   - E2E tests: < 60s each

4. **Add Core Business Logic Tests**
   - Agent registry behavior
   - Workflow execution
   - Error handling
   - Validation logic
   - Cache behavior

5. **Fix Flaky Tests**
   - Remove timing assertions
   - Use proper mocks
   - Add retries for E2E tests

6. **Add Test Coverage Thresholds**
   - Unit tests: >80% coverage
   - Integration tests: >60% coverage
   - Core lib: >90% coverage

---

## E. FIXING THE CHECKS – PRIORITIZED EXECUTION PLAN

### PHASED CI STABILIZATION PLAN

#### PHASE 1: STOP THE BLEEDING (Week 1)

**Goal:** Reduce failing checks from 25+ to < 5

1. **Disable Non-Critical Workflows on PRs**
   - Remove PR triggers from `code-hygiene.yml`
   - Remove PR triggers from `performance-pr.yml`
   - Remove PR triggers from `futurecheck.yml`
   - Remove PR triggers from `preview-pr.yml`

2. **Delete Duplicate Workflows**
   - Delete `pre-merge-validation.yml`
   - Delete `code-hygiene-check.yml`

3. **Fix Core CI Workflow**
   - Consolidate `ci.yml` to only core checks
   - Remove redundant jobs
   - Fix database dependency (make optional or mock)

4. **Mark Flaky Tests as Non-Blocking**
   - Add `[flaky]` label to E2E tests
   - Set E2E tests to `continue-on-error: true` temporarily
   - Fix timing assertions in unit tests

5. **Fix Build Dependencies**
   - Make `DATABASE_URL` optional in build step
   - Mock Prisma client generation
   - Skip database migrations in CI build

6. **Consolidate Security Scans**
   - Keep lightweight npm audit in CI
   - Move Trivy/CodeQL to scheduled
   - Make security scans non-blocking

7. **Fix Type Coverage Check**
   - Install `type-coverage` properly
   - Set realistic threshold (90% instead of 95%)
   - Make non-blocking if flaky

8. **Remove Bundle Size Check**
   - Remove incomplete bundle size check
   - Add TODO to implement properly later

9. **Fix Performance Tests**
   - Remove baseline comparison (not implemented)
   - Make performance tests informational only

10. **Add Retry Logic**
    - Add retries to flaky E2E tests
    - Add retries to network-dependent tests

#### PHASE 2: FIX CORE CHECKS (Week 2-3)

**Goal:** Make core checks reliable and fast

1. **Fix Lint Configuration**
   - Ensure ESLint config is consistent
   - Fix any lint errors in codebase
   - Add lint cache

2. **Fix Type Checking**
   - Fix all TypeScript errors
   - Remove `any` types
   - Add strict type checking

3. **Fix Format Check**
   - Run Prettier on entire codebase
   - Ensure consistent formatting
   - Add format cache

4. **Fix Unit Tests**
   - Fix flaky tests (remove timing assertions)
   - Add missing test coverage
   - Ensure tests run in < 3 minutes

5. **Fix Build Process**
   - Ensure build succeeds without database
   - Mock external dependencies
   - Add build cache

6. **Add Test Coverage**
   - Add tests for core lib utilities
   - Add tests for API routes
   - Add tests for error handling

7. **Fix E2E Tests**
   - Add proper timeouts
   - Add retries
   - Mock external services

8. **Optimize CI Performance**
   - Add dependency caching
   - Parallelize jobs
   - Use matrix strategy for tests

#### PHASE 3: REINTRODUCE HEAVIER CHECKS (Week 4)

**Goal:** Add back non-critical checks in controlled way

1. **Reintroduce Code Hygiene (Scheduled)**
   - Run weekly, not on PRs
   - Generate reports, don't block

2. **Reintroduce Performance Tests (Scheduled)**
   - Run nightly
   - Compare against baseline
   - Alert on regressions

3. **Reintroduce Security Scans (Scheduled)**
   - Run weekly deep scans
   - Keep lightweight scan in CI

4. **Add Bundle Size Monitoring**
   - Implement proper bundle size check
   - Compare against baseline
   - Alert on regressions

5. **Add Test Coverage Monitoring**
   - Track coverage over time
   - Alert on coverage drops
   - Set coverage thresholds

### DEFINITION OF DONE FOR GREEN CI

**Success Criteria:**
- ✅ All PRs run `ci.yml` with 5 core checks (lint, type-check, format-check, test, build)
- ✅ Core checks pass >95% of the time
- ✅ Flaky tests are identified and either fixed or marked as non-blocking
- ✅ CI feedback time < 5 minutes for core checks
- ✅ No duplicate checks running
- ✅ All checks provide actionable error messages
- ✅ Build succeeds without external dependencies (database, APIs)

**Metrics:**
- PR check pass rate: >95%
- Average CI time: < 5 minutes
- Flaky test rate: < 5%
- False positive rate: < 2%

---

## F. CONCRETE CHANGES & PR STRUCTURE

### PR PLAN

#### PR #1: Disable Non-Critical Workflows on PRs
**Title:** `ci: disable non-critical workflows on PRs`
**Scope:** Remove PR triggers from maintenance/scheduled workflows
**Files:**
- `.github/workflows/code-hygiene.yml` - Remove PR trigger
- `.github/workflows/performance-pr.yml` - Remove PR trigger
- `.github/workflows/futurecheck.yml` - Remove PR trigger
- `.github/workflows/preview-pr.yml` - Change to manual trigger
**Risk:** Low
**Dependencies:** None

#### PR #2: Delete Duplicate Workflows
**Title:** `ci: delete duplicate workflows`
**Scope:** Remove workflows that duplicate `ci.yml` checks
**Files:**
- Delete `.github/workflows/pre-merge-validation.yml`
- Delete `.github/workflows/code-hygiene-check.yml`
**Risk:** Low
**Dependencies:** PR #1

#### PR #3: Consolidate CI Workflow
**Title:** `ci: consolidate core checks into single workflow`
**Scope:** Merge `quality-gates.yml` and `full-matrix-ci.yml` into `ci.yml`, remove redundant jobs
**Files:**
- `.github/workflows/ci.yml` - Rewrite with core checks only
- Delete `.github/workflows/quality-gates.yml` (after merge)
- Delete `.github/workflows/full-matrix-ci.yml` (after merge)
**Risk:** Medium
**Dependencies:** PR #2

#### PR #4: Fix Flaky Tests
**Title:** `test: fix flaky tests and add vitest config`
**Scope:** Remove timing assertions, add proper mocks, create vitest config
**Files:**
- `vitest.config.ts` - Create new config
- `tests/api/healthz.test.ts` - Fix timing assertions
- `tests/lib/route-handler.test.ts` - Add proper mocks
- All test files - Ensure deterministic behavior
**Risk:** Medium
**Dependencies:** None (can run parallel)

#### PR #5: Fix Build Dependencies
**Title:** `ci: make build independent of external dependencies`
**Scope:** Mock database, make DATABASE_URL optional, skip migrations in CI
**Files:**
- `.github/workflows/ci.yml` - Update build job
- `package.json` - Add build scripts that don't require DB
**Risk:** Medium
**Dependencies:** PR #3

#### PR #6: Code Cleanup - Naming & Structure
**Title:** `refactor: standardize naming and file structure`
**Scope:** Rename files to kebab-case, extract route handler concerns, remove dead code
**Files:**
- Multiple files - Rename to kebab-case
- `lib/api/route-handler.ts` - Split into multiple files
- Remove unused exports (from ts-prune report)
**Risk:** High (many files changed)
**Dependencies:** PR #4 (tests should pass)

### LOCAL DEV & CI PARITY

**Single Command to Run CI Locally:**
```bash
# Add to package.json
"ci": "pnpm lint && pnpm typecheck && pnpm format:check && pnpm test && pnpm build"
```

**Documentation:**
- Add `CONTRIBUTING.md` section: "Running CI Checks Locally"
- Update `README.md` with CI command
- Add pre-commit hook to run `pnpm ci` (optional, can be slow)

**Ensure Parity:**
- Use same Node version (18) in CI and local
- Use same pnpm version (8.15.0)
- Use same environment variables (mock where needed)
- Run same commands in same order

---

## G. FINAL CHECKLIST – WHAT I SHOULD DO NEXT

### Week 1: Stop the Bleeding

- [QW] Remove PR trigger from `code-hygiene.yml` (change `on.pull_request` to `on.schedule` only)
- [QW] Remove PR trigger from `performance-pr.yml`
- [QW] Remove PR trigger from `futurecheck.yml`
- [QW] Change `preview-pr.yml` to `workflow_dispatch` only
- [QW] Delete `.github/workflows/pre-merge-validation.yml`
- [QW] Delete `.github/workflows/code-hygiene-check.yml`
- [DW] Rewrite `ci.yml` to only include core checks (lint, type-check, format-check, test, build)
- [DW] Remove database dependency from build job (make DATABASE_URL optional)
- [QW] Add `continue-on-error: true` to E2E tests temporarily
- [QW] Remove timing assertions from `tests/api/healthz.test.ts`

### Week 2: Fix Core Checks

- [DW] Create `vitest.config.ts` with proper configuration
- [DW] Fix all lint errors in codebase (`pnpm lint --fix`)
- [DW] Fix all TypeScript errors (`pnpm typecheck`)
- [DW] Fix all formatting issues (`pnpm format`)
- [DW] Fix flaky tests (remove timing assertions, add proper mocks)
- [DW] Add test coverage for core lib utilities (target: 80%)
- [QW] Add dependency caching to CI workflows
- [QW] Add build caching to CI workflows
- [DW] Ensure tests run in < 3 minutes
- [QW] Add retry logic to E2E tests

### Week 3: Code Cleanup

- [DW] Standardize file naming (kebab-case for files, PascalCase for components)
- [DW] Split `lib/api/route-handler.ts` into separate files
- [DW] Run `ts-prune` and remove unused exports
- [DW] Run `knip` and remove unused dependencies
- [DW] Extract hard-coded values to config
- [DW] Add JSDoc comments to all scripts
- [DW] Create `scripts/README.md` documenting script purposes
- [DW] Consolidate error handling into single utility
- [DW] Remove `any` types from codebase
- [DW] Add proper types for API responses

### Week 4: Reintroduce & Monitor

- [DW] Create `nightly.yml` workflow for scheduled checks
- [DW] Move code hygiene to scheduled workflow
- [DW] Move performance tests to scheduled workflow
- [DW] Move security scans to scheduled workflow
- [DW] Implement proper bundle size check
- [DW] Add test coverage monitoring
- [QW] Set up CI metrics dashboard (optional)
- [QW] Document CI workflow in `docs/CI.md`
- [QW] Update `CONTRIBUTING.md` with CI information
- [QW] Add `pnpm ci` command to `package.json`

### Ongoing: Maintenance

- [QW] Weekly review of CI failures
- [QW] Fix flaky tests as they appear
- [QW] Update dependencies monthly
- [QW] Review and update CI workflows quarterly
- [QW] Monitor CI performance metrics

---

## SUMMARY

**Current State:**
- 40 workflows, ~25-30 checks per PR
- Many duplicate checks
- Flaky tests
- Missing test coverage
- Inconsistent code structure

**Target State:**
- 1 core workflow (`ci.yml`) with 5 checks
- < 5 minutes CI feedback
- >95% pass rate
- Clean, maintainable codebase
- Comprehensive test coverage

**Path Forward:**
1. Disable non-critical workflows (Week 1)
2. Fix core checks (Week 2-3)
3. Clean up code (Week 3)
4. Reintroduce heavier checks (Week 4)

**Success Metric:**
Every PR to main runs a small, clear set of checks that almost always pass unless there is a real bug.
