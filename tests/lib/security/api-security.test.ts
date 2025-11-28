import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  sanitizeHTML,
  detectSQLInjection,
  detectXSS,
  validateRequestBody,
} from '@/lib/security/api-security';
import { z } from 'zod';

describe('API Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
      expect(sanitized).toContain('World');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should preserve safe HTML', () => {
      const input = 'Hello <strong>World</strong>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBeTruthy();
    });
  });

  describe('sanitizeHTML', () => {
    it('should remove dangerous HTML', () => {
      const html = '<div onclick="alert(1)">Click me</div>';
      const sanitized = sanitizeHTML(html);
      expect(sanitized).not.toContain('onclick');
    });

    it('should preserve safe HTML elements', () => {
      const html = '<p>Safe content</p>';
      const sanitized = sanitizeHTML(html);
      expect(sanitized).toContain('Safe content');
    });
  });

  describe('detectSQLInjection', () => {
    it('should detect SQL injection attempts', () => {
      expect(detectSQLInjection("'; DROP TABLE users; --")).toBe(true);
      expect(detectSQLInjection("1' OR '1'='1")).toBe(true);
      expect(detectSQLInjection('SELECT * FROM users')).toBe(true);
    });

    it('should not flag safe input', () => {
      expect(detectSQLInjection('Hello World')).toBe(false);
      expect(detectSQLInjection('user@example.com')).toBe(false);
    });
  });

  describe('detectXSS', () => {
    it('should detect XSS attempts', () => {
      expect(detectXSS('<script>alert("xss")</script>')).toBe(true);
      expect(detectXSS('javascript:alert(1)')).toBe(true);
      expect(detectXSS('<img src=x onerror=alert(1)>')).toBe(true);
    });

    it('should not flag safe input', () => {
      expect(detectXSS('Hello World')).toBe(false);
      expect(detectXSS('<p>Safe HTML</p>')).toBe(false);
    });
  });

  describe('validateRequestBody', () => {
    it('should validate correct data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = { name: 'Test', age: 25 };
      const result = validateRequestBody(schema, data);

      expect((result as any).success).toBe(true);
      if ((result as any).success) {
        expect((result as any).data).toEqual(data);
      }
    });

    it('should reject invalid data', () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const data = { email: 'invalid-email' };
      const result = validateRequestBody(schema, data);

      expect((result as any).success).toBe(false);
    });
  });
});
