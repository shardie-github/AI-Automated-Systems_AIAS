// Affiliate Marketing System
// Automatic affiliate link insertion and tracking

export interface AffiliateLink {
  id: string;
  product: string;
  affiliateProgram: string;
  url: string;
  commissionRate: number;
  cookieDays: number;
  enabled: boolean;
  category?: string;
  keywords?: string[]; // Keywords that trigger this affiliate link
  systemsThinkingAlignment?: string; // How this product aligns with systems thinking
}

export interface AffiliateStats {
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
  conversionRate: number;
}

// Affiliate Programs Configuration
// All affiliates are systems thinking and AI automation tools that align with our mission
export const affiliatePrograms: AffiliateLink[] = [
  {
    id: "shopify",
    product: "Shopify",
    affiliateProgram: "Shopify Partners",
    url: "https://shopify.pxf.io/", // Replace with actual affiliate link
    commissionRate: 0.20,
    cookieDays: 30,
    enabled: true,
    category: "E-Commerce",
    keywords: ["shopify", "e-commerce", "online store", "store builder"],
    systemsThinkingAlignment: "E-commerce automation requires systems thinking to connect processes, inventory, and customer experience",
  },
  {
    id: "stripe",
    product: "Stripe",
    affiliateProgram: "Stripe Partners",
    url: "https://stripe.com/", // Replace with actual affiliate link
    commissionRate: 0.10,
    cookieDays: 90,
    enabled: true,
    category: "Payments",
    keywords: ["stripe", "payment", "payments", "payment processing"],
    systemsThinkingAlignment: "Payment systems require understanding of process flows, data security, and user experience — all systems thinking dimensions",
  },
  {
    id: "wave",
    product: "Wave Accounting",
    affiliateProgram: "Wave Affiliate",
    url: "https://wave.com/", // Replace with actual affiliate link
    commissionRate: 0.15,
    cookieDays: 30,
    enabled: true,
    category: "Accounting",
    keywords: ["wave", "accounting", "bookkeeping", "invoicing"],
    systemsThinkingAlignment: "Canadian accounting tool that fits our systems thinking approach to financial processes and data flows",
  },
  {
    id: "notion",
    product: "Notion",
    affiliateProgram: "Notion Affiliate",
    url: "https://notion.so/", // Replace with actual affiliate link
    commissionRate: 0.20,
    cookieDays: 30,
    enabled: true,
    category: "Productivity",
    keywords: ["notion", "productivity", "workspace", "notes"],
    systemsThinkingAlignment: "Notion embodies systems thinking by connecting knowledge, processes, and people in an interconnected workspace",
  },
  {
    id: "zapier",
    product: "Zapier",
    affiliateProgram: "Zapier Affiliate",
    url: "https://zapier.com/", // Replace with actual affiliate link
    commissionRate: 0.20,
    cookieDays: 30,
    enabled: true,
    category: "Automation",
    keywords: ["zapier", "automation", "workflow", "integrations"],
    systemsThinkingAlignment: "Automation tool that enables systems thinking by connecting processes across tools — but requires systems thinking to design effective workflows",
  },
  {
    id: "make",
    product: "Make (Integromat)",
    affiliateProgram: "Make Affiliate",
    url: "https://make.com/", // Replace with actual affiliate link
    commissionRate: 0.25,
    cookieDays: 30,
    enabled: true,
    category: "Automation",
    keywords: ["make", "integromat", "automation", "workflow"],
    systemsThinkingAlignment: "Advanced automation platform that benefits from systems thinking to design complex, multi-step workflows",
  },
];

// Get affiliate link for product/keyword
export function getAffiliateLink(productOrKeyword: string): AffiliateLink | null {
  const normalized = productOrKeyword.toLowerCase();
  
  const match = affiliatePrograms.find(
    (program) =>
      program.enabled &&
      (program.product.toLowerCase().includes(normalized) ||
       program.keywords?.some((k) => normalized.includes(k.toLowerCase())))
  );

  return match || null;
}

// Generate affiliate link HTML
export function generateAffiliateLink(
  product: string,
  text: string,
  className?: string
): string {
  const affiliate = getAffiliateLink(product);
  
  if (!affiliate) {
    return `<a href="#" class="${className || ""}">${text}</a>`;
  }

  return `<a href="${affiliate.url}" 
              class="${className || ""} affiliate-link" 
              data-affiliate-id="${affiliate.id}"
              data-product="${affiliate.product}"
              rel="sponsored nofollow"
              target="_blank">${text}</a>
           <span class="affiliate-disclosure" title="Affiliate link - we may earn a commission">*</span>`;
}

// Track affiliate click
export async function trackAffiliateClick(affiliateId: string, product: string) {
  // Track in analytics
  if (typeof window !== "undefined") {
    const sessionId = sessionStorage.getItem("analytics_session_id") || `session_${Date.now()}`;
    
    // Send to analytics endpoint
    fetch("/api/monetization/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ affiliateId, product, sessionId, referrerUrl: window.location.href }),
    }).catch(console.error);

    // Also track in database
    try {
      const { databasePMFTracker } = await import("../analytics/database-integration");
      await databasePMFTracker.trackAffiliateClick(
        affiliateId,
        product,
        sessionId,
        undefined, // userId if available
        window.location.href
      );
    } catch (error) {
      // Continue even if database fails
    }
  }
}

// Calculate estimated revenue
export function calculateAffiliateRevenue(
  clicks: number,
  conversionRate: number,
  averageOrderValue: number,
  commissionRate: number
): number {
  const conversions = clicks * conversionRate;
  const revenue = conversions * averageOrderValue;
  const commission = revenue * commissionRate;
  return commission;
}
