/**
 * Business Planning Access Module
 * 
 * PUBLIC MODULE - Visible in repo for IP protection
 * Provides access to business planning documents stored in protected directories.
 * 
 * Actual data is stored in:
 * - internal/private/business-planning/ (encrypted with git-crypt)
 * - internal/private/investor-relations/ (encrypted with git-crypt)
 * - internal/private/yc-materials/ (encrypted with git-crypt)
 * 
 * Access: Financial Admin or Super Admin role required
 */

export interface BusinessPlanningDocument {
  id: string;
  name: string;
  category: "financial" | "investor" | "yc" | "strategy";
  location: string;
  encrypted: boolean;
  requiresAccess: "financial_admin" | "super_admin";
  description: string;
}

/**
 * Available business planning documents
 */
export const businessPlanningDocuments: BusinessPlanningDocument[] = [
  {
    id: "finance-model",
    name: "Financial Model",
    category: "financial",
    location: "internal/private/business-planning/finance_model.csv",
    encrypted: true,
    requiresAccess: "financial_admin",
    description: "3-year financial projections and revenue models",
  },
  {
    id: "product-revenue",
    name: "Product Revenue Storyboard",
    category: "strategy",
    location: "internal/private/business-planning/product_revenue_storyboard.md",
    encrypted: true,
    requiresAccess: "financial_admin",
    description: "Product revenue strategy and narrative blueprint",
  },
  {
    id: "investor-deck",
    name: "Investor Deck",
    category: "investor",
    location: "internal/private/investor-relations/investor-deck.md",
    encrypted: true,
    requiresAccess: "financial_admin",
    description: "AIAS Platform investor presentation deck",
  },
  {
    id: "investor-targets",
    name: "Investor Target List",
    category: "investor",
    location: "internal/private/investor-relations/investor_target_list.md",
    encrypted: true,
    requiresAccess: "financial_admin",
    description: "List of target investors and contact information",
  },
  {
    id: "investor-emails",
    name: "Investor Outreach Emails",
    category: "investor",
    location: "internal/private/investor-relations/investor_outreach_emails.md",
    encrypted: true,
    requiresAccess: "financial_admin",
    description: "Email templates for investor outreach",
  },
  {
    id: "yc-financials",
    name: "YC Financial Projections",
    category: "yc",
    location: "internal/private/yc-materials/financial_projections.md",
    encrypted: true,
    requiresAccess: "financial_admin",
    description: "Financial projections for YC application",
  },
  {
    id: "yc-fundraising",
    name: "YC Fundraising Plan",
    category: "yc",
    location: "internal/private/yc-materials/fundraising_plan.md",
    encrypted: true,
    requiresAccess: "financial_admin",
    description: "Fundraising strategy and plan for YC",
  },
  {
    id: "business-metrics",
    name: "Business Metrics Dashboard",
    category: "financial",
    location: "internal/private/business-planning/aias_business_metrics.json",
    encrypted: true,
    requiresAccess: "financial_admin",
    description: "Grafana dashboard configuration for business metrics",
  },
];

/**
 * Get document by ID
 */
export function getBusinessPlanningDocument(
  id: string
): BusinessPlanningDocument | undefined {
  return businessPlanningDocuments.find((doc) => doc.id === id);
}

/**
 * Get documents by category
 */
export function getDocumentsByCategory(
  category: BusinessPlanningDocument["category"]
): BusinessPlanningDocument[] {
  return businessPlanningDocuments.filter((doc) => doc.category === category);
}

/**
 * Check if user has access to document
 */
export function hasDocumentAccess(
  userRole: string,
  document: BusinessPlanningDocument
): boolean {
  if (document.requiresAccess === "super_admin") {
    return userRole === "super_admin";
  }
  return userRole === "financial_admin" || userRole === "super_admin";
}

/**
 * Get accessible documents for user
 */
export function getAccessibleDocuments(
  userRole: string
): BusinessPlanningDocument[] {
  return businessPlanningDocuments.filter((doc) =>
    hasDocumentAccess(userRole, doc)
  );
}
