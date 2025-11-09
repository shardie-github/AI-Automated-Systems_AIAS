/**
 * Tests for Telemetry Ingest Endpoint
 * Tests error handling, validation, and telemetry tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/telemetry/ingest/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/env', () => ({
  env: {
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
    },
  },
}));

vi.mock('@/lib/monitoring/enhanced-telemetry', () => ({
  telemetry: {
    trackPerformance: vi.fn(),
  },
}));

describe('POST /api/telemetry/ingest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should accept valid telemetry payload', async () => {
    const payload = {
      app: 'web',
      type: 'page_view',
      path: '/test',
      meta: { userId: '123' },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    });

    const req = new NextRequest('http://localhost/api/telemetry/ingest', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/ingest-telemetry'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should handle empty body', async () => {
    const req = new NextRequest('http://localhost/api/telemetry/ingest', {
      method: 'POST',
      body: '',
    });

    const res = await POST(req);
    
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/telemetry/ingest', {
      method: 'POST',
      body: 'invalid json{',
    });

    const res = await POST(req);
    
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle Supabase function errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: 'Internal error' }),
    });

    const req = new NextRequest('http://localhost/api/telemetry/ingest', {
      method: 'POST',
      body: JSON.stringify({ type: 'test' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);
    
    expect(res.status).toBe(500);
  });

  it('should track performance metrics', async () => {
    const { telemetry } = await import('@/lib/monitoring/enhanced-telemetry');
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    });

    const req = new NextRequest('http://localhost/api/telemetry/ingest', {
      method: 'POST',
      body: JSON.stringify({ type: 'test' }),
      headers: { 'content-type': 'application/json' },
    });

    await POST(req);
    
    expect(telemetry.trackPerformance).toHaveBeenCalled();
  });
});
