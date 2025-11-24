/**
 * Settings API Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, PUT } from "@/app/api/settings/route";
import { NextRequest } from "next/server";

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  rpc: vi.fn(),
  from: vi.fn(() => ({
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
    })),
  })),
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

vi.mock("@/lib/env", () => ({
  env: {
    supabase: {
      url: "https://test.supabase.co",
      serviceRoleKey: "test-key",
    },
  },
}));

describe("GET /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return settings for authenticated user", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    mockSupabaseClient.rpc.mockResolvedValue({
      data: {
        email_notifications_enabled: true,
        theme: "dark",
      },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/settings", {
      headers: {
        authorization: "Bearer test-token",
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.settings).toBeDefined();
  });

  it("should return 401 without authentication", async () => {
    const request = new NextRequest("http://localhost/api/settings");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });
});

describe("PUT /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update settings successfully", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    mockSupabaseClient.rpc.mockResolvedValue({
      data: {},
      error: null,
    });

    const request = new NextRequest("http://localhost/api/settings", {
      method: "PUT",
      headers: {
        authorization: "Bearer test-token",
      },
      body: JSON.stringify({
        theme: "dark",
        email_notifications_enabled: true,
      }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.settings).toBeDefined();
  });

  it("should validate settings update schema", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/settings", {
      method: "PUT",
      headers: {
        authorization: "Bearer test-token",
      },
      body: JSON.stringify({
        theme: "invalid-theme",
      }),
    });

    const response = await PUT(request);

    expect(response.status).toBe(400);
  });
});
