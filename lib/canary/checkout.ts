/**
 * Canary Deployment for Checkout Module
 * Implements canary deployment logic for checkout flow
 */

import { getCanaryFlag, shouldUseCanary } from './flags';
import { canaryMonitor } from './monitor';

/**
 * Check if checkout should use canary version
 */
export async function useCanaryCheckout(userId: string): Promise<boolean> {
  const config = await getCanaryFlag('checkout');
  
  if (!config.enabled || config.percentage === 0) {
    return false;
  }

  return shouldUseCanary('checkout', userId, config);
}

/**
 * Record checkout request for canary monitoring
 */
export async function recordCheckoutRequest(
  userId: string,
  success: boolean,
  latency: number
): Promise<void> {
  const isCanary = await useCanaryCheckout(userId);
  
  if (isCanary) {
    await canaryMonitor.recordRequest('checkout', success, latency);
  }
}

/**
 * Get checkout handler (canary or stable)
 */
export async function getCheckoutHandler(userId: string): Promise<'canary' | 'stable'> {
  const useCanary = await useCanaryCheckout(userId);
  return useCanary ? 'canary' : 'stable';
}
