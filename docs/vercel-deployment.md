# Vercel Deployment Guide

This document outlines the Vercel build and deployment configuration for the project.

## Build Configuration

### vercel.json

The project uses a custom build script (`vercel-build.sh`) configured in `vercel.json`:

- **buildCommand**: `bash vercel-build.sh`
- **installCommand**: Uses pnpm with corepack
- **framework**: Next.js
- **outputDirectory**: `.next`

### Build Script (vercel-build.sh)

The build script:
1. Sets up pnpm using corepack
2. Installs dependencies with frozen lockfile
3. Generates Prisma client (if DATABASE_URL is available)
4. Builds the application using Turborepo
5. Validates build output

## Required Environment Variables

### Required Secrets (GitHub Actions)

These secrets must be configured in GitHub → Settings → Secrets → Actions:

- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

### Optional Secrets

- `DATABASE_URL`: Database connection string (for Prisma client generation)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

## CI/CD Workflows

### frontend-deploy.yml

Main deployment workflow that:
- Runs on PRs and pushes to main
- Validates required secrets
- Builds and tests the application
- Validates build output
- Deploys to Vercel (preview for PRs, production for main)

### vercel-build-check.yml

Validation workflow that:
- Runs on PRs and pushes to main/develop
- Validates vercel.json configuration
- Simulates Vercel build environment
- Validates build output
- Checks for required build artifacts

### ci.yml & ci-consolidated.yml

CI workflows that:
- Run lint, typecheck, format checks
- Run tests
- Build the application
- Validate build output
- Upload build artifacts

## Build Validation

The project includes comprehensive build validation:

1. **Build Script Validation**: `vercel-build.sh` validates the build succeeds
2. **Build Output Validation**: `scripts/validate-build.ts` checks build artifacts
3. **Deployment Verification**: `scripts/verify-deployment.ts` verifies deployed URLs

## Troubleshooting

### Build Failures

1. Check that all required secrets are configured
2. Verify `vercel-build.sh` is executable (`chmod +x vercel-build.sh`)
3. Check build logs for specific errors
4. Ensure `vercel.json` is valid JSON

### Deployment Failures

1. Verify Vercel credentials are correct
2. Check that the build output is valid
3. Ensure environment variables are set in Vercel dashboard
4. Review deployment logs in GitHub Actions

### Common Issues

- **pnpm not found**: Ensure corepack is enabled and pnpm version matches
- **Prisma generation fails**: DATABASE_URL may be missing (non-blocking)
- **Build validation fails**: Check that `.next` directory contains required files
- **Deployment URL extraction fails**: Check Vercel CLI output format

## Best Practices

1. Always validate builds locally before pushing
2. Run `pnpm run validate:build` after local builds
3. Check GitHub Actions logs for detailed error messages
4. Ensure all required secrets are set before merging to main
5. Review PR comments from build check workflows
