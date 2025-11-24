# Environment Variables & Secrets Management

**Last Updated:** 2025-01-XX  
**Purpose:** Complete guide to environment variables across local, CI, and production

---

## Overview

The AIAS Platform uses environment variables for all configuration. No hardcoded values exist in the codebase. Variables are managed through:

1. **Local Development:** `.env.local` file (not committed)
2. **CI/CD:** GitHub Secrets
3. **Production:** Vercel Environment Variables
4. **Database:** Supabase Dashboard settings

---

## Environment Variable Categories

### 🔴 Required (Production)

These variables **must** be set for the application to run:

#### Supabase (Core)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- `SUPABASE_PROJECT_REF` - Supabase project reference ID
- `SUPABASE_ACCESS_TOKEN` - Supabase CLI access token (for migrations)

#### Database
- `DATABASE_URL` - PostgreSQL connection string (constructed from Supabase credentials)
- `DIRECT_URL` - Direct PostgreSQL connection (for migrations)

#### Application
- `NEXT_PUBLIC_SITE_URL` - Public site URL (e.g., `https://aias-platform.com`)
- `NODE_ENV` - Environment (`production`, `development`, `test`)

---

### 🟡 Optional (Feature-Specific)

These variables enable specific features:

#### Stripe (Payments)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (public)
- `NEXT_PUBLIC_STRIPE_PRICE_*` - Stripe price IDs for plans

#### OAuth (Authentication)
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

#### AI Services
- `OPENAI_API_KEY` - OpenAI API key

#### Email
- `RESEND_API_KEY` - Resend API key
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password

#### Monitoring & Observability
- `SENTRY_DSN` - Sentry error tracking DSN
- `DATADOG_API_KEY` - Datadog API key
- `OTEL_SERVICE_NAME` - OpenTelemetry service name
- `OTEL_EXPORTER_OTLP_ENDPOINT` - OpenTelemetry endpoint
- `ENABLE_OTEL` - Enable OpenTelemetry (`true`/`false`)

#### Redis/Caching
- `REDIS_URL` - Redis connection URL
- `KV_REST_API_URL` - Vercel KV API URL
- `KV_REST_API_TOKEN` - Vercel KV API token

#### Admin & Security
- `ADMIN_BASIC_AUTH` - Basic auth credentials (`username:password`)
- `PREVIEW_REQUIRE_AUTH` - Require auth for preview deployments (`true`/`false`)

#### Integrations
- `META_ACCESS_TOKEN` - Meta/Facebook API token
- `TIKTOK_ACCESS_TOKEN` - TikTok API token
- `SHOPIFY_API_KEY` - Shopify API key
- `ELEVENLABS_API_KEY` - ElevenLabs API key
- And 20+ more integration variables (see `.env.example`)

---

## Environment Variable Naming Convention

### Public Variables (Client-Side)

**Prefix:** `NEXT_PUBLIC_*`

These variables are exposed to the browser/client. **Never** include secrets here.

**Examples:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

### Private Variables (Server-Side)

**No prefix** (or service-specific prefix)

These variables are only available server-side. **Never** expose these to the client.

**Examples:**
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `DATABASE_URL`

---

## Setting Up Environment Variables

### Local Development

1. **Copy example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in required values:**
   - Get Supabase credentials from Supabase Dashboard → Settings → API
   - Add other variables as needed

3. **Never commit `.env.local`:**
   - Already in `.gitignore`
   - Contains sensitive values

### GitHub Actions (CI/CD)

**Location:** Repository → Settings → Secrets and variables → Actions

**Required Secrets (for deployments):**
- `VERCEL_TOKEN` - **REQUIRED** - Vercel API token (get from Vercel Dashboard → Settings → Tokens)
- `VERCEL_ORG_ID` - **REQUIRED** - Vercel organization ID (get from Vercel Dashboard → Settings → General)
- `VERCEL_PROJECT_ID` - **REQUIRED** - Vercel project ID (get from Vercel Dashboard → Project → Settings → General)

**Required Secrets (for migrations):**
- `SUPABASE_ACCESS_TOKEN` - Supabase CLI access token
- `SUPABASE_PROJECT_REF` - Supabase project reference ID

**Required Secrets (for builds - optional but recommended):**
- `DATABASE_URL` - Database connection string (for Prisma generation)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (for build)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (for build)

**Optional Secrets:**
- `STRIPE_SECRET_KEY`
- `OPENAI_API_KEY`
- `SLACK_WEBHOOK_URL`
- And others as needed

**Validation:** The `frontend-deploy.yml` workflow validates required Vercel secrets before deployment. Missing secrets will cause deployment to fail with a clear error message.

### Vercel (Production)

**Location:** Vercel Dashboard → Project → Settings → Environment Variables

**Environment Types:**
1. **Production:** Used in production deployments
2. **Preview:** Used in preview deployments
3. **Development:** Used in local development (via `vercel pull`)

**Required Variables:**
- All `NEXT_PUBLIC_*` variables (public)
- All server-side variables (private)

**How to Set:**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add variables for each environment type

### Supabase (Database)

**Location:** Supabase Dashboard → Settings → API

**Variables Available:**
- `SUPABASE_URL` (Project URL)
- `SUPABASE_ANON_KEY` (Anon/Public Key)
- `SUPABASE_SERVICE_ROLE_KEY` (Service Role Key)
- `SUPABASE_JWT_SECRET` (JWT Secret)

