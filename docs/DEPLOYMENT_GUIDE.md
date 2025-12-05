# Deployment Guide
**AIAS Platform - Content Strategy Deployment**

*Last Updated: 2025-01-XX*

---

## Overview

This guide covers deploying the content strategy system, including:
- Environment variable configuration
- GitHub Actions setup
- Email cadence deployment
- Content pages deployment
- Verification and testing

---

## Prerequisites

1. **GitHub Repository** with Actions enabled
2. **Supabase Project** with functions enabled
3. **Vercel Project** (or alternative hosting)
4. **Email Provider** (Resend, SendGrid, or SMTP)

---

## Step 1: Configure Environment Variables

### GitHub Secrets

Go to **Repository → Settings → Secrets and variables → Actions** and add:

#### Required Secrets

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_PROJECT_REF=your-project-ref

# Email Provider (choose one)
RESEND_API_KEY=re_your-resend-api-key
# OR
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# Vercel Deployment
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Application
NEXT_PUBLIC_SITE_URL=https://aiautomatedsystems.ca
```

#### Optional Secrets

```bash
# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Social Media
TWITTER_API_KEY=...
LINKEDIN_CLIENT_ID=...
```

### Vercel Environment Variables

Go to **Vercel Dashboard → Project → Settings → Environment Variables** and add the same variables (prefixed with `NEXT_PUBLIC_` for client-side).

### Supabase Environment Variables

Go to **Supabase Dashboard → Project Settings → API** and verify:
- Project URL
- Anon key
- Service role key

For Edge Functions, set in **Supabase Dashboard → Edge Functions → Settings**:
- `RESEND_API_KEY` (or `SENDGRID_API_KEY`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Deploy Email Cadence Function

### Option A: Via GitHub Actions (Recommended)

1. **Trigger Deployment Workflow**:
   ```bash
   # Go to Actions tab → "Deploy Content Strategy" → Run workflow
   ```

2. **Or push to main branch**:
   ```bash
   git add .
   git commit -m "Deploy content strategy"
   git push origin main
   ```

The workflow will:
- Validate environment variables
- Deploy email cadence scheduler function
- Set up cron job (daily at 9 AM UTC)
- Test email delivery

### Option B: Manual Deployment

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy email-cadence-scheduler
```

### Verify Function Deployment

1. Go to **Supabase Dashboard → Edge Functions**
2. Verify `email-cadence-scheduler` is deployed
3. Check function logs for errors

---

## Step 3: Set Up Cron Job

### Via Supabase Dashboard

1. Go to **Supabase Dashboard → Database → Cron Jobs**
2. Create new cron job:
   - **Name**: `email-cadence-daily`
   - **Schedule**: `0 9 * * *` (Daily at 9 AM UTC)
   - **SQL**:
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

### Via GitHub Actions (Alternative)

The `email-cadence-cron.yml` workflow runs daily at 9 AM UTC automatically.

---

## Step 4: Deploy Content Pages

### Automatic Deployment (Vercel)

Content pages deploy automatically when you push to main branch via the `deploy-content-strategy.yml` workflow.

### Manual Deployment

```bash
# Build and deploy
npm run build
vercel --prod
```

### Verify Pages

Check these URLs are accessible:
- `https://your-site.com/systems-thinking`
- `https://your-site.com/automation-guide`
- `https://your-site.com/canadian-automation`
- `https://your-site.com/blog/10-automation-workflows-save-time`

---

## Step 5: Test Email Delivery

### Test Welcome Email

```bash
# Via API
curl -X POST \
  "https://your-project.supabase.co/functions/v1/email-cadence-scheduler" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "test": true,
    "email_type": "trial_welcome",
    "test_email": "your-email@example.com"
  }'
```

### Test Template Rendering

```typescript
// In your code
import { sendTrialWelcomeEmail } from '@/lib/email-cadence/scheduler';

await sendTrialWelcomeEmail({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  trialStartDate: new Date(),
  trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});
```

---

## Step 6: Verify Deployment

### Checklist

