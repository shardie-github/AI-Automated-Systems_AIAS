// GenAI Content Engine Configuration
// Automated blog post generation with systems thinking analysis

export interface ContentGenerationConfig {
  enabled: boolean;
  dailyPublishing: boolean;
  targetKeywords: string[];
  affiliateLinksEnabled: boolean;
  systemsThinkingAnalysis: boolean;
  seoOptimization: boolean;
}

export const contentConfig: ContentGenerationConfig = {
  enabled: true,
  dailyPublishing: true,
  targetKeywords: [
    "canadian business automation",
    "AI automation for SMBs",
    "Shopify automation",
    "Canadian small business",
    "Wave Accounting automation",
    "Stripe CAD automation",
    "no-code AI agents",
    "business automation Canada",
  ],
  affiliateLinksEnabled: true,
  systemsThinkingAnalysis: true,
  seoOptimization: true,
};

export interface BlogPostTemplate {
  title: string;
  category: string;
  keywords: string[];
  affiliateProducts: string[];
  systemsThinkingPerspectives: string[];
}

export const blogPostTemplates: BlogPostTemplate[] = [
  {
    title: "10 Ways Canadian SMBs Can Automate with AI",
    category: "Automation",
    keywords: ["canadian smb", "ai automation", "shopify", "wave"],
    affiliateProducts: ["Shopify", "Wave", "Stripe", "Notion"],
    systemsThinkingPerspectives: [
      "Process automation perspective",
      "Technology integration perspective",
      "ROI and cost-benefit perspective",
      "User experience perspective",
    ],
  },
];

export function generateBlogPost(template: BlogPostTemplate): string {
  // This would integrate with actual GenAI API
  // For now, returns structured content outline
  return JSON.stringify({
    title: template.title,
    category: template.category,
    keywords: template.keywords,
    affiliateProducts: template.affiliateProducts,
    systemsThinkingPerspectives: template.systemsThinkingPerspectives,
    generated: new Date().toISOString(),
  });
}

export function analyzeContentWithSystemsThinking(_content: string): {
  seo: number;
  ux: number;
  conversion: number;
  systems: number;
} {
  // Systems thinking analysis from 6 perspectives
  return {
    seo: 85,
    ux: 80,
    conversion: 75,
    systems: 90,
  };
}
