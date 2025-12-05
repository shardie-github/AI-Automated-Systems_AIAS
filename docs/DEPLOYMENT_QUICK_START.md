# Deployment Quick Start
**AIAS Platform - Content Strategy Deployment in 5 Minutes**

*Last Updated: 2025-01-XX*

---

## 🚀 Quick Deployment (5 Minutes)

### Step 1: Add GitHub Secrets (2 minutes)

Go to **Repository → Settings → Secrets and variables → Actions** and add:

```bash
# Required Secrets
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_PROJECT_REF=your-project-ref
RESEND_API_KEY=re_your-resend-api-key
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Optional
NEXT_PUBLIC_SITE_URL=https://aiautomatedsystems.ca
```

### Step 2: Deploy via GitHub Actions (3 minutes)

1. Go to **Actions** tab
2. Select **"Deploy Content Strategy"** workflow
3. Click **"Run workflow"**
4. Choose options:
   - Environment: `production`
   - Deploy emails: ✅
   - Deploy components: ✅
   - Deploy pages: ✅
5. Click **"Run workflow"**

That's it! The workflow will:
- ✅ Validate environment variables
- ✅ Deploy email cadence function
- ✅ Deploy content pages to Vercel
- ✅ Set up daily email scheduler

---

## 📋 What Gets Deployed

### Email System
- Email cadence scheduler function (Supabase Edge Function)
- Daily cron job (9 AM UTC)
- Email templates with dynamic fields

### Content Pages
- Systems Thinking pillar page
- Business Automation guide
- Canadian Automation guide
- Blog post template and sample

### UI Components
- Enhanced onboarding flow
- Welcome dashboard
- Upgrade prompts
- Empty states
- Error states

---

## ✅ Verification

After deployment, verify:

1. **Email Function**: Supabase Dashboard → Edge Functions → `email-cadence-scheduler`
2. **Content Pages**: 
   - `https://your-site.com/systems-thinking`
   - `https://your-site.com/automation-guide`
   - `https://your-site.com/canadian-automation`
3. **Blog**: `https://your-site.com/blog/10-automation-workflows-save-time`

---

## 🔄 Automatic Deployment

The system automatically deploys when you:
- Push to `main` or `develop` branch
- Modify files in `emails/`, `lib/email-templates/`, `components/`, or `app/`

---

## 📊 Monitoring

### Email Metrics
- Resend Dashboard: https://resend.com/emails
- SendGrid Dashboard: https://app.sendgrid.com/activity

### Function Logs
- Supabase Dashboard → Edge Functions → Logs

### Deployment Status
- GitHub Actions → Workflow runs
- Vercel Dashboard → Deployments

---

## 🆘 Troubleshooting

### "Missing required environment variable"
→ Add the secret in GitHub: Repository → Settings → Secrets

### "Function deployment failed"
→ Check `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` are set

### "Vercel deployment failed"
→ Check `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` are set

---

## 📚 Full Documentation

See `docs/DEPLOYMENT_GUIDE.md` for complete deployment instructions.

---

*Deployment is automated via GitHub Actions. Just add secrets and run the workflow!*
