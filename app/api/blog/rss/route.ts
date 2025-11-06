import { NextRequest, NextResponse } from "next/server";
import { rssFeeds, analyzeRSSItemWithSystemsThinking } from "@/lib/blog/rss-feed";

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

    // Fetch RSS feeds (simplified - in production, use RSS parser)
    const items: any[] = [];

    // TODO: Integrate with RSS parser library
    // For now, return structure
    return NextResponse.json({
      success: true,
      feeds: feeds.map(f => ({
        name: f.name,
        category: f.category,
        url: f.url,
      })),
      items: items,
      message: "RSS feed integration ready. Connect RSS parser library to fetch real feeds.",
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
