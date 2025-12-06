"use client";
import { useEffect } from "react";

export function PWARegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // Service worker registered (use logger in production)
          if (process.env.NODE_ENV === "development") {
            const { logger } = require("@/lib/utils/logger");
            logger.debug("Service worker registered", { scope: registration.scope });
          }
        })
        .catch((error) => {
          const { logger } = require("@/lib/utils/logger");
          logger.error("Service worker registration failed", error as Error);
        });
    }
  }, []);

  return null;
}
