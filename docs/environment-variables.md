# Environment Variables Management

## Overview

This project uses a **centralized environment variable management system** that ensures:

1. ✅ **No hardcoded values** - All secrets and configuration are loaded dynamically
2. ✅ **Runtime validation** - Required variables are validated at startup
3. ✅ **Multiple sources** - Variables can be sourced from Vercel, Supabase, GitHub Actions, or local files
4. ✅ **Type safety** - Centralized access with TypeScript support
5. ✅ **Clear error messages** - Helpful errors when variables are missing

## Architecture

### Centralized Configuration (`lib/env.ts`)

All environment variables are accessed through the centralized `env` object:

```typescript
import { env } from "@/lib/env";

// Access Supabase configuration
const supabaseUrl = env.supabase.url;
const anonKey = env.supabase.anonKey;

// Access Stripe configuration
const stripeKey = env.stripe.secretKey;
```

### Dynamic Loading

Environment variables are loaded dynamically at runtime from:

1. **Vercel** - Set in Dashboard → Settings → Environment Variables
2. **Supabase** - Set in Dashboard → Settings → API
3. **GitHub Actions** - Set in Repository → Settings → Secrets
4. **Local Development** - Set in `.env.local` file (not committed to git)

### Runtime Detection

The system automatically detects the runtime environment:

- `vercel` - Running on Vercel
- `github` - Running in GitHub Actions
- `local` - Running in development
- `unknown` - Other environments

## Required Variables

### Core Supabase (Required)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://{project-ref}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://{project-ref}.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:{service_role_key}@db.{project-ref}.supabase.co:5432/postgres?sslmode=require
```

### Application (Required for Production)

```bash
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
```

### Optional Variables

See `.env.example` for a complete list of optional variables including:
- OAuth providers (GitHub, Google)
- Stripe payment processing
- AI/ML services (OpenAI)
- Storage configuration
- CI/CD tokens

## Usage Examples

### In API Routes

```typescript
import { env } from "@/lib/env";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    env.supabase.url,
    env.supabase.serviceRoleKey
  );
  // ... use supabase
}
```

### In Client Components

```typescript
import { env } from "@/lib/env";

// Client components can access NEXT_PUBLIC_* variables
const supabaseUrl = env.supabase.url;
```

### In Scripts

```typescript
import { env, validateEnv } from "../lib/env";

// Validate before use
const validation = validateEnv();
if (!validation.valid) {
  console.error("Missing variables:", validation.errors);
  process.exit(1);
}

// Use environment variables
const url = env.supabase.url;
```

## Validation

### Automatic Validation

The system validates required variables when:
- Application starts (server-side)
- Scripts run (via `validateEnv()`)
- API routes access environment variables

### Manual Validation

```typescript
import { validateEnv } from "@/lib/env";

const validation = validateEnv();
if (!validation.valid) {
  console.error("Errors:", validation.errors);
}
```

## Error Handling

When a required variable is missing, you'll see a clear error message:

```
Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL
Runtime: vercel
Please set this variable in:
- Vercel: Dashboard → Settings → Environment Variables
- Supabase: Dashboard → Settings → API
- GitHub Actions: Repository → Settings → Secrets
- Local: .env.local file
```

## Security Best Practices

1. ✅ **Never commit `.env.local`** - It's in `.gitignore`
2. ✅ **Use different values** - Use different keys for development, staging, and production
3. ✅ **Rotate secrets regularly** - Use `npm run secrets:rotate` to rotate keys
4. ✅ **Use service role keys carefully** - Only use in server-side code
5. ✅ **Validate at startup** - The system validates required variables automatically

## Setting Variables

### Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate environment (Production, Preview, Development)

### Supabase

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the values for:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### GitHub Actions

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret variable

### Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in the values from your Supabase dashboard
3. Never commit `.env.local` to git

## Troubleshooting

### "Missing required environment variable" Error

1. Check that the variable is set in your environment
2. Verify the variable name matches exactly (case-sensitive)
3. For Vercel, ensure you've set it for the correct environment
4. For local development, check `.env.local` exists and has the variable

### Variables Not Loading

1. Restart your development server after changing `.env.local`
2. For Vercel, redeploy after adding variables
3. Check for typos in variable names
4. Ensure `NEXT_PUBLIC_*` prefix is used for client-side variables

### Build Failures

If the build fails due to missing variables:
1. Check that all required `NEXT_PUBLIC_*` variables are set
2. Verify Vercel environment variables are configured
3. Check build logs for specific missing variables

## Migration Guide

If you're updating from hardcoded values:

1. **Remove hardcoded values** - Replace with `env.*` access
2. **Update imports** - Use `import { env } from "@/lib/env"`
3. **Add validation** - Use `validateEnv()` in scripts
4. **Test locally** - Ensure `.env.local` has all required variables
5. **Update CI/CD** - Add variables to GitHub Actions secrets
6. **Update Vercel** - Add variables to Vercel environment settings

## Related Files

- `lib/env.ts` - Centralized environment variable configuration
- `lib/env-validation.ts` - Runtime validation utilities
- `.env.example` - Template with all variables documented
- `scripts/reality-check.ts` - Validates environment setup
- `scripts/smoke.ts` - Smoke tests using environment variables
