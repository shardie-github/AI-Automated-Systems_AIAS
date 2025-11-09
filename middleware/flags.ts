/**
 * Feature Flags Middleware
 * 
 * Handles feature flag evaluation and variant assignment for growth experiments.
 * Integrates with Supabase experiments table and flags.json configuration.
 * 
 * Usage:
 *   import { getFeatureFlag, getExperimentVariant } from '@/middleware/flags';
 *   
 *   const variant = await getExperimentVariant('onboarding-optimization', userId);
 *   if (variant === 'treatment') {
 *     // Show optimized onboarding
 *   }
 */

import { createClient } from '@supabase/supabase-js';
import flagsConfig from '../featureflags/flags.json';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface FeatureFlag {
  key: string;
  name: string;
  enabled: boolean;
  type: 'feature' | 'experiment';
  experiment_slug?: string;
  variants?: Array<{
    name: string;
    weight: number;
  }>;
  targeting?: {
    all_users?: boolean;
    segments?: string[];
  };
}

/**
 * Get feature flag configuration
 */
export function getFlagConfig(key: string): FeatureFlag | null {
  const flag = flagsConfig.flags.find(f => f.key === key);
  return flag || null;
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(key: string): boolean {
  const flag = getFlagConfig(key);
  if (!flag) return false;
  return flag.enabled;
}

/**
 * Get experiment variant for a user
 * Uses consistent hashing to ensure same user gets same variant
 */
export async function getExperimentVariant(
  experimentSlug: string,
  userId: string | null
): Promise<string> {
  // Check if experiment exists and is enabled
  const flag = flagsConfig.flags.find(
    f => f.experiment_slug === experimentSlug && f.enabled
  );
  
  if (!flag || !flag.variants) {
    return 'control'; // Default to control if experiment not found
  }

  // Use consistent hashing based on userId or sessionId
  const identifier = userId || `session_${Date.now()}`;
  const hash = simpleHash(identifier + experimentSlug);
  const random = hash % 100;

  // Assign variant based on weights
  let cumulativeWeight = 0;
  for (const variant of flag.variants) {
    cumulativeWeight += variant.weight;
    if (random < cumulativeWeight) {
      return variant.name;
    }
  }

  // Fallback to first variant
  return flag.variants[0].name;
}

/**
 * Simple hash function for consistent variant assignment
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Track experiment assignment in Supabase
 */
export async function trackExperimentAssignment(
  experimentSlug: string,
  variant: string,
  userId: string | null,
  sessionId: string | null
): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Supabase not configured, skipping experiment tracking');
    return;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Record experiment assignment in events table
    await supabase.from('events').insert({
      event_type: 'experiment',
      event_name: 'experiment_assigned',
      user_id: userId,
      session_id: sessionId,
      properties: {
        experiment_slug: experimentSlug,
        variant: variant,
      },
    });
  } catch (error) {
    console.error('Error tracking experiment assignment:', error);
  }
}

/**
 * Get experiment status from Supabase
 */
export async function getExperimentStatus(
  experimentSlug: string
): Promise<'draft' | 'running' | 'paused' | 'completed' | 'cancelled' | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from('experiments')
      .select('status')
      .eq('slug', experimentSlug)
      .single();

    if (error || !data) {
      return null;
    }

    return data.status as any;
  } catch (error) {
    console.error('Error fetching experiment status:', error);
    return null;
  }
}

/**
 * Check if user should see feature (considering targeting rules)
 */
export async function shouldShowFeature(
  key: string,
  userId: string | null,
  userSegments: string[] = []
): Promise<boolean> {
  const flag = getFlagConfig(key);
  if (!flag || !flag.enabled) {
    return false;
  }

  // Check targeting rules
  if (flag.targeting) {
    if (flag.targeting.all_users) {
      return true;
    }

    if (flag.targeting.segments && flag.targeting.segments.length > 0) {
      // Check if user is in any of the required segments
      const hasMatchingSegment = flag.targeting.segments.some(segment =>
        userSegments.includes(segment)
      );
      return hasMatchingSegment;
    }
  }

  return true; // Default to enabled if no targeting rules
}

/**
 * Example usage in Next.js middleware or API route
 */
export async function evaluateFeatureFlag(
  key: string,
  userId: string | null,
  sessionId: string | null,
  userSegments: string[] = []
): Promise<{
  enabled: boolean;
  variant?: string;
}> {
  const flag = getFlagConfig(key);
  if (!flag) {
    return { enabled: false };
  }

  // Check if feature should be shown based on targeting
  const shouldShow = await shouldShowFeature(key, userId, userSegments);
  if (!shouldShow) {
    return { enabled: false };
  }

  // For experiments, get variant
  if (flag.type === 'experiment' && flag.experiment_slug) {
    const variant = await getExperimentVariant(flag.experiment_slug, userId);
    
    // Track assignment
    await trackExperimentAssignment(flag.experiment_slug, variant, userId, sessionId);
    
    return {
      enabled: flag.enabled,
      variant: variant,
    };
  }

  // For regular features, just return enabled status
  return {
    enabled: flag.enabled,
  };
}

export default {
  getFlagConfig,
  isFeatureEnabled,
  getExperimentVariant,
  trackExperimentAssignment,
  getExperimentStatus,
  shouldShowFeature,
  evaluateFeatureFlag,
};
