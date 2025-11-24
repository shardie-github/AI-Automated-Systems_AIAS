# Migration Rollback Procedures

**Last Updated:** 2025-01-31  
**Purpose:** Complete guide to rolling back database migrations safely

---

## Executive Summary

This document outlines procedures for rolling back database migrations when issues occur. **Always test rollbacks in staging first** before applying to production.

**Critical Rule:** Never rollback production migrations without testing in staging first.

---

## When to Rollback

### Scenarios Requiring Rollback

1. **Migration Causes Errors**
   - Application errors after migration
   - Data corruption detected
   - Performance degradation

2. **Migration Applied Incorrectly**
   - Wrong migration applied
   - Migration applied to wrong environment
   - Partial migration failure

3. **Business Decision**
   - Feature removed
   - Rollback requested by stakeholders
   - Compliance requirements

### When NOT to Rollback

1. **Data Already Modified**
   - If application has written new data using new schema
   - If users have created records with new structure
   - If rollback would cause data loss

2. **Dependent Migrations Applied**
   - If subsequent migrations depend on this one
   - If other systems depend on new schema

3. **Long Time Since Migration**
   - If migration was applied days/weeks ago
   - Better to fix forward than rollback

---

## Rollback Strategy

### Types of Rollbacks

1. **Full Rollback** - Revert entire migration
2. **Partial Rollback** - Revert specific changes
3. **Forward Fix** - Fix issues without rolling back

### Decision Tree

```
Migration Issue Detected
├─ Can fix forward? → Yes → Apply fix migration
└─ Must rollback? → Yes
   ├─ Tested in staging? → No → Test first
   └─ Yes → Apply rollback
```

---

## Rollback Procedures

### Step 1: Assess Impact

**Check:**
- [ ] What data will be affected?
- [ ] Are there dependent migrations?
- [ ] Has application code been deployed?
- [ ] Can we fix forward instead?

**Commands:**
```bash
# Check migration history
supabase migration list

# Check current schema
psql $DATABASE_URL -c "\d"

# Check for dependent objects
psql $DATABASE_URL -c "SELECT * FROM pg_depend WHERE refobjid = 'table_name'::regclass;"
```

### Step 2: Create Rollback Migration

**Naming Convention:**
- Format: `YYYYMMDDHHMMSS_rollback_original_description.sql`
- Example: `20250131120000_rollback_add_user_preferences.sql`

**Template:**
```sql
-- Rollback Migration: [Description]
-- Reverts: [Original Migration File]
-- Date: [Date]
-- Reason: [Why rolling back]

-- ⚠️ WARNING: This rollback will [describe impact]

BEGIN;

-- Rollback changes here
-- Example: DROP TABLE IF EXISTS new_table CASCADE;
-- Example: ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column;

COMMIT;
```

### Step 3: Test Rollback in Staging

**Procedure:**
1. Apply original migration to staging
2. Apply rollback migration
3. Verify schema matches pre-migration state
4. Test application functionality
5. Verify data integrity

**Commands:**
```bash
# Apply original migration to staging
supabase link --project-ref $STAGING_PROJECT_REF
supabase db push

# Apply rollback
psql $STAGING_DATABASE_URL -f rollback_migration.sql

# Validate
pnpm run db:validate-schema
```

### Step 4: Apply Rollback to Production

**Only after successful staging test:**

```bash
# Link to production
supabase link --project-ref $PRODUCTION_PROJECT_REF

# Apply rollback
psql $PRODUCTION_DATABASE_URL -f rollback_migration.sql

# Validate
pnpm run db:validate-schema
```

---

## Common Rollback Patterns

### Rollback: Add Table

**Original Migration:**
```sql
CREATE TABLE new_table (
  id uuid PRIMARY KEY,
  name text NOT NULL
);
```

**Rollback Migration:**
```sql
-- Rollback: Remove new_table
DROP TABLE IF EXISTS new_table CASCADE;
```

### Rollback: Add Column

**Original Migration:**
```sql
ALTER TABLE users ADD COLUMN new_field text;
```

**Rollback Migration:**
```sql
-- Rollback: Remove new_field column
ALTER TABLE users DROP COLUMN IF EXISTS new_field;
```

### Rollback: Modify Column

**Original Migration:**
```sql
ALTER TABLE users ALTER COLUMN email TYPE varchar(255);
```

**Rollback Migration:**
```sql
-- Rollback: Restore original column type
-- Note: May fail if data doesn't fit original type
ALTER TABLE users ALTER COLUMN email TYPE text;
```

### Rollback: Add Index

**Original Migration:**
```sql
CREATE INDEX idx_users_email ON users(email);
```

**Rollback Migration:**
```sql
-- Rollback: Remove index
DROP INDEX IF EXISTS idx_users_email;
```

### Rollback: Add Function

**Original Migration:**
```sql
CREATE OR REPLACE FUNCTION new_function() RETURNS void AS $$
BEGIN
  -- Implementation
END;
$$ LANGUAGE plpgsql;
```

**Rollback Migration:**
```sql
-- Rollback: Drop function
DROP FUNCTION IF EXISTS new_function();
```

### Rollback: Add RLS Policy

**Original Migration:**
```sql
CREATE POLICY "new_policy" ON users FOR SELECT USING (true);
```

