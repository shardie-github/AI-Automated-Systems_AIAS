# Vercel Deployment Guide

This guide ensures flawless and foolproof Vercel deployments, preventing common issues like distribution/index errors and JSON parsing problems.

## Overview

The deployment system includes multiple layers of validation and verification to ensure successful deployments:

1. **Pre-build validation** - Checks before building
2. **Build validation** - Validates build output
3. **Post-deployment verification** - Verifies deployment health

## Build Validation

### Automatic Validation

Build validation runs automatically:
- After local builds (`pnpm run build`)
- In CI/CD pipelines
- In Vercel build process (via `vercel.json`)

### What Gets Validated

1. **Build Directory Structure**
   - `.next` directory exists
   - Required subdirectories (`static`, `server`) exist
   - Required files (`BUILD_ID`, `package.json`) exist

2. **JSON Files**
   - All JSON files in build output are valid
   - No parsing errors
   - Proper structure

3. **Index Files**
   - App directory has index/page files
   - Pages directory has index files

4. **Server Files**
   - Server manifests exist
   - Server files are valid

### Manual Validation

```bash
# Validate build output
pnpm run validate:build
```

## Deployment Verification

### Automatic Verification

Deployment verification runs automatically:
- After preview deployments (non-blocking)
- After production deployments (blocking)

### What Gets Verified

1. **Root URL Accessibility**
   - Deployment URL is accessible
   - Returns valid HTTP status

2. **Health Check Endpoint**
   - `/api/healthz` is accessible
   - Returns valid JSON

3. **API Routes**
   - API routes are functional
   - Return valid responses

4. **Static Assets**
   - Static files are accessible
   - Proper caching headers

5. **JSON Parsing**
   - All JSON responses are valid
   - No parsing errors

### Manual Verification

```bash
# Verify deployment
DEPLOYMENT_URL=https://your-app.vercel.app pnpm run verify:deployment
```

## Common Issues and Solutions

### Distribution/Index Errors

**Problem**: Missing or invalid index files

**Solution**: 
- Build validation catches this before deployment
- Check `scripts/validate-build.ts` output
- Ensure all routes have proper index files

### JSON Parsing Errors

**Problem**: Invalid JSON in build output or API responses

**Solution**:
- Build validation checks all JSON files
- Deployment verification validates API responses
- Check build logs for specific file errors

### Build Output Issues

**Problem**: Missing build artifacts or incorrect structure

**Solution**:
- Build validation ensures required files exist
- Check `.next` directory structure
- Verify `BUILD_ID` file exists

### Deployment Failures

**Problem**: Deployment succeeds but site doesn't work

**Solution**:
- Deployment verification catches this
- Check verification logs for specific failures
- Review deployment URL accessibility

## Configuration

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "pnpm run db:generate && pnpm run build && pnpm run validate:build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Next.js Configuration (`next.config.ts`)

- Proper experimental settings for file tracing
- Optimized package imports
- Correct output configuration

## Workflow Integration

### GitHub Actions

The `frontend-deploy.yml` workflow includes:

1. **Build Validation Step**
   ```yaml
   - name: Validate build output
     run: pnpm run validate:build
   ```

2. **Post-Deployment Verification**
   ```yaml
   - name: Verify Deployment
     run: pnpm run verify:deployment
   ```

### Pre-Deployment Checks

Before deployment:
- ✅ Lint passes
- ✅ Type check passes
- ✅ Tests pass
- ✅ Build succeeds
- ✅ Build validation passes

### Post-Deployment Checks

After deployment:
- ✅ Deployment URL accessible
- ✅ Health check endpoint works
- ✅ API routes functional
- ✅ JSON responses valid
- ✅ Static assets accessible

## Troubleshooting

### Build Validation Fails

1. Check build logs for specific errors
2. Verify all required files exist
3. Check JSON file validity
4. Review build directory structure

### Deployment Verification Fails

1. Wait a few seconds (deployment may still be propagating)
2. Check deployment URL manually
3. Review verification logs
4. Check Vercel deployment logs

### Common Error Messages

**"Build directory not found"**
- Run `pnpm run build` first
- Check `.next` directory exists

**"Invalid JSON file"**
- Check specific file mentioned in error
- Validate JSON syntax
- Check for encoding issues

**"Required file missing"**
- Check build output
- Verify build completed successfully
- Review build configuration

## Best Practices

1. ✅ Always run build validation before committing
2. ✅ Check deployment verification after deployment
3. ✅ Monitor build logs for warnings
4. ✅ Keep build output clean and valid
5. ✅ Test locally before deploying
6. ✅ Use proper error handling in API routes
7. ✅ Validate JSON responses in API routes
8. ✅ Keep build configuration consistent

## Scripts Reference

- `pnpm run validate:build` - Validate build output
- `pnpm run verify:deployment` - Verify deployment health
- `pnpm run build` - Build with validation

## Monitoring

Deployment health can be monitored via:
- GitHub Actions workflow logs
- Vercel deployment logs
- Health check endpoint: `/api/healthz`
- Deployment verification script output

## Summary

The deployment system ensures:
- ✅ Build output is valid before deployment
- ✅ Deployments are verified after completion
- ✅ Common issues are caught early
- ✅ JSON/index errors are prevented
- ✅ Deployment health is monitored

This multi-layer approach ensures flawless and foolproof Vercel deployments.
