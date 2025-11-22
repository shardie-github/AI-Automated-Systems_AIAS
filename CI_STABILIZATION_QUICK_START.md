# CI Stabilization Quick Start Guide

**TL;DR:** Follow this guide to go from "25 failed checks" to "green by default" in 4 weeks.

## Immediate Actions (Do Today)

### 1. Disable Non-Critical Workflows on PRs

Run these commands to remove PR triggers:

```bash
# Backup workflows first
cp -r .github/workflows .github/workflows.backup

# Remove PR triggers from these workflows:
# - code-hygiene.yml
# - performance-pr.yml  
# - futurecheck.yml
# - preview-pr.yml
```

### 2. Delete Duplicate Workflows

```bash
rm .github/workflows/pre-merge-validation.yml
rm .github/workflows/code-hygiene-check.yml
```

### 3. Create Core CI Workflow

Replace `.github/workflows/ci.yml` with the simplified version (see below).

## Core CI Workflow Template

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  PNPM_VERSION: '8.15.0'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  format-check:
    name: Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: [lint, type-check]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - run: pnpm install --frozen-lockfile
      - run: pnpm test -- --run

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
        env:
          # Make DATABASE_URL optional for build
          DATABASE_URL: ${{ secrets.DATABASE_URL || 'postgresql://localhost:5432/test' }}
          # Skip Prisma generation if DB not available
          SKIP_PRISMA_GENERATE: ${{ !secrets.DATABASE_URL }}

  test-e2e:
    name: E2E Tests (Non-Blocking)
    runs-on: ubuntu-latest
    needs: [build]
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
```

## Local CI Command

Add to `package.json`:

```json
{
  "scripts": {
    "ci": "pnpm lint && pnpm typecheck && pnpm format:check && pnpm test && pnpm build"
  }
}
```

Run locally: `pnpm ci`

## Week-by-Week Plan

### Week 1: Stop the Bleeding ✅
- [ ] Disable non-critical workflows on PRs
- [ ] Delete duplicate workflows  
- [ ] Simplify `ci.yml` to core checks
- [ ] Fix immediate build failures

### Week 2: Fix Core Checks 🔧
- [ ] Fix all lint errors
- [ ] Fix all TypeScript errors
- [ ] Fix flaky tests
- [ ] Add vitest config

### Week 3: Code Cleanup 🧹
- [ ] Standardize naming
- [ ] Remove dead code
- [ ] Add test coverage
- [ ] Extract concerns

### Week 4: Reintroduce & Monitor 📊
- [ ] Create `nightly.yml` for scheduled checks
- [ ] Monitor CI metrics
- [ ] Document CI process

## Success Metrics

- ✅ PR check pass rate: >95%
- ✅ Average CI time: < 5 minutes
- ✅ Flaky test rate: < 5%
- ✅ False positive rate: < 2%

## Need Help?

See `CI_AND_CODE_AUDIT_REPORT.md` for detailed analysis and rationale.
