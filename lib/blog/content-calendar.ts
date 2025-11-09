// Content Calendar System
// Manages blog post publishing schedule and content generation

export interface ContentCalendarEntry {
  date: string;
  title: string;
  category: string;
  keywords: string[];
  affiliateProducts: string[];
  status: "draft" | "scheduled" | "published";
  author?: string;
}

export interface ContentCalendar {
  month: string;
  year: number;
  entries: ContentCalendarEntry[];
}

export const contentCalendar: ContentCalendarEntry[] = [
  {
    date: "2025-01-27",
    title: "10 Ways Canadian SMBs Can Automate with AI (Save 10+ Hours/Week)",
    category: "Automation",
    keywords: ["canadian smb", "ai automation", "shopify", "wave"],
    affiliateProducts: ["Shopify", "Wave", "Stripe"],
    status: "published",
  },
  {
    date: "2025-01-28",
    title: "Shopify Automation: Complete Guide for Canadian E-Commerce",
    category: "E-Commerce",
    keywords: ["shopify", "e-commerce", "automation", "canada"],
    affiliateProducts: ["Shopify", "Stripe"],
    status: "scheduled",
  },
  {
    date: "2025-01-29",
    title: "Wave Accounting Automation: Save 5+ Hours/Week on Bookkeeping",
    category: "Accounting",
    keywords: ["wave accounting", "bookkeeping", "automation", "canada"],
    affiliateProducts: ["Wave"],
    status: "scheduled",
  },
  {
    date: "2025-01-30",
    title: "Canadian Business Automation: ROI Calculator Guide",
    category: "Business",
    keywords: ["roi", "automation", "canadian business", "productivity"],
    affiliateProducts: [],
    status: "scheduled",
  },
  {
    date: "2025-01-31",
    title: "Stripe CAD Automation: Payment Processing Made Easy",
    category: "Payments",
    keywords: ["stripe", "payments", "canada", "automation"],
    affiliateProducts: ["Stripe"],
    status: "scheduled",
  },
];

export function getUpcomingPosts(days: number = 7): ContentCalendarEntry[] {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);

  return contentCalendar.filter(
    (entry) =>
      new Date(entry.date) >= today &&
      new Date(entry.date) <= futureDate &&
      entry.status !== "published"
  );
}

export function getPublishedPosts(limit: number = 10): ContentCalendarEntry[] {
  return contentCalendar
    .filter((entry) => entry.status === "published")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function schedulePost(entry: ContentCalendarEntry): void {
  // This would integrate with actual scheduling system
  const index = contentCalendar.findIndex((e) => e.date === entry.date);
  if (index >= 0) {
    contentCalendar[index] = { ...entry, status: "scheduled" };
  } else {
    contentCalendar.push({ ...entry, status: "scheduled" });
  }
}
