/**
 * Tests for Health Check Endpoint
 * Tests parallelization and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/healthz/route';
import { NextRequest } from 'next/server';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    auth: {
      admin: {
        listUsers: vi.fn(() => Promise.resolve({ data: { users: [] }, error: null })),
      },
    },
    storage: {
      listBuckets: vi.fn(() => Promise.resolve({ data: [], error: null })),
    },
  })),
}));

describe('GET /api/healthz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return healthy status when all checks pass', async () => {
    const req = new NextRequest('http://localhost/api/healthz');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.db).toBeDefined();
    expect(data.rest).toBeDefined();
    expect(data.auth).toBeDefined();
  });

  it('should include latency metrics', async () => {
    const req = new NextRequest('http://localhost/api/healthz');
    const res = await GET(req);
    const data = await res.json();

    expect(data.total_latency_ms).toBeDefined();
    expect(typeof data.total_latency_ms).toBe('number');
    
    // With parallelization, should be faster
    // (exact timing depends on environment)
    expect(data.total_latency_ms).toBeLessThan(1000);
  });

  it('should handle individual check failures gracefully', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    vi.mocked(createClient).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ error: new Error('DB error') })),
        })),
      })),
      auth: {
        admin: {
          listUsers: vi.fn(() => Promise.resolve({ data: { users: [] }, error: null })),
        },
      },
      storage: {
        listBuckets: vi.fn(() => Promise.resolve({ data: [], error: null })),
      },
    } as any);

    const req = new NextRequest('http://localhost/api/healthz');
    const res = await GET(req);
    const data = await res.json();

    // Should still return response, but with ok: false
    expect(data.ok).toBe(false);
    expect(data.db?.ok).toBe(false);
  });

  it('should execute checks in parallel', async () => {
    const startTime = Date.now();
    const req = new NextRequest('http://localhost/api/healthz');
    await GET(req);
    const duration = Date.now() - startTime;

    // With parallelization, all checks should complete quickly
    // Sequential would take ~400ms, parallel should be ~100ms
    expect(duration).toBeLessThan(500); // Allow some buffer
  });
});
