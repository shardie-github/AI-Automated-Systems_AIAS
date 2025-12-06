/**
 * Error Analyzer
 * Categorizes errors, detects patterns, and generates insights
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export type ErrorCategory =
  | "network"
  | "validation"
  | "integration"
  | "authentication"
  | "authorization"
  | "database"
  | "timeout"
  | "rate_limit"
  | "unknown";

export interface ErrorPattern {
  category: ErrorCategory;
  message: string;
  count: number;
  affectedUsers: number;
  firstSeen: Date;
  lastSeen: Date;
  trend: "increasing" | "decreasing" | "stable";
  likelyCause: string;
  suggestedFix: string;
  relatedErrors: string[];
}

export interface ErrorSummary {
  totalErrors: number;
  uniqueErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  topErrors: ErrorPattern[];
  trends: {
    errorRate: number;
    trend: "increasing" | "decreasing" | "stable";
  };
}

/**
 * Categorize error by message
 */
function categorizeError(message: string): ErrorCategory {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("network") || lowerMessage.includes("fetch") || lowerMessage.includes("connection")) {
    return "network";
  }
  if (lowerMessage.includes("validation") || lowerMessage.includes("invalid") || lowerMessage.includes("required")) {
    return "validation";
  }
  if (lowerMessage.includes("integration") || lowerMessage.includes("shopify") || lowerMessage.includes("wave")) {
    return "integration";
  }
  if (lowerMessage.includes("unauthorized") || lowerMessage.includes("authentication") || lowerMessage.includes("token")) {
    return "authentication";
  }
  if (lowerMessage.includes("forbidden") || lowerMessage.includes("permission") || lowerMessage.includes("access")) {
    return "authorization";
  }
  if (lowerMessage.includes("database") || lowerMessage.includes("sql") || lowerMessage.includes("query")) {
    return "database";
  }
  if (lowerMessage.includes("timeout") || lowerMessage.includes("timed out")) {
    return "timeout";
  }
  if (lowerMessage.includes("rate limit") || lowerMessage.includes("too many requests")) {
    return "rate_limit";
  }

  return "unknown";
}

/**
 * Analyze errors and detect patterns
 */
export async function analyzeErrors(days: number = 7): Promise<ErrorSummary> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get all errors
    const { data: errors, error: fetchError } = await supabase
      .from("app_events")
      .select("event_type, user_id, created_at, meta")
      .eq("event_type", "error")
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: false });

    if (fetchError) {
      logger.error("Failed to fetch errors", fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
      return {
        totalErrors: 0,
        uniqueErrors: 0,
        errorsByCategory: {} as Record<ErrorCategory, number>,
        topErrors: [],
        trends: {
          errorRate: 0,
          trend: "stable",
        },
      };
    }

    // Group errors by message
    const errorGroups: Record<string, {
      count: number;
      users: Set<string>;
      timestamps: Date[];
      category: ErrorCategory;
      meta: Record<string, unknown>[];
    }> = {};

    errors?.forEach((error) => {
      const errorMessage = (error.meta as Record<string, unknown>)?.error as string || 
                           (error.meta as Record<string, unknown>)?.message as string || 
                           "Unknown error";
      
      if (!errorGroups[errorMessage]) {
        errorGroups[errorMessage] = {
          count: 0,
          users: new Set(),
          timestamps: [],
          category: categorizeError(errorMessage),
          meta: [],
        };
      }

      errorGroups[errorMessage].count++;
      if (error.user_id) {
        errorGroups[errorMessage].users.add(error.user_id);
      }
      errorGroups[errorMessage].timestamps.push(new Date(error.created_at));
      errorGroups[errorMessage].meta.push(error.meta as Record<string, unknown>);
    });

    // Convert to patterns
    const patterns: ErrorPattern[] = [];

    for (const [message, data] of Object.entries(errorGroups)) {
      // Calculate trend
      const midPoint = Math.floor(data.timestamps.length / 2);
      const firstHalf = data.timestamps.slice(0, midPoint).length;
      const secondHalf = data.timestamps.slice(midPoint).length;

      let trend: "increasing" | "decreasing" | "stable" = "stable";
      if (secondHalf > firstHalf * 1.2) {
        trend = "increasing";
      } else if (firstHalf > secondHalf * 1.2) {
        trend = "decreasing";
      }

      // Determine likely cause and suggested fix
      const { likelyCause, suggestedFix } = generateErrorInsights(message, data.category);

      patterns.push({
        category: data.category,
        message,
        count: data.count,
        affectedUsers: data.users.size,
        firstSeen: data.timestamps[0],
        lastSeen: data.timestamps[data.timestamps.length - 1],
        trend,
        likelyCause,
        suggestedFix,
        relatedErrors: findRelatedErrors(message, Object.keys(errorGroups)),
      });
    }

    // Calculate category counts
    const errorsByCategory: Record<ErrorCategory, number> = {
      network: 0,
      validation: 0,
      integration: 0,
      authentication: 0,
      authorization: 0,
      database: 0,
      timeout: 0,
      rate_limit: 0,
      unknown: 0,
    };

    patterns.forEach((pattern) => {
      errorsByCategory[pattern.category] = (errorsByCategory[pattern.category] || 0) + pattern.count;
    });

    // Calculate error rate trend
    const totalErrors = errors?.length || 0;
    const errorRate = totalErrors / days; // Errors per day

    // Sort by count
    const topErrors = patterns.sort((a, b) => b.count - a.count).slice(0, 10);

    return {
      totalErrors,
      uniqueErrors: patterns.length,
      errorsByCategory,
      topErrors,
      trends: {
        errorRate: Math.round(errorRate * 10) / 10,
        trend: patterns.filter((p) => p.trend === "increasing").length > patterns.filter((p) => p.trend === "decreasing").length
          ? "increasing"
          : patterns.filter((p) => p.trend === "decreasing").length > patterns.filter((p) => p.trend === "increasing").length
          ? "decreasing"
          : "stable",
      },
    };
  } catch (error) {
    logger.error("Failed to analyze errors", error instanceof Error ? error : new Error(String(error)));
    return {
      totalErrors: 0,
      uniqueErrors: 0,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      topErrors: [],
      trends: {
        errorRate: 0,
        trend: "stable",
      },
    };
  }
}

