/**
 * Edge Runtime Compatible Rate Limiter
 * Simple in-memory rate limiting for Edge runtime (middleware)
 * 
 * Note: This is a per-instance rate limiter. For distributed rate limiting,
 * use Vercel KV or a Redis-compatible service that works in Edge runtime.
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// In-memory store (per Edge runtime instance)
// Note: This resets on cold starts, so it's not perfect for production
// For production, use Vercel KV or similar Edge-compatible storage
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit (Edge runtime compatible)
 * Uses in-memory storage or Vercel KV if available
 */
export async function checkRateLimitEdge(
  pathname: string,
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `rate_limit:${pathname}:${identifier}`;
  const now = Date.now();

  // Try Vercel KV first (Edge-compatible)
  if (typeof process !== 'undefined' && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      return await checkRateLimitVercelKV(key, config, now);
    } catch (error) {
      // Fall through to in-memory
      console.warn('Vercel KV rate limit check failed, using in-memory fallback:', error);
    }
  }

  // Fallback to in-memory
  return checkRateLimitInMemory(key, config, now);
}

/**
 * Check rate limit using Vercel KV (Edge-compatible)
 */
async function checkRateLimitVercelKV(
  key: string,
  config: RateLimitConfig,
  now: number
): Promise<RateLimitResult> {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    throw new Error('Vercel KV not configured');
  }

  const windowSeconds = Math.ceil(config.windowMs / 1000);

  try {
    // Get current count
    const getResponse = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${kvToken}`,
      },
    });

    let count = 1;
    if (getResponse.ok) {
      const data = await getResponse.json();
      const entry = data.result ? JSON.parse(data.result) : null;
      
      if (entry && entry.resetTime > now) {
        count = entry.count + 1;
      }
    }

    // Set count with TTL
    const resetTime = now + config.windowMs;
    await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: JSON.stringify({ count, resetTime }),
        expiration: windowSeconds,
      }),
    });

    if (count > config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - count,
      resetTime,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Check rate limit using in-memory store (fallback)
 */
function checkRateLimitInMemory(
  key: string,
  config: RateLimitConfig,
  now: number
): RateLimitResult {
  // Cleanup expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    for (const [k, entry] of inMemoryStore.entries()) {
      if (entry.resetTime < now) {
        inMemoryStore.delete(k);
      }
    }
  }

  const entry = inMemoryStore.get(key);

  // Cleanup expired entry
  if (entry && entry.resetTime < now) {
    inMemoryStore.delete(key);
  }

  const currentEntry = inMemoryStore.get(key);

  if (!currentEntry) {
    // New window
    const resetTime = now + config.windowMs;
    inMemoryStore.set(key, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Increment count
  currentEntry.count++;
  inMemoryStore.set(key, currentEntry);

  if (currentEntry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentEntry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - currentEntry.count,
    resetTime: currentEntry.resetTime,
  };
}
