# Migration Guardian Setup Complete ✅

## What Was Created

### 1. Migration Guardian Agent
**Location**: `scripts/migration-guardian.ts`

A comprehensive background agent that:
- Automatically discovers database URLs from environment files
- Tests database connectivity before proceeding
- Checks Prisma migration status
- Applies pending migrations safely
- Archives applied migrations to `prisma/_archive/`
- Verifies Redis (Upstash) connectivity
- Performs reality verification (actual DB queries, not just theory)
- Maintains detailed logs in `MIGRATION_LOG.md`

### 2. Package.json Script
**Command**: `npm run migrate:guardian`

Added to `package.json` scripts section for easy execution.

### 3. Gitignore Update
Added `prisma/_archive/` to `.gitignore` to keep archived migrations private.

### 4. Documentation
- `scripts/MIGRATION_GUARDIAN_README.md` - Complete usage guide

## Quick Start

### Run the Migration Guardian

```bash
npm run migrate:guardian
```

### What It Will Do

1. **Discover Environment**: Looks for `DATABASE_URL` or `SUPABASE_DB_URL` in:
   - `.env.local` (priority)
   - `.env.development`
   - `.env`
   - `.env.production`
   - Process environment variables

2. **Test Connection**: Verifies it can connect to your Supabase Postgres database

3. **Check Migrations**: Runs `prisma migrate status` to find pending migrations

4. **Apply If Needed**: If migrations are pending:
   - Applies them using `prisma migrate deploy`
   - Verifies they were applied
   - Archives copies to `prisma/_archive/<timestamp>/`

5. **Verify Reality**: 
   - Confirms Prisma reports "up to date"
   - Tests database connectivity
   - Checks that expected tables exist
   - Runs health queries

6. **Check Redis**: Tests Upstash Redis connectivity (if configured)

7. **Log Everything**: Writes detailed entry to `MIGRATION_LOG.md`

## Expected Output States

- ✅ **GO-LIVE VERIFIED** - All migrations applied and verified
- ✅ **GO-LIVE VERIFIED (NO CHANGES NEEDED)** - Already up-to-date, verified
- ⚠️ **PARTIAL – MANUAL ACTION REQUIRED** - Some checks failed
- ❌ **FAILED – SEE ERRORS ABOVE** - Critical failure

## Environment Variables Needed

### Required
- `DATABASE_URL` or `SUPABASE_DB_URL` - Your Supabase Postgres connection string

### Optional
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST API token

## Example Connection String

For Supabase:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

## Safety Features

- ✅ Production mode detection (warns when operating on live DB)
- ✅ Pre-flight connectivity checks
- ✅ Post-apply verification
- ✅ Reality checks via actual DB queries
- ✅ Comprehensive error logging
- ✅ Never modifies original migration files (only archives copies)

## Integration Examples

### CI/CD (GitHub Actions)
```yaml
- name: Run Migration Guardian
  run: npm run migrate:guardian
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Scheduled Task
```bash
# Daily at 2 AM
0 2 * * * cd /path/to/project && npm run migrate:guardian
```

## Next Steps

1. **Test the agent**:
   ```bash
   npm run migrate:guardian
   ```

2. **Check the log**:
   ```bash
   cat MIGRATION_LOG.md
   ```

3. **Review archived migrations** (if any were applied):
   ```bash
   ls -la apps/web/prisma/_archive/
   ```

## Troubleshooting

If you encounter issues:

1. **Check environment variables**: Ensure `DATABASE_URL` or `SUPABASE_DB_URL` is set
2. **Verify Prisma setup**: Ensure `apps/web/prisma/schema.prisma` exists
3. **Check database access**: Verify your Supabase credentials and IP allowlist
4. **Review the log**: Check `MIGRATION_LOG.md` for detailed error messages

## Notes

- The agent is designed to be **safe for production use**
- It **never deletes or modifies** original migration files
- All operations are **logged for audit purposes**
- The agent **fails safely** with clear error messages

---

**Status**: ✅ Ready to use

Run `npm run migrate:guardian` to start!
