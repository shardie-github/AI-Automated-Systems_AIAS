# CI Workflow Guide

## Overview

Our CI pipeline is designed to be **fast, reliable, and green by default**. Every PR runs a focused set of core checks that should pass unless there's a real bug.

## Core Checks (Required for PRs)

Every PR to `main` or `develop` runs these checks:

1. **Lint** - ESLint code quality checks (~2-3 min)
2. **Type Check** - TypeScript type checking (~1-2 min)
3. **Format Check** - Prettier formatting validation (~30 sec)
4. **Test** - Unit tests (~2-3 min)
5. **Build** - Production build verification (~3-5 min)

**Total time:** ~5-10 minutes

## Non-Blocking Checks

These checks run but don't block merges:

- **E2E Tests** - End-to-end tests (can be flaky)
- **Security Scan** - Lightweight dependency audit

## Scheduled Checks

These checks run on a schedule and don't block PRs:

- **Code Hygiene** - Dead code analysis (weekly)
- **Performance Benchmarks** - Performance regression detection (nightly)
- **Security Audit** - Deep security scans (weekly)
- **AI Audit** - AI-powered code analysis (weekly)

## Running CI Locally

Before pushing, run the same checks locally:

```bash
pnpm ci
```

This runs: lint → typecheck → format:check → test → build

## Fixing CI Failures

### Lint Errors
```bash
pnpm lint --fix
```

### Type Errors
```bash
pnpm typecheck
# Fix TypeScript errors in your IDE
```

### Format Errors
```bash
pnpm format
```

### Test Failures
```bash
pnpm test
# Fix failing tests
```

### Build Failures
```bash
pnpm build
# Check build output for errors
```

## Workflow Files

- **`ci.yml`** - Core CI pipeline (runs on PRs)
- **`nightly.yml`** - Scheduled checks (if created)
- **`deploy.yml`** - Production deployment (main branch only)

## Branch Protection

PRs to `main` require:
- ✅ All core checks pass (lint, type-check, format-check, test, build)
- ⚠️ E2E tests can be skipped/flaky (non-blocking)
- ❌ No other workflows required

## Getting Help

- See `CI_AND_CODE_AUDIT_REPORT.md` for detailed analysis
- See `CI_STABILIZATION_QUICK_START.md` for quick fixes
- See `CHANGES_SUMMARY.md` for what changed

## Best Practices

1. **Run `pnpm ci` before pushing** - Catch issues early
2. **Fix lint/format errors immediately** - Don't let them accumulate
3. **Write tests for new code** - Maintain >80% coverage
4. **Keep tests fast** - Unit tests should be < 1s each
5. **Don't ignore flaky tests** - Fix or mark as `[flaky]`
