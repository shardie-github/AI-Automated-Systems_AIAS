/**
 * Error Summarizer
 * Generates human-readable error summaries for support
 */

import { ErrorPattern } from "./error-analyzer";

export interface ErrorSummary {
  errorMessage: string;
  category: string;
  frequency: number;
  affectedUsers: number;
  humanReadableSummary: string;
  likelyRootCause: string;
  suggestedFix: string;
  supportTemplate: string;
  escalationCriteria: string;
}

/**
 * Generate error summary for support
 */
export function generateErrorSummary(pattern: ErrorPattern): ErrorSummary {
  const humanReadableSummary = `
    ${pattern.message} has occurred ${pattern.count} times, affecting ${pattern.affectedUsers} users.
    The error trend is ${pattern.trend}, first seen on ${pattern.firstSeen.toLocaleDateString()},
    last seen on ${pattern.lastSeen.toLocaleDateString()}.
  `.trim();

  const supportTemplate = generateSupportTemplate(pattern);

  const escalationCriteria = determineEscalationCriteria(pattern);

  return {
    errorMessage: pattern.message,
    category: pattern.category,
    frequency: pattern.count,
    affectedUsers: pattern.affectedUsers,
    humanReadableSummary,
    likelyRootCause: pattern.likelyCause,
    suggestedFix: pattern.suggestedFix,
    supportTemplate,
    escalationCriteria,
  };
}

/**
 * Generate support reply template
 */
function generateSupportTemplate(pattern: ErrorPattern): string {
  const templates: Record<string, string> = {
    network: `We're experiencing connectivity issues with external services. Our team is investigating. 
      In the meantime, please try again in a few minutes. If the issue persists, please let us know.`,
    
    integration: `There's an issue with the ${extractIntegrationName(pattern.message)} integration connection. 
      Please try reconnecting the integration in Settings → Integrations. 
      If the problem continues, our support team can help troubleshoot.`,
    
    validation: `The request couldn't be processed due to invalid data. 
      Please check that all required fields are filled correctly and try again. 
      If you continue to see this error, please contact support with details.`,
    
    timeout: `The operation took longer than expected to complete. 
      This can happen during high traffic periods. Please try again. 
      If timeouts persist, we may need to investigate further.`,
    
    rate_limit: `You've reached your API rate limit. 
      This is based on your current plan. You can upgrade for higher limits, 
      or wait for the limit to reset (typically at the start of the next hour/day).`,
  };

  return templates[pattern.category] || 
    `We're aware of this issue and our team is working on a fix. 
      If you need immediate assistance, please contact support with the error details.`;
}

/**
 * Determine escalation criteria
 */
function determineEscalationCriteria(pattern: ErrorPattern): string {
  if (pattern.count > 100 || pattern.affectedUsers > 50) {
    return "Escalate immediately - high impact";
  }
  if (pattern.count > 50 || pattern.affectedUsers > 20) {
    return "Escalate within 1 hour - medium impact";
  }
  if (pattern.trend === "increasing") {
    return "Monitor closely - escalating trend";
  }
  return "Standard priority - low impact";
}

/**
 * Extract integration name from error message
 */
function extractIntegrationName(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("shopify")) return "Shopify";
  if (lowerMessage.includes("wave")) return "Wave Accounting";
  if (lowerMessage.includes("slack")) return "Slack";
  if (lowerMessage.includes("gmail")) return "Gmail";
  return "integration";
}

/**
 * Generate debugging context summary
 */
export function generateDebugContext(
  error: Error,
  breadcrumbs: Array<{ action: string; timestamp: Date; context?: Record<string, unknown> }>,
  additionalContext?: Record<string, unknown>
): string {
  const context = [
    `Error: ${error.message}`,
    `Type: ${error.name}`,
    `Stack: ${error.stack?.split("\n").slice(0, 3).join("\n")}`,
    `Breadcrumbs (${breadcrumbs.length}):`,
    ...breadcrumbs.slice(-5).map((crumb, idx) => 
      `  ${idx + 1}. ${crumb.action} at ${crumb.timestamp.toISOString()}`
    ),
    `Additional Context:`,
    ...Object.entries(additionalContext || {}).map(([key, value]) => 
      `  ${key}: ${JSON.stringify(value)}`
    ),
  ].join("\n");

  return context;
}
