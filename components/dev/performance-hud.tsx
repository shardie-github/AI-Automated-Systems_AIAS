"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PerformanceMetrics {
  lcp?: number;
  inp?: number;
  cls?: number;
}

export function PerformanceHUD() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    setVisible(true);

    // Get Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "largest-contentful-paint") {
          const lcp = entry as any;
          setMetrics((m) => ({ ...m, lcp: lcp.renderTime || lcp.loadTime }));
        }
        if (entry.entryType === "layout-shift" && !(entry as any).hadRecentInput) {
          const cls = entry as PerformanceEntry & { value: number };
          setMetrics((m) => ({ ...m, cls: (m.cls || 0) + cls.value }));
        }
      }
    });

    observer.observe({ entryTypes: ["largest-contentful-paint", "layout-shift"] });

    // INP polyfill would go here
    return () => observer.disconnect();
  }, []);

  if (!visible || process.env.NODE_ENV !== "development") return null;

  const lcpGood = !metrics.lcp || metrics.lcp <= 2500;
  const clsGood = !metrics.cls || metrics.cls <= 0.05;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg p-4 shadow-lg text-xs font-mono">
      <div className="font-bold mb-2">Performance HUD</div>
      <div className="space-y-1">
        <div className={cn("flex justify-between gap-4", lcpGood ? "text-green-600" : "text-red-600")}>
          <span>LCP:</span>
          <span>{metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : "—"}</span>
        </div>
        <div className={cn("flex justify-between gap-4", clsGood ? "text-green-600" : "text-red-600")}>
          <span>CLS:</span>
          <span>{metrics.cls ? metrics.cls.toFixed(3) : "—"}</span>
        </div>
        <div className="flex justify-between gap-4 text-gray-500">
          <span>INP:</span>
          <span>{metrics.inp ? `${metrics.inp.toFixed(0)}ms` : "—"}</span>
        </div>
      </div>
    </div>
  );
}
