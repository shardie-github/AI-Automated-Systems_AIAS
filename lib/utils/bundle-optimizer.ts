/**
 * Bundle Optimization Utilities
 * 
 * Helps identify and optimize large dependencies.
 */

/**
 * Analyze bundle size (for development)
 */
export function analyzeBundle(moduleName: string): void {
  if (process.env.NODE_ENV !== "development") return;

  if (typeof window !== "undefined") {
    const performance = (window as any).performance;
    if (performance && performance.getEntriesByType) {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const moduleResources = resources.filter((r) => r.name.includes(moduleName));
      
      // Use logger instead of console.log
      const { logger } = require("@/lib/utils/logger");
      logger.debug(`Bundle Analysis: ${moduleName}`, {
        resources: moduleResources.map((resource) => ({
          name: resource.name,
          size: ((resource as any).transferSize || 0) / 1024,
          duration: resource.duration,
        })),
      });
    }
  }
}

/**
 * Lazy load heavy dependencies
 */
export const lazyLoadHeavyDeps = {
  recharts: () => import("recharts"),
  framerMotion: () => import("framer-motion"),
  pdfkit: () => import("pdfkit"),
  openai: () => import("openai"),
};

/**
 * Check if module should be code-split
 */
export function shouldCodeSplit(moduleName: string): boolean {
  const heavyModules = [
    "recharts",
    "framer-motion",
    "pdfkit",
    "openai",
    "@tanstack/react-query",
  ];
  return heavyModules.some((heavy) => moduleName.includes(heavy));
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(): void {
  if (typeof document === "undefined") return;

  // Preload critical fonts
  const fontPreloads = [
    { href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap", as: "style" },
  ];

  fontPreloads.forEach(({ href, as }) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  });
}
