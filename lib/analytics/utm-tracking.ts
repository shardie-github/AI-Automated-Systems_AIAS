/**
 * UTM Parameter Tracking Utilities
 * Tracks acquisition channels for YC metrics
 */

export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface ReferralParams {
  ref?: string; // Referral code
}

/**
 * Extract UTM parameters from URL
 */
export function extractUTMParams(url: string | URL): UTMParams {
  const urlObj = typeof url === "string" ? new URL(url) : url;
  const params = urlObj.searchParams;

  return {
    source: params.get("utm_source") || undefined,
    medium: params.get("utm_medium") || undefined,
    campaign: params.get("utm_campaign") || undefined,
    term: params.get("utm_term") || undefined,
    content: params.get("utm_content") || undefined,
  };
}

/**
 * Extract referral code from URL
 */
export function extractReferralCode(url: string | URL): string | undefined {
  const urlObj = typeof url === "string" ? new URL(url) : url;
  return urlObj.searchParams.get("ref") || undefined;
}

/**
 * Store UTM parameters in localStorage (for client-side tracking)
 */
export function storeUTMParams(params: UTMParams): void {
  if (typeof window === "undefined") return;

  const stored = {
    ...params,
    timestamp: Date.now(),
  };

  localStorage.setItem("utm_params", JSON.stringify(stored));
}

/**
 * Get stored UTM parameters from localStorage
 */
export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("utm_params");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    // Expire after 30 days
    if (Date.now() - parsed.timestamp > 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem("utm_params");
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Track UTM parameters on signup (client-side)
 */
export function trackSignupWithUTM(params: UTMParams & ReferralParams): void {
  // Store in localStorage for later use
  storeUTMParams(params);

  // Also send to analytics endpoint
  if (typeof window !== "undefined") {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "signup_initiated",
        properties: {
          ...params,
          timestamp: new Date().toISOString(),
        },
      }),
    }).catch((error) => {
      console.error("Failed to track UTM params:", error);
    });
  }
}

/**
 * Get channel name from UTM parameters
 */
export function getChannelName(params: UTMParams): string {
  if (params.source && params.medium) {
    return `${params.source}/${params.medium}`;
  }
  if (params.source) {
    return params.source;
  }
  if (params.ref) {
    return "referral";
  }
  return "direct";
}
