# Branch Protection Rules

**Last Updated:** 2025-01-XX  
**Purpose:** Guide to GitHub branch protection rules and required checks

---

## Overview

Branch protection rules ensure code quality and prevent accidental changes to production code. This document outlines the recommended branch protection rules for the AIAS Platform.

---

## Protected Branches

### `main` Branch (Production)

**Status:** ✅ **Should be protected**

**Purpose:** Production-ready code only

**Protection Rules:**

1. **Require Pull Request Reviews**
   - ✅ Required: At least 1 approval
   - ✅ Dismiss stale reviews when new commits are pushed
   - ✅ Require review from code owners (if CODEOWNERS file exists)

2. **Require Status Checks to Pass**
   - ✅ Required checks:
     - `lint` (from `ci.yml`)
     - `type-check` (from `ci.yml`)
     - `format-check` (from `ci.yml`)
     - `test` (from `ci.yml`)
     - `build` (from `ci.yml`)
     - `test-e2e` (from `ci.yml`) - Critical flows
   - ✅ Require branches to be up to date before merging

3. **Require Conversation Resolution**
   - ✅ All comments must be resolved before merging

4. **Restrictions**
   - ✅ Do not allow force pushes
   - ✅ Do not allow deletions
   - ✅ Restrict pushes that create matching branches (optional)

5. **Allow Specific Actors**
   - ✅ Allow specified actors to bypass required pull requests (admins only)

---

## Required Status Checks

### Core Checks (Blocking)

These checks **must** pass before merging to `main`:

1. **`lint`**
   - Workflow: `.github/workflows/ci.yml`
   - Job: `lint`
   - Purpose: Code linting (ESLint)
   - **Status:** ✅ Required

2. **`type-check`**
   - Workflow: `.github/workflows/ci.yml`
   - Job: `type-check`
   - Purpose: TypeScript type checking
   - **Status:** ✅ Required

3. **`format-check`**
   - Workflow: `.github/workflows/ci.yml`
   - Job: `format-check`
   - Purpose: Code formatting (Prettier)
   - **Status:** ✅ Required

4. **`test`**
   - Workflow: `.github/workflows/ci.yml`
   - Job: `test`
   - Purpose: Unit tests (Vitest)
   - **Status:** ✅ Required

5. **`build`**
   - Workflow: `.github/workflows/ci.yml`
   - Job: `build`
   - Purpose: Build verification
   - **Status:** ✅ Required

6. **`test-e2e`**
   - Workflow: `.github/workflows/ci.yml`
   - Job: `test-e2e`
   - Purpose: E2E tests (critical flows)
   - **Status:** ✅ Required (newly added)

### Optional Checks (Non-Blocking)

These checks run but don't block merging:

1. **`test-e2e` (Full Suite)**
   - Workflow: `.github/workflows/ci.yml`
   - Job: `test-e2e` (full suite)
   - Purpose: Complete E2E test coverage
   - **Status:** ⚠️ Non-blocking (if separate from critical flows)

2. **`security-scan`**
   - Workflow: `.github/workflows/ci.yml`
   - Job: `security-scan`
   - Purpose: Dependency security audit
   - **Status:** ⚠️ Non-blocking

---

## Setting Up Branch Protection

### Via GitHub Web Interface

1. **Navigate to Repository Settings:**
   - Go to repository → Settings → Branches

2. **Add Branch Protection Rule:**
   - Click "Add rule"
   - Branch name pattern: `main`

3. **Configure Rules:**
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Require status checks to pass before merging
   - ✅ Select required checks (see list above)
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow force pushes
   - ✅ Do not allow deletions

4. **Save Rule:**
   - Click "Create" to save

### Via GitHub API

```bash
# Set branch protection (requires admin access)
curl -X PUT \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/branches/main/protection \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": [
        "lint",
        "type-check",
        "format-check",
        "test",
        "build",
        "test-e2e"
      ]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true
    },
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }'
```

### Via Terraform (Infrastructure as Code)

