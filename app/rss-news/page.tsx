import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { rssFeeds, RSSFeedItem } from "@/lib/blog/rss-feed";
import { generateQuickTake } from "@/lib/blog/rss-editorial";

export const metadata: Metadata = {
  title: "AI & Tech News Feed | Systems Thinking Analysis | AIAS Platform",
  description: "Curated AI and tech news from top sources, analyzed through systems thinking. Get daily insights on AI, automation, and technology with systems thinking perspectives.",
};

// Mock RSS items - in production, fetch from database/API
function getSampleRSSItems(): RSSFeedItem[] {
  return [
    {
      id: "news-1",
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
    },
    {
      id: "news-2",
      title: "New AI Automation Tools Hit the Market",
      link: "https://example.com/news/ai-tools",
      description: "Several new AI automation platforms launch, promising to revolutionize business workflows.",
      pubDate: new Date(Date.now() - 86400000).toISOString(),
      source: "The Verge AI",
      category: "AI",
      relevance: "medium",
      systemsThinkingAngle: "AI/automation topic - systems thinking perspective can be applied",
      perspectives: ["Technology", "Process", "Automation"],
      discussionEnabled: true,
    },
    {
      id: "news-3",
      title: "Systems Thinking Becomes Required Skill in Tech Jobs",
      link: "https://example.com/news/systems-thinking-jobs",
      description: "Tech companies increasingly require systems thinking skills for senior positions.",
      pubDate: new Date(Date.now() - 172800000).toISOString(),
      source: "MIT Technology Review",
      category: "Business",
      relevance: "high",
      systemsThinkingAngle: "Directly relates to systems thinking concepts",
      perspectives: ["People", "Systems"],
      discussionEnabled: true,
    },
  ];
}

export default function RSSNewsPage() {
  const items = getSampleRSSItems();

  return (
    <div className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          AI & Tech News Feed
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Curated AI and tech news from top sources, analyzed through systems thinking. 
          <strong className="text-foreground"> Editorial takes + open discussion.</strong> Get daily insights on AI, automation, and technology with systems thinking perspectives.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            📰 Daily News
          </span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            ✍️ Editorial Takes
          </span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            💬 Open Discussion
          </span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            🧠 Systems Thinking Analysis
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Latest News Items with Editorial Takes */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest News with Editorial Takes</h2>
            <span className="text-sm text-muted-foreground">
              {items.length} items
            </span>
          </div>
          <div className="space-y-6">
            {items.map((item) => {
              const quickTake = generateQuickTake(item);
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
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
                          {item.relevance.charAt(0).toUpperCase() + item.relevance.slice(1)}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">
                      <Link href={`/rss-news/${item.id}`} className="hover:underline">
                        {item.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Quick Editorial Take */}
                    <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="font-semibold mb-2 text-sm flex items-center gap-2">
                        ✍️ Quick Editorial Take
                      </p>
                      <p className="text-sm text-muted-foreground">{quickTake}</p>
                    </div>

                    {/* Systems Thinking Info */}
                    {item.perspectives && item.perspectives.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Perspectives:</span>
                        <div className="flex flex-wrap gap-1">
                          {item.perspectives.map((perspective) => (
                            <span
                              key={perspective}
                              className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs"
                            >
                              {perspective}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <time dateTime={item.pubDate}>
                          {new Date(item.pubDate).toLocaleDateString("en-CA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                        <span>•</span>
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Original Article →
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/rss-news/${item.id}`}>
                            Read Editorial + Discussion
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold">RSS Feed Aggregation</p>
                    <p className="text-sm text-muted-foreground">
                      We aggregate news from top AI and tech sources: TechCrunch, The Verge, MIT Technology Review, 
                      Hacker News, Product Hunt, and more.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold">Systems Thinking Analysis + Editorial Take</p>
                    <p className="text-sm text-muted-foreground">
                      Each news item is analyzed through systems thinking. We provide a quick editorialized take 
                      on the news, identifying which perspectives apply and what it means systemically.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold">Open Discussion</p>
                    <p className="text-sm text-muted-foreground">
                      Every news item opens for discussion. Share your systems thinking perspective, debate implications, 
                      and engage with the community. AI-moderated comments ensure quality discussions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">News Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rssFeeds.map((feed) => (
              <Card key={feed.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{feed.name}</CardTitle>
                  <CardDescription>{feed.category} • {feed.enabled ? "Active" : "Inactive"}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Card className="bg-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl">Editorial Takes + Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Every news item gets:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✍️</span>
                  <span><strong>Quick Editorial Take:</strong> Our immediate systems thinking perspective on the news</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">📝</span>
                  <span><strong>Full Editorial:</strong> Detailed analysis with key takeaways and systems thinking insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">💬</span>
                  <span><strong>Open Discussion:</strong> AI-moderated comments for community dialogue and diverse perspectives</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">🧠</span>
                  <span><strong>Systems Thinking Analysis:</strong> Relevance, perspectives, and implications</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                <strong>Why Editorial Takes?</strong> We don't just share news — we provide context, analysis, and invite 
                discussion. Every news item gets our quick take on what it means systemically, then we open it up for 
                your perspective. It's blog-style commentary meets news aggregation.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="text-center space-y-6 bg-muted/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold">Get Daily AI & Tech News</h2>
            <p className="text-muted-foreground">
              Subscribe to receive daily curated AI and tech news with systems thinking analysis. 
              Stay informed about the latest developments with systems thinking insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/blog">View Blog Articles</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Get Daily Updates</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
