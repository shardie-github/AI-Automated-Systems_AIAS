/**
 * Tests for Environment Variable Management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('lib/env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  describe('env object', () => {
    it('should load Supabase URL from NEXT_PUBLIC_SUPABASE_URL', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://test';

      const { env } = await import('@/lib/env');
      expect(env.supabase.url).toBe('https://test.supabase.co');
    });

    it('should fallback to SUPABASE_URL if NEXT_PUBLIC_SUPABASE_URL not set', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.SUPABASE_URL = 'https://fallback.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://test';

      const { env } = await import('@/lib/env');
      expect(env.supabase.url).toBe('https://fallback.supabase.co');
    });

    it('should detect runtime environment', async () => {
      process.env.VERCEL = '1';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://test';

      const { env } = await import('@/lib/env');
      expect(env.runtime.env).toBe('vercel');
    });

    it('should use default values for optional variables', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://test';

      const { env } = await import('@/lib/env');
      expect(env.app.env).toBe('production');
      expect(env.app.logLevel).toBe('info');
      expect(env.storage.uploadBucket).toBe('public');
    });
  });

  describe('validateEnv', () => {
    it('should validate required environment variables', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://test';

      const { validateEnv } = await import('@/lib/env');
      const result = validateEnv();
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing required variables', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_URL;
      delete process.env.DATABASE_URL;

      const { validateEnv } = await import('@/lib/env');
      const result = validateEnv();
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getOptionalEnv', () => {
    it('should return undefined for missing optional variables', async () => {
      const { getOptionalEnv } = await import('@/lib/env');
      const result = getOptionalEnv('NONEXISTENT_VAR');
      
      expect(result).toBeUndefined();
    });

    it('should return value for existing optional variables', async () => {
      process.env.OPTIONAL_VAR = 'test-value';

      const { getOptionalEnv } = await import('@/lib/env');
      const result = getOptionalEnv('OPTIONAL_VAR');
      
      expect(result).toBe('test-value');
    });
  });
});