```hcl
resource "github_branch_protection" "main" {
  repository_id = github_repository.repo.id
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = [
      "lint",
      "type-check",
      "format-check",
      "test",
      "build",
      "test-e2e"
    ]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
  }

  enforce_admins   = true
  allow_force_pushes = false
  allow_deletions   = false
}
```

---

## Workflow Integration

### CI Workflow Status Checks

The `.github/workflows/ci.yml` workflow automatically creates status checks:

```yaml
jobs:
  lint:
    name: Lint  # Creates status check: "lint"
    # ...
  
  type-check:
    name: Type Check  # Creates status check: "type-check"
    # ...
  
  test:
    name: Test  # Creates status check: "test"
    # ...
  
  build:
    name: Build  # Creates status check: "build"
    # ...
  
  test-e2e:
    name: E2E Tests (Critical Flows)  # Creates status check: "test-e2e"
    # ...
```

### Required Check Names

When setting up branch protection, use these exact check names:

- `lint`
- `type-check`
- `format-check`
- `test`
- `build`
- `test-e2e`

**Note:** Check names are case-sensitive and must match exactly.

---

## Bypassing Protection (Emergency Only)

### When to Bypass

**Only bypass protection in emergencies:**
- Critical security fix
- Production outage
- Data loss prevention

### How to Bypass

1. **Admin Access Required:**
   - Only repository admins can bypass
   - Go to branch protection settings
   - Temporarily disable protection
   - Make emergency fix
   - Re-enable protection
   - Create follow-up PR for review

2. **Document Bypass:**
   - Create issue explaining bypass
   - Link to emergency fix
   - Schedule post-mortem if needed

---

## Troubleshooting

### Check Not Showing Up

**Issue:** Required check not appearing in branch protection

**Solution:**
1. Verify workflow runs on PRs
2. Check workflow file syntax
3. Ensure job name matches check name
4. Wait for workflow to run at least once

### Check Failing

**Issue:** Required check failing, blocking merge

**Solution:**
1. Review check logs
2. Fix issues locally
3. Push fixes to PR
4. Wait for checks to re-run

### Check Stuck

**Issue:** Check stuck in "pending" state

**Solution:**
1. Check GitHub Actions status
2. Verify workflow is running
3. Re-run failed workflow if needed
4. Contact GitHub support if persistent

---

## Best Practices

### ✅ Do

1. **Require All Core Checks:**
   - Lint, type-check, format-check, test, build, E2E

2. **Require PR Reviews:**
   - At least 1 approval
   - Code owner reviews if applicable

3. **Keep Checks Fast:**
   - Optimize test execution
   - Use parallel jobs
   - Cache dependencies

4. **Document Changes:**
   - Update this doc when adding checks
   - Communicate changes to team

### ❌ Don't

1. **Don't Bypass Without Reason:**
   - Only bypass in emergencies
   - Document all bypasses

2. **Don't Make Checks Too Strict:**
   - Balance quality with velocity
   - Don't require unnecessary checks

3. **Don't Ignore Failing Checks:**
   - Fix issues before merging
   - Don't disable checks to merge

---

## Monitoring

### Check Status Dashboard

**GitHub Insights:**
- Go to repository → Insights → Pull Requests
- View check pass/fail rates
- Identify common failure patterns

### Alerts

**Set Up Alerts For:**
- Frequent check failures
- Long-running checks
- Bypassed protections

---

## Conclusion

**Current Status:**
- ✅ Core checks defined
- ✅ E2E tests added as required check
- ⏳ Branch protection rules need to be configured in GitHub

**Next Steps:**
1. Configure branch protection in GitHub
2. Verify all checks appear correctly
3. Test protection rules with a test PR
4. Document any custom rules

**Required Checks for `main`:**
- `lint`
- `type-check`
- `format-check`
- `test`
- `build`
- `test-e2e`

---

## Quick Reference

### Required Checks
```
lint
type-check
format-check
test
build
test-e2e
```

### Protection Settings
- Require PR: ✅ Yes
- Required Approvals: 1
- Require Up-to-Date: ✅ Yes
- Allow Force Push: ❌ No
- Allow Deletion: ❌ No
