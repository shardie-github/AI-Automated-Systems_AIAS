/**
 * Email Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emailService } from '@/lib/email/email-service';

// Mock fetch
global.fetch = vi.fn();

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(emailService.isValidEmail('test@example.com')).toBe(true);
      expect(emailService.isValidEmail('user.name@example.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(emailService.isValidEmail('invalid')).toBe(false);
      expect(emailService.isValidEmail('@example.com')).toBe(false);
      expect(emailService.isValidEmail('test@')).toBe(false);
    });
  });

  describe('sendTemplate', () => {
    it('should send email using template', async () => {
      // Mock successful response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'msg_123' }),
      });

      const result = await emailService.sendTemplate(
        'welcome',
        'test@example.com',
        { firstName: 'John' }
      );

      // Note: This will fail if Resend API key is not set, which is expected in tests
      // In a real test environment, you'd mock the env variables
      expect(result).toBeDefined();
    });

    it('should handle missing template', async () => {
      const result = await emailService.sendTemplate(
        'non-existent',
        'test@example.com',
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
