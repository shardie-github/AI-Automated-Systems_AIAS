// Daily Publishing Schedule
// Manages article publishing cadence

export interface PublishingSchedule {
  date: string;
  articleSlug?: string;
  articleTitle?: string;
  status: "scheduled" | "published" | "draft";
  category?: string;
  source?: "original" | "rss-curated" | "genai-generated";
}

// Daily publishing schedule (next 30 days)
export const publishingSchedule: PublishingSchedule[] = [
  {
    date: "2025-01-16",
    articleTitle: "Systems Thinking in Daily Business Operations",
    status: "scheduled",
    category: "Systems Thinking",
    source: "original",
  },
  {
    date: "2025-01-17",
    articleTitle: "How to Apply Systems Thinking to Your AI Projects",
    status: "scheduled",
    category: "Systems Thinking",
    source: "original",
  },
  {
    date: "2025-01-18",
    articleTitle: "GenAI Content Engine: Case Study Results",
    status: "scheduled",
    category: "GenAI",
    source: "genai-generated",
  },
  // ... continue for 30 days
];

// Get schedule for date range
export function getScheduleForDateRange(startDate: string, endDate: string): PublishingSchedule[] {
  return publishingSchedule.filter(
    item => item.date >= startDate && item.date <= endDate
  );
}

// Get next scheduled article
export function getNextScheduledArticle(): PublishingSchedule | undefined {
  const today = new Date().toISOString().split('T')[0];
  return publishingSchedule
    .filter(item => item.status === "scheduled" && item.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}
