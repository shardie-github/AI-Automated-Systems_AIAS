#!/usr/bin/env tsx
/**
 * MASTER OMEGA PRIME — Schema Validation
 * 
 * Validates Prisma schema matches Supabase migrations
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

interface SchemaValidationResult {
  table: string;
  status: 'match' | 'missing_in_prisma' | 'missing_in_supabase' | 'drift';
  issues: string[];
}

async function validateSchema(): Promise<{
  results: SchemaValidationResult[];
  summary: {
    total: number;
    matches: number;
    issues: number;
  };
}> {
  const results: SchemaValidationResult[] = [];
  
  try {
    // Read Prisma schema
    const prismaSchemaPath = join(process.cwd(), 'apps/web/prisma/schema.prisma');
    const prismaSchema = readFileSync(prismaSchemaPath, 'utf-8');
    
    // Extract table names from Prisma schema
    const prismaTables = new Set<string>();
    const tableMatches = prismaSchema.matchAll(/model\s+(\w+)/g);
    for (const match of tableMatches) {
      const tableName = match[1].toLowerCase();
      prismaTables.add(tableName);
    }
    
    // Read Supabase migrations to find table references
    const migrationsDir = join(process.cwd(), 'supabase/migrations');
    const { readdirSync } = await import('fs');
    const migrations = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
    
    const supabaseTables = new Set<string>();
    for (const migration of migrations) {
      const migrationPath = join(migrationsDir, migration);
      const migrationContent = readFileSync(migrationPath, 'utf-8');
      
      // Extract CREATE TABLE statements
      const createTableMatches = migrationContent.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi);
      for (const match of createTableMatches) {
        supabaseTables.add(match[1].toLowerCase());
      }
    }
    
    // Compare
    const allTables = new Set([...prismaTables, ...supabaseTables]);
    
    for (const table of allTables) {
      const inPrisma = prismaTables.has(table);
      const inSupabase = supabaseTables.has(table);
      
      if (inPrisma && inSupabase) {
        results.push({
          table,
          status: 'match',
          issues: [],
        });
      } else if (inPrisma && !inSupabase) {
        results.push({
          table,
          status: 'missing_in_supabase',
          issues: [`Table exists in Prisma but not in Supabase migrations`],
        });
      } else if (!inPrisma && inSupabase) {
        results.push({
          table,
          status: 'missing_in_prisma',
          issues: [`Table exists in Supabase but not in Prisma schema`],
        });
      }
    }
    
    const summary = {
      total: results.length,
      matches: results.filter((r) => r.status === 'match').length,
      issues: results.filter((r) => r.status !== 'match').length,
    };
    
    return { results, summary };
  } catch (error) {
    console.error('Error validating schema:', error);
    throw error;
  }
}

function printReport() {
  validateSchema()
    .then(({ results, summary }) => {
      console.log('\n🔍 MASTER OMEGA PRIME — Schema Validation Report\n');
      console.log('='.repeat(70));
      console.log(`Total Tables: ${summary.total}`);
      console.log(`✅ Matches: ${summary.matches}`);
      console.log(`⚠️  Issues: ${summary.issues}`);
      console.log('='.repeat(70));
      console.log();

      if (summary.issues > 0) {
        console.log('\n⚠️  SCHEMA DRIFT DETECTED:\n');
        
        results
          .filter((r) => r.status !== 'match')
          .forEach((result) => {
            const icon = result.status === 'missing_in_prisma' ? '📝' : '🗄️';
            console.log(`${icon} ${result.table}`);
            result.issues.forEach((issue) => {
              console.log(`   - ${issue}`);
            });
            console.log();
          });
      } else {
        console.log('\n✅ Schema validation passed! Prisma and Supabase are in sync.\n');
      }
      
      process.exit(summary.issues > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

if (require.main === module) {
  printReport();
}

export { validateSchema };
