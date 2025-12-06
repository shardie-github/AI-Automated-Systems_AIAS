/**
 * Next.js Middleware
 * 
 * Applies security headers, rate limiting, and other protections
 * to all routes.
 */

import { NextRequest, NextResponse } from "next/server";
import { addSecurityHeaders } from "@/lib/middleware/security";
import { detectSuspiciousActivity } from "@/lib/middleware/security";
import { rateLimit, getClientIP } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";
import { adminGuard, financialAdminGuard } from "@/lib/middleware/admin-guard";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = getClientIP(request);

  // Check admin access first (before rate limiting)
  const adminCheck = await adminGuard(request);
  if (adminCheck) return adminCheck;

  // Check financial admin access
  const financialCheck = await financialAdminGuard(request);
  if (financialCheck) return financialCheck;

  // Skip middleware for static files and API routes (handled separately)
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/static") ||
    path.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Detect suspicious activity
  const suspicious = detectSuspiciousActivity(request);
  if (suspicious.suspicious) {
    logger.warn("Suspicious activity detected", undefined, {
      ip,
      path,
      reason: suspicious.reason,
    });
    // Optionally block or rate limit more aggressively
  }

  // Global rate limiting for pages (more lenient than API)
  const limit = rateLimit(ip, 200, 60 * 1000); // 200 requests per minute
  if (!limit.allowed) {
    const response = NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
        },
      }
    );
    addSecurityHeaders(response);
    return response;
  }

  // Create response
  const response = NextResponse.next();

  // Add security headers
  addSecurityHeaders(response);

  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", "200");
  response.headers.set("X-RateLimit-Remaining", String(limit.remaining));
  response.headers.set("X-RateLimit-Reset", String(limit.resetTime));

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
