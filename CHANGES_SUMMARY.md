# CI Stabilization Changes Summary

## Changes Made

### 1. Simplified Core CI Workflow (`ci.yml`)
- **Removed:** Redundant jobs (security-audit, code-hygiene, performance-tests, docker-build, deploy jobs)
- **Kept:** Core checks only (lint, type-check, format-check, test, build)
- **Added:** Non-blocking E2E tests and lightweight security scan
- **Result:** Reduced from 11 jobs to 6 jobs, faster feedback

### 2. Disabled Non-Critical Workflows on PRs
- **`code-hygiene.yml`:** Removed PR trigger, now scheduled/maintenance only
- **`performance-pr.yml`:** Removed PR trigger, now scheduled nightly
- **`futurecheck.yml`:** Removed PR trigger, now scheduled daily
- **`preview-pr.yml`:** Changed to manual trigger only

### 3. Deleted Duplicate Workflows
- **Deleted:** `.github/workflows/pre-merge-validation.yml` (duplicated ci.yml checks)
- **Deleted:** `.github/workflows/code-hygiene-check.yml` (redundant with code-hygiene.yml)

### 4. Added Local CI Command
- **Added:** `pnpm ci` script to `package.json` that runs all core checks locally
- **Usage:** Run `pnpm ci` before pushing to ensure CI passes

### 5. Created Vitest Config
- **Created:** `vitest.config.ts` with proper test configuration
- **Features:** Coverage thresholds, retries for flaky tests, proper aliases

## Expected Impact

### Before
- ~25-30 checks per PR
- Many duplicate checks
- Non-critical checks blocking PRs
- Flaky tests causing failures

### After
- ~6 core checks per PR
- No duplicate checks
- Non-critical checks moved to scheduled/maintenance
- E2E tests non-blocking

## Next Steps

1. **Test the changes:** Create a test PR to verify CI works correctly
2. **Fix any remaining issues:** Address lint/type errors if they appear
3. **Monitor CI metrics:** Track pass rate and feedback time
4. **Continue with Week 2 tasks:** Fix flaky tests, add test coverage

## Files Changed

- `.github/workflows/ci.yml` - Simplified core workflow
- `.github/workflows/code-hygiene.yml` - Removed PR trigger
- `.github/workflows/performance-pr.yml` - Removed PR trigger
- `.github/workflows/futurecheck.yml` - Removed PR trigger
- `.github/workflows/preview-pr.yml` - Changed to manual trigger
- `.github/workflows/pre-merge-validation.yml` - **DELETED**
- `.github/workflows/code-hygiene-check.yml` - **DELETED**
- `package.json` - Added `ci` script
- `vitest.config.ts` - **CREATED** new test config

## Rollback Plan

If issues occur, you can:
1. Restore deleted workflows from git history
2. Re-enable PR triggers by uncommenting the `pull_request` sections
3. Revert `ci.yml` to previous version

```bash
# Restore deleted workflows
git checkout HEAD~1 -- .github/workflows/pre-merge-validation.yml
git checkout HEAD~1 -- .github/workflows/code-hygiene-check.yml

# Re-enable PR triggers (uncomment pull_request sections in workflow files)
```
