/**
 * Enhanced Logger with Debug Breadcrumbs
 * Adds rich context and breadcrumbs to error logs
 */

import { logger } from "./structured-logger";

interface Breadcrumb {
  timestamp: Date;
  action: string;
  context?: Record<string, unknown>;
}

class EnhancedLogger {
  private breadcrumbs: Map<string, Breadcrumb[]> = new Map();
  private maxBreadcrumbs = 20;

  /**
   * Add breadcrumb for debugging context
   */
  addBreadcrumb(requestId: string, action: string, context?: Record<string, unknown>): void {
    if (!this.breadcrumbs.has(requestId)) {
      this.breadcrumbs.set(requestId, []);
    }

    const crumbs = this.breadcrumbs.get(requestId)!;
    crumbs.push({
      timestamp: new Date(),
      action,
      context,
    });

    // Keep only last N breadcrumbs
    if (crumbs.length > this.maxBreadcrumbs) {
      crumbs.shift();
    }
  }

  /**
   * Get breadcrumbs for a request
   */
  getBreadcrumbs(requestId: string): Breadcrumb[] {
    return this.breadcrumbs.get(requestId) || [];
  }

  /**
   * Clear breadcrumbs for a request
   */
  clearBreadcrumbs(requestId: string): void {
    this.breadcrumbs.delete(requestId);
  }

  /**
   * Enhanced error logging with breadcrumbs
   */
  errorWithContext(
    message: string,
    error: Error,
    requestId: string,
    context?: Record<string, unknown>
  ): void {
    const breadcrumbs = this.getBreadcrumbs(requestId);
    
    logger.error(message, error, {
      ...context,
      breadcrumbs: breadcrumbs.map((crumb) => ({
        action: crumb.action,
        timestamp: crumb.timestamp.toISOString(),
        context: crumb.context,
      })),
      requestId,
    });
  }

  /**
   * Generate error summary with context
   */
  generateErrorSummary(
    error: Error,
    requestId: string,
    context?: Record<string, unknown>
  ): {
    summary: string;
    likelyCause: string;
    suggestedSteps: string[];
    relatedContext: Record<string, unknown>;
  } {
    const breadcrumbs = this.getBreadcrumbs(requestId);
    const errorMessage = error.message.toLowerCase();

    // Determine likely cause
    let likelyCause = "Unknown error";
    let suggestedSteps: string[] = [];

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      likelyCause = "Network connectivity issue";
      suggestedSteps = [
        "Check internet connection",
        "Verify external service is accessible",
        "Check firewall/proxy settings",
        "Review network timeout configurations",
      ];
    } else if (errorMessage.includes("timeout")) {
      likelyCause = "Operation timeout";
      suggestedSteps = [
        "Check if external service is slow",
        "Review timeout settings",
        "Consider increasing timeout limits",
        "Optimize slow operations",
      ];
    } else if (errorMessage.includes("validation") || errorMessage.includes("invalid")) {
      likelyCause = "Input validation error";
      suggestedSteps = [
        "Review input data",
        "Check required fields",
        "Validate data format",
        "Review validation rules",
      ];
    } else if (errorMessage.includes("integration") || errorMessage.includes("not connected")) {
      likelyCause = "Integration connection issue";
      suggestedSteps = [
        "Check integration connection status",
        "Verify OAuth token is valid",
        "Reconnect integration if needed",
        "Review integration configuration",
      ];
    } else {
      likelyCause = "Unexpected error";
      suggestedSteps = [
        "Review error logs",
        "Check system status",
        "Verify recent changes",
        "Contact support if issue persists",
      ];
    }

    // Build summary
    const summary = `Error: ${error.message}. Occurred during: ${breadcrumbs.map((c) => c.action).join(" → ")}`;

    // Extract relevant context
    const relatedContext: Record<string, unknown> = {
      ...context,
      errorName: error.name,
      errorStack: error.stack?.split("\n").slice(0, 5).join("\n"), // First 5 stack lines
      breadcrumbCount: breadcrumbs.length,
      recentActions: breadcrumbs.slice(-5).map((c) => c.action),
    };

    return {
      summary,
      likelyCause,
      suggestedSteps,
      relatedContext,
    };
  }

  /**
   * Cleanup old breadcrumbs (run periodically)
   */
  cleanup(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const [requestId, crumbs] of this.breadcrumbs.entries()) {
      const oldestCrumb = crumbs[0];
      if (oldestCrumb && now - oldestCrumb.timestamp.getTime() > maxAge) {
        this.breadcrumbs.delete(requestId);
      }
    }
  }
}

export const enhancedLogger = new EnhancedLogger();
