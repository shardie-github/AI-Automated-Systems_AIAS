/**
 * Health Check API Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "@/app/api/healthz/route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/env", () => ({
  env: {
    supabase: {
      url: "https://test.supabase.co",
      anonKey: "test-anon-key",
      serviceRoleKey: "test-service-key",
    },
    database: {
      url: "postgresql://test",
    },
  },
}));

vi.mock("@supabase/supabase-js", () => ({
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

vi.mock("@/lib/env-validation", () => ({
  validateEnvOnStartup: vi.fn(),
}));

describe("GET /api/healthz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 when all checks pass", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.timestamp).toBeDefined();
    expect(data.db).toBeDefined();
    expect(data.rest).toBeDefined();
    expect(data.auth).toBeDefined();
  });

  it("should return 503 when environment validation fails", async () => {
    const { validateEnvOnStartup } = await import("@/lib/env-validation");
    vi.mocked(validateEnvOnStartup).mockImplementation(() => {
      throw new Error("Environment validation failed");
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.ok).toBe(false);
    expect(data.error).toContain("Environment validation failed");
  });

  it("should include latency measurements", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.total_latency_ms).toBeDefined();
    expect(typeof data.total_latency_ms).toBe("number");
    if (data.db) {
      expect(data.db.latency_ms).toBeDefined();
    }
  });
});
