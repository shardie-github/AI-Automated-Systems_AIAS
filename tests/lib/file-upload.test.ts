/**
 * File Upload Security Tests
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeFilename,
  validateFileSize,
  validateFileType,
} from '@/lib/security/file-upload';

describe('sanitizeFilename', () => {
  it('should remove path components', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFilename('/path/to/file.jpg')).toBe('file.jpg');
  });

  it('should remove null bytes', () => {
    expect(sanitizeFilename('file\0name.jpg')).toBe('file_name.jpg');
  });

  it('should remove special characters', () => {
    expect(sanitizeFilename('file<>name.jpg')).toBe('file__name.jpg');
    expect(sanitizeFilename('file@#$name.jpg')).toBe('file___name.jpg');
  });

  it('should limit filename length', () => {
    const longName = 'a'.repeat(300) + '.jpg';
    expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255);
  });

  it('should remove leading/trailing dots and dashes', () => {
    expect(sanitizeFilename('.file.jpg')).toBe('file.jpg');
    expect(sanitizeFilename('file.jpg.')).toBe('file.jpg');
    expect(sanitizeFilename('-file.jpg')).toBe('file.jpg');
  });
});

describe('validateFileSize', () => {
  const config = {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [],
    allowedExtensions: [],
    requireAuth: true,
    storageBucket: 'public',
  };

  it('should accept valid file size', () => {
    const result = validateFileSize(5 * 1024 * 1024, config);
    expect(result.valid).toBe(true);
  });

  it('should reject file exceeding max size', () => {
    const result = validateFileSize(15 * 1024 * 1024, config);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds maximum');
  });

  it('should reject empty file', () => {
    const result = validateFileSize(0, config);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });
});

describe('validateFileType', () => {
  const config = {
    maxSizeBytes: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    requireAuth: true,
    storageBucket: 'public',
  };

  it('should accept valid file type', () => {
    const result = validateFileType('image/jpeg', 'test.jpg', config);
    expect(result.valid).toBe(true);
  });

  it('should reject disallowed MIME type', () => {
    const result = validateFileType('application/x-executable', 'test.exe', config);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('should reject disallowed extension', () => {
    const result = validateFileType('image/jpeg', 'test.exe', config);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('extension not allowed');
  });

  it('should reject mismatched MIME type and extension', () => {
    const result = validateFileType('image/jpeg', 'test.pdf', config);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('does not match');
  });
});
