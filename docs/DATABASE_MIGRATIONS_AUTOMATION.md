# Database Migrations Automation

This document describes the automated database migration system that ensures Supabase schema is always up-to-date across all environments.

## Overview

The migration system automatically runs database migrations:
- **On server startup** - via Next.js instrumentation hook (in deployed environments only)
- **Manual execution** - via `npm run migrate:run` or workflow_dispatch

**Important**: Migrations do NOT run automatically on:
- ❌ PR commits
- ❌ Merges to main branch
- ❌ CI/CD pipelines (except server startup in deployed environments)

Migrations only run automatically when the server starts in deployed environments (preview/production).

## Architecture

### Components

1. **`instrumentation.ts`** - Next.js instrumentation hook that runs migrations on server startup
2. **`lib/database/migrations.ts`** - Core migration runner with Supabase CLI and direct SQL fallback
3. **`scripts/run-migrations.ts`** - CLI script for manual migration execution
4. **GitHub Actions Workflows** - Automated migration execution in CI/CD

### Migration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Migration Sources                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Server Startup (instrumentation.ts) - Deployed envs only│
│ 2. Manual Execution (npm run migrate:run)                  │
│ 3. Workflow Dispatch (explicit trigger)                     │
│                                                              │
│ ❌ NOT on PR commits                                        │
│ ❌ NOT on main branch merges                                │
│ ❌ NOT in CI/CD pipelines                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Migration Runner (migrations.ts)               │
├─────────────────────────────────────────────────────────────┤
│ 1. Try Supabase CLI (preferred)                            │
│ 2. Fallback to direct SQL application                      │
│ 3. Track applied migrations in schema_migrations table      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database                        │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Automatic Migrations

Migrations run automatically ONLY in the following scenario:

1. **Server Startup**: When the Next.js server starts in deployed environments (preview/production), migrations are checked and applied automatically

**Migrations do NOT run automatically on:**
- PR commits
- Merges to main branch  
- CI/CD pipeline execution
- Build processes

This ensures migrations only run when the actual server starts serving traffic, not during development or CI/CD processes.

### Manual Execution

Run migrations manually using:

```bash
npm run migrate:run
```

Or directly:

```bash
tsx scripts/run-migrations.ts
```

### Health Check

Check migration status via API:

```bash
curl http://localhost:3000/api/healthz/migrations
```

Response:
```json
{
  "status": "healthy",
  "message": "All migrations applied",
  "migrations": {
    "total": 27,
    "applied": 27,
    "pending": 0,
    "pendingFiles": []
  },
  "schema": {
    "valid": true
  },
  "timestamp": "2025-01-31T12:00:00.000Z"
}
```

## Configuration

### Environment Variables

Required for migrations:

- `SUPABASE_DB_URL` - Direct database connection URL (preferred)
- `DATABASE_URL` - Alternative database URL
- `DIRECT_URL` - Alternative direct database URL
- `SUPABASE_ACCESS_TOKEN` - For Supabase CLI authentication
- `SUPABASE_PROJECT_REF` - Supabase project reference

Optional:

- `SKIP_MIGRATIONS=true` - Skip migrations on startup
- `FAIL_ON_MIGRATION_ERROR=true` - Fail fast on migration errors in production

### Next.js Configuration

The `next.config.ts` file includes:

```typescript
experimental: {
  instrumentationHook: true, // Enables instrumentation.ts
  // ... other options
}
```

## GitHub Actions Integration

### Workflows

1. **`ci.yml`** - Validates migration files in PRs
2. **`frontend-deploy.yml`** - Runs migrations before preview/production deployments
3. **`apply-supabase-migrations.yml`** - Dedicated migration workflow
4. **`ci-consolidated.yml`** - Consolidated CI/CD with migrations

### Migration Jobs

All workflows include migration steps that:
1. Setup Supabase CLI
2. Authenticate with Supabase
3. Link project
4. Run migrations using `npm run migrate:run`
5. Validate schema after migrations

## Migration Files

### Location

Migrations are stored in: `supabase/migrations/`

### Naming Convention

Migration files should follow this pattern:
- `YYYYMMDDHHMMSS_description.sql` - Timestamped migrations
- `99999999999999_master_consolidated_schema.sql` - Master schema

### Migration Tracking

Applied migrations are tracked in:
- Schema: `supabase_migrations`
- Table: `schema_migrations`
- Columns: `version`, `name`, `applied_at`

## Error Handling

### Startup Failures

If migrations fail on server startup:
- Error is logged but server continues (non-blocking)
- In production with `FAIL_ON_MIGRATION_ERROR=true`, server exits
- Migrations can be retried manually or via CI/CD

### CI/CD Failures

If migrations fail in CI/CD:
- Workflow fails and deployment is blocked
- Error details are logged in GitHub Actions
- Manual intervention required

### Idempotency

All migrations are designed to be idempotent:
- Can be run multiple times safely
- Uses `IF NOT EXISTS` clauses where possible
- Tracks applied migrations to skip duplicates

## Monitoring

### Health Check Endpoint

Monitor migration status via:
- `GET /api/healthz/migrations` - Returns migration status

### Logging

Migration execution logs:
- Migration files found
- Applied migrations count
- Skipped migrations (already applied)
- Failed migrations with errors
- Schema validation results

## Troubleshooting

### Migrations Not Running

1. Check environment variables are set
2. Verify `instrumentationHook: true` in `next.config.ts`
3. Check server logs for migration errors
4. Verify Supabase CLI is installed (for CLI method)

### Migration Failures

1. Check migration SQL syntax
2. Verify database connection
3. Check for conflicting migrations
4. Review `supabase_migrations.schema_migrations` table

### Schema Validation Failures

1. Check critical tables exist
2. Verify RLS policies are enabled
3. Check for missing indexes
4. Review schema validation logs

## Best Practices

1. **Always test migrations locally** before committing
2. **Use transactions** in migration files where possible
3. **Make migrations idempotent** using `IF NOT EXISTS`
4. **Test in preview environment** before production
5. **Monitor migration health** via health check endpoint
6. **Document breaking changes** in migration comments
7. **Keep migrations small** and focused on single changes
8. **Use descriptive names** for migration files

## Migration Scripts

### Available Commands

- `npm run migrate:run` - Run all pending migrations
- `npm run migrate:apply` - Apply migrations directly (legacy)
- `npm run migrate:apply-all` - Apply all pending changes (legacy)
- `npm run db:validate-migrations` - Validate migration files
- `npm run db:validate-schema` - Validate database schema

## Security Considerations

1. **Database credentials** are stored as GitHub Secrets
2. **Migrations run with service role** permissions
3. **Migration tracking** prevents duplicate execution
4. **Rollback support** via manual migration creation
5. **Audit trail** via `schema_migrations` table

## Future Enhancements

- [ ] Automatic rollback on failure
- [ ] Migration dry-run mode
- [ ] Migration conflict detection
- [ ] Migration performance metrics
- [ ] Automated migration testing
- [ ] Migration dependency graph visualization

## Support

For issues or questions:
1. Check migration logs
2. Review GitHub Actions workflow runs
3. Check health check endpoint status
4. Review `supabase_migrations.schema_migrations` table
