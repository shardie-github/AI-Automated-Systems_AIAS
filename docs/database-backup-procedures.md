# Database Backup & Recovery Procedures

**Last Updated:** 2025-01-31  
**Purpose:** Complete guide to database backup, recovery, and disaster recovery procedures

---

## Executive Summary

This document outlines backup and recovery procedures for the AIAS Platform database. **Automated backups require Supabase Pro tier ($25/month)**. Manual backup procedures are documented for free tier usage.

**Current Tier:** Free (Manual backups only)  
**Recommended:** Pro (Automated daily backups)  
**Production Requirement:** Pro tier minimum

---

## Backup Strategy

### Tier Comparison

| Feature | Free Tier | Pro Tier ($25/mo) | Team Tier ($599/mo) |
|---------|-----------|-------------------|---------------------|
| Automated Backups | ❌ | ✅ Daily | ✅ Daily |
| Backup Retention | N/A | 7 days | 7 days |
| Point-in-Time Recovery | ❌ | ❌ | ✅ |
| Manual Exports | ✅ | ✅ | ✅ |
| Backup Notifications | ❌ | ✅ | ✅ |

### Recommended Setup

**For Production:**
1. **Upgrade to Supabase Pro** - Automated Daily Automated Backups
2. **Weekly Manual Exports** - Store in S3/GCS for long-term retention
3. **Test Restore Procedures** - Quarterly restore tests

**For Development/Staging:**
- Manual exports as needed
- Consider Pro tier if data is critical

---

## Automated Backups (Supabase Pro)

### Setup Instructions

1. **Upgrade to Pro Tier**
   - Go to Supabase Dashboard → Settings → Billing
   - Select Pro plan ($25/month)
   - Confirm upgrade

2. **Verify Backup Configuration**
   - Go to Supabase Dashboard → Settings → Database
   - Verify "Daily Backups" is enabled
   - Check backup retention period (7 days)

3. **Configure Backup Notifications** (Optional)
   - Go to Supabase Dashboard → Settings → Notifications
   - Enable backup success/failure notifications
   - Configure email/Slack notifications

### Backup Schedule

**Automatic:**
- **Frequency:** Daily at 2 AM UTC
- **Retention:** 7 days
- **Format:** PostgreSQL dump (.sql)
- **Storage:** Managed by Supabase

**Access:**
- Supabase Dashboard → Database → Backups
- Download backups via Dashboard or API

### Restore from Automated Backup

**Via Dashboard:**
1. Go to Supabase Dashboard → Database → Backups
2. Select backup to restore
3. Click "Restore" button
4. Confirm restore (this will overwrite current database)

**Via Supabase CLI:**
```bash
# List available backups
supabase db backups list --project-ref YOUR_PROJECT_REF

# Restore from backup
supabase db restore --project-ref YOUR_PROJECT_REF --backup-id BACKUP_ID
```

**⚠️ Warning:** Restoring from backup will **overwrite** the current database. Always test restores in staging first.

---

## Manual Backups (Free Tier or Additional)

### Using Supabase Dashboard

1. **Export via Dashboard:**
   - Go to Supabase Dashboard → Database → Backups
   - Click "Create Backup" (manual backup)
   - Wait for backup to complete
   - Download backup file (.sql)

2. **Export via SQL Editor:**
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT * FROM pg_database WHERE datname = 'postgres';`
   - Use pg_dump via connection string (see below)

### Using pg_dump (Command Line)

**Prerequisites:**
- PostgreSQL client tools installed
- Database connection string

**Export Full Database:**
```bash
# Get connection string from Supabase Dashboard → Settings → Database
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --file=backup-$(date +%Y%m%d-%H%M%S).sql
```

**Export Specific Schema:**
```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require" \
  --schema=public \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --file=backup-schema-$(date +%Y%m%d-%H%M%S).sql
```

**Export Specific Tables:**
```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require" \
  --table=users \
  --table=organizations \
  --clean \
  --if-exists \
  --file=backup-tables-$(date +%Y%m%d-%H%M%S).sql
```

### Automated Manual Backup Script

Create `scripts/db-backup.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * Manual Database Backup Script
 * Creates a backup of the Supabase database
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
import { env } from "@/lib/env";

const BACKUP_DIR = join(process.cwd(), "backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFile = join(BACKUP_DIR, `backup-${timestamp}.sql`);

async function createBackup() {
  console.log("🔄 Creating database backup...");
  
  const dbUrl = env.database.url;
  if (!dbUrl) {
    throw new Error("DATABASE_URL not set");
  }

  try {
    // Create backup directory if it doesn't exist
    execSync(`mkdir -p ${BACKUP_DIR}`);

    // Create backup using pg_dump
    execSync(
      `pg_dump "${dbUrl}" --clean --if-exists --no-owner --no-privileges --file="${backupFile}"`,
      { stdio: "inherit" }
    );

    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`📦 Backup size: ${getFileSize(backupFile)}`);
    
    return backupFile;
  } catch (error) {
    console.error("❌ Backup failed:", error);
    throw error;
  }
}

