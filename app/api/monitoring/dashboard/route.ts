/**
 * Monitoring Dashboard Data Endpoint
 * Provides comprehensive system metrics for monitoring dashboard
 */

import { NextResponse } from 'next/server';
import { createGETHandler } from '@/lib/api/route-handler';
import { circuitBreakerRegistry } from '@/lib/resilience/circuit-breaker';
import { cacheService } from '@/lib/performance/cache';
import { rateLimiter as _rateLimiter } from '@/lib/performance/rate-limiter';

export const GET = createGETHandler(
  async () => {
    // Get circuit breaker metrics
    const circuitBreakers = circuitBreakerRegistry.getAllMetrics();
    
    // Get cache stats
    const cacheStats = cacheService.getStats();
    
    // Calculate system health
    const circuitBreakerStates = Object.values(circuitBreakers).map(cb => cb.state);
    const openCircuits = circuitBreakerStates.filter(state => state === 'open').length;
    const halfOpenCircuits = circuitBreakerStates.filter(state => state === 'half-open').length;
    
    const systemHealth = {
      status: openCircuits > 0 ? 'degraded' : halfOpenCircuits > 0 ? 'warning' : 'healthy',
      score: openCircuits > 0 ? 50 : halfOpenCircuits > 0 ? 75 : 100,
    };
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      system: {
        health: systemHealth,
        uptime: process.uptime(),
      },
      circuitBreakers: {
        total: Object.keys(circuitBreakers).length,
        open: openCircuits,
        halfOpen: halfOpenCircuits,
        closed: circuitBreakerStates.filter(state => state === 'closed').length,
        details: circuitBreakers,
      },
      cache: {
        provider: cacheStats.provider,
        size: cacheStats.size,
        maxSize: cacheStats.maxSize,
        utilization: (cacheStats.size / cacheStats.maxSize) * 100,
      },
      performance: {
        // Placeholder for performance metrics
        averageResponseTime: null,
        requestsPerSecond: null,
      },
    });
  },
  {
    requireAuth: true,
    cache: {
      enabled: true,
      ttl: 30, // Cache for 30 seconds
    },
  }
);