**Note:** These are the source of truth. Copy them to Vercel and GitHub Secrets.

---

## Environment Variable Mapping

### GitHub Secrets → CI Workflows

**Workflow:** `.github/workflows/frontend-deploy.yml`
```yaml
env:
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

**Workflow:** `.github/workflows/apply-supabase-migrations.yml`
```yaml
env:
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
```

### Vercel Variables → Application

**Pulled via:** `vercel pull` in CI workflows

**Used in:** Next.js application at runtime

**Access:** Via `process.env.*` or `lib/env.ts`

---

## Environment Variable Validation

### Runtime Validation

**File:** `lib/env.ts`

**Function:** `validateEnv()`

**Checks:**
- Required variables are present
- Variables are in correct format
- No hardcoded values

**Usage:**
```typescript
import { validateEnv } from '@/lib/env';

const validation = validateEnv();
if (!validation.valid) {
  console.error('Missing required variables:', validation.errors);
}
```

### Startup Validation

**File:** `lib/env-validation.ts`

**Function:** `validateEnvOnStartup()`

**Checks:** Runs on application startup, throws if invalid

---

## Security Best Practices

### ✅ Do

1. **Use Secrets Management:**
   - GitHub Secrets for CI
   - Vercel Environment Variables for deployments
   - Supabase Dashboard for database credentials

2. **Separate Environments:**
   - Different values for development, staging, production
   - Never use production secrets in development

3. **Rotate Secrets Regularly:**
   - Rotate API keys quarterly
   - Rotate database credentials annually
   - Rotate immediately if compromised

4. **Use Public Variables Sparingly:**
   - Only expose what's necessary
   - Never expose secrets in `NEXT_PUBLIC_*` variables

5. **Validate on Startup:**
   - Check required variables exist
   - Fail fast if missing

### ❌ Don't

1. **Never Commit Secrets:**
   - Don't commit `.env.local`
   - Don't hardcode secrets in code
   - Don't commit `.env` files

2. **Never Expose Private Variables:**
   - Don't use `NEXT_PUBLIC_*` for secrets
   - Don't log secrets in production
   - Don't expose secrets in error messages

3. **Never Share Secrets:**
   - Don't share secrets in Slack/email
   - Don't store secrets in documentation
   - Don't share secrets between environments

---

## Troubleshooting

### Missing Environment Variables

**Error:** `Missing required environment variable: SUPABASE_URL`

**Solution:**
1. Check `.env.local` (local) or Vercel Dashboard (production)
2. Verify variable name matches exactly (case-sensitive)
3. Restart development server after adding variables

### Variables Not Available in Client

**Error:** `process.env.SECRET_KEY is undefined` in browser

**Solution:**
- Use `NEXT_PUBLIC_*` prefix for client-side variables
- Or access server-side only (API routes, Server Components)

### CI Workflow Fails

**Error:** `Secret not found: VERCEL_TOKEN` or `❌ Missing required secrets: VERCEL_TOKEN`

**Solution:**
1. Go to GitHub → Settings → Secrets → Actions
2. Add missing secret:
   - `VERCEL_TOKEN` - Get from Vercel Dashboard → Settings → Tokens
   - `VERCEL_ORG_ID` - Get from Vercel Dashboard → Settings → General
   - `VERCEL_PROJECT_ID` - Get from Vercel Dashboard → Project → Settings → General
3. Re-run workflow

**Note:** The `frontend-deploy.yml` workflow now validates secrets before deployment, providing clear error messages if secrets are missing.

### Vercel Deployment Fails

**Error:** `Environment variable not found`

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add variable for correct environment (Production/Preview)
3. Redeploy

---

## Environment Variable Reference

### Complete List

See `.env.example` for complete list of all environment variables with descriptions.

### Quick Reference

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` - Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-only)
- `SUPABASE_PROJECT_REF` - Project reference ID
- `SUPABASE_ACCESS_TOKEN` - CLI access token

**Vercel:**
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Organization ID
- `VERCEL_PROJECT_ID` - Project ID

**Application:**
- `NEXT_PUBLIC_SITE_URL` - Public site URL
- `NODE_ENV` - Environment (`production`/`development`)

**Stripe:**
- `STRIPE_SECRET_KEY` - Secret key (server-only)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Publishable key (public)

---

## Migration Guide

### From Hardcoded Values

1. **Identify hardcoded values** in codebase
2. **Create environment variable** in `.env.example`
3. **Replace hardcoded value** with `process.env.VARIABLE_NAME`
4. **Add to all environments** (local, CI, Vercel)
5. **Test** in each environment

### From Different Naming

1. **Standardize naming** (use conventions above)
2. **Update code** to use new names
3. **Update all environments** simultaneously
4. **Remove old variables** after migration

---

## Conclusion

**Key Takeaways:**
- ✅ All configuration via environment variables
- ✅ No hardcoded values
- ✅ Separate values for each environment
- ✅ Secrets stored securely (GitHub Secrets, Vercel)
- ✅ Validation on startup

**Next Steps:**
1. Review `.env.example` for all variables
2. Set up GitHub Secrets for CI
3. Set up Vercel Environment Variables for production
4. Document any custom variables in this file
