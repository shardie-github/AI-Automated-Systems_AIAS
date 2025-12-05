/**
 * Plan Configuration
 * Defines feature flags, limits, and access levels for free, trial, and paid plans
 */

export type PlanTier = "free" | "trial" | "starter" | "pro";

export interface PlanFeatures {
  // News Feed
  newsFeedPersonalized: boolean;
  newsFeedArticlesPerDay: number;
  
  // Email Analysis
  emailAnalysisCampaignsPerMonth: number;
  emailAnalysisAdvanced: boolean;
  emailAnalysisDiagnostics: boolean;
  
  // Workflows
  workflowsMax: number | null; // null = unlimited
  automationsPerMonth: number | null; // null = unlimited
  templatesAccess: "basic" | "all";
  integrationsAccess: "basic" | "all";
  
  // AI Agents
  aiAgentsMax: number;
  aiAgentsCustom: boolean;
  
  // Consulting
  consultingTimeMinutes: number;
  
  // Support
  supportLevel: "community" | "email" | "priority";
  supportResponseTime: string;
  
  // Analytics
  analyticsLevel: "basic" | "advanced";
  
  // Content Access
  caseStudiesFull: boolean;
  frameworksFull: boolean;
  playbooksFull: boolean;
}

export const plans: Record<PlanTier, PlanFeatures> = {
  free: {
    newsFeedPersonalized: false,
    newsFeedArticlesPerDay: 15,
    emailAnalysisCampaignsPerMonth: 1,
    emailAnalysisAdvanced: false,
    emailAnalysisDiagnostics: false,
    workflowsMax: 3,
    automationsPerMonth: 100,
    templatesAccess: "basic",
    integrationsAccess: "basic",
    aiAgentsMax: 3,
    aiAgentsCustom: false,
    consultingTimeMinutes: 0,
    supportLevel: "community",
    supportResponseTime: "Community forums",
    analyticsLevel: "basic",
    caseStudiesFull: false,
    frameworksFull: false,
    playbooksFull: false,
  },
  trial: {
    // Trial gets same as free, but with upgrade prompts
    newsFeedPersonalized: false,
    newsFeedArticlesPerDay: 15,
    emailAnalysisCampaignsPerMonth: 1,
    emailAnalysisAdvanced: false,
    emailAnalysisDiagnostics: false,
    workflowsMax: 3,
    automationsPerMonth: 100,
    templatesAccess: "basic",
    integrationsAccess: "basic",
    aiAgentsMax: 3,
    aiAgentsCustom: false,
    consultingTimeMinutes: 0,
    supportLevel: "community",
    supportResponseTime: "Community forums",
    analyticsLevel: "basic",
    caseStudiesFull: false,
    frameworksFull: false,
    playbooksFull: false,
  },
  starter: {
    newsFeedPersonalized: true,
    newsFeedArticlesPerDay: 50,
    emailAnalysisCampaignsPerMonth: null, // unlimited
    emailAnalysisAdvanced: true,
    emailAnalysisDiagnostics: true,
    workflowsMax: null, // unlimited
    automationsPerMonth: null, // unlimited
    templatesAccess: "all",
    integrationsAccess: "all",
    aiAgentsMax: 10,
    aiAgentsCustom: true,
    consultingTimeMinutes: 30,
    supportLevel: "email",
    supportResponseTime: "24-48 hours",
    analyticsLevel: "advanced",
    caseStudiesFull: true,
    frameworksFull: true,
    playbooksFull: true,
  },
  pro: {
    newsFeedPersonalized: true,
    newsFeedArticlesPerDay: 100,
    emailAnalysisCampaignsPerMonth: null, // unlimited
    emailAnalysisAdvanced: true,
    emailAnalysisDiagnostics: true,
    workflowsMax: null, // unlimited
    automationsPerMonth: null, // unlimited
    templatesAccess: "all",
    integrationsAccess: "all",
    aiAgentsMax: 50,
    aiAgentsCustom: true,
    consultingTimeMinutes: 60,
    supportLevel: "priority",
    supportResponseTime: "24 hours",
    analyticsLevel: "advanced",
    caseStudiesFull: true,
    frameworksFull: true,
    playbooksFull: true,
  },
};

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
  userPlan: PlanTier,
  feature: keyof PlanFeatures
): boolean {
  return plans[userPlan][feature] === true || 
         (typeof plans[userPlan][feature] === "number" && plans[userPlan][feature] > 0) ||
         (typeof plans[userPlan][feature] === "string" && plans[userPlan][feature] !== "basic");
}

/**
 * Get feature limit for user's plan
 */
export function getFeatureLimit(
  userPlan: PlanTier,
  feature: keyof PlanFeatures
): number | null {
  const value = plans[userPlan][feature];
  if (typeof value === "number") {
    return value;
  }
  return null;
}

/**
 * Check if user is on free/trial plan
 */
export function isFreeOrTrial(plan: PlanTier): boolean {
  return plan === "free" || plan === "trial";
}

/**
 * Check if user is on paid plan
 */
export function isPaid(plan: PlanTier): boolean {
  return plan === "starter" || plan === "pro";
}
