/**
 * Vercel Edge Config Utility
 * 
 * Provides a unified interface for accessing Edge Config,
 * useful for feature flags, A/B testing, and dynamic configuration.
 * 
 * Setup:
 * 1. Create an Edge Config in your Vercel dashboard
 * 2. Add EDGE_CONFIG to environment variables
 * 3. Use this utility to read configuration values
 * 
 * Edge Config is globally distributed and read-optimized,
 * making it perfect for feature flags and configuration that
 * needs to be updated without redeploying.
 */

import { get } from '@vercel/edge-config';
import { logger } from '@/lib/logging/structured-logger';

/**
 * Get a value from Edge Config
 * Returns null if the key doesn't exist or Edge Config is not configured
 */
export async function getEdgeConfigValue<T = unknown>(key: string): Promise<T | null> {
  try {
    if (!process.env.EDGE_CONFIG) {
      logger.warn('Edge Config not configured', { key });
      return null;
    }

    const value = await get<T>(key);
    return value ?? null;
  } catch (error) {
    logger.error('Failed to get Edge Config value', error instanceof Error ? error : new Error(String(error)), {
      key,
    });
    return null;
  }
}

/**
 * Get multiple values from Edge Config
 */
export async function getEdgeConfigValues<T extends Record<string, unknown>>(
  keys: string[]
): Promise<Partial<T>> {
  try {
    if (!process.env.EDGE_CONFIG) {
      logger.warn('Edge Config not configured', { keys });
      return {};
    }

    const values: Partial<T> = {};
    for (const key of keys) {
      const value = await get<T[keyof T]>(key);
      if (value !== undefined) {
        values[key as keyof T] = value;
      }
    }
    return values;
  } catch (error) {
    logger.error('Failed to get Edge Config values', error instanceof Error ? error : new Error(String(error)), {
      keys,
    });
    return {};
  }
}

/**
 * Check if a feature flag is enabled
 * Returns false if the flag doesn't exist or Edge Config is not configured
 */
export async function isFeatureEnabled(flagName: string): Promise<boolean> {
  const value = await getEdgeConfigValue<boolean>(`feature:${flagName}`);
  return value === true;
}

/**
 * Get feature flag value with default
 */
export async function getFeatureFlag<T>(flagName: string, defaultValue: T): Promise<T> {
  const value = await getEdgeConfigValue<T>(`feature:${flagName}`);
  return value ?? defaultValue;
}

/**
 * Get A/B test variant for a user
 * Returns the variant name or null if not configured
 */
export async function getABTestVariant(testName: string, userId?: string): Promise<string | null> {
  if (!userId) {
    return null;
  }

  // Use a hash of userId to consistently assign variants
  const hash = userId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  const variants = await getEdgeConfigValue<string[]>(`ab:${testName}:variants`);
  if (!variants || variants.length === 0) {
    return null;
  }

  const index = Math.abs(hash) % variants.length;
  return variants[index] ?? null;
}

/**
 * Get configuration value with type safety
 */
export async function getConfig<T>(key: string, defaultValue: T): Promise<T> {
  const value = await getEdgeConfigValue<T>(key);
  return value ?? defaultValue;
}

/**
 * Check if Edge Config is available
 */
export function isEdgeConfigAvailable(): boolean {
  return !!process.env.EDGE_CONFIG;
}
