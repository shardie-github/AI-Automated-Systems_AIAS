/**
 * Telemetry API Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/telemetry/ingest/route";
import { NextRequest } from "next/server";

// Mock fetch
global.fetch = vi.fn();

vi.mock("@/lib/env", () => ({
  env: {
    supabase: {
      url: "https://test.supabase.co",
      anonKey: "test-anon-key",
    },
  },
}));

vi.mock("@/lib/monitoring/enhanced-telemetry", () => ({
  telemetry: {
    trackPerformance: vi.fn(),
  },
}));

describe("POST /api/telemetry/ingest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should ingest telemetry successfully", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    });

    const request = new NextRequest("http://localhost/api/telemetry/ingest", {
      method: "POST",
      body: JSON.stringify({
        type: "page_view",
        path: "/dashboard",
        app: "web",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(global.fetch).toHaveBeenCalled();
  });

  it("should handle invalid JSON", async () => {
    const request = new NextRequest("http://localhost/api/telemetry/ingest", {
      method: "POST",
      body: "invalid json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("should proxy to Supabase Edge Function", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    });

    const request = new NextRequest("http://localhost/api/telemetry/ingest", {
      method: "POST",
      body: JSON.stringify({
        type: "event",
        meta: { key: "value" },
      }),
    });

    await POST(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/functions/v1/ingest-telemetry"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "content-type": "application/json",
        }),
      })
    );
  });
});
