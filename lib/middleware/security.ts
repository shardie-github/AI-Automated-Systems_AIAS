/**
 * Security Middleware
 * 
 * Comprehensive security middleware for API routes and pages.
 * Provides CSRF protection, input validation, security headers, and more.
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

/**
 * Security configuration
 */
export interface SecurityConfig {
  enableCSRF?: boolean;
  enableRateLimit?: boolean;
  rateLimitMax?: number;
  rateLimitWindow?: number;
  allowedOrigins?: string[];
  enableCORS?: boolean;
}

const defaultConfig: SecurityConfig = {
  enableCSRF: true,
  enableRateLimit: true,
  rateLimitMax: 100,
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  allowedOrigins: [],
  enableCORS: false,
};

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(request: NextRequest, token: string): boolean {
  const headerToken = request.headers.get("x-csrf-token");
  const cookieToken = request.cookies.get("csrf-token")?.value;

  // Check header or cookie token matches
  return headerToken === token || cookieToken === token;
}

/**
 * Security middleware for API routes
 */
export function securityMiddleware(
  request: NextRequest,
  config: SecurityConfig = {}
): NextResponse | null {
  const securityConfig = { ...defaultConfig, ...config };
  const ip = getClientIP(request);
  const path = request.nextUrl.pathname;

  // Rate limiting
  if (securityConfig.enableRateLimit) {
    const limit = rateLimit(
      ip,
      securityConfig.rateLimitMax!,
      securityConfig.rateLimitWindow!
    );

    if (!limit.allowed) {
      logger.warn("Rate limit exceeded", undefined, { ip, path });
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((limit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(securityConfig.rateLimitMax),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(limit.resetTime),
          },
        }
      );
    }
  }

  // CORS validation
  if (securityConfig.enableCORS && securityConfig.allowedOrigins!.length > 0) {
    const origin = request.headers.get("origin");
    if (origin && !securityConfig.allowedOrigins!.includes(origin)) {
      logger.warn("CORS violation", undefined, { origin, path });
      return NextResponse.json({ error: "CORS policy violation" }, { status: 403 });
    }
  }

  // CSRF protection for state-changing methods
  if (securityConfig.enableCSRF && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const csrfToken = request.headers.get("x-csrf-token");
    if (!csrfToken) {
      logger.warn("Missing CSRF token", undefined, { ip, path, method: request.method });
      return NextResponse.json({ error: "CSRF token required" }, { status: 403 });
    }
  }

  return null; // Continue processing
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Remove server information
  response.headers.delete("x-powered-by");

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // HSTS (only in production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

/**
 * Sanitize request body to prevent injection attacks
 */
export function sanitizeRequestBody(body: any): any {
  if (typeof body !== "object" || body === null) {
    return body;
  }

  const sanitized: any = Array.isArray(body) ? [] : {};

  for (const [key, value] of Object.entries(body)) {
    // Skip dangerous keys
    if (key.startsWith("__") || key.includes("prototype") || key.includes("constructor")) {
      continue;
    }

    if (typeof value === "string") {
      // Basic sanitization - remove script tags and dangerous patterns
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "");
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeRequestBody(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate request size to prevent DoS
 */
export function validateRequestSize(request: NextRequest, maxSize: number = 1024 * 1024): boolean {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > maxSize) {
      return false;
    }
  }
  return true;
}

/**
 * Check for suspicious patterns in request
 */
export function detectSuspiciousActivity(request: NextRequest): {
  suspicious: boolean;
  reason?: string;
} {
  const userAgent = request.headers.get("user-agent") || "";
  const path = request.nextUrl.pathname;
  const query = request.nextUrl.search;

  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /('|(\\')|(;)|(\\;)|(--)|(\\--)|(\/\*)|(\\\/\*)|(\*\/)|(\\\*\/))/i,
  ];

  // Check for XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  // Check user agent for bots/scrapers
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
  ];

  const fullQuery = path + query;

  // Check SQL injection
  for (const pattern of sqlPatterns) {
    if (pattern.test(fullQuery)) {
      return { suspicious: true, reason: "SQL injection pattern detected" };
    }
  }

  // Check XSS
  for (const pattern of xssPatterns) {
    if (pattern.test(fullQuery)) {
      return { suspicious: true, reason: "XSS pattern detected" };
    }
  }

  // Check user agent
  for (const pattern of suspiciousUserAgents) {
    if (pattern.test(userAgent)) {
      return { suspicious: true, reason: "Suspicious user agent detected" };
    }
  }

  return { suspicious: false };
}
