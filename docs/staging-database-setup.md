# Staging Database Setup & Migration Testing

**Last Updated:** 2025-01-31  
**Purpose:** Guide to setting up staging database for migration testing

---

## Executive Summary

A **staging database is essential** for testing migrations before production. This document outlines how to set up and maintain a staging Supabase project for safe migration testing.

**Current Status:** ⚠️ **No staging database configured**  
**Recommendation:** ✅ **Set up staging database immediately**

---

## Why Staging Database?

### Benefits
1. **Test Migrations Safely** - Verify migrations work before production
2. **Catch Issues Early** - Identify problems before they affect production
3. **Practice Restores** - Test backup/restore procedures
4. **Development Testing** - Test features with production-like data
5. **Performance Testing** - Test queries without affecting production

### Risks Without Staging
- ❌ Migrations break production
- ❌ Data loss from bad migrations
- ❌ Downtime from migration failures
- ❌ No way to test rollbacks

---

## Setup Instructions

### Option 1: Supabase Staging Project (Recommended)

**Cost:** Free tier available (same as production)

**Steps:**

1. **Create New Supabase Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: `aias-platform-staging`
   - Database Password: Generate strong password
   - Region: Same as production (for latency consistency)
   - Click "Create new project"

2. **Copy Environment Variables**
   - Go to Staging Project → Settings → API
   - Copy all environment variables
   - Create `.env.staging` file:

```bash
# Staging Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://[STAGING_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[STAGING_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[STAGING_SERVICE_ROLE_KEY]
SUPABASE_PROJECT_REF=[STAGING_PROJECT_REF]
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[STAGING_PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

3. **Apply Initial Schema**
   ```bash
   # Link to staging project
   supabase link --project-ref [STAGING_PROJECT_REF]
   
   # Apply all migrations
   supabase db push
   ```

4. **Seed Test Data** (Optional)
   ```bash
   # Run seed script with staging env
   DATABASE_URL=$STAGING_DATABASE_URL pnpm run db:seed
   ```

### Option 2: Local PostgreSQL (Alternative)

**Use Case:** Local development, offline testing

**Setup:**
```bash
# Install PostgreSQL locally
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create database
createdb aias_platform_staging

# Apply migrations
psql aias_platform_staging < supabase/migrations/99999999999999_master_consolidated_schema.sql
```

---

## Migration Testing Workflow

### Pre-Production Migration Testing

**Workflow:**
```mermaid
graph LR
    A[Create Migration] --> B[Test in Staging]
    B --> C{Migration OK?}
    C -->|Yes| D[Apply to Production]
    C -->|No| E[Fix Migration]
    E --> B
    D --> F[Verify Production]
```

### Step-by-Step Process

1. **Create Migration**
   ```bash
   # Create new migration file
   touch supabase/migrations/$(date +%Y%m%d%H%M%S)_your_migration.sql
   ```

2. **Test in Staging**
   ```bash
   # Link to staging
   supabase link --project-ref [STAGING_PROJECT_REF]
   
   # Apply migration
   supabase db push
   
   # Verify schema
   pnpm run db:validate-schema
   ```

3. **Verify Application**
   - Deploy to staging environment
   - Test affected features
   - Check for errors

4. **Apply to Production**
   ```bash
   # Link to production
   supabase link --project-ref [PRODUCTION_PROJECT_REF]
   
   # Apply migration (via CI/CD)
   git push origin main
   ```

### Automated Testing Script

Create `scripts/test-migration.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * Test Migration in Staging
 * Applies migration to staging database and validates
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

const STAGING_PROJECT_REF = process.env.STAGING_SUPABASE_PROJECT_REF;
const MIGRATION_FILE = process.argv[2];

if (!MIGRATION_FILE) {
  console.error("Usage: pnpm run test:migration <migration-file>");
  process.exit(1);
}

if (!existsSync(MIGRATION_FILE)) {
  console.error(`Migration file not found: ${MIGRATION_FILE}`);
  process.exit(1);
}

console.log("🧪 Testing migration in staging...");

try {
  // Link to staging
  console.log("1. Linking to staging project...");
  execSync(
    `supabase link --project-ref ${STAGING_PROJECT_REF}`,
    { stdio: "inherit" }
  );

  // Apply migration
  console.log("2. Applying migration...");
  execSync(
    `psql "${process.env.STAGING_DATABASE_URL}" -f "${MIGRATION_FILE}"`,
    { stdio: "inherit" }
  );

  // Validate schema
  console.log("3. Validating schema...");
  execSync("pnpm run db:validate-schema", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: process.env.STAGING_DATABASE_URL,
    },
  });

  console.log("✅ Migration test passed!");
} catch (error) {
  console.error("❌ Migration test failed:", error);
  process.exit(1);
}
```

**Usage:**
```bash
pnpm run test:migration supabase/migrations/20250131000000_new_feature.sql
```

---

## CI/CD Integration

### Update Migration Workflow

Modify `.github/workflows/apply-supabase-migrations.yml`:

```yaml
name: Apply Supabase Migrations

