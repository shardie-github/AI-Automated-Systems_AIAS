/**
 * CSRF Protection Utilities
 * 
 * Provides CSRF token generation and validation.
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const CSRF_TOKEN_COOKIE = "csrf-token";
const CSRF_TOKEN_HEADER = "x-csrf-token";

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for server-side
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Set CSRF token in cookie
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
  return token;
}

/**
 * Get CSRF token from cookie
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_COOKIE)?.value || null;
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(request: NextRequest, expectedToken: string): boolean {
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER);
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;

  // Token must match either header or cookie
  return headerToken === expectedToken || cookieToken === expectedToken;
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(
  request: NextRequest,
  expectedToken: string | null
): { valid: boolean; response?: NextResponse } {
  // Only protect state-changing methods
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    return { valid: true };
  }

  if (!expectedToken) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "CSRF token not found" },
        { status: 403 }
      ),
    };
  }

  if (!validateCSRFToken(request, expectedToken)) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      ),
    };
  }

  return { valid: true };
}
