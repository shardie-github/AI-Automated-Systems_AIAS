/**
 * Performance Optimization Utilities
 * 
 * Provides utilities for code splitting, lazy loading, and performance monitoring.
 */

/**
 * Lazy load component with loading state
 * Note: Use React.lazy() directly in components
 */
export function getLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): () => Promise<{ default: T }> {
  return importFn;
}

/**
 * Prefetch resource
 */
export function prefetchResource(href: string, as?: string): void {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  if (as) {
    link.as = as;
  }
  document.head.appendChild(link);
}

/**
 * Preload resource
 */
export function preloadResource(
  href: string,
  as: string,
  options?: { crossorigin?: string; type?: string }
): void {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.href = href;
  link.as = as;
  if (options?.crossorigin) {
    link.crossOrigin = options.crossorigin;
  }
  if (options?.type) {
    link.type = options.type;
  }
  document.head.appendChild(link);
}

/**
 * Defer non-critical JavaScript
 */
export function deferScript(src: string): void {
  if (typeof document === "undefined") return;

  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  document.head.appendChild(script);
}

/**
 * Measure performance metric
 */
export function measurePerformance(
  name: string,
  fn: () => void | Promise<void>
): Promise<number> {
  return new Promise(async (resolve) => {
    if (typeof performance === "undefined") {
      await fn();
      resolve(0);
      return;
    }

    const start = performance.now();
    await fn();
    const end = performance.now();
    const duration = end - start;

    // Log to performance API if available
    if (typeof performance.mark !== "undefined") {
      performance.mark(`${name}-start`);
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    resolve(duration);
  });
}

/**
 * Check if connection is slow
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === "undefined" || !("connection" in navigator)) {
    return false;
  }

  const connection = (navigator as any).connection;
  if (!connection) return false;

  // Check effective type (4G, 3G, 2G, slow-2g)
  const effectiveType = connection.effectiveType;
  return effectiveType === "2g" || effectiveType === "slow-2g";
}

/**
 * Optimize images based on connection speed
 */
export function getOptimalImageQuality(): number {
  if (isSlowConnection()) {
    return 60; // Lower quality for slow connections
  }
  return 85; // Default quality
}

/**
 * Bundle size analyzer helper
 */
export function analyzeBundleSize(moduleName: string): void {
  if (process.env.NODE_ENV !== "development") return;

  if (typeof window !== "undefined" && (window as any).__NEXT_DATA__) {
    const chunks = (window as any).__NEXT_DATA__.chunks || [];
    const moduleChunks = chunks.filter((chunk: any) =>
      chunk.includes(moduleName)
    );
    // Use logger instead of console.log
    if (typeof window !== "undefined") {
      const { logger } = require("@/lib/utils/logger");
      logger.debug(`Bundle analysis for ${moduleName}`, { chunks: moduleChunks });
    }
  }
}
