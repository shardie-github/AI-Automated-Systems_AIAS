import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RSSFeedItem } from "@/lib/blog/rss-feed";
import { generateEditorialTake, generateQuickTake } from "@/lib/blog/rss-editorial";
import { RSSItemComments } from "@/components/blog/rss-item-comments";

interface PageProps {
  params: {
    id: string;
  };
}

// Mock function - in production, fetch from database/API
function getRSSItem(id: string): RSSFeedItem | null {
  // TODO: Fetch from database
  // For now, return mock data
  return {
    id,
    title: "OpenAI Releases GPT-5 with Systems Thinking Capabilities",
    link: "https://example.com/news/gpt5",
    description: "OpenAI's latest model includes systems thinking analysis features, enabling multi-perspective problem solving.",
    pubDate: new Date().toISOString(),
    source: "TechCrunch AI",
    category: "AI",
    relevance: "high",
    systemsThinkingAngle: "Directly relates to systems thinking concepts",
    perspectives: ["Technology", "Systems", "Automation"],
    discussionEnabled: true,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = getRSSItem(params.id);
  
  if (!item) {
    return {
      title: "News Item Not Found",
    };
  }

  return {
    title: `${item.title} | AIAS Platform Editorial & Discussion`,
    description: item.description,
  };
}

export default function RSSItemPage({ params }: PageProps) {
  const item = getRSSItem(params.id);

  if (!item) {
    notFound();
  }

  const editorial = generateEditorialTake(item);
  const quickTake = generateQuickTake(item);

  return (
    <div className="container py-16 max-w-4xl">
      {/* Back to News Feed */}
      <div className="mb-6">
        <Link href="/rss-news" className="text-sm text-muted-foreground hover:underline">
          ← Back to AI & Tech News Feed
        </Link>
      </div>

      {/* Original News Item */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {item.source}
            </span>
            {item.category && (
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                {item.category}
              </span>
            )}
            {item.relevance && (
              <span className={`px-3 py-1 rounded-full text-sm ${
                item.relevance === "high" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                  : item.relevance === "medium"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}>
                {item.relevance.charAt(0).toUpperCase() + item.relevance.slice(1)} Relevance
              </span>
            )}
          </div>
          <CardTitle className="text-3xl mb-2">{item.title}</CardTitle>
          <CardDescription className="text-base">
            {item.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <time dateTime={item.pubDate}>
              {new Date(item.pubDate).toLocaleDateString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </time>
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Read Original Article →
            </a>
          </div>

          {/* Systems Thinking Analysis */}
          {item.systemsThinkingAngle && (
            <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg mb-4">
              <p className="font-semibold mb-2">🧠 Systems Thinking Analysis</p>
              <p className="text-sm text-muted-foreground">{item.systemsThinkingAngle}</p>
              {item.perspectives && item.perspectives.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold mb-1">Perspectives:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.perspectives.map((perspective) => (
                      <span
                        key={perspective}
                        className="px-2 py-1 rounded bg-primary/20 text-primary text-xs"
                      >
                        {perspective}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editorial Take */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✍️ Editorial Take
          </CardTitle>
          <CardDescription>
            Our quick editorialized perspective on this news
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Take */}
          <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
            <p className="font-semibold mb-2 text-sm">Quick Take:</p>
            <p className="text-muted-foreground">{quickTake}</p>
          </div>

          {/* Full Editorial */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {editorial.content}
            </p>
          </div>

          {/* Key Takeaways */}
          {editorial.keyTakeaways && editorial.keyTakeaways.length > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-semibold mb-2 text-sm">Key Takeaways:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {editorial.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <span>By {editorial.author}</span>
            <span>•</span>
            <time dateTime={editorial.timestamp}>
              {new Date(editorial.timestamp).toLocaleDateString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </CardContent>
      </Card>

      {/* Discussion Section */}
      {item.discussionEnabled && (
        <RSSItemComments itemId={params.id} itemTitle={item.title} />
      )}

      {/* Related News */}
      <div className="mt-12 text-center bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Want More Editorial Takes?</h2>
        <p className="text-muted-foreground mb-6">
          Get daily AI and tech news with editorialized takes and systems thinking analysis. 
          Join the discussion on each news item.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/rss-news">View All News</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/blog">View Blog Articles</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