/**
 * Generate error insights (likely cause and suggested fix)
 */
function generateErrorInsights(
  message: string,
  category: ErrorCategory
): { likelyCause: string; suggestedFix: string } {
  const lowerMessage = message.toLowerCase();

  // Network errors
  if (category === "network") {
    return {
      likelyCause: "Network connectivity issue or external service unavailable",
      suggestedFix: "Check internet connection, verify external service status, implement retry logic",
    };
  }

  // Validation errors
  if (category === "validation") {
    return {
      likelyCause: "Invalid input data or missing required fields",
      suggestedFix: "Validate input before processing, provide clear error messages to users",
    };
  }

  // Integration errors
  if (category === "integration") {
    if (lowerMessage.includes("not connected") || lowerMessage.includes("disconnected")) {
      return {
        likelyCause: "Integration connection lost or expired",
        suggestedFix: "Reconnect the integration, check OAuth token expiration",
      };
    }
    if (lowerMessage.includes("api") || lowerMessage.includes("request failed")) {
      return {
        likelyCause: "External API error or rate limiting",
        suggestedFix: "Check integration API status, verify credentials, implement rate limiting",
      };
    }
    return {
      likelyCause: "Integration configuration issue",
      suggestedFix: "Review integration settings, check API credentials, verify permissions",
    };
  }

  // Authentication errors
  if (category === "authentication") {
    return {
      likelyCause: "Invalid or expired authentication token",
      suggestedFix: "Refresh authentication token, re-authenticate user",
    };
  }

  // Timeout errors
  if (category === "timeout") {
    return {
      likelyCause: "Operation took too long to complete",
      suggestedFix: "Increase timeout limits, optimize slow operations, implement async processing",
    };
  }

  // Rate limit errors
  if (category === "rate_limit") {
    return {
      likelyCause: "API rate limit exceeded",
      suggestedFix: "Implement exponential backoff, upgrade plan for higher limits, cache responses",
    };
  }

  // Default
  return {
    likelyCause: "Unknown error - requires investigation",
    suggestedFix: "Review error logs, check system status, contact support if issue persists",
  };
}

/**
 * Find related errors (similar messages)
 */
function findRelatedErrors(message: string, allMessages: string[]): string[] {
  const messageWords = message.toLowerCase().split(/\s+/);
  const related: string[] = [];

  allMessages.forEach((otherMessage) => {
    if (otherMessage === message) return;

    const otherWords = otherMessage.toLowerCase().split(/\s+/);
    const commonWords = messageWords.filter((word) => otherWords.includes(word));
    
    // If >30% words in common, consider related
    if (commonWords.length / Math.max(messageWords.length, otherWords.length) > 0.3) {
      related.push(otherMessage);
    }
  });

  return related.slice(0, 5); // Top 5 related
}
