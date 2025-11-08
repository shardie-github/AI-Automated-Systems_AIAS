/**
 * Runtime Environment Variable Validation
 * 
 * This module provides runtime validation for environment variables.
 * Import and call validateEnvOnStartup() in your app initialization.
 */

import { validateEnv } from "./env";

/**
 * Validate environment variables at application startup
 * Call this in your app's entry point or middleware
 */
export function validateEnvOnStartup(): void {
  if (typeof window !== 'undefined') {
    // Client-side: Environment variables are already validated at build time
    // Next.js will fail the build if required NEXT_PUBLIC_* vars are missing
    return;
  }

  // Server-side: Validate required environment variables
  const validation = validateEnv();
  
  if (!validation.valid) {
    const errorMessage = [
      '❌ Application startup failed: Missing required environment variables',
      '',
      ...validation.errors.map(err => `  - ${err}`),
      '',
      'Please set these variables in:',
      '  - Vercel: Dashboard → Settings → Environment Variables',
      '  - Supabase: Dashboard → Settings → API',
      '  - GitHub Actions: Repository → Settings → Secrets',
      '  - Local: .env.local file',
      '',
      'See .env.example for all required variables.'
    ].join('\n');

    console.error(errorMessage);
    
    // In production, fail fast
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables. See logs for details.');
    }
  }
}

/**
 * Validate environment variables for API routes
 * Use this in API route handlers that require specific variables
 */
export function validateApiEnv(requiredVars: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}
