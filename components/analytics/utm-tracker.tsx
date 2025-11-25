"use client";

import { useEffect } from "react";
import { extractUTMParams, extractReferralCode, storeUTMParams } from "@/lib/analytics/utm-tracking";

/**
 * UTM Tracker Component
 * Captures UTM parameters from URL and stores them for signup tracking
 */
export function UTMTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Extract UTM parameters from current URL
    const utmParams = extractUTMParams(window.location.href);
    const referralCode = extractReferralCode(window.location.href);

    // Store UTM parameters if present
    if (utmParams.source || referralCode) {
      storeUTMParams({
        ...utmParams,
        ref: referralCode,
      });

      // Also track page view with UTM parameters
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "page_view",
          properties: {
            ...utmParams,
            ref: referralCode,
            path: window.location.pathname,
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch((error) => {
        console.error("Failed to track page view:", error);
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
