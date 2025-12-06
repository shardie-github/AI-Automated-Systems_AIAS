/**
 * Client-side logging utility
 * 
 * Provides environment-aware logging that:
 * - Only logs to console in development
 * - Sends errors to telemetry in production
 * - Prevents console pollution in production builds
 */

import { telemetry } from "@/lib/monitoring/enhanced-telemetry";

const isDevelopment = typeof window !== 'undefined' 
  ? process.env.NODE_ENV === 'development' 
  : process.env.NODE_ENV === 'development';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Logger class for client-side logging
 */
class Logger {
  private shouldLogToConsole(level: LogLevel): boolean {
    // Always log errors and warnings, even in production (for debugging)
    // But only log debug/info in development
    if (level >= LogLevel.WARN) {
      return true; // Errors and warnings are useful even in production
    }
    return isDevelopment;
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLogToConsole(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log info messages (development only)
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLogToConsole(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log warning messages (always logged, sent to telemetry in production)
   */
  warn(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    if (this.shouldLogToConsole(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, error, context);
    }

    // Send to telemetry in production
    if (!isDevelopment && typeof window !== 'undefined') {
      try {
        telemetry.trackEvent({
          name: 'warning',
          category: 'error',
          properties: {
            message,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            ...context,
          },
        });
      } catch (e) {
        // Silently fail if telemetry is unavailable
      }
    }
  }

  /**
   * Log error messages (always logged, sent to telemetry in production)
   */
  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    if (this.shouldLogToConsole(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, error, context);
    }

    // Send to telemetry in production
    if (!isDevelopment && typeof window !== 'undefined') {
      try {
        if (error instanceof Error) {
          telemetry.trackError(error, {
            message,
            ...context,
          });
        } else {
          telemetry.trackEvent({
            name: 'error',
            category: 'error',
            properties: {
              message,
              error: String(error),
              ...context,
            },
          });
        }
      } catch (e) {
        // Silently fail if telemetry is unavailable
      }
    }
  }
}

/**
 * Server-side logging utility
 * For use in API routes and server components
 */
class ServerLogger {
  private shouldLogToConsole(level: LogLevel): boolean {
    // Server-side: log based on NODE_ENV
    return process.env.NODE_ENV === 'development' || level >= LogLevel.WARN;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLogToConsole(LogLevel.DEBUG)) {
      console.debug(`[SERVER DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLogToConsole(LogLevel.INFO)) {
      console.info(`[SERVER INFO] ${message}`, ...args);
    }
  }

  warn(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    if (this.shouldLogToConsole(LogLevel.WARN)) {
      console.warn(`[SERVER WARN] ${message}`, error, context);
    }
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    if (this.shouldLogToConsole(LogLevel.ERROR)) {
      console.error(`[SERVER ERROR] ${message}`, error, context);
    }
  }
}

// Export singleton instances
export const logger = typeof window !== 'undefined' ? new Logger() : new ServerLogger();
export const serverLogger = new ServerLogger();

// Default export for convenience
export default logger;
