# Frontend Deployment via GitHub Actions to Vercel

This document explains how frontend deployments work for the AIAS Platform. **No local Vercel or Supabase CLI is required**—everything runs automatically in GitHub Actions.

## Overview

The frontend is deployed to Vercel using the **Frontend CI/CD** workflow (`.github/workflows/frontend-deploy.yml`). This workflow:

- **For Pull Requests:** Creates preview deployments automatically
- **For `main` branch:** Deploys to production automatically
- **Runs checks first:** Lint, typecheck, tests, and build must pass before deployment

## How It Works

### Pull Request Flow

1. **Developer opens a PR** → Workflow triggers automatically
2. **Build and Test job runs:**
   - Installs dependencies (pnpm)
   - Runs lint (`pnpm run lint`)
   - Runs typecheck (`pnpm run typecheck`)
   - Runs tests (`pnpm run test`)
   - Builds the application (`pnpm run build`)
3. **If all checks pass** → Deploy job runs:
   - Pulls Vercel environment configuration
   - Builds for Vercel
   - Deploys as preview deployment
   - Comments the preview URL on the PR

### Production Flow (main branch)

1. **Code is pushed/merged to `main`** → Workflow triggers automatically
2. **Build and Test job runs** (same as PR flow)
3. **If all checks pass** → Deploy job runs:
   - Pulls Vercel production environment configuration
   - Builds for Vercel
   - Deploys to production
   - Logs the production URL

## Required GitHub Secrets

The following secrets must be configured in your GitHub repository:

### Vercel Secrets

1. **`VERCEL_TOKEN`**
   - **How to get:** 
     - Go to [Vercel Dashboard](https://vercel.com/account/tokens)
     - Click "Create Token"
     - Give it a name (e.g., "GitHub Actions")
     - Copy the token
   - **Where to add:** GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret

2. **`VERCEL_ORG_ID`**
   - **How to get:**
     - Go to [Vercel Dashboard](https://vercel.com/account)
     - Open your organization settings
     - The Organization ID is shown in the URL or settings page
   - **Where to add:** Same as above

3. **`VERCEL_PROJECT_ID`**
   - **How to get:**
     - Go to your project in Vercel Dashboard
     - Open project settings
     - The Project ID is shown in the General settings or URL
   - **Where to add:** Same as above

### Optional (for build)

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (if needed for build)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (if needed for build)
- `DATABASE_URL`: Database connection string (optional, defaults to test value)

## Manual Trigger

You can manually trigger the workflow:

1. Go to **Actions** tab in GitHub
2. Select **Frontend CI/CD** workflow
3. Click **Run workflow**
4. Choose the branch and click **Run workflow**

## Finding Deployment URLs

### Preview Deployments (PRs)

- **In PR comments:** The workflow automatically comments the preview URL on each PR
- **In GitHub Actions logs:** Look for the "Deploy to Vercel (Preview)" step output
- **In Vercel Dashboard:** Go to your project → Deployments → Find the preview deployment

### Production Deployments

- **In GitHub Actions logs:** Look for the "Deploy to Vercel (Production)" step output
- **In Vercel Dashboard:** Go to your project → Deployments → Production deployments

## Workflow Details

### Concurrency

The workflow uses concurrency groups to prevent multiple deployments of the same branch:
- **Group:** `frontend-deploy-${{ github.ref }}`
- **Behavior:** Cancels in-progress deployments when a new one starts

### Build Artifacts

- Build artifacts (`.next/` directory) are uploaded and reused between jobs
- Retention: 7 days

### Environment Variables

The workflow sets:
- `NODE_ENV=production` for all deployments
- Vercel-specific env vars are pulled from Vercel project settings

## Troubleshooting

### Deployment Fails

1. **Check GitHub Actions logs** for the specific error
2. **Common issues:**
   - Missing secrets → Add required secrets in GitHub Settings
   - Build failures → Check lint/typecheck/test output
   - Vercel API errors → Verify `VERCEL_TOKEN` is valid and has correct permissions

### Preview URL Not Showing

- Check if the PR comment was created (look in PR comments)
- Check GitHub Actions logs for the "Comment Preview URL" step
- Ensure the deployment step succeeded

### Build Fails Locally But Passes in CI

- Ensure you're using Node 20 (`nvm use` or check `.nvmrc`)
- Ensure you're using pnpm (`pnpm install`)
- Clear local cache: `rm -rf node_modules .next && pnpm install`

## Related Workflows

- **Supabase Migrations:** Handled separately via `.github/workflows/supabase-migrate.yml`
  - Runs independently of frontend deployments
  - Can be triggered manually or on push to `main`
  - See [docs/ci-overview.md](./ci-overview.md) for details

## Best Practices

1. **Always check PR previews** before merging to `main`
2. **Monitor GitHub Actions** for deployment status
3. **Keep secrets up to date** if Vercel project settings change
4. **Don't commit secrets** - always use GitHub Secrets
5. **Review build logs** if deployments fail unexpectedly

## No Local CLI Required

✅ **Everything runs in GitHub Actions**  
✅ **No need to install Vercel CLI locally**  
✅ **No need to run `vercel` commands manually**  
✅ **Preview deployments happen automatically on PRs**  
✅ **Production deployments happen automatically on merge to `main`**

---

For questions or issues, see the [CI/CD Overview](./ci-overview.md) or open an issue in the repository.
