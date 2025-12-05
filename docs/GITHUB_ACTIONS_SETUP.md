# GitHub Actions Setup Guide
**AIAS Platform - Automated Deployment via GitHub Actions**

*Last Updated: 2025-01-XX*

---

## Overview

GitHub Actions automatically deploy the content strategy system when you push code. This guide shows you how to set it up.

---

## Step 1: Add Required Secrets

### Go to GitHub Secrets

1. Navigate to your repository
2. Go to **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**

### Add These Secrets

#### Required Secrets

| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_ACCESS_TOKEN` | Access token for CLI | Supabase Dashboard → Account → Access Tokens |
| `SUPABASE_PROJECT_REF` | Project reference | Supabase Dashboard → Settings → General |
| `RESEND_API_KEY` | Resend API key | Resend Dashboard → API Keys |
| `VERCEL_TOKEN` | Vercel API token | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel org ID | Vercel Dashboard → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel project ID | Vercel Dashboard → Project → Settings |

#### Optional Secrets

| Secret Name | Description |
|------------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Your site URL (defaults to https://aiautomatedsystems.ca) |
| `SENDGRID_API_KEY` | Alternative to Resend |
| `STRIPE_SECRET_KEY` | For payments |
| `STRIPE_WEBHOOK_SECRET` | For webhooks |

---

## Step 2: Verify Workflows

### Available Workflows

1. **Deploy Content Strategy** (`deploy-content-strategy.yml`)
   - Triggers: Push to main/develop, manual dispatch
   - Deploys: Email function, content pages, components

2. **Email Cadence Scheduler** (`email-cadence-cron.yml`)
   - Triggers: Daily at 9 AM UTC, manual dispatch
   - Processes: Lifecycle emails

3. **Setup Environment Variables** (`setup-env-vars.yml`)
   - Triggers: Manual dispatch only
   - Validates: Required secrets

### Test Workflow

1. Go to **Actions** tab
2. Select **"Setup Environment Variables"**
3. Click **"Run workflow"**
4. Choose environment: `production`
5. Click **"Run workflow"**

This will validate all your secrets are set correctly.

---

## Step 3: Deploy

### Automatic Deployment

Push to `main` or `develop` branch:

```bash
git add .
git commit -m "Deploy content strategy"
git push origin main
```

The workflow automatically:
- Validates environment variables
- Deploys email function
- Deploys content pages
- Sets up cron job

### Manual Deployment

1. Go to **Actions** tab
2. Select **"Deploy Content Strategy"**
3. Click **"Run workflow"**
4. Choose options:
   - Environment: `production` or `staging`
   - Deploy emails: ✅
   - Deploy components: ✅
   - Deploy pages: ✅
5. Click **"Run workflow"**

---

## Step 4: Verify Deployment

### Check Workflow Status

1. Go to **Actions** tab
2. Click on the latest workflow run
3. Verify all jobs completed successfully

### Verify Email Function

1. Go to **Supabase Dashboard → Edge Functions**
2. Verify `email-cadence-scheduler` is deployed
3. Check function logs for errors

### Verify Content Pages

Visit these URLs:
- `https://your-site.com/systems-thinking`
- `https://your-site.com/automation-guide`
- `https://your-site.com/canadian-automation`
- `https://your-site.com/blog/10-automation-workflows-save-time`

---

## Step 5: Set Up Cron Job

### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard → Database → Cron Jobs**
2. Create new cron job:
   ```sql
   SELECT net.http_post(
     url := 'https://your-project.supabase.co/functions/v1/email-cadence-scheduler',
     headers := jsonb_build_object(
       'Content-Type', 'application/json',
       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
     ),
     body := '{}'::jsonb
   );
   ```
3. Schedule: `0 9 * * *` (Daily at 9 AM UTC)

### Option B: Via GitHub Actions (Alternative)

The `email-cadence-cron.yml` workflow runs daily automatically. No setup needed.

---

## Environment Variables Reference

### GitHub Secrets (Actions)

All secrets are available to workflows via `${{ secrets.SECRET_NAME }}`

### Vercel Environment Variables

Set in **Vercel Dashboard → Project → Settings → Environment Variables**:
- All `NEXT_PUBLIC_*` variables
- Server-side variables (for API routes)

### Supabase Environment Variables

Set in **Supabase Dashboard → Edge Functions → Settings**:
- `RESEND_API_KEY` (or `SENDGRID_API_KEY`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Troubleshooting

### Workflow Fails: "Missing required environment variable"

**Solution**: Add the missing secret in GitHub: Repository → Settings → Secrets

### Function Deployment Fails

**Solution**: 
1. Check `SUPABASE_ACCESS_TOKEN` is valid
2. Check `SUPABASE_PROJECT_REF` is correct
3. Verify Supabase CLI is up to date

### Vercel Deployment Fails

**Solution**:
1. Check `VERCEL_TOKEN` is valid
2. Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
3. Verify project exists in Vercel

### Email Not Sending

**Solution**:
1. Check `RESEND_API_KEY` or `SENDGRID_API_KEY` is set
2. Check function logs in Supabase Dashboard
3. Verify email provider account is active

---

## Workflow Configuration

### Customize Deployment

Edit `.github/workflows/deploy-content-strategy.yml` to:
- Change deployment schedule
- Add additional validation steps
- Customize deployment targets

### Add New Environments

Add to workflow `on.workflow_dispatch.inputs.environment.options`:
```yaml
options:
  - production
  - staging
  - development  # Add new environment
```

---

## Security Best Practices

1. **Never commit secrets** to repository
2. **Use GitHub Secrets** for all sensitive data
3. **Rotate API keys** regularly (every 90 days)
4. **Review workflow logs** for exposed secrets
5. **Use least privilege** for service accounts
6. **Enable 2FA** on all accounts

---

## Monitoring

### Workflow Status

- **GitHub Actions**: Repository → Actions tab
- **Email**: Workflow completion notifications (if configured)

### Deployment Metrics

Track in:
- GitHub Actions workflow runs
- Vercel deployment history
- Supabase function logs

---

## Quick Reference

### Deploy Command (Local)

```bash
# Validate environment
npm run validate:env

# Deploy email function
npm run deploy:email-function

# Deploy everything
./scripts/deploy-content-strategy.sh
```

### Deploy Command (GitHub Actions)

```bash
# Automatic: Push to main/develop
git push origin main

# Manual: Run workflow via Actions tab
```

---

*GitHub Actions automates all deployment steps. Just add secrets and push code!*
