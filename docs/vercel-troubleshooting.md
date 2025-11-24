# Vercel Troubleshooting Guide

**Last Updated:** 2025-01-XX  
**Purpose:** Troubleshooting guide for Vercel deployment issues

---

## Quick Diagnosis

### Step 1: Run Deploy Doctor

```bash
pnpm run deploy:doctor
```

This will check:
- Node version consistency
- Package manager consistency
- Lockfile consistency
- Deploy scripts presence
- Environment variables documentation
- Workflow configuration
- Vercel configuration

### Step 2: Check GitHub Actions Logs

1. Go to GitHub → Actions
2. Find the latest workflow run
3. Check which job/step failed
4. Review error messages

### Step 3: Check Vercel Dashboard

1. Go to Vercel Dashboard → Your Project
2. Check Deployments tab
3. Review build logs
4. Check environment variables

---

## Common Issues and Solutions

### Issue 1: No Preview Deployment Appears for PRs

**Symptoms:**
- PR opened but no preview deployment
- GitHub Actions workflow doesn't run
- No preview URL in PR comments

**Diagnosis:**

1. **Check Workflow Triggers**
   ```yaml
   # Should be in frontend-deploy.yml
   on:
     pull_request:
       branches: ['**']  # Should trigger on all PRs
   ```

2. **Check Workflow is Enabled**
   - Go to GitHub → Actions → Workflows
   - Verify `frontend-deploy.yml` is enabled
   - Check if workflow was disabled

3. **Check Branch Protection**
   - Go to GitHub → Settings → Branches
   - Verify branch protection doesn't block workflows

4. **Check Workflow Permissions**
   - Go to GitHub → Settings → Actions → General
   - Verify "Workflow permissions" allows workflows to write

**Solutions:**

- ✅ Ensure `frontend-deploy.yml` triggers on `pull_request: branches: ['**']`
- ✅ Enable workflow in GitHub Actions settings
- ✅ Check branch protection rules
- ✅ Verify workflow permissions

---

### Issue 2: No Production Deploy on Push to Main

**Symptoms:**
- Push to `main` but no production deployment
- GitHub Actions workflow doesn't run
- No deployment in Vercel dashboard

**Diagnosis:**

1. **Check Workflow Triggers**
   ```yaml
   # Should be in frontend-deploy.yml
   on:
     push:
       branches: [main]  # Should trigger on main push
   ```

2. **Check Workflow Condition**
   ```yaml
   # Deploy job should have:
   if: github.ref == 'refs/heads/main' && github.event_name == 'push'
   ```

3. **Check Workflow is Enabled**
   - Go to GitHub → Actions → Workflows
   - Verify `frontend-deploy.yml` is enabled

**Solutions:**

- ✅ Ensure `frontend-deploy.yml` triggers on `push: branches: [main]`
- ✅ Verify deploy job condition includes `github.event_name == 'push'`
- ✅ Enable workflow in GitHub Actions settings

---

### Issue 3: Workflow Runs But Deploy Step is Skipped

**Symptoms:**
- Build/test jobs pass
- Deploy job is skipped (grayed out)
- No deployment occurs

**Diagnosis:**

1. **Check Job Condition**
   ```yaml
   # Deploy job should have:
   if: |
     (github.event_name == 'pull_request') || 
     (github.ref == 'refs/heads/main' && github.event_name == 'push')
   ```

2. **Check Job Dependencies**
   ```yaml
   # Deploy job should depend on build-and-test:
   needs: build-and-test
   ```

3. **Check if Build Job Failed**
   - If `build-and-test` job failed, deploy won't run
   - Fix build issues first

**Solutions:**

- ✅ Fix deploy job condition if incorrect
- ✅ Ensure `build-and-test` job passes
- ✅ Check job dependencies are correct

---

### Issue 4: Workflow Runs But Fails During Deploy

**Symptoms:**
- Build/test jobs pass
- Deploy job starts but fails
- Error messages in GitHub Actions logs

**Common Error Messages:**

#### "Missing required secrets"

**Error:**
```
❌ Missing required secrets: VERCEL_TOKEN, VERCEL_ORG_ID
```

**Solution:**
1. Go to GitHub → Settings → Secrets → Actions
2. Add missing secrets:
   - `VERCEL_TOKEN` - Get from Vercel Dashboard → Settings → Tokens
   - `VERCEL_ORG_ID` - Get from Vercel Dashboard → Settings → General
   - `VERCEL_PROJECT_ID` - Get from Vercel Dashboard → Project → Settings → General

#### "Failed to extract deployment URL"

**Error:**
```
❌ Failed to extract deployment URL from Vercel output
```

**Solution:**
1. Check Vercel token is valid
2. Check Vercel project ID is correct
3. Check Vercel org ID is correct
4. Review full deployment output in logs

#### "Vercel build failed"

**Error:**
```
Error: Build failed
```

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify environment variables are set in Vercel
3. Test build locally: `pnpm run build`
4. Check for missing dependencies

---

### Issue 5: Double Deployments

**Symptoms:**
- Two deployments appear for same commit
- One from GitHub Actions, one from Vercel
- Confusion about which is "real"

**Root Cause:** Vercel Git integration is enabled alongside GitHub Actions

**Diagnosis:**

