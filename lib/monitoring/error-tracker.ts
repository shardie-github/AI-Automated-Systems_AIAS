/**
 * Error Tracking with Sentry
 * Provides centralized error tracking and monitoring
 */

import { logger } from "@/lib/logging/structured-logger";

// Sentry SDK will be imported dynamically to avoid breaking if not installed
let Sentry: any = null;

try {
  // Try to import Sentry - it may not be installed
  Sentry = require("@sentry/nextjs");
} catch {
  // Sentry not installed, will use fallback logging
}

interface ErrorContext {
  userId?: string;
  tenantId?: string;
  path?: string;
  method?: string;
  [key: string]: any;
}

class ErrorTracker {
  private initialized = false;

  /**
   * Initialize Sentry if available
   */
  init(): void {
    if (!Sentry) {
      logger.warn("Sentry not installed, using fallback error logging");
      return;
    }

    try {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV || "development",
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        beforeSend(event, hint) {
          // Filter out sensitive data
          if (event.request) {
            delete event.request.cookies;
            if (event.request.headers) {
              delete event.request.headers["authorization"];
              delete event.request.headers["cookie"];
            }
          }
          return event;
        },
      });
      this.initialized = true;
      logger.info("Sentry error tracking initialized");
    } catch (error) {
      logger.error("Failed to initialize Sentry", { error });
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: ErrorContext): void {
    if (Sentry && this.initialized) {
      try {
        Sentry.withScope((scope: any) => {
          if (context?.userId) {
            scope.setUser({ id: context.userId });
          }
          if (context?.tenantId) {
            scope.setTag("tenant_id", context.tenantId);
          }
          if (context?.path) {
            scope.setTag("path", context.path);
          }
          if (context?.method) {
            scope.setTag("method", context.method);
          }
          Object.keys(context || {}).forEach((key) => {
            if (!["userId", "tenantId", "path", "method"].includes(key)) {
              scope.setContext(key, context![key]);
            }
          });
          Sentry.captureException(error);
        });
      } catch (sentryError) {
        logger.error("Failed to capture exception in Sentry", { error: sentryError });
      }
    }

    // Always log to our structured logger as fallback
    logger.error("Exception captured", {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    });
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: ErrorContext): void {
    if (Sentry && this.initialized) {
      try {
        Sentry.withScope((scope: any) => {
          if (context?.userId) {
            scope.setUser({ id: context.userId });
          }
          if (context?.tenantId) {
            scope.setTag("tenant_id", context.tenantId);
          }
          Object.keys(context || {}).forEach((key) => {
            if (!["userId", "tenantId"].includes(key)) {
              scope.setContext(key, context![key]);
            }
          });
          Sentry.captureMessage(message, level);
        });
      } catch (sentryError) {
        logger.error("Failed to capture message in Sentry", { error: sentryError });
      }
    }

    // Always log to our structured logger as fallback
    if (level === "error") {
      logger.error(message, context);
    } else if (level === "warning") {
      logger.warn(message, context);
    } else {
      logger.info(message, context);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, email?: string, metadata?: Record<string, any>): void {
    if (Sentry && this.initialized) {
      try {
        Sentry.setUser({
          id: userId,
          email,
          ...metadata,
        });
      } catch (error) {
        logger.error("Failed to set user in Sentry", { error });
      }
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category?: string, level?: "info" | "warning" | "error", data?: Record<string, any>): void {
    if (Sentry && this.initialized) {
      try {
        Sentry.addBreadcrumb({
          message,
          category: category || "default",
          level: level || "info",
          data,
          timestamp: Date.now() / 1000,
        });
      } catch (error) {
        logger.error("Failed to add breadcrumb in Sentry", { error });
      }
    }
  }
}

export const errorTracker = new ErrorTracker();

// Initialize on module load if in server environment
if (typeof window === "undefined") {
  errorTracker.init();
}