on:
  pull_request:
    paths:
      - 'supabase/migrations/**'
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'

jobs:
  test-migration-staging:
    name: Test Migration in Staging
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
      
      - name: Test migration in staging
        run: |
          supabase link --project-ref ${{ secrets.STAGING_SUPABASE_PROJECT_REF }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_REF: ${{ secrets.STAGING_SUPABASE_PROJECT_REF }}
      
      - name: Validate schema
        run: pnpm run db:validate-schema
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}

  apply-migration-production:
    name: Apply Migration to Production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: [test-migration-staging]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
      
      - name: Apply migration to production
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
      
      - name: Validate production schema
        run: pnpm run db:validate-schema
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Staging Data Management

### Seed Staging Database

**Option 1: Copy Production Data (Anonymized)**
```bash
# Export production data (anonymize sensitive fields)
pg_dump $PRODUCTION_DATABASE_URL | \
  sed 's/real-email@example.com/test-email@example.com/g' | \
  psql $STAGING_DATABASE_URL
```

**Option 2: Generate Test Data**
```bash
# Use seed script
DATABASE_URL=$STAGING_DATABASE_URL pnpm run db:seed
```

**Option 3: Use Production Snapshot**
```bash
# Restore production backup to staging
psql $STAGING_DATABASE_URL < backup-production.sql
```

### Keep Staging in Sync

**Weekly Sync:**
- Export production schema
- Apply to staging
- Anonymize sensitive data
- Update test data

**Before Major Migrations:**
- Always sync staging before testing migrations
- Ensures migration works with production-like data

---

## Rollback Testing

### Test Rollback Procedures

**Create Rollback Migration:**
```sql
-- Rollback migration: 20250131000001_rollback_new_feature.sql
-- Reverts: 20250131000000_new_feature.sql

-- Drop new table
DROP TABLE IF EXISTS new_feature_table CASCADE;

-- Remove new columns
ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column;

-- Restore old function
CREATE OR REPLACE FUNCTION old_function() RETURNS void AS $$
BEGIN
  -- Old implementation
END;
$$ LANGUAGE plpgsql;
```

**Test Rollback:**
```bash
# Apply migration
supabase db push

# Test rollback
psql $STAGING_DATABASE_URL -f rollback_migration.sql

# Verify rollback worked
pnpm run db:validate-schema
```

---

## Environment Variables

### Required GitHub Secrets

Add to GitHub → Settings → Secrets:

```
STAGING_SUPABASE_PROJECT_REF
STAGING_DATABASE_URL
STAGING_SUPABASE_SERVICE_ROLE_KEY
```

### Local Development

Create `.env.staging`:
```bash
# Staging Database
STAGING_SUPABASE_URL=https://[STAGING_PROJECT_REF].supabase.co
STAGING_SUPABASE_ANON_KEY=[STAGING_ANON_KEY]
STAGING_SUPABASE_SERVICE_ROLE_KEY=[STAGING_SERVICE_ROLE_KEY]
STAGING_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[STAGING_PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

---

## Checklist: Staging Database Setup

### Initial Setup
- [ ] Create Supabase staging project
- [ ] Copy environment variables
- [ ] Apply initial schema
- [ ] Seed test data
- [ ] Verify staging works

### CI/CD Integration
- [ ] Add staging secrets to GitHub
- [ ] Update migration workflow
- [ ] Test PR migration workflow
- [ ] Verify staging tests run

### Documentation
- [ ] Document staging setup
- [ ] Document migration testing mandatory
- [ ] Train team on staging workflow

### Ongoing Maintenance
- [ ] Weekly staging data sync
- [ ] Test rollback procedures quarterly
- [ ] Monitor staging costs
- [ ] Review staging usage

---

## Cost Considerations

### Staging Database Costs

**Free Tier:**
- Database: 500MB
- Bandwidth: 2GB/month
- **Cost:** $0/month

**Pro Tier (if needed):**
- Database: 8GB
- Bandwidth: 50GB/month
- **Cost:** $25/month

**Recommendation:** Start with Free tier, upgrade if needed

---

## Troubleshooting

### Common Issues

**Issue:** Migration works in staging but fails in production
**Solution:** 
- Check for production-specific data
- Verify RLS policies
- Check for production-only constraints

**Issue:** Staging database out of sync
**Solution:**
- Re-sync from production
- Apply all migrations
- Verify schema matches

**Issue:** Staging costs too high
**Solution:**
- Use Free tier
- Reduce test data
- Clean up old data regularly

---

## Conclusion

**Status:** ⚠️ **Staging database not configured**  
**Action Required:** ✅ **Set up staging database immediately**

**Benefits:**
- Safe migration testing
- Early issue detection
- Practice rollbacks
- Development testing

**Next Steps:**
1. Create Supabase staging project
2. Apply initial schema
3. Update CI/CD workflows
4. Test migration workflow

---

**Last Updated:** 2025-01-31  
**Next Review:** 2025-02-28
