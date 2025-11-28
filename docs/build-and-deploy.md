# Build & Deploy Guide

This document describes how to build and deploy the AIAS Platform monorepo.

## Prerequisites

- Node.js >=20 <21 (see `package.json` engines field)
- pnpm >=8.0.0 (or npm with --legacy-peer-deps)
- TypeScript 5.3.0+

## Workspace Structure

The monorepo uses Turborepo with the following workspaces:

- `apps/web` - Next.js web application (main deploy target for Vercel)
- `packages/config` - Shared configuration package
- `packages/lib` - Shared library package

## Build Commands

### Type Checking

Run TypeScript type checking across all workspaces:

```bash
npm run typecheck
# or
npx turbo run typecheck
```

### Building

Build all packages:

```bash
npm run build
# or
npx turbo run build
```

### Linting

Run ESLint:

```bash
npm run lint
# or
npx turbo run lint
```

### Full Check

Run lint and typecheck together:

```bash
npm run check
```

## Vercel Deployment

### Configuration

Vercel is configured to:
1. Use Node.js 20.x (configured in Vercel dashboard or `vercel.json`)
2. Run `npm install` (or `pnpm install` if configured)
3. Execute `turbo run build` which builds all workspace packages

### Build Pipeline

The build pipeline runs:
1. `turbo run build` - Builds all workspace packages in dependency order
2. Each package's `build` script runs:
   - `packages/config`: `tsc --build`
   - `packages/lib`: `tsc --build`
   - `apps/web`: `next build`

### Type Checking in Build

Each package's `typecheck` script runs `tsc --noEmit` to ensure type safety without emitting files.

## Local Development

### Setup

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   # or if using pnpm:
   pnpm install
   ```

2. Run typecheck to verify setup:
   ```bash
   npm run typecheck
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

### TypeScript Errors

If you encounter TypeScript errors:

1. Ensure all dependencies are installed in root and workspace packages
2. Run `npm run typecheck` to see all errors
3. Common error patterns:
   - **TS6133**: Unused variables/parameters - remove or prefix with `_`
   - **TS2353**: Type errors - check function signatures and imports
   - **TS2322/TS2345**: Type assignment errors - verify types match
   - **TS2305**: Missing exports - check import paths

### Build Failures

If builds fail:

1. Check Node.js version matches `package.json` engines requirement
2. Ensure all workspace dependencies are installed
3. Verify `turbo.json` pipeline configuration
4. Check individual package `package.json` scripts

### Package Manager Issues

The project is configured for pnpm but can work with npm using `--legacy-peer-deps`:

```bash
npm install --legacy-peer-deps
```

For Vercel, ensure the package manager is configured correctly in Vercel dashboard settings.

## CI/CD

The build process should:
1. Install dependencies
2. Run `npm run check` (lint + typecheck)
3. Run `npm run build`
4. Deploy to Vercel

## Notes

- TypeScript strict mode is enabled with `noUnusedLocals` and `noUnusedParameters`
- Each workspace package has its own `tsconfig.json` extending the root config
- The root `tsconfig.json` includes files from the entire repo for type checking
- Workspace packages scope their includes to their own directories
