"use client";

import { useEffect } from "react";
import { initWebVitalsTracking } from "@/lib/performance/vitals";

/**
 * Web Vitals Tracker Component
 * Initializes Core Web Vitals tracking on mount
 */
export function WebVitalsTracker() {
  useEffect(() => {
    initWebVitalsTracking();
  }, []);

  return null;
}
