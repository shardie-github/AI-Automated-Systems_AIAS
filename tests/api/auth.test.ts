/**
 * Authentication API Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as signupPOST } from "@/app/api/auth/signup/route";
import { NextRequest } from "next/server";

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
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

vi.mock("@/lib/telemetry/track", () => ({
  track: vi.fn(() => Promise.resolve()),
}));

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should login successfully with valid credentials", async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: "user-123", email: "test@example.com" },
        session: { access_token: "token" },
      },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const response = await loginPOST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe("test@example.com");
    expect(data.session).toBeDefined();
  });

  it("should return 401 with invalid credentials", async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid credentials" },
    });

    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    });

    const response = await loginPOST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
  });

  it("should validate request body", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email",
      }),
    });

    const response = await loginPOST(request);

    expect(response.status).toBe(400);
  });
});

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create account successfully", async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: {
        user: { id: "user-123", email: "new@example.com" },
        session: null,
      },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "new@example.com",
        password: "password123",
        name: "Test User",
      }),
    });

    const response = await signupPOST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe("new@example.com");
    expect(data.message).toContain("created");
  });

  it("should validate password length", async () => {
    const request = new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "short",
      }),
    });

    const response = await signupPOST(request);

    expect(response.status).toBe(400);
  });

  it("should return 400 if account already exists", async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "User already registered" },
    });

    const request = new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "existing@example.com",
        password: "password123",
      }),
    });

    const response = await signupPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
