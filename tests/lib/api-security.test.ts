/**
 * Tests for API Security Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  sanitizeHTML,
  sanitizeObject,
  validateInput,
  checkRequestSize,
  maskSensitiveData,
  validationSchemas,
  detectSQLInjection,
  detectXSS,
  validateAPIKey,
} from '@/lib/security/api-security';

describe('lib/security/api-security', () => {
  describe('sanitizeInput', () => {
    it('should remove null bytes', () => {
      const input = 'test\0string';
      const result = sanitizeInput(input);
      
      expect(result).toBe('teststring');
      expect(result).not.toContain('\0');
    });

    it('should trim whitespace', () => {
      const input = '  test string  ';
      const result = sanitizeInput(input);
      
      expect(result).toBe('test string');
    });

    it('should remove control characters', () => {
      const input = 'test\x01\x02\x03string';
      const result = sanitizeInput(input);
      
      expect(result).toBe('teststring');
    });

    it('should preserve newlines and tabs', () => {
      const input = 'test\n\tstring';
      const result = sanitizeInput(input);
      
      expect(result).toBe('test\n\tstring');
    });
  });

  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const html = '<div>Hello</div><script>alert("xss")</script>';
      const result = sanitizeHTML(html);
      
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove dangerous attributes', () => {
      const html = '<div onclick="alert(\'xss\')">Hello</div>';
      const result = sanitizeHTML(html);
      
      expect(result).not.toContain('onclick');
    });

    it('should preserve safe HTML', () => {
      const html = '<div><p>Hello <strong>World</strong></p></div>';
      const result = sanitizeHTML(html);
      
      expect(result).toContain('<div>');
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string values in object', () => {
      const obj = {
        name: '  John Doe  ',
        email: 'test@example.com',
        description: 'Test\0description',
      };
      
      const result = sanitizeObject(obj);
      
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('test@example.com');
      expect(result.description).toBe('Testdescription');
    });

    it('should handle nested objects', () => {
      const obj = {
        user: {
          name: '  John  ',
          profile: {
            bio: '  Bio text  ',
          },
        },
      };
      
      const result = sanitizeObject(obj);
      
      expect(result.user.name).toBe('John');
      expect(result.user.profile.bio).toBe('Bio text');
    });

    it('should preserve non-string values', () => {
      const obj = {
        name: 'John',
        age: 30,
        active: true,
        tags: ['tag1', 'tag2'],
      };
      
      const result = sanitizeObject(obj);
      
      expect(result.age).toBe(30);
      expect(result.active).toBe(true);
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('validateInput', () => {
    it('should validate input with Zod schema', () => {
      const schema = validationSchemas.email;
      const input = 'test@example.com';
      
      const result = validateInput(schema, input);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('test@example.com');
    });

    it('should reject invalid input', () => {
      const schema = validationSchemas.email;
      const input = 'not-an-email';
      
      const result = validateInput(schema, input);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate UUID', () => {
      const schema = validationSchemas.uuid;
      const input = '123e4567-e89b-12d3-a456-426614174000';
      
      const result = validateInput(schema, input);
      
      expect(result.success).toBe(true);
    });
  });

  describe('checkRequestSize', () => {
    it('should allow requests within size limit', () => {
      const body = JSON.stringify({ data: 'test' });
      const result = checkRequestSize(body, 1000);
      
      expect(result).toBe(true);
    });

    it('should reject requests exceeding size limit', () => {
      const body = 'x'.repeat(2000);
      const result = checkRequestSize(body, 1000);
      
      expect(result).toBe(false);
    });

    it('should handle object bodies', () => {
      const body = { data: 'test' };
      const result = checkRequestSize(body, 1000);
      
      expect(result).toBe(true);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask sensitive data in strings', () => {
      const data = 'password=secret123&api_key=sk_test_123456';
      const result = maskSensitiveData(data);
      
      expect(result).toContain('password=***');
      expect(result).toContain('api_key=***');
    });

    it('should mask credit card numbers', () => {
      const data = 'card=1234-5678-9012-3456';
      const result = maskSensitiveData(data);
      
      expect(result).toContain('****-****-****-****');
    });

    it('should mask SSNs', () => {
      const data = 'ssn=123-45-6789';
      const result = maskSensitiveData(data);
      
      expect(result).toContain('***-**-****');
    });
  });

  describe('detectSQLInjection', () => {
    it('should detect SQL injection patterns', () => {
      expect(detectSQLInjection("'; DROP TABLE users; --")).toBe(true);
      expect(detectSQLInjection("SELECT * FROM users")).toBe(true);
      expect(detectSQLInjection("normal text")).toBe(false);
    });
  });

  describe('detectXSS', () => {
    it('should detect XSS patterns', () => {
      expect(detectXSS('<script>alert("xss")</script>')).toBe(true);
      expect(detectXSS('javascript:alert("xss")')).toBe(true);
      expect(detectXSS('normal text')).toBe(false);
    });
  });

  describe('validateAPIKey', () => {
    it('should validate UUID format API keys', () => {
      const valid = validateAPIKey('123e4567-e89b-12d3-a456-426614174000');
      expect(valid).toBe(true);
    });

    it('should validate base64 format API keys', () => {
      const valid = validateAPIKey('dGVzdC1hcGkta2V5LWZvci12YWxpZGF0aW9u');
      expect(valid).toBe(true);
    });

    it('should reject invalid API keys', () => {
      const invalid = validateAPIKey('invalid-key');
      expect(invalid).toBe(false);
    });
  });

  describe('validationSchemas', () => {
    it('should validate UUID format', () => {
      const valid = validationSchemas.uuid.safeParse('123e4567-e89b-12d3-a456-426614174000');
      expect(valid.success).toBe(true);
      
      const invalid = validationSchemas.uuid.safeParse('not-a-uuid');
      expect(invalid.success).toBe(false);
    });

    it('should validate email format', () => {
      const valid = validationSchemas.email.safeParse('test@example.com');
      expect(valid.success).toBe(true);
      
      const invalid = validationSchemas.email.safeParse('not-an-email');
      expect(invalid.success).toBe(false);
    });

    it('should validate URL format', () => {
      const valid = validationSchemas.url.safeParse('https://example.com');
      expect(valid.success).toBe(true);
      
      const invalid = validationSchemas.url.safeParse('not-a-url');
      expect(invalid.success).toBe(false);
    });

    it('should validate pagination schema', () => {
      const valid = validationSchemas.pagination.safeParse({ page: 1, limit: 20 });
      expect(valid.success).toBe(true);
      
      const invalid = validationSchemas.pagination.safeParse({ page: 0, limit: 200 });
      expect(invalid.success).toBe(false);
    });
  });
});
