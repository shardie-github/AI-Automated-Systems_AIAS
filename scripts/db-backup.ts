#!/usr/bin/env tsx
/**
 * Database Backup Script
 * Creates a manual backup of the Supabase database
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, statSync } from "fs";
import { join } from "path";

const BACKUP_DIR = join(process.cwd(), "backups");

function getFileSize(filePath: string): string {
  const stats = statSync(filePath);
  const bytes = stats.size;
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function createBackup() {
  console.log("🔄 Creating database backup...");
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable not set");
  }

  // Create backup directory if it doesn't exist
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = join(BACKUP_DIR, `backup-${timestamp}.sql`);

  try {
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

if (require.main === module) {
  try {
    createBackup();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export { createBackup };
