# Build & Deploy Guide

This document describes how to build and deploy the AIAS Platform monorepo.

## Prerequisites

- Node.js >= 20.0.0 (see `.nvmrc` or `package.json` engines)
- pnpm >= 8.0.0 (or npm with workspaces support)
- Vercel CLI (for local testing)

## Monorepo Structure

This is a Turborepo monorepo with the following workspaces:

- **apps/web**: Next.js web application (main deploy target)
- **packages/lib**: Shared library package
- **packages/config**: Shared configuration package

## Local Development

### Install Dependencies

```bash
npm install
# or
pnpm install
```

### Run Type Checking

```bash
npm run typecheck
# or for root only
npm run typecheck:root
```

This runs `tsc --noEmit` across all workspace packages via Turborepo.

### Run Linting

```bash
npm run lint
```

### Run Build

```bash
npm run build
# or for Next.js app only
npm run build:next
```

This builds all packages in dependency order via Turborepo.

### Run Development Server

```bash
npm run dev
```

## Vercel Build & Deploy

### Build Command

Vercel uses the `vercel-build.sh` script which:

1. Sets up pnpm via corepack
2. Installs dependencies with `--frozen-lockfile`
3. Generates Prisma client (if DATABASE_URL is available)
4. Runs `pnpm run build` (which uses Turborepo)

### Build Script Location

The build script is at `/vercel-build.sh` and is referenced in `vercel.json`:

```json
{
  "buildCommand": "bash vercel-build.sh"
}
```

### Environment Variables

Required environment variables for Vercel:

- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase URL (for client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Supabase anonymous key

Optional but recommended:

- `VERCEL_TOKEN`: For Vercel API access
- `SUPABASE_ACCESS_TOKEN`: For Supabase CLI operations
- `SUPABASE_PROJECT_REF`: Supabase project reference

### Node Version

The project targets Node.js 20.x as specified in `package.json`:

```json
{
  "engines": {
    "node": ">=20 <21"
  }
}
```

Ensure Vercel is configured to use Node 20 in the project settings.

## Turborepo Pipeline

The build pipeline is defined in `turbo.json`:

- **build**: Builds packages in dependency order, outputs `.next/**` and `dist/**`
- **typecheck**: Runs TypeScript type checking with no output
- **lint**: Runs ESLint
- **test**: Runs tests (depends on build)
- **dev**: Development server (no cache, persistent)

### Running Turbo Commands

```bash
# Run build for all packages
npx turbo run build

# Run typecheck for all packages
npx turbo run typecheck

# Run lint for all packages
npx turbo run lint

# Run specific package tasks
npx turbo run build --filter=web
npx turbo run typecheck --filter=@ai-consultancy/lib
```

## TypeScript Configuration

### Root Configuration

- `tsconfig.json`: Base configuration with strict mode enabled
- `noUnusedLocals: true` and `noUnusedParameters: true` are enabled
- Excludes `ai/aurora_prime.ts` due to template literal syntax issues

### Workspace Configurations

- `apps/web/tsconfig.json`: Extends root, Next.js specific settings
- Each package should have its own `tsconfig.json` extending the root

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors:

1. Run `npm run typecheck:root` to check root-level errors
2. Check individual packages: `cd apps/web && npm run typecheck`
3. Ensure all dependencies are installed: `npm install`

### Build Failures

1. Check Vercel build logs for specific errors
2. Verify environment variables are set correctly
3. Ensure Node version matches (20.x)
4. Check that Prisma client is generated: `npm run db:generate`

### Dependency Issues

If you see dependency resolution errors:

1. Clear node_modules: `rm -rf node_modules apps/*/node_modules packages/*/node_modules`
2. Clear lockfile and reinstall: `rm -f package-lock.json pnpm-lock.yaml && npm install`
3. Use `--legacy-peer-deps` if needed: `npm install --legacy-peer-deps`

## CI/CD

The project uses GitHub Actions for CI/CD. Key workflows:

- Frontend deployment: `.github/workflows/frontend-deploy.yml`
- Supabase migrations: `.github/workflows/apply-supabase-migrations.yml`

## Quick Reference

```bash
# Full validation before pushing
npm run check          # Runs lint + typecheck via Turbo
npm run build:all      # Builds all packages via Turbo

# Individual checks
npm run typecheck      # Type check all packages
npm run lint           # Lint all packages
npm run build          # Build all packages

# Vercel-specific
npm run vercel:build   # Simulate Vercel build locally
```

## Notes

- The monorepo uses npm workspaces (or pnpm workspaces)
- Turborepo handles task orchestration and caching
- Vercel builds the `apps/web` package for deployment
- TypeScript strict mode is enabled for type safety
- Unused variables/parameters are flagged (TS6133) - fix these rather than disabling the check
