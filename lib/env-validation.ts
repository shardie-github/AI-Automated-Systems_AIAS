/* eslint-disable no-process-env */
/**
 * Build-safe environment variable validation using Zod
 * 
 * This module provides validation that won't fail during build time
 * if environment variables are missing. Use SKIP_ENV_VALIDATION=true
 * during build to bypass validation.
 */

import { z } from 'zod';

const envSchema = z.object({
  // Public (exposed to browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  
  // Server-only
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  
  // Build flags
  SKIP_ENV_VALIDATION: z.string().optional().default('false'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  
  // Prisma
  PRISMA_CLIENT_ENGINE_TYPE: z.enum(['library', 'wasm', 'binary']).optional().default('library'),
});

// Skip validation during build if flag set
const skipValidation = 
  process.env.SKIP_ENV_VALIDATION === 'true' || 
  process.env.SKIP_ENV_VALIDATION === '1' ||
  process.env.NODE_ENV === 'production' && typeof window === 'undefined';

function getEnv() {
  if (skipValidation) {
    // Return process.env as-is during build
    return process.env as z.infer<typeof envSchema>;
  }
  
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    // Don't throw during build, just warn
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      console.warn('⚠️ Continuing build with missing env vars');
      return process.env as z.infer<typeof envSchema>;
    }
  }
  
  return (parsed.success ? parsed.data : process.env) as z.infer<typeof envSchema>;
}

export const validatedEnv = getEnv();
