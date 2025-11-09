#!/usr/bin/env tsx
/**
 * Regenerate Supabase TypeScript types from schema
 * 
 * Usage:
 *   pnpm tsx scripts/regenerate-supabase-types.ts
 * 
 * Requires:
 *   - SUPABASE_PROJECT_REF environment variable
 *   - SUPABASE_ACCESS_TOKEN environment variable (or supabase CLI login)
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const TYPES_OUTPUT_PATH = 'src/integrations/supabase/types.ts';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function regenerateTypes() {
  console.log('🔄 Regenerating Supabase types...\n');

  if (!PROJECT_REF) {
    console.error('❌ Error: SUPABASE_PROJECT_REF environment variable not set');
    console.log('\nTo fix:');
    console.log('  1. Get your project ref from Supabase dashboard');
    console.log('  2. Set SUPABASE_PROJECT_REF=<your-project-ref>');
    console.log('  3. Or run: supabase link --project-ref <your-project-ref>');
    process.exit(1);
  }

  try {
    // Check if supabase CLI is installed
    try {
      execSync('supabase --version', { stdio: 'ignore' });
    } catch {
      console.error('❌ Error: Supabase CLI not found');
      console.log('\nTo install:');
      console.log('  npm install -g supabase');
      console.log('  Or: brew install supabase/tap/supabase');
      process.exit(1);
    }

    // Generate types
    console.log(`📦 Generating types for project: ${PROJECT_REF}`);
    
    let command = `supabase gen types typescript --project-id ${PROJECT_REF}`;
    
    if (ACCESS_TOKEN) {
      command += ` --token ${ACCESS_TOKEN}`;
    }

    const typesOutput = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    // Write to file
    const header = `/**
 * Supabase Database Types
 * 
 * Auto-generated from Supabase schema
 * Last regenerated: ${new Date().toISOString()}
 * 
 * To regenerate:
 *   pnpm tsx scripts/regenerate-supabase-types.ts
 * 
 * Or manually:
 *   supabase gen types typescript --project-id $SUPABASE_PROJECT_REF > ${TYPES_OUTPUT_PATH}
 */

`;

    writeFileSync(TYPES_OUTPUT_PATH, header + typesOutput);
    
    console.log(`✅ Types generated successfully!`);
    console.log(`   Output: ${TYPES_OUTPUT_PATH}`);
    console.log(`   Size: ${(header.length + typesOutput.length) / 1024} KB`);
    
    // Check for common issues
    const typesContent = header + typesOutput;
    const tableCount = (typesContent.match(/Tables:/g) || []).length;
    const enumCount = (typesContent.match(/Enums:/g) || []).length;
    
    console.log(`\n📊 Schema Summary:`);
    console.log(`   Tables detected: ${tableCount > 0 ? 'Yes' : 'No'}`);
    console.log(`   Enums detected: ${enumCount > 0 ? 'Yes' : 'No'}`);
    
    if (tableCount === 0) {
      console.warn('\n⚠️  Warning: No tables detected. Check:');
      console.warn('  1. Project ref is correct');
      console.warn('  2. You have access to the project');
      console.warn('  3. Schema is properly configured');
    }
    
  } catch (error) {
    console.error('❌ Error generating types:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not authenticated')) {
        console.log('\nTo authenticate:');
        console.log('  supabase login');
        console.log('  Or set SUPABASE_ACCESS_TOKEN environment variable');
      }
    }
    
    process.exit(1);
  }
}

regenerateTypes().catch(console.error);
