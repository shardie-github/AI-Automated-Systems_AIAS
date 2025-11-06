// RSS Feed Integration for AI and Tech News
// Automated content curation with systems thinking analysis

export interface RSSFeedItem {
  id?: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category?: string;
  relevance?: "high" | "medium" | "low";
  systemsThinkingAngle?: string; // How systems thinking applies
  editorialTake?: string; // Quick editorialized take on the news
  perspectives?: string[]; // Which perspectives apply
  discussionEnabled?: boolean; // Whether comments are enabled
}

export interface RSSFeed {
  name: string;
  url: string;
  category: "AI" | "Tech" | "Business" | "Systems Thinking";
  enabled: boolean;
}

// RSS Feed Sources for AI and Tech News
export const rssFeeds: RSSFeed[] = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/tag/artificial-intelligence/feed/",
    category: "AI",
    enabled: true,
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
    category: "AI",
    enabled: true,
  },
  {
    name: "MIT Technology Review AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/rss/",
    category: "AI",
    enabled: true,
  },
  {
    name: "ArXiv AI (Latest)",
    url: "http://arxiv.org/rss/cs.AI",
    category: "AI",
    enabled: true,
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
    category: "Tech",
    enabled: true,
  },
  {
    name: "Product Hunt",
    url: "https://www.producthunt.com/feed",
    category: "Tech",
    enabled: true,
  },
  {
    name: "Indie Hackers",
    url: "https://www.indiehackers.com/feed",
    category: "Business",
    enabled: true,
  },
  {
    name: "Harvard Business Review",
    url: "https://feeds.hbr.org/harvardbusiness",
    category: "Business",
    enabled: true,
  },
];

// Systems Thinking Analysis for RSS Items
export function analyzeRSSItemWithSystemsThinking(item: RSSFeedItem): {
  relevance: "high" | "medium" | "low";
  systemsThinkingAngle?: string;
  perspectives?: string[];
} {
  // Analyze if item relates to systems thinking concepts
  const systemsThinkingKeywords = [
    "systems thinking",
    "complex systems",
    "interconnected",
    "root cause",
    "holistic",
    "multi-perspective",
    "systemic",
    "ecosystem",
    "architecture",
  ];

  const aiKeywords = ["AI", "artificial intelligence", "automation", "machine learning"];
  const productivityKeywords = ["productivity", "efficiency", "optimization", "workflow"];

  const title = (item.title || "").toLowerCase();
  const description = (item.description || "").toLowerCase();

  let relevance: "high" | "medium" | "low" = "low";
  let systemsThinkingAngle: string | undefined;
  const perspectives: string[] = [];

  // Check for systems thinking relevance
  if (systemsThinkingKeywords.some(keyword => title.includes(keyword) || description.includes(keyword))) {
    relevance = "high";
    systemsThinkingAngle = "Directly relates to systems thinking concepts";
  } else if (aiKeywords.some(keyword => title.includes(keyword) || description.includes(keyword))) {
    relevance = "medium";
    systemsThinkingAngle = "AI/automation topic - systems thinking perspective can be applied";
    
    // Determine which perspectives apply
    if (title.includes("process") || description.includes("workflow")) perspectives.push("Process");
    if (title.includes("tool") || description.includes("platform")) perspectives.push("Technology");
    if (title.includes("team") || description.includes("people")) perspectives.push("People");
    if (title.includes("data") || description.includes("analytics")) perspectives.push("Data");
    if (title.includes("system") || description.includes("architecture")) perspectives.push("Systems");
    if (title.includes("automate") || description.includes("automation")) perspectives.push("Automation");
  }

  return {
    relevance,
    systemsThinkingAngle,
    perspectives: perspectives.length > 0 ? perspectives : undefined,
  };
}

// Generate commentary on RSS item from systems thinking perspective
export function generateSystemsThinkingCommentary(item: RSSFeedItem): string {
  const analysis = analyzeRSSItemWithSystemsThinking(item);
  
  if (analysis.relevance === "high") {
    return `This article directly relates to systems thinking. ${analysis.systemsThinkingAngle || ""}`;
  } else if (analysis.relevance === "medium") {
    const perspectivesText = analysis.perspectives 
      ? `From a systems thinking perspective, this touches on: ${analysis.perspectives.join(", ")}.`
      : "";
    return `While this article focuses on ${item.title}, systems thinking can provide valuable insights. ${perspectivesText}`;
  }
  
  return "This article may benefit from systems thinking analysis to understand broader implications.";
}
