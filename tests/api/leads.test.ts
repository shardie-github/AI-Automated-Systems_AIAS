/**
 * Leads API Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/leads/capture/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/lead-generation/lead-capture", () => ({
  leadCaptureService: {
    captureLead: vi.fn(),
  },
}));

describe("POST /api/leads/capture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should capture lead successfully", async () => {
    const { leadCaptureService } = await import("@/lib/lead-generation/lead-capture");
    vi.mocked(leadCaptureService.captureLead).mockResolvedValue({
      success: true,
      leadId: "lead-123",
      score: 85,
      qualified: true,
      nextAction: "contact",
    });

    const request = new NextRequest("http://localhost/api/leads/capture", {
      method: "POST",
      body: JSON.stringify({
        email: "lead@example.com",
        firstName: "John",
        lastName: "Doe",
        company: "Acme Corp",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.leadId).toBe("lead-123");
    expect(data.score).toBe(85);
    expect(data.qualified).toBe(true);
  });

  it("should validate email format", async () => {
    const request = new NextRequest("http://localhost/api/leads/capture", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("should handle capture failures", async () => {
    const { leadCaptureService } = await import("@/lib/lead-generation/lead-capture");
    vi.mocked(leadCaptureService.captureLead).mockResolvedValue({
      success: false,
      error: "Database error",
    });

    const request = new NextRequest("http://localhost/api/leads/capture", {
      method: "POST",
      body: JSON.stringify({
        email: "lead@example.com",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
