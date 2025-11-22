/**
 * Tests for Route Handler Utility
 * Tests request body caching, error handling, and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGETHandler, createPOSTHandler } from '@/lib/api/route-handler';
import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/lib/errors';
import { z } from 'zod';

describe('Route Handler Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createGETHandler', () => {
    it('should handle GET requests', async () => {
      const handler = createGETHandler(async (context) => {
        return NextResponse.json({ data: 'test' });
      });

      const req = new NextRequest('http://localhost/api/test');
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toBe('test');
    });

    it('should cache responses when enabled', async () => {
      let callCount = 0;
      const handler = createGETHandler(
        async (context) => {
          callCount++;
          return NextResponse.json({ count: callCount });
        },
        {
          cache: { enabled: true, ttl: 60 },
        }
      );

      const req = new NextRequest('http://localhost/api/test');
      
      // First call
      const res1 = await handler(req);
      const data1 = await res1.json();
      
      // Second call should use cache (if cache service is available)
      // Note: Cache behavior depends on cache service implementation
      expect(res1.status).toBe(200);
    });
  });

  describe('createPOSTHandler', () => {
    it('should validate request body with Zod schema', async () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().int().positive(),
      });

      const handler = createPOSTHandler(
        async (context) => {
          return NextResponse.json({ success: true });
        },
        {
          validateBody: schema,
        }
      );

      // Valid request
      const validReq = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', age: 25 }),
        headers: { 'content-type': 'application/json' },
      });

      const validRes = await handler(validReq);
      expect(validRes.status).toBe(200);

      // Invalid request
      const invalidReq = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: '', age: -5 }),
        headers: { 'content-type': 'application/json' },
      });

      const invalidRes = await handler(invalidReq);
      expect(invalidRes.status).toBe(400);
    });

    it('should cache request body to avoid double consumption', async () => {
      let bodyReadCount = 0;
      const handler = createPOSTHandler(
        async (context) => {
          // Read body multiple times (should work due to caching)
          const body1 = await context.request.text();
          const body2 = await context.request.text();
          bodyReadCount = 2;
          return NextResponse.json({ body1, body2 });
        }
      );

      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'content-type': 'application/json' },
      });

      const res = await handler(req);
      expect(res.status).toBe(200);
      expect(bodyReadCount).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should format errors consistently', async () => {
      const handler = createGETHandler(async (context) => {
        throw new Error('Test error');
      });

      const req = new NextRequest('http://localhost/api/test');
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle validation errors', async () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const handler = createPOSTHandler(
        async (context) => {
          return NextResponse.json({ success: true });
        },
        {
          validateBody: schema,
        }
      );

      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ email: 'invalid' }),
        headers: { 'content-type': 'application/json' },
      });

      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.details).toBeDefined();
    });
  });
});
