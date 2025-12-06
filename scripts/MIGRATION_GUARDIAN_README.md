# Migration Guardian – Supabase + Prisma + Upstash

## Overview

The Migration Guardian is a background agent that automatically applies Prisma migrations to your Supabase Postgres database with full verification. It ensures that:

- ✅ Migrations are actually executed against the live Supabase DB
- ✅ The resulting DB schema matches Prisma's expectations
- ✅ Redis (Upstash) is reachable
- ✅ The state reached is the **authoritative GO-LIVE migration state** for this environment

## Usage

### Run the Migration Guardian

```bash
npm run migrate:guardian
# or
pnpm migrate:guardian
# or
yarn migrate:guardian
```

### What It Does

1. **Environment Discovery**: Automatically finds and loads database URLs from:
   - `.env.local` (highest priority)
   - `.env.development`
   - `.env`
   - `.env.production`
   - Process environment variables

2. **Database Connection**: Tests connectivity to Supabase Postgres using the discovered `DATABASE_URL` or `SUPABASE_DB_URL`

3. **Migration Status Check**: Runs `prisma migrate status` to detect pending migrations

4. **Migration Application**: If pending migrations exist:
   - Applies them using `prisma migrate deploy` (or your configured script)
   - Verifies they were applied successfully
   - Archives copies to `prisma/_archive/<timestamp>/`

5. **Redis Connectivity**: Checks Upstash Redis connectivity (if configured)

6. **Reality Verification**: Performs concrete verification:
   - Prisma status confirms "up to date"
   - Database connectivity test
   - Schema checks (verifies expected tables exist)
   - Health queries (table counts, etc.)

7. **Logging**: Maintains `MIGRATION_LOG.md` with full details of each run

## Environment Variables

The agent looks for these environment variables:

### Database
- `DATABASE_URL` - Primary PostgreSQL connection string
- `SUPABASE_DB_URL` - Supabase-specific database URL (preferred if present)
- `DIRECT_URL` - Direct connection URL (for migrations)

### Redis (Optional)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST API token
- `REDIS_URL` or `UPSTASH_REDIS_URL` - Alternative Redis URL

## Output States

The agent reports one of these final states:

- ✅ **GO-LIVE VERIFIED** - All migrations applied and verified
- ✅ **GO-LIVE VERIFIED (NO CHANGES NEEDED)** - DB already up-to-date, verified
- ⚠️ **PARTIAL – MANUAL ACTION REQUIRED** - Some checks failed, manual intervention needed
- ❌ **FAILED – SEE ERRORS ABOVE** - Critical failure, check errors in log

## Migration Log

All runs are logged to `MIGRATION_LOG.md` in the repository root. Each entry includes:

- Run ID and timestamp
- Environment and database information
- Pre-run migration status
- Commands executed
- Apply results and outputs
- Archive information
- Redis connectivity status
- Reality verification details
- Final outcome and any errors/warnings

## Archive Structure

Applied migrations are archived to:
```
prisma/_archive/
  └── YYYY-MM-DD_HH-MM-SS/
      └── <migration-id>/
          ├── migration.sql
          └── ...
```

**Note**: Original migrations in `prisma/migrations/` are never moved or deleted - only copies are archived.

## Safety Features

- **Production Mode Detection**: Automatically detects if operating on production/live databases
- **Pre-flight Checks**: Tests database connectivity before attempting migrations
- **Post-apply Verification**: Confirms migrations were actually applied
- **Reality Checks**: Verifies schema matches expectations via actual DB queries
- **Error Handling**: Fails safely with detailed error messages

## Integration

### CI/CD

Add to your deployment pipeline:

```yaml
- name: Run Migration Guardian
  run: npm run migrate:guardian
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    UPSTASH_REDIS_REST_URL: ${{ secrets.UPSTASH_REDIS_REST_URL }}
    UPSTASH_REDIS_REST_TOKEN: ${{ secrets.UPSTASH_REDIS_REST_TOKEN }}
```

### Scheduled Runs

Set up a cron job or scheduled task to run periodically:

```bash
# Daily at 2 AM
0 2 * * * cd /path/to/project && npm run migrate:guardian
```

## Troubleshooting

### "No DATABASE_URL or SUPABASE_DB_URL found"

Ensure your `.env` file contains one of these variables. Check file priority order in the discovery section above.

### "Database connectivity test failed"

- Verify your database URL is correct
- Check Supabase IP allowlist settings
- Ensure `sslmode=require` is in your connection string for Supabase
- Verify database credentials

### "Prisma schema not found"

Ensure `apps/web/prisma/schema.prisma` exists. The agent expects Prisma to be in the `apps/web` directory.

### "Migration apply failed"

- Check the error output in `MIGRATION_LOG.md`
- Verify migration SQL files are valid
- Ensure database user has necessary permissions
- Check for schema conflicts or drift

## Requirements

- Node.js >= 22
- Prisma CLI (via `npx` or installed)
- Access to Supabase Postgres database
- (Optional) `psql` CLI for enhanced schema verification

## Notes

- The agent **does not modify** original migration files
- Archives are stored in `prisma/_archive/` (gitignored)
- The agent is designed to be safe for production use
- All operations are logged for audit purposes
