// Editorialized Takes Generator
// Creates quick editorial perspectives on RSS news items

import { RSSFeedItem, analyzeRSSItemWithSystemsThinking } from "./rss-feed";

export interface EditorialTake {
  id: string;
  itemId: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  systemsThinkingPerspectives?: string[];
  keyTakeaways?: string[];
}

// Generate editorialized take for RSS item
export function generateEditorialTake(item: RSSFeedItem): EditorialTake {
  const analysis = analyzeRSSItemWithSystemsThinking(item);
  
  // Generate editorial based on relevance and content
  let editorialContent = "";
  const keyTakeaways: string[] = [];

  if (analysis.relevance === "high") {
    editorialContent = `This news directly connects to systems thinking principles. ${item.title} represents a systemic shift that affects multiple dimensions — not just technology, but how people, processes, and data interact. `;
    
    if (analysis.perspectives && analysis.perspectives.length > 0) {
      editorialContent += `From a systems thinking perspective, this touches on ${analysis.perspectives.join(", ")}. `;
    }
    
    editorialContent += `The real question isn't just "what" this technology does, but "why" it matters systemically and "how" it creates ripple effects across interconnected systems.`;
    
    keyTakeaways.push("Direct systems thinking application");
    keyTakeaways.push("Multi-dimensional impact");
  } else if (analysis.relevance === "medium") {
    editorialContent = `While ${item.title} might seem like a straightforward tech story, systems thinking reveals deeper implications. `;
    
    if (analysis.perspectives && analysis.perspectives.length > 0) {
      editorialContent += `This affects ${analysis.perspectives.join(", ")} — and likely more. `;
    }
    
    editorialContent += `The opportunity here is to look beyond the immediate headline: What root causes does this address? What leverage points exist? How does this create feedback loops in the system? Systems thinking helps us see the forest, not just the trees.`;
    
    keyTakeaways.push("Systems thinking analysis reveals deeper insights");
    if (analysis.perspectives) {
      keyTakeaways.push(`Impacts: ${analysis.perspectives.join(", ")}`);
    }
  } else {
    editorialContent = `At first glance, ${item.title} might not seem directly related to systems thinking. But that's exactly why systems thinking matters here. `;
    editorialContent += `Many businesses focus on individual tools or technologies without understanding how they fit into the larger system. `;
    editorialContent += `This news item could benefit from systems thinking analysis to understand: What problems does this solve at a root cause level? What unintended consequences might emerge? How does this fit into the broader ecosystem?`;
    
    keyTakeaways.push("Systems thinking helps identify hidden connections");
    keyTakeaways.push("Root cause analysis needed");
  }

  editorialContent += ` What's your take? Join the discussion below and share your systems thinking perspective.`;

  return {
    id: `editorial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    itemId: item.id || `item-${Date.now()}`,
    title: `Editorial: ${item.title}`,
    content: editorialContent,
    author: "AIAS Platform Editorial Team",
    timestamp: new Date().toISOString(),
    systemsThinkingPerspectives: analysis.perspectives,
    keyTakeaways,
  };
}

// Generate quick take (shorter version)
export function generateQuickTake(item: RSSFeedItem): string {
  const analysis = analyzeRSSItemWithSystemsThinking(item);
  
  if (analysis.relevance === "high") {
    return `🧠 Systems thinking directly applies here. This news affects multiple dimensions — not just technology, but how people, processes, and data interact systemically.`;
  } else if (analysis.relevance === "medium") {
    const perspectivesText = analysis.perspectives 
      ? `This touches on ${analysis.perspectives.join(", ")}. `
      : "";
    return `💡 Systems thinking perspective: ${perspectivesText}Look beyond the headline — what root causes does this address? What leverage points exist?`;
  }
  
  return `🔍 Systems thinking analysis would help identify: What problems does this solve at a root cause level? How does this fit into the broader ecosystem?`;
}
