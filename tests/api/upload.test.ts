/**
 * File Upload API Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST, GET } from '@/app/api/upload/route';
import { NextRequest } from 'next/server';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({
        data: {
          user: { id: 'test-user-id' },
        },
        error: null,
      })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({
          data: { id: 'test-file-id' },
          error: null,
        })),
        getPublicUrl: vi.fn(() => ({
          data: {
            publicUrl: 'https://example.com/file.jpg',
          },
        })),
      })),
    },
  })),
}));

// Mock file upload service
vi.mock('@/lib/security/file-upload', () => ({
  uploadFileSecure: vi.fn(() => ({
    success: true,
    fileUrl: 'https://example.com/file.jpg',
    filePath: 'uploads/test-user-id/test-file.jpg',
    fileId: 'test-file-id',
  })),
  validateFileSize: vi.fn(() => ({ valid: true })),
  validateFileType: vi.fn(() => ({ valid: true })),
  sanitizeFilename: vi.fn((name: string) => name),
}));

describe('POST /api/upload', () => {
  it('should upload file successfully', async () => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.fileUrl).toBeDefined();
  });

  it('should reject unauthorized requests', async () => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should reject requests without file', async () => {
    const formData = new FormData();

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No file provided');
  });
});

describe('GET /api/upload', () => {
  it('should return upload configuration', async () => {
    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.maxSizeBytes).toBeDefined();
    expect(data.allowedMimeTypes).toBeDefined();
    expect(data.allowedExtensions).toBeDefined();
  });

  it('should reject unauthorized requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
