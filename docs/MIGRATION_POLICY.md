# Migration Execution Policy

## Overview

This document outlines when and how database migrations are executed in this project.

## Policy: Migrations Do NOT Run on PR Commits or Main Merges

**Key Principle**: Migrations only run automatically when the server starts in deployed environments. They do NOT run during CI/CD processes, PR commits, or merges to main.

## Execution Scenarios

### ✅ Migrations WILL Run

1. **Server Startup** (Deployed Environments Only)
   - When the Next.js server starts in preview/production environments
   - Via `instrumentation.ts` hook
   - Only in Node.js runtime (not Edge runtime)
   - Skips if `SKIP_MIGRATIONS=true` is set

2. **Manual Execution**
   - Via `npm run migrate:run`
   - Via `tsx scripts/run-migrations.ts`
   - Via GitHub Actions `workflow_dispatch` trigger

3. **Scheduled Execution**
   - Via GitHub Actions scheduled workflows (if configured)

### ❌ Migrations Will NOT Run

1. **PR Commits**
   - Migrations are skipped when `GITHUB_EVENT_NAME === 'pull_request'`
   - Detected in `instrumentation.ts` via `shouldSkipMigrations()`

2. **Main Branch Merges**
   - Migrations are skipped when `GITHUB_EVENT_NAME === 'push'` and `GITHUB_REF === 'refs/heads/main'`
   - Detected in `instrumentation.ts` via `shouldSkipMigrations()`

3. **CI/CD Pipelines**
   - Build processes
   - Test execution
   - Linting/type checking
   - Any GitHub Actions workflow execution (except server startup in deployed environments)

4. **Development Environment**
   - Local development (unless explicitly run)
   - Build processes
   - Test environments

## Implementation Details

### Instrumentation Hook (`instrumentation.ts`)

The `shouldSkipMigrations()` function checks:
- `CI === 'true'` or `GITHUB_ACTIONS === 'true'` → Skip if PR or main merge
- `SKIP_MIGRATIONS === 'true'` → Always skip

### GitHub Actions Workflows

All workflows have been updated to:
- Remove automatic migration execution jobs
- Only validate migration files exist (not execute them)
- Rely on server startup for migration execution

### Workflow Updates

1. **`frontend-deploy.yml`**
   - Removed `run-migrations` job
   - Deploy job no longer depends on migrations

2. **`ci-consolidated.yml`**
   - Removed `migrate-database` job
   - Deploy job no longer depends on migrations

3. **`apply-supabase-migrations.yml`**
   - Only runs on `workflow_dispatch` or `schedule`
   - Does NOT run on `push` or `pull_request` events

4. **`ci.yml`**
   - Only validates migration files exist
   - Does NOT execute migrations

## Rationale

### Why Skip Migrations on PRs?

1. **Safety**: PRs may contain untested migrations
2. **Performance**: Avoids unnecessary database operations
3. **Isolation**: Prevents PRs from affecting shared databases
4. **Control**: Allows review before execution

### Why Skip Migrations on Main Merges?

1. **Deployment Flow**: Migrations run when server deploys, not when code merges
2. **Rollback Safety**: If deployment fails, migrations haven't run yet
3. **Consistency**: Migrations run in the same environment as the application
4. **Monitoring**: Easier to track migration execution with deployment events

### Why Run on Server Startup?

1. **Consistency**: Migrations run in the same environment as the application
2. **Reliability**: Ensures schema is up-to-date before serving traffic
3. **Simplicity**: Single execution point, easier to monitor and debug
4. **Safety**: Server won't start if migrations fail (if `FAIL_ON_MIGRATION_ERROR=true`)

## Manual Migration Execution

If you need to run migrations manually:

```bash
# Local execution
npm run migrate:run

# Or directly
tsx scripts/run-migrations.ts
```

## Monitoring

Check migration status:

```bash
# Health check endpoint
curl http://localhost:3000/api/healthz/migrations

# Or check logs
# Server startup logs will show migration execution
```

## Troubleshooting

### Migrations Not Running

1. Check server logs for migration execution
2. Verify `instrumentationHook: true` in `next.config.ts`
3. Check environment variables (`SKIP_MIGRATIONS`, etc.)
4. Verify you're in a deployed environment (not CI/CD)

### Need to Run Migrations Manually

1. Use `npm run migrate:run`
2. Or trigger `apply-supabase-migrations.yml` via `workflow_dispatch`

## Best Practices

1. ✅ Test migrations locally before committing
2. ✅ Keep migrations idempotent
3. ✅ Review migrations in PRs before merging
4. ✅ Monitor migration execution in server logs
5. ✅ Use health check endpoint to verify status
6. ❌ Don't rely on CI/CD for migration execution
7. ❌ Don't run migrations manually unless necessary

## Summary

- **Migrations run**: On server startup in deployed environments
- **Migrations don't run**: On PR commits, main merges, or in CI/CD
- **Manual execution**: Available via `npm run migrate:run` or workflow dispatch
- **Monitoring**: Via `/api/healthz/migrations` endpoint
