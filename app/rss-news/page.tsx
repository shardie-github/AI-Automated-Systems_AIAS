import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { rssFeeds } from "@/lib/blog/rss-feed";

export const metadata: Metadata = {
  title: "AI & Tech News Feed | Systems Thinking Analysis | AIAS Platform",
  description: "Curated AI and tech news from top sources, analyzed through systems thinking. Get daily insights on AI, automation, and technology with systems thinking perspectives.",
};

export default function RSSNewsPage() {
  return (
    <div className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          AI & Tech News Feed
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Curated AI and tech news from top sources, analyzed through systems thinking. 
          Get daily insights on AI, automation, and technology with systems thinking perspectives.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          📰 Daily News • 🧠 Systems Thinking Analysis • 🤖 AI & Tech Focus
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
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
                    <p className="font-semibold">Systems Thinking Analysis</p>
                    <p className="text-sm text-muted-foreground">
                      Each news item is analyzed through systems thinking. We identify which perspectives apply 
                      (process, technology, people, data, systems, automation) and provide insights.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold">Daily Curated Updates</p>
                    <p className="text-sm text-muted-foreground">
                      News items are curated daily, analyzed for systems thinking relevance, and presented with 
                      insights on how systems thinking applies to the news.
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
              <CardTitle className="text-2xl">Systems Thinking Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Every news item is analyzed through our systems thinking framework:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Relevance:</strong> High, Medium, or Low relevance to systems thinking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Perspectives:</strong> Which of the 6 perspectives apply (process, technology, people, data, systems, automation)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Insights:</strong> How systems thinking applies to the news</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Commentary:</strong> Systems thinking perspective on implications</span>
                </li>
              </ul>
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
