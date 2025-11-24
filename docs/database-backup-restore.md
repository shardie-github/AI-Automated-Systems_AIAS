# Database Backup & Restore Procedures

**Last Updated:** 2025-01-XX  
**Purpose:** Complete guide to backing up and restoring the Supabase database

---

## Overview

The AIAS Platform uses **Supabase** (PostgreSQL) as its database. This document outlines backup and restore procedures for production data safety.

---

## Backup Strategy

### Current Setup

**Free Tier:**
- ❌ No automated backups
- ✅ Manual exports available
- ⚠️ **Risk:** Data loss if database corrupted

**Pro Tier ($25/month):**
- ✅ Daily automated backups
- ✅ 7-day retention
- ✅ Point-in-time recovery (limited)
- ✅ **Recommended for production**

**Team Tier ($599/month):**
- ✅ Daily automated backups
- ✅ 30-day retention
- ✅ Full point-in-time recovery
- ✅ **Recommended for high-traffic production**

---

## Automated Backups (Supabase Pro+)

### Enabling Automated Backups

1. **Upgrade to Supabase Pro:**
   - Go to Supabase Dashboard → Settings → Billing
   - Upgrade to Pro tier ($25/month)
   - Automated backups are enabled automatically

2. **Verify Backup Status:**
   - Go to Supabase Dashboard → Database → Backups
   - Check backup schedule (daily at 2 AM UTC)
   - Verify recent backups exist

### Backup Retention

- **Pro Tier:** 7 days
- **Team Tier:** 30 days
- **Enterprise:** Custom retention

### Restoring from Automated Backup

1. **Go to Supabase Dashboard:**
   - Navigate to Database → Backups

2. **Select Backup:**
   - Choose backup date/time
   - Click "Restore"

3. **Confirm Restore:**
   - Review backup details
   - Confirm restore (this will overwrite current database)

4. **Verify Restore:**
   - Check database tables
   - Verify data integrity
   - Test application

**⚠️ Warning:** Restoring from backup will overwrite current database. Ensure you have a backup of current state if needed.

---

## Manual Backups

### Using Supabase Dashboard

1. **Export Database:**
   - Go to Supabase Dashboard → Database → Backups
   - Click "Create Backup"
   - Download SQL dump file

2. **Store Backup:**
   - Store in secure location (S3, GCS, etc.)
   - Encrypt sensitive backups
   - Keep multiple copies (3-2-1 rule)

### Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Create backup
supabase db dump -f backup-$(date +%Y%m%d).sql
```

### Using pg_dump (Direct PostgreSQL)

```bash
# Get connection string from Supabase Dashboard → Settings → Database
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Create backup
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  --file=backup-$(date +%Y%m%d).sql \
  --verbose

# Compress backup
gzip backup-$(date +%Y%m%d).sql
```

### Automated Manual Backup Script

Create `scripts/backup-database.sh`:

```bash
#!/bin/bash
# Database Backup Script
# Run daily via cron or GitHub Actions

set -euo pipefail

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-$DATE.sql"

mkdir -p "$BACKUP_DIR"

# Get database URL from environment
DB_URL="${DATABASE_URL:-}"

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL not set"
  exit 1
fi

# Create backup
pg_dump "$DB_URL" --file="$BACKUP_FILE" --verbose

# Compress backup
gzip "$BACKUP_FILE"

# Upload to S3/GCS (optional)
# aws s3 cp "$BACKUP_FILE.gz" s3://your-bucket/backups/

echo "Backup created: $BACKUP_FILE.gz"
```

**Make executable:**
```bash
chmod +x scripts/backup-database.sh
```

---

## Restore Procedures

### Restoring from SQL Dump

1. **Prepare SQL File:**
   - Download backup SQL file
   - Decompress if needed (`gunzip backup.sql.gz`)

2. **Restore Database:**
   ```bash
   # Using psql
   psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
     < backup-YYYYMMDD.sql
   
   # Or using Supabase CLI
   supabase db reset --db-url "postgresql://..." < backup-YYYYMMDD.sql
   ```

3. **Verify Restore:**
   - Check table counts
   - Verify critical data
   - Test application

### Restoring Specific Tables

```sql
-- Restore specific table from backup
psql "postgresql://..." -c "
  DROP TABLE IF EXISTS users CASCADE;
  CREATE TABLE users (...);
"

