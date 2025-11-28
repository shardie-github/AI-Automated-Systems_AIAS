/**
 * API Latency Monitoring
 * Tracks API response times and performance
 */

import { track } from "@/lib/telemetry/track";

export interface APIMetric {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
}

class APIMonitor {
  private metrics: APIMetric[] = [];

  /**
   * Track API request
   */
  trackRequest(path: string, method: string, statusCode: number, duration: number): void {
    const metric: APIMetric = {
      path,
      method,
      statusCode,
      duration,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Send to telemetry
    const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") || "anonymous" : "anonymous";
    
    track(userId, {
      type: "api_request",
      path,
      meta: {
        method,
        status_code: statusCode,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      },
      app: "web",
    });

    // Log slow requests
    if (duration > 1000) {
      console.warn(`[API Monitor] Slow request: ${method} ${path} took ${duration}ms`);
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): APIMetric[] {
    return [...this.metrics];
  }

  /**
   * Get average latency for a path
   */
  getAverageLatency(path: string, method?: string): number {
    const filtered = this.metrics.filter(
      (m) => m.path === path && (!method || m.method === method)
    );
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, m) => sum + m.duration, 0) / filtered.length;
  }

  /**
   * Get p95 latency for a path
   */
  getP95Latency(path: string, method?: string): number {
    const filtered = this.metrics
      .filter((m) => m.path === path && (!method || m.method === method))
      .sort((a, b) => a.duration - b.duration);
    if (filtered.length === 0) return 0;
    const index = Math.floor(filtered.length * 0.95);
    return filtered[index]?.duration || 0;
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

export const apiMonitor = typeof window !== "undefined" ? new APIMonitor() : {
  trackRequest: () => {},
  getMetrics: () => [],
  getAverageLatency: () => 0,
  getP95Latency: () => 0,
  clear: () => {},
  metrics: [],
} as unknown as APIMonitor;

/**
 * Intercept fetch requests to track API performance
 */
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const startTime = Date.now();
    const url = typeof args[0] === "string" ? args[0] : args[0] instanceof URL ? args[0].toString() : (args[0] as Request).url;
    const method = (args[1]?.method || "GET").toUpperCase();

    try {
      const response = await originalFetch(...args);
      const duration = Date.now() - startTime;
      
      // Extract path from URL
      const path = new URL(url, window.location.origin).pathname;
      
      apiMonitor.trackRequest(path, method, response.status, duration);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const path = new URL(url, window.location.origin).pathname;
      apiMonitor.trackRequest(path, method, 0, duration); // Status 0 for network errors
      throw error;
    }
  };
}
