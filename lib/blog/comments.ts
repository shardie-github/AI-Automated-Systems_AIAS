// AI-Moderated Comment System
// Comments analyzed with systems thinking and AI moderation

export interface Comment {
  id: string;
  articleSlug: string;
  author: string;
  email: string;
  content: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected" | "flagged";
  moderationScore?: number; // 0-100, lower = more likely to be problematic
  moderationReason?: string;
  systemsThinkingInsight?: string; // AI-generated insight about comment
  parentId?: string; // For threaded comments
  likes?: number;
  replies?: Comment[];
}

export interface ModerationResult {
  approved: boolean;
  score: number;
  reasons: string[];
  systemsThinkingInsight?: string;
  suggestedAction: "approve" | "reject" | "flag" | "review";
}

// AI Moderation Rules
const moderationRules = {
  spam: {
    keywords: ["buy now", "click here", "free money", "guaranteed"],
    maxLinks: 2,
    maxLength: 5000,
  },
  toxicity: {
    keywords: ["hate", "stupid", "dumb", "worthless"],
    threshold: 0.7,
  },
  relevance: {
    minLength: 10,
    maxLength: 2000,
  },
  systemsThinking: {
    encourage: ["systems thinking", "multi-perspective", "root cause", "holistic"],
    reward: 0.2, // Boost score for systems thinking discussions
  },
};

// AI Moderation Function
export function moderateComment(comment: Comment): ModerationResult {
  const content = comment.content.toLowerCase();
  let score = 100; // Start with perfect score
  const reasons: string[] = [];
  let systemsThinkingInsight: string | undefined;

  // Check for spam
  if (moderationRules.spam.keywords.some(keyword => content.includes(keyword))) {
    score -= 50;
    reasons.push("Potential spam detected");
  }

  // Check link count
  const linkCount = (content.match(/http/g) || []).length;
  if (linkCount > moderationRules.spam.maxLinks) {
    score -= 30;
    reasons.push(`Too many links (${linkCount})`);
  }

  // Check length
  if (comment.content.length > moderationRules.relevance.maxLength) {
    score -= 20;
    reasons.push("Comment too long");
  } else if (comment.content.length < moderationRules.relevance.minLength) {
    score -= 15;
    reasons.push("Comment too short");
  }

  // Check for toxicity
  const toxicityMatches = moderationRules.toxicity.keywords.filter(keyword => content.includes(keyword));
  if (toxicityMatches.length > 0) {
    score -= 40;
    reasons.push("Potentially toxic language detected");
  }

  // Reward systems thinking discussions
  const systemsThinkingMatches = moderationRules.systemsThinking.encourage.filter(keyword => 
    content.includes(keyword)
  );
  if (systemsThinkingMatches.length > 0) {
    score += 10;
    systemsThinkingInsight = `Great to see systems thinking discussion! This comment relates to: ${systemsThinkingMatches.join(", ")}`;
  }

  // Determine action
  let suggestedAction: "approve" | "reject" | "flag" | "review";
  if (score >= 80) {
    suggestedAction = "approve";
  } else if (score >= 50) {
    suggestedAction = "review";
  } else if (score >= 30) {
    suggestedAction = "flag";
  } else {
    suggestedAction = "reject";
  }

  return {
    approved: score >= 80,
    score,
    reasons,
    systemsThinkingInsight,
    suggestedAction,
  };
}

// Generate systems thinking insight for comment
export function generateSystemsThinkingInsight(comment: Comment, article: any): string {
  const content = comment.content.toLowerCase();
  
  // Check for systems thinking concepts
  if (content.includes("systems thinking") || content.includes("multi-perspective")) {
    return "This comment demonstrates systems thinking awareness. Great engagement with holistic problem-solving approaches.";
  }
  
  // Check for specific perspectives
  const perspectives = ["process", "technology", "people", "data", "systems", "automation"];
  const mentionedPerspectives = perspectives.filter(p => content.includes(p));
  
  if (mentionedPerspectives.length > 0) {
    return `This comment touches on ${mentionedPerspectives.length} perspective(s) from our systems thinking framework: ${mentionedPerspectives.join(", ")}.`;
  }
  
  // Check for root cause discussion
  if (content.includes("root cause") || content.includes("why") || content.includes("because")) {
    return "This comment suggests root cause thinking - a key component of systems thinking.";
  }
  
  return "This comment could benefit from systems thinking analysis to explore multiple perspectives.";
}
