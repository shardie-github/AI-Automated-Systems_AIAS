import { NextRequest, NextResponse } from "next/server";
import { rssFeeds, analyzeRSSItemWithSystemsThinking, type RSSFeedItem } from "@/lib/blog/rss-feed";

// RSS Feed Endpoint
// Fetches and analyzes AI/Tech news with systems thinking perspective

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feed = searchParams.get("feed");
    const category = searchParams.get("category");

    // Filter feeds
    let feeds = rssFeeds.filter(f => f.enabled);
    if (feed) {
      feeds = feeds.filter(f => f.name === feed);
    }
    if (category) {
      feeds = feeds.filter(f => f.category === category);
    }

    // Fetch RSS feeds using rss-parser
    const Parser = (await import('rss-parser')).default;
    const parser = new Parser({
      timeout: 10000,
      maxRedirects: 5,
    });

    const items: RSSFeedItem[] = [];
    const errors: Array<{ feed: string; error: string }> = [];

    // Fetch all feeds in parallel with error handling
    const feedPromises = feeds.map(async (feed) => {
      try {
        const feedData = await parser.parseURL(feed.url);
        if (feedData.items) {
          feedData.items.forEach((item) => {
            items.push({
              title: item.title || '',
              description: item.contentSnippet || item.content || '',
              link: item.link || '',
              source: feed.name,
              pubDate: item.pubDate || new Date().toISOString(),
            });
          });
        }
      } catch (error) {
        errors.push({
          feed: feed.name,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(`Failed to fetch feed ${feed.name}:`, error);
      }
    });

    await Promise.allSettled(feedPromises);

    // Sort items by publication date (newest first)
    items.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      feeds: feeds.map(f => ({
        name: f.name,
        category: f.category,
        url: f.url,
      })),
      items: items.slice(0, 50), // Limit to 50 items
      errors: errors.length > 0 ? errors : undefined,
      count: items.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch RSS feeds" },
      { status: 500 }
    );
  }
}

// POST endpoint to analyze RSS item with systems thinking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, link, source } = body;

    const analysis = analyzeRSSItemWithSystemsThinking({
      title,
      description: description || "",
      link,
      source,
      pubDate: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to analyze RSS item" },
      { status: 500 }
    );
  }
}