psql "postgresql://..." -c "\copy users FROM 'users_backup.csv' CSV HEADER"
```

### Point-in-Time Recovery (Team Tier+)

1. **Go to Supabase Dashboard:**
   - Database → Backups → Point-in-Time Recovery

2. **Select Recovery Point:**
   - Choose date/time
   - Review changes that will be restored

3. **Initiate Recovery:**
   - Click "Restore to Point"
   - Confirm recovery

4. **Verify Recovery:**
   - Check database state
   - Test application

---

## Backup Schedule Recommendations

### Production

- **Automated:** Daily (via Supabase Pro)
- **Manual:** Weekly (store in S3/GCS)
- **Before Major Changes:** Always backup before:
  - Schema migrations
  - Data migrations
  - Major deployments

### Staging/Development

- **Automated:** Daily (if using Supabase Pro)
- **Manual:** Weekly (optional)

---

## Backup Storage

### Recommended Locations

1. **Supabase Backups:**
   - Stored by Supabase (automated)
   - 7-30 day retention

2. **External Storage:**
   - AWS S3
   - Google Cloud Storage
   - Azure Blob Storage
   - Encrypted storage

### Backup Retention Policy

- **Daily Backups:** Keep 7 days
- **Weekly Backups:** Keep 4 weeks
- **Monthly Backups:** Keep 12 months
- **Before Major Changes:** Keep indefinitely

---

## Disaster Recovery Plan

### Scenario 1: Database Corruption

1. **Identify Issue:**
   - Check application errors
   - Verify database connectivity
   - Review Supabase logs

2. **Stop Application:**
   - Pause deployments
   - Notify team

3. **Restore from Backup:**
   - Use most recent automated backup
   - Or restore from manual backup

4. **Verify Restore:**
   - Check data integrity
   - Test critical flows
   - Resume application

### Scenario 2: Accidental Data Deletion

1. **Identify Deletion:**
   - Check audit logs
   - Identify affected tables/rows

2. **Restore from Backup:**
   - Use point-in-time recovery (if available)
   - Or restore specific tables from backup

3. **Merge Changes:**
   - If data was modified after backup
   - Manually merge changes if needed

### Scenario 3: Migration Failure

1. **Rollback Migration:**
   - Restore database from pre-migration backup
   - Fix migration script
   - Re-apply migration

2. **Verify Rollback:**
   - Check database state
   - Test application
   - Document issue

---

## Testing Backups

### Regular Backup Testing

**Frequency:** Monthly

**Procedure:**
1. Create test database
2. Restore from backup
3. Verify data integrity
4. Test application
5. Document results

### Backup Verification Script

Create `scripts/verify-backup.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * Backup Verification Script
 * Verifies backup file integrity and completeness
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env';

async function verifyBackup(backupFile: string) {
  console.log(`Verifying backup: ${backupFile}`);
  
  // Check file exists
  const backup = readFileSync(backupFile, 'utf-8');
  
  // Check for key tables
  const requiredTables = ['users', 'tenants', 'agents', 'workflows'];
  const missingTables: string[] = [];
  
  for (const table of requiredTables) {
    if (!backup.includes(`CREATE TABLE ${table}`) && 
        !backup.includes(`CREATE TABLE public.${table}`)) {
      missingTables.push(table);
    }
  }
  
  if (missingTables.length > 0) {
    console.error(`❌ Missing tables in backup: ${missingTables.join(', ')}`);
    return false;
  }
  
  console.log('✅ Backup verification passed');
  return true;
}

// Run if executed directly
if (require.main === module) {
  const backupFile = process.argv[2];
  if (!backupFile) {
    console.error('Usage: tsx scripts/verify-backup.ts <backup-file.sql>');
    process.exit(1);
  }
  
  verifyBackup(backupFile)
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}
```

---

## Cost Considerations

### Backup Storage Costs

- **Supabase Automated Backups:** Included in Pro/Team tier
- **External Storage (S3):**
  - Storage: ~$0.023/GB/month
  - Transfer: ~$0.09/GB
  - **Example:** 10GB backups = ~$0.23/month

### Backup Frequency vs Cost

- **Daily Backups:** Higher storage costs, better recovery
- **Weekly Backups:** Lower storage costs, acceptable recovery
- **Monthly Backups:** Lowest costs, limited recovery

**Recommendation:** Daily automated backups (Supabase Pro) + weekly manual backups (external storage)

---

## Security

### Backup Encryption

- **At Rest:** Encrypt backups in storage
- **In Transit:** Use TLS/SSL for transfers
- **Access Control:** Limit backup access to admins only

### Backup Access

- **Supabase Dashboard:** Requires Supabase account access
- **External Storage:** Use IAM policies to restrict access
- **Backup Scripts:** Store credentials securely (GitHub Secrets)

---

## Monitoring

### Backup Monitoring

1. **Check Backup Status:**
   - Supabase Dashboard → Database → Backups
   - Verify recent backups exist

2. **Set Up Alerts:**
   - Alert if backup fails
   - Alert if backup is older than 24 hours
   - Alert on restore operations

3. **Regular Audits:**
   - Monthly backup verification
   - Quarterly disaster recovery drill

---

## Conclusion

**Current Status:**
- ⚠️ Free tier: Manual backups only
- ✅ Pro tier: Automated daily backups (recommended)

**Recommendations:**
1. Upgrade to Supabase Pro for automated backups
2. Set up weekly manual backups to external storage
3. Test restore procedures quarterly
4. Document any custom backup procedures

**Next Steps:**
1. Upgrade to Supabase Pro
- Set up automated backup script
- Schedule monthly backup verification
- Document team backup procedures

---

## Quick Reference

### Create Backup
```bash
# Manual backup
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql

# Compress
gzip backup-$(date +%Y%m%d).sql
```

### Restore Backup
```bash
# Decompress
gunzip backup-YYYYMMDD.sql.gz

# Restore
psql "$DATABASE_URL" < backup-YYYYMMDD.sql
```

### Verify Backup
```bash
# Check backup file
head -n 100 backup-YYYYMMDD.sql

# Verify tables
grep "CREATE TABLE" backup-YYYYMMDD.sql
```
