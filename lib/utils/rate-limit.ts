/**
 * Rate Limiting Utility
 * 
 * Provides rate limiting for API routes to prevent abuse.
 * Uses in-memory store for simple cases, can be extended to use Redis for distributed systems.
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  check(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;
    const entry = this.store[key];

    // If no entry or expired, create new entry
    if (!entry || now > entry.resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    // If limit exceeded
    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    delete this.store[identifier];
  }

  /**
   * Get current count for an identifier
   */
  getCount(identifier: string): number {
    const entry = this.store[identifier];
    if (!entry || Date.now() > entry.resetTime) {
      return 0;
    }
    return entry.count;
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limit middleware for API routes
 * 
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const ip = request.headers.get('x-forwarded-for') || 'unknown';
 *   const limit = rateLimit(ip, 10, 60000); // 10 requests per minute
 *   
 *   if (!limit.allowed) {
 *     return new Response('Too Many Requests', { status: 429 });
 *   }
 *   
 *   // ... your handler
 * }
 * ```
 */
export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
) {
  return rateLimiter.check(identifier, maxRequests, windowMs);
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
