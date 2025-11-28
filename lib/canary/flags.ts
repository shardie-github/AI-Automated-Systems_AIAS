/**
 * Canary Deployment Feature Flags
 * Manages canary deployment flags and percentage rollouts
 */

import { cacheService } from '@/lib/performance/cache';

export interface CanaryFlagConfig {
  enabled: boolean;
  percentage: number; // 0-100
  stopLoss: {
    errorRate: number;
    p95Latency: number;
    enabled: boolean;
  };
}

/**
 * Get canary flag configuration
 * Checks environment variables first, then cache, then defaults
 */
export async function getCanaryFlag(
  canaryId: string
): Promise<CanaryFlagConfig> {
  const envEnabled = process.env[`CANARY_${canaryId.toUpperCase()}_ENABLED`];
  const envPercentage = process.env[`CANARY_${canaryId.toUpperCase()}_PERCENTAGE`];

  // Check cache (for runtime updates without redeploy)
  const cached = await cacheService.get<CanaryFlagConfig>(
    `canary:${canaryId}:config`,
    { ttl: 60 }
  );

  if (cached) {
    return cached;
  }

  // Default configuration
  const defaultConfig: CanaryFlagConfig = {
    enabled: envEnabled === 'true',
    percentage: envPercentage ? parseInt(envPercentage, 10) : 0,
    stopLoss: {
      errorRate: 0.05, // 5%
      p95Latency: 1000, // 1 second
      enabled: true,
    },
  };

  return defaultConfig;
}

/**
 * Check if user should receive canary version
 */
export function shouldUseCanary(
  _canaryId: string,
  userId: string,
  config: CanaryFlagConfig
): boolean {
  if (!config.enabled || config.percentage === 0) {
    return false;
  }

  // Hash user ID to consistent bucket (0-99)
  const hash = hashUserId(userId);
  return hash % 100 < config.percentage;
}

/**
 * Hash user ID to consistent number (0-99)
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
}

/**
 * Update canary flag configuration
 * Updates cache (for immediate effect) and should update env vars (for persistence)
 */
export async function updateCanaryFlag(
  canaryId: string,
  config: Partial<CanaryFlagConfig>
): Promise<void> {
  const current = await getCanaryFlag(canaryId);
  const updated = { ...current, ...config };

  // Update cache
  await cacheService.set(`canary:${canaryId}:config`, updated, { ttl: 3600 });

  // TODO: Update environment variable via:
  // - Vercel API
  // - Feature flag service API
  // - Database update

  console.log(`Canary flag ${canaryId} updated:`, updated);
}

/**
 * Disable canary deployment
 */
export async function disableCanary(canaryId: string): Promise<void> {
  await updateCanaryFlag(canaryId, {
    enabled: false,
    percentage: 0,
  });
}