function getFileSize(filePath: string): string {
  const fs = require("fs");
  const stats = fs.statSync(filePath);
  const bytes = stats.size;
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

if (require.main === module) {
  createBackup()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
```

**Usage:**
```bash
pnpm run db:backup
```

---

## Backup Storage Strategy

### Local Storage (Development)

Store backups in `backups/` directory:
- Keep last 7 days of backups
- Compress old backups
- Rotate weekly

### Cloud Storage (Production)

**Recommended:** Store backups in cloud storage for long-term retention

**AWS S3:**
```bash
# Upload backup to S3
aws s3 cp backup-20250131.sql s3://your-bucket/backups/database/
```

**Google Cloud Storage:**
```bash
# Upload backup to GCS
gsutil cp backup-20250131.sql gs://your-bucket/backups/database/
```

**Automated Upload Script:**
```typescript
// Add to scripts/db-backup.ts
async function uploadToS3(filePath: string) {
  const AWS = require("aws-sdk");
  const s3 = new AWS.S3();
  
  const bucket = process.env.BACKUP_S3_BUCKET;
  const key = `backups/database/${path.basename(filePath)}`;
  
  await s3.upload({
    Bucket: bucket,
    Key: key,
    Body: require("fs").createReadStream(filePath),
  }).promise();
  
  console.log(`✅ Uploaded to S3: s3://${bucket}/${key}`);
}
```

### Backup Retention Policy

**Automated Backups (Supabase Pro):**
- Retention: 7 days
- Automatic cleanup

**Manual Backups:**
- **Daily:** Keep last 7 days
- **Weekly:** Keep last 4 weeks
- **Monthly:** Keep last 12 months
- **Yearly:** Keep indefinitely

**Cloud Storage:**
- **Daily:** 30 days
- **Weekly:** 12 weeks
- **Monthly:** 12 months
- **Yearly:** 7 years

---

## Recovery Procedures

### Full Database Restore

**Prerequisites:**
- Backup file (.sql)
- Database connection string
- Confirmation that restore is needed

**Steps:**

1. **Verify Backup File:**
   ```bash
   # Check backup file exists and is readable
   ls -lh backup-20250131.sql
   head -20 backup-20250131.sql
   ```

2. **Test Restore in Staging** (Recommended):
   ```bash
   # Restore to staging database first
   psql "postgresql://postgres:[PASSWORD]@db.[STAGING_PROJECT_REF].supabase.co:5432/postgres?sslmode=require" < backup-20250131.sql
   ```

3. **Restore to Production:**
   ```bash
   # ⚠️ WARNING: This will overwrite production database
   psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require" < backup-20250131.sql
   ```

4. **Verify Restore:**
   - Check critical tables exist
   - Verify data integrity
   - Test application functionality

### Partial Restore (Specific Tables)

**Restore Single Table:**
```bash
# Extract table from backup
pg_restore --table=users backup-20250131.sql > users-only.sql

# Restore table
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require" < users-only.sql
```

### Point-in-Time Recovery (Team Tier Only)

**Supabase Team Tier** supports point-in-time recovery:

1. Go to Supabase Dashboard → Database → Backups
2. Select "Point-in-Time Recovery"
3. Choose recovery point (timestamp)
4. Click "Restore"

**Limitations:**
- Only available on Team tier ($599/month)
- Requires continuous backup (enabled by default)

---

## Disaster Recovery Plan

### Scenario 1: Database Corruption

**Symptoms:**
- Database queries failing
- Data inconsistencies
- Application errors

**Recovery Steps:**
1. **Immediate:** Stop application writes (if possible)
2. **Assess:** Determine corruption scope
3. **Restore:** Restore from most recent backup
4. **Verify:** Test application functionality
5. **Investigate:** Root cause analysis

### Scenario 2: Accidental Data Deletion

**Symptoms:**
- Missing data
- User reports
- Application errors

**Recovery Steps:**
1. **Stop:** Stop application writes
2. **Identify:** Determine deletion scope and time
3. **Restore:** Restore from backup before deletion
4. **Merge:** If needed, merge with current data
5. **Verify:** Verify data integrity

### Scenario 3: Complete Database Loss

**Symptoms:**
- Database inaccessible
- Connection errors
- Complete data loss

**Recovery Steps:**
1. **Contact:** Supabase support immediately
2. **Restore:** Restore from most recent backup
3. **Verify:** Verify all critical data restored
4. **Investigate:** Root cause analysis
5. **Prevent:** Implement prevention measures

### Recovery Time Objectives (RTO)

**Target RTO:** 4 hours
- Assessment: 30 minutes
- Restore: 1-2 hours
- Verification: 1 hour
- Communication: 30 minutes

### Recovery Point Objectives (RPO)

**Target RPO:** 24 hours
- Daily automated backups (Pro tier)
- Manual backups before major changes
- Point-in-time recovery (Team tier) for <1 hour RPO

---

## Backup Testing

### Quarterly Restore Tests

**Schedule:** Every 3 months

**Procedure:**
1. **Select Backup:** Choose recent backup
2. **Create Test Environment:** Set up staging database
3. **Restore:** Restore backup to staging
4. **Verify:** 
   - All tables exist
   - Data integrity checks
   - Application functionality
5. **Document:** Document results:** Document results

**Checklist:**
- [ ] Backup file accessible
- [ ] Restore completes successfully
- [ ] All tables present
- [ ] Data integrity verified
- [ ] Application works correctly
- [ ] Performance acceptable

### Monthly Backup Verification

**Schedule:** Monthly

**Checks:**
- [ ] Automated backups running (Pro tier)
- [ ] Backup files accessible
- [ ] Backup sizes reasonable
- [ ] No backup failures
- [ ] Retention policy followed

---

## Upgrade Path to Pro Tier

### Step 1: Evaluate Current Usage

**Check:**
- Database size (should be <8GB for Pro)
- Bandwidth usage (should be <50GB/month)
- Feature requirements

**Supabase Dashboard → Settings → Usage**

### Step 2: Upgrade Process

1. **Go to:** Supabase Dashboard → Settings → Billing
2. **Select:** Pro plan ($25/month)
3. **Confirm:** Payment method
4. **Activate:** Upgrade completes immediately

### Step 3: Verify Backup Activation

1. **Go to:** Supabase Dashboard → Database → Backups
2. **Verify:** "Daily Backups" enabled
3. **Check:** First backup scheduled
4. **Test:** Create manual backup

### Step 4: Update Documentation

- Update team documentation
- Notify team of backup schedule
- Update disaster recovery plan

---

## Cost Analysis

### Free Tier (Current)
- **Cost:** $0/month
- **Backups:** Manual only
- **Risk:** High (no automated backups)

### Pro Tier (Recommended)
- **Cost:** $25/month
- **Backups:** Daily automated
- **Risk:** Low (automated backups)
- **ROI:** Prevents potential data loss worth thousands

### Team Tier (Future)
- **Cost:** $599/month
- **Backups:** Daily + Point-in-Time Recovery
- **Risk:** Very Low
- **ROI:** Required for enterprise customers

---

## Backup Automation (CI/CD)

### GitHub Actions Workflow

Create `.github/workflows/db-backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    # Run weekly on Sunday at 2 AM UTC
    - cron: '0 2 * * 0'
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Create backup
        run: pnpm run db:backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Upload to S3
        if: env.BACKUP_S3_BUCKET != ''
        run: |
          aws s3 cp backups/*.sql s3://${{ secrets.BACKUP_S3_BUCKET }}/backups/database/
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          BACKUP_S3_BUCKET: ${{ secrets.BACKUP_S3_BUCKET }}
```

---

## Checklist: Pre-Production Backup Setup

### Before Launch
- [ ] Upgrade to Supabase Pro tier
- [ ] Verify automated backups enabled
- [ ] Test manual backup procedure
- [ ] Document backup procedures
- [ ] Set up backup notifications
- [ ] Create backup automation script
- [ ] Test restore procedure
- [ ] Document disaster recovery plan
- [ ] Train team on backup/restore procedures

### Post-Launch
- [ ] Schedule quarterly restore tests
- [ ] Monitor backup success/failures
- [ ] Review backup retention policy
- [ ] Update disaster recovery plan
- [ ] Document any issues/learnings

---

## Conclusion

**Current Status:** ⚠️ **Manual backups only** (Free tier)  
**Recommendation:** ✅ **Upgrade to Pro tier** before production launch  
**Cost:** $25/month for automated daily backups  
**Risk Reduction:** Prevents catastrophic data loss

**Action Required:**
1. Upgrade to Supabase Pro tier
2. Verify automated backups enabled
3. Test restore procedures
4. Document team procedures

---

**Last Updated:** 2025-01-31  
**Next Review:** 2025-04-30 (Quarterly)
