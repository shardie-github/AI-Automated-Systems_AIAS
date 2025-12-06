export interface TelemetryPayload {
  type: string;
  path?: string;
  meta?: Record<string, unknown>;
  app?: string;
}

import { logger } from "@/lib/logging/structured-logger";

export function track(userId: string, payload: TelemetryPayload) {
  try {
    const body = JSON.stringify({ 
      user_id: userId, 
      app: payload.app || 'web', 
      type: payload.type, 
      path: payload.path || (globalThis.location?.pathname ?? '/'), 
      meta: payload.meta 
    });
    
    const send = () => fetch("/api/telemetry/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body
    }).catch((error) => {
      // Log telemetry failures but don't throw (non-critical)
      logger.warn("Telemetry send failed", {
        userId,
        type: payload.type,
        error: error instanceof Error ? error.message : String(error),
      });
    });
    
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const sent = navigator.sendBeacon("/api/telemetry/ingest", body);
      if (!sent) {
        // Fallback to fetch if sendBeacon fails
        send();
      }
    } else {
      send();
    }
  } catch (error) {
    // Log errors but don't throw (telemetry is non-critical)
    logger.warn("Telemetry tracking failed", {
      userId,
      type: payload.type,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
