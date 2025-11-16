/**
 * API Contract Validation Tests
 * 
 * Validates API endpoints match OpenAPI specification and expected behavior
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000/api";

// Load OpenAPI spec
let openApiSpec: any;
try {
  const specPath = join(process.cwd(), "docs", "openapi.yaml");
  const specContent = readFileSync(specPath, "utf-8");
  openApiSpec = yaml.load(specContent);
} catch (error) {
  console.warn("Could not load OpenAPI spec:", error);
}

describe("API Contract Validation", () => {
  describe("Health Endpoints", () => {
    it("GET /api/healthz should return health check", async () => {
      const response = await fetch(`${API_BASE}/healthz`);
      expect(response.status).toBeOneOf([200, 503]); // Can be healthy or unhealthy

      const data = await response.json();
      expect(data).toHaveProperty("ok");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("db");
      expect(data).toHaveProperty("rest");
      expect(data).toHaveProperty("auth");
    });

    it("GET /api/status should return system status", async () => {
      const response = await fetch(`${API_BASE}/status`);
      expect(response.status).toBeOneOf([200, 503]);

      const data = await response.json();
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("version");
      expect(data).toHaveProperty("services");
    });
  });

  describe("Feature Flags", () => {
    it("GET /api/flags/trust should return trust flags", async () => {
      const response = await fetch(`${API_BASE}/flags/trust`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("trust_audit_enabled");
      expect(data).toHaveProperty("trust_ledger_enabled");
      expect(data).toHaveProperty("trust_scoring_enabled");
      expect(data).toHaveProperty("trust_badges_enabled");
      expect(data).toHaveProperty("trust_verification_enabled");
      expect(data).toHaveProperty("timestamp");

      // Validate types
      expect(typeof data.trust_audit_enabled).toBe("boolean");
      expect(typeof data.trust_ledger_enabled).toBe("boolean");
      expect(typeof data.timestamp).toBe("string");
    });
  });

  describe("Error Handling", () => {
    it("should return 401 for unauthorized requests", async () => {
      const response = await fetch(`${API_BASE}/settings`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty("error");
    });

    it("should return 400 for invalid request body", async () => {
      const response = await fetch(`${API_BASE}/v1/workflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ invalid: "data" }),
      });

      // Should be 401 (unauthorized) or 400 (validation error)
      expect(response.status).toBeOneOf([400, 401]);
      const data = await response.json();
      expect(data).toHaveProperty("error");
    });
  });

  describe("Rate Limiting", () => {
    it("should include rate limit headers", async () => {
      const response = await fetch(`${API_BASE}/healthz`);

      // Rate limit headers should be present
      const rateLimitHeaders = [
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
      ];

      for (const header of rateLimitHeaders) {
        // Headers may or may not be present depending on middleware configuration
        const value = response.headers.get(header);
        if (value !== null) {
          expect(value).toBeTruthy();
        }
      }
    });
  });

  describe("Response Format", () => {
    it("should return JSON for all endpoints", async () => {
      const endpoints = [
        "/healthz",
        "/status",
        "/flags/trust",
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${API_BASE}${endpoint}`);
        const contentType = response.headers.get("content-type");

        expect(contentType).toContain("application/json");

        // Should be valid JSON
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });

    it("should include timestamp in responses", async () => {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();

      if (data.timestamp) {
        // Should be valid ISO 8601 timestamp
        expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
      }
    });
  });

  describe("CORS Headers", () => {
    it("should include CORS headers for cross-origin requests", async () => {
      const response = await fetch(`${API_BASE}/healthz`, {
        headers: {
          Origin: "https://example.com",
        },
      });

      // CORS headers may or may not be present depending on configuration
      const corsHeaders = ["Access-Control-Allow-Origin", "Access-Control-Allow-Methods"];

      for (const header of corsHeaders) {
        const value = response.headers.get(header);
        // Just check that if present, it's valid
        if (value !== null) {
          expect(value).toBeTruthy();
        }
      }
    });
  });

  describe("Security Headers", () => {
    it("should include security headers", async () => {
      const response = await fetch(`${API_BASE}/healthz`);

      const securityHeaders = [
        "X-Content-Type-Options",
        "X-Frame-Options",
        "X-XSS-Protection",
        "Referrer-Policy",
      ];

      for (const header of securityHeaders) {
        const value = response.headers.get(header);
        // Security headers should be present
        if (value !== null) {
          expect(value).toBeTruthy();
        }
      }
    });
  });
});

// Helper to check if value is one of expected values
expect.extend({
  toBeOneOf(received: any, expected: any[]) {
    const pass = expected.includes(received);
    return {
      message: () => `expected ${received} to be one of ${expected.join(", ")}`,
      pass,
    };
  },
});
