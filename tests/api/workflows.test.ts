/**
 * Workflows API Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/workflows/execute/route";
import { NextRequest } from "next/server";

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
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

vi.mock("@/lib/workflows/executor", () => ({
  executeWorkflow: vi.fn(),
}));

describe("POST /api/workflows/execute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute workflow successfully", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const { executeWorkflow } = await import("@/lib/workflows/executor");
    vi.mocked(executeWorkflow).mockResolvedValue({
      id: "exec-123",
      workflow_id: "workflow-123",
      status: "completed",
    } as any);

    const request = new NextRequest("http://localhost/api/workflows/execute", {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
      },
      body: JSON.stringify({
        workflowId: "workflow-123",
        trigger: {
          type: "manual",
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.execution).toBeDefined();
    expect(data.message).toContain("successfully");
  });

  it("should require authentication", async () => {
    const request = new NextRequest("http://localhost/api/workflows/execute", {
      method: "POST",
      body: JSON.stringify({
        workflowId: "workflow-123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should validate workflowId format", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/workflows/execute", {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
      },
      body: JSON.stringify({
        workflowId: "invalid-uuid",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
