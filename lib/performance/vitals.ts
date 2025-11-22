/**
 * Core Web Vitals Tracking
 * Tracks and reports Core Web Vitals metrics
 */

import { track } from "@/lib/telemetry/track";

export interface WebVital {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: "good" | "needs-improvement" | "poor";
}

/**
 * Track Core Web Vitals
 */
export function trackWebVitals(metric: WebVital): void {
  // Send to telemetry
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") || "anonymous" : "anonymous";
  
  track(userId, {
    type: "web_vital",
    path: window.location.pathname,
    meta: {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      timestamp: new Date().toISOString(),
    },
    app: "web",
  });

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vital] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
    });
  }
}

/**
 * Initialize Core Web Vitals tracking
 */
export function initWebVitalsTracking(): void {
  if (typeof window === "undefined") return;

  // LCP - Largest Contentful Paint
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };

        const value = lastEntry.renderTime || lastEntry.loadTime || 0;
        const rating = value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";

        trackWebVitals({
          name: "LCP",
          value,
          id: lastEntry.name,
          delta: value,
          rating,
        });
      });

      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      console.warn("LCP tracking not supported", e);
    }

    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as PerformanceEntry & {
            value?: number;
            hadRecentInput?: boolean;
          };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value || 0;
          }
        }

        const rating = clsValue <= 0.1 ? "good" : clsValue <= 0.25 ? "needs-improvement" : "poor";

        trackWebVitals({
          name: "CLS",
          value: clsValue,
          id: "cls",
          delta: clsValue,
          rating,
        });
      });

      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      console.warn("CLS tracking not supported", e);
    }

    // FID - First Input Delay (or INP - Interaction to Next Paint)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEntry & {
            processingStart?: number;
            startTime?: number;
          };
          const value = fidEntry.processingStart
            ? fidEntry.processingStart - fidEntry.startTime!
            : 0;
          const rating = value <= 100 ? "good" : value <= 300 ? "needs-improvement" : "poor";

          trackWebVitals({
            name: "FID",
            value,
            id: fidEntry.name,
            delta: value,
            rating,
          });
        }
      });

      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      console.warn("FID tracking not supported", e);
    }
  }
}

// Auto-initialize on client side
if (typeof window !== "undefined") {
  // Wait for page load
  if (document.readyState === "complete") {
    initWebVitalsTracking();
  } else {
    window.addEventListener("load", initWebVitalsTracking);
  }
}