- [ ] Email cadence function deployed
- [ ] Cron job scheduled (daily at 9 AM UTC)
- [ ] Pillar pages accessible
- [ ] Blog post accessible
- [ ] Email delivery working
- [ ] Environment variables set
- [ ] GitHub Actions workflows running
- [ ] Analytics tracking enabled

### Verification Commands

```bash
# Check Supabase function
supabase functions list

# Check Vercel deployment
vercel ls

# Test email template
npm run test:email-templates

# Check environment variables
npm run validate:env
```

---

## Step 7: Monitor & Optimize

### Email Metrics

Monitor in your email provider dashboard:
- Open rates (target: 25%+)
- Click rates (target: 5%+)
- Bounce rates (target: <2%)
- Unsubscribe rates (target: <0.5%)

### Content Metrics

Monitor in Google Analytics:
- Page views
- Time on page
- Bounce rate
- Conversion rate

### Set Up Alerts

1. **Email Delivery Failures**: Alert if email send rate < 95%
2. **Function Errors**: Alert on Supabase function errors
3. **Page Errors**: Alert on 5xx errors

---

## Troubleshooting

### Email Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` or `SENDGRID_API_KEY` is set
2. **Check Function Logs**: Supabase Dashboard → Edge Functions → Logs
3. **Test Template Rendering**: Verify variables are populated
4. **Check Rate Limits**: Email providers have rate limits

### Function Deployment Fails

1. **Check Supabase CLI**: `supabase --version`
2. **Verify Access Token**: `supabase login`
3. **Check Project Ref**: Verify in Supabase Dashboard
4. **Review Function Code**: Check for syntax errors

### Pages Not Deploying

1. **Check Vercel Build Logs**: Vercel Dashboard → Deployments
2. **Verify Environment Variables**: All `NEXT_PUBLIC_*` vars set
3. **Check Build Errors**: Review build output
4. **Verify Domain**: Check domain configuration

---

## Environment-Specific Configuration

### Production

```bash
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SITE_URL=https://aiautomatedsystems.ca
EMAIL_CADENCE_ENABLED=true
EMAIL_TRACKING_ENABLED=true
```

### Staging

```bash
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_SITE_URL=https://staging.aiautomatedsystems.ca
EMAIL_CADENCE_ENABLED=true
EMAIL_TRACKING_ENABLED=false  # Disable in staging
```

### Development

```bash
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EMAIL_CADENCE_ENABLED=false  # Disable in dev
EMAIL_TRACKING_ENABLED=false
```

---

## GitHub Actions Workflows

### Available Workflows

1. **Deploy Content Strategy** (`deploy-content-strategy.yml`)
   - Deploys email function, pages, and components
   - Runs on push to main/develop
   - Can be triggered manually

2. **Email Cadence Scheduler** (`email-cadence-cron.yml`)
   - Runs daily at 9 AM UTC
   - Processes lifecycle emails
   - Can be triggered manually

3. **Setup Environment Variables** (`setup-env-vars.yml`)
   - Validates required secrets
   - Generates env template
   - Manual trigger only

### Manual Workflow Triggers

1. Go to **Actions** tab
2. Select workflow
3. Click **Run workflow**
4. Choose options
5. Click **Run workflow**

---

## Security Best Practices

1. **Never commit secrets** to repository
2. **Use GitHub Secrets** for sensitive data
3. **Rotate API keys** regularly
4. **Use service role key** only in server-side code
5. **Enable 2FA** on all accounts
6. **Review access logs** regularly

---

## Rollback Procedure

### Rollback Email Function

```bash
# Deploy previous version
supabase functions deploy email-cadence-scheduler --version previous
```

### Rollback Pages

```bash
# Via Vercel Dashboard
# Go to Deployments → Select previous deployment → Promote to Production
```

### Disable Email Cadence

```bash
# Set in environment variables
EMAIL_CADENCE_ENABLED=false
```

---

## Support

For issues:
1. Check function logs in Supabase Dashboard
2. Review GitHub Actions workflow logs
3. Check Vercel deployment logs
4. Review email provider dashboard
5. Contact support: support@aiautomatedsystems.ca

---

*This guide is updated as deployment processes evolve.*