1. **Check `vercel.json`**
   ```json
   {
     "git": {
       "deploymentEnabled": {
         "main": false,  // Should be false
         "preview": false  // Should be false
       }
     },
     "github": {
       "deploymentEnabled": {
         "main": false,  // Should be false
         "preview": false  // Should be false
       }
     }
   }
   ```

2. **Check Vercel Dashboard**
   - Go to Vercel Dashboard → Project → Settings → Git
   - Verify Git integration is disabled
   - Or disconnect repository if connected

**Solution:**

- ✅ Disable Git integration in `vercel.json`
- ✅ Disable GitHub integration in `vercel.json`
- ✅ Disconnect repository in Vercel dashboard (if connected)
- ✅ Use only GitHub Actions for deployments

---

### Issue 6: Wrong Environment Variables Used

**Symptoms:**
- Preview uses production env vars
- Production uses preview env vars
- Build fails due to missing env vars

**Root Cause:** Wrong environment pulled in `vercel pull`

**Diagnosis:**

1. **Check Workflow Pull Command**
   ```yaml
   # For preview (PRs):
   vercel pull --yes --environment=preview
   
   # For production (main):
   vercel pull --yes --environment=production
   ```

2. **Check Vercel Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Verify variables are set for correct environments:
     - Preview: Set for "Preview" environment
     - Production: Set for "Production" environment

**Solution:**

- ✅ Ensure workflow pulls correct environment
- ✅ Set environment variables in Vercel for correct environments
- ✅ Use `vercel pull:preview` or `vercel:pull:production` scripts

---

### Issue 7: Build Fails Due to Missing Prisma Client

**Symptoms:**
```
Error: Cannot find module '@prisma/client'
```

**Root Cause:** Prisma client not generated before build

**Solution:**

1. **Ensure Prisma Generation Step**
   ```yaml
   - name: Generate Prisma Client
     run: pnpm run db:generate
     continue-on-error: true
   ```

2. **Check DATABASE_URL**
   - Prisma generation needs DATABASE_URL
   - Set in GitHub Secrets or use fallback

---

### Issue 8: Node Version Mismatch

**Symptoms:**
```
Error: The engine "node" is incompatible with this module
```

**Root Cause:** Workflow uses wrong Node version

**Solution:**

1. **Check Workflow Node Version**
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       node-version: '20'  # Should match package.json engines
   ```

2. **Check package.json**
   ```json
   {
     "engines": {
       "node": ">=20 <21"
     }
   }
   ```

---

### Issue 9: Package Manager Mismatch

**Symptoms:**
```
Error: Lockfile mismatch
Error: Cannot find module
```

**Root Cause:** Workflow uses npm instead of pnpm

**Solution:**

1. **Check Workflow Package Manager**
   ```yaml
   - name: Setup pnpm
     uses: pnpm/action-setup@v2
     with:
       version: 8.15.0
   
   - name: Install dependencies
     run: pnpm install --frozen-lockfile
   ```

2. **Check Lockfile**
   - Should have `pnpm-lock.yaml`
   - Should NOT have `package-lock.json` or `yarn.lock`

---

## Verification Checklist

Before reporting an issue, verify:

- [ ] Deploy doctor passes: `pnpm run deploy:doctor`
- [ ] Required secrets are set in GitHub Secrets
- [ ] Environment variables are set in Vercel
- [ ] Vercel Git integration is disabled
- [ ] Workflow triggers are correct
- [ ] Node version is 20
- [ ] Package manager is pnpm
- [ ] Build succeeds locally: `pnpm run build`

---

## Getting Help

### 1. Check Documentation

- `docs/deploy-strategy.md` - Deployment strategy
- `docs/deploy-reliability-plan.md` - Reliability plan
- `docs/deploy-failure-postmortem-final.md` - Previous fixes

### 2. Run Diagnostics

```bash
# Run deploy doctor
pnpm run deploy:doctor

# Test build locally
pnpm run build

# Test Vercel CLI (if token available)
vercel pull --environment=preview
vercel build
```

### 3. Check Logs

- **GitHub Actions:** GitHub → Actions → Latest workflow run
- **Vercel:** Vercel Dashboard → Project → Deployments → Latest deployment

### 4. Create Issue

If issue persists:
1. Document the issue
2. Include error messages
3. Include deploy doctor output
4. Include relevant logs
5. Create GitHub issue

---

## Prevention

### Regular Checks

1. **Weekly:** Run deploy doctor (automatic via GitHub Actions)
2. **Monthly:** Review deployment metrics
3. **Quarterly:** Full deployment audit

### Best Practices

1. ✅ Always test in preview before production
2. ✅ Keep Node/pnpm versions consistent
3. ✅ Disable Vercel Git integration
4. ✅ Use only GitHub Actions for deployments
5. ✅ Validate secrets before deploying
6. ✅ Monitor deployment success rate

---

## Conclusion

**Key Takeaways:**
- Run deploy doctor first: `pnpm run deploy:doctor`
- Check GitHub Actions logs for errors
- Verify secrets and environment variables
- Ensure Vercel Git integration is disabled
- Test locally before deploying

**If All Else Fails:**
1. Review `docs/deploy-strategy.md`
2. Review `docs/deploy-reliability-plan.md`
3. Create GitHub issue with full details
