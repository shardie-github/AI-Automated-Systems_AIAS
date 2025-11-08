import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Supabase Client Configuration
 * 
 * All values are loaded dynamically from environment variables.
 * No hardcoded credentials are used.
 * 
 * Environment variables are sourced from:
 * - Vercel: Dashboard → Settings → Environment Variables
 * - Supabase: Dashboard → Settings → API
 * - GitHub Actions: Repository → Settings → Secrets
 * - Local: .env.local file
 */

// Get environment variables dynamically
// Support both Vite (import.meta.env) and Next.js (process.env) patterns
function getEnvVar(key: string, viteKey?: string): string {
  // Try Vite environment variables first (for Vite-based builds)
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    const viteValue = import.meta.env[viteKey || key] || import.meta.env[`VITE_${key}`];
    if (viteValue) return viteValue;
  }
  
  // Try Next.js environment variables
  if (typeof process !== 'undefined' && process.env) {
    const nextValue = process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
    if (nextValue) return nextValue;
  }
  
  // Throw error if not found (no fallback values for security)
  throw new Error(
    `Missing required environment variable: ${key}\n` +
    `Please set this variable in:\n` +
    `- Vercel: Dashboard → Settings → Environment Variables\n` +
    `- Supabase: Dashboard → Settings → API\n` +
    `- GitHub Actions: Repository → Settings → Secrets\n` +
    `- Local: .env.local file`
  );
}

const SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL');
const SUPABASE_PUBLISHABLE_KEY = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});