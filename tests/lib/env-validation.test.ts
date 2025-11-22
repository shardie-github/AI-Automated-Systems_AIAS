/**
 * Tests for Environment Variable Validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateEnvWithZod, validateApiEnv, getValidatedEnvVar } from '@/lib/env-validation';

describe('lib/env-validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  describe('validateEnvWithZod', () => {
    it('should validate correct environment variables', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.NODE_ENV = 'test';

      const result = validateEnvWithZod();
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.SUPABASE_URL).toBe('https://test.supabase.co');
    });

    it('should fail validation for missing required variables', () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.DATABASE_URL;

      const result = validateEnvWithZod();
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.errors.length).toBeGreaterThan(0);
    });

    it('should validate Stripe keys format', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

      const result = validateEnvWithZod();
      
      expect(result.success).toBe(true);
      expect(result.data?.STRIPE_SECRET_KEY).toBe('sk_test_123');
    });

    it('should reject invalid Stripe key format', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.STRIPE_SECRET_KEY = 'invalid-key';

      const result = validateEnvWithZod();
      
      expect(result.success).toBe(false);
    });
  });

  describe('validateApiEnv', () => {
    it('should validate required API environment variables', () => {
      process.env.REQUIRED_VAR_1 = 'value1';
      process.env.REQUIRED_VAR_2 = 'value2';

      const result = validateApiEnv(['REQUIRED_VAR_1', 'REQUIRED_VAR_2']);
      
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should return missing variables', () => {
      process.env.REQUIRED_VAR_1 = 'value1';
      delete process.env.REQUIRED_VAR_2;

      const result = validateApiEnv(['REQUIRED_VAR_1', 'REQUIRED_VAR_2']);
      
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('REQUIRED_VAR_2');
    });
  });

  describe('getValidatedEnvVar', () => {
    it('should return validated environment variable', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.NODE_ENV = 'test';

      const result = getValidatedEnvVar('SUPABASE_URL');
      
      expect(result).toBe('https://test.supabase.co');
    });

    it('should return undefined for invalid validation', () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const result = getValidatedEnvVar('SUPABASE_URL');
      
      expect(result).toBeUndefined();
    });
  });
});