**Rollback Migration:**
```sql
-- Rollback: Drop policy
DROP POLICY IF EXISTS "new_policy" ON users;
```

---

## Rollback Script Template

Create `scripts/create-rollback.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * Create Rollback Migration
 * Generates a rollback migration template
 */

import { writeFileSync } from "fs";
import { join } from "path";

const originalMigration = process.argv[2];
const reason = process.argv[3] || "Migration issue detected";

if (!originalMigration) {
  console.error("Usage: pnpm run create:rollback <original-migration> [reason]");
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "");
const rollbackFile = join(
  process.cwd(),
  "supabase/migrations",
  `${timestamp}_rollback_${originalMigration.replace(/^\d+_/, "")}`
);

const rollbackTemplate = `-- Rollback Migration
-- Reverts: ${originalMigration}
-- Date: ${new Date().toISOString()}
-- Reason: ${reason}

-- ⚠️ WARNING: Review and modify this rollback before applying

BEGIN;

-- Add rollback SQL here
-- Example: DROP TABLE IF EXISTS new_table CASCADE;
-- Example: ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column;

COMMIT;
`;

writeFileSync(rollbackFile, rollbackTemplate);
console.log(`✅ Rollback migration created: ${rollbackFile}`);
console.log("⚠️  Review and modify before applying!");
```

**Usage:**
```bash
pnpm run create:rollback 20250131000000_add_user_preferences.sql "Causing performance issues"
```

---

## Emergency Rollback Procedures

### Critical Production Issue

**If migration causes critical production issues:**

1. **Immediate Actions:**
   - [ ] Stop application deployments
   - [ ] Assess impact scope
   - [ ] Notify team

2. **Quick Assessment:**
   - Can application run with current state?
   - Is data being corrupted?
   - Can we fix forward quickly?

3. **Rollback Decision:**
   - If data corruption: Rollback immediately
   - If application broken: Consider rollback
   - If performance issue: May fix forward

4. **Execute Rollback:**
   ```bash
   # Quick rollback (if tested before)
   psql $PRODUCTION_DATABASE_URL -f rollback_migration.sql
   ```

5. **Verify:**
   - Check application functionality
   - Verify data integrity
   - Monitor error rates

### Post-Rollback Actions

1. **Document:**
   - What went wrong?
   - Why rollback was needed?
   - What was learned?

2. **Fix:**
   - Fix original migration
   - Test thoroughly
   - Re-apply when ready

3. **Prevent:**
   - Improve migration testing
   - Add more validation
   - Update procedures

---

## Rollback Testing Checklist

### Before Production Rollback

- [ ] Rollback migration created
- [ ] Rollback tested in staging
- [ ] Impact assessment complete
- [ ] Team notified
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Rollback verified safe

### During Rollback

- [ ] Application writes stopped (if needed)
- [ ] Rollback migration applied
- [ ] Schema validated
- [ ] Application tested
- [ ] Data integrity verified

### After Rollback

- [ ] Application functioning
- [ ] No data loss
- [ ] Error rates normal
- [ ] Team notified of success
- [ ] Incident documented
- [ ] Prevention measures planned

---

## Prevention: Better Migrations

### Best Practices

1. **Always Test First**
   - Test in staging
   - Test with production-like data
   - Test rollback procedure

2. **Make Migrations Reversible**
   - Design for easy rollback
   - Avoid destructive changes
   - Use IF EXISTS clauses

3. **Add Validation**
   - Validate data before migration
   - Check constraints
   - Verify dependencies

4. **Document Changes**
   - Clear migration descriptions
   - Document rollback procedure
   - Note potential issues

5. **Use Transactions**
   - Wrap in BEGIN/COMMIT
   - Allow rollback on error
   - Test transaction behavior

---

## Rollback Examples

### Example 1: Rollback Add Table with Data

**Original:**
```sql
CREATE TABLE user_preferences (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  preference_key text,
  preference_value jsonb
);
```

**Rollback:**
```sql
-- Rollback: Remove user_preferences table
-- ⚠️ WARNING: This will delete all preference data
DROP TABLE IF EXISTS user_preferences CASCADE;
```

### Example 2: Rollback Add Column (Safe)

**Original:**
```sql
ALTER TABLE users ADD COLUMN phone_number text;
```

**Rollback:**
```sql
-- Rollback: Remove phone_number column
-- Safe: No data loss if column not used yet
ALTER TABLE users DROP COLUMN IF EXISTS phone_number;
```

### Example 3: Rollback Complex Migration

**Original:**
```sql
-- Add table
CREATE TABLE orders (...);

-- Add column
ALTER TABLE users ADD COLUMN order_count int DEFAULT 0;

-- Add function
CREATE FUNCTION update_order_count() ...;
```

**Rollback:**
```sql
-- Rollback: Remove all changes
DROP FUNCTION IF EXISTS update_order_count() CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS order_count;
DROP TABLE IF EXISTS orders CASCADE;
```

---

## Conclusion

**Key Principles:**
1. ✅ Always test rollbacks in staging first
2. ✅ Assess impact before rolling back
3. ✅ Consider fixing forward vs rolling back
4. ✅ Document all rollbacks
5. ✅ Learn from rollback incidents

**Remember:** A well-tested rollback is safer than a broken migration.

---

**Last Updated:** 2025-01-31  
**Next Review:** 2025-04-30
