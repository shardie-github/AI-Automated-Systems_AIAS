import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getLatestArticles, getArticlesByCategory, getFeaturedArticles } from "@/lib/blog/articles";
import { Button } from "@/components/ui/button";
import { AffiliateLink } from "@/components/monetization/affiliate-link";

export const metadata: Metadata = {
  title: "Blog — Systems Thinking + AI | Daily Articles | AIAS Platform",
  description: "Daily articles on systems thinking, AI automation, and business success. RSS feed of AI and tech news analyzed through systems thinking. AI-moderated comments for quality discussions.",
};

export default function BlogPage() {
  const articles = getLatestArticles(14); // All existing articles
  const featuredArticles = getFeaturedArticles();
  const categories = ["Systems Thinking", "GenAI", "E-Commerce", "Automation", "Compliance", "AI", "Productivity", "Career", "Business", "Education"];

  return (
    <div className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Systems Thinking + AI Blog
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Daily articles on systems thinking, AI automation, and business success. 
          <strong className="text-foreground"> New articles published daily.</strong> RSS feed of AI and tech news with systems thinking analysis.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            📰 Daily Publishing
          </span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            🧠 Systems Thinking Focus
          </span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            🤖 AI & Tech News RSS
          </span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            💬 AI-Moderated Comments
          </span>
        </div>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredArticles.map((article) => (
              <Card key={article.slug} className="hover:shadow-lg transition-shadow border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                      {article.category}
                    </span>
                    {article.systemsThinking && (
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                        🧠 Systems Thinking
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    <Link href={`/blog/${article.slug}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <time className="text-xs text-muted-foreground">
                      {new Date(article.publishedDate).toLocaleDateString("en-CA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">All Articles ({articles.length})</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/rss-news">AI & Tech News Feed</Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <Card key={article.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">
                    {article.category}
                  </span>
                  {article.systemsThinking && (
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">
                      🧠
                    </span>
                  )}
                  {article.genAIContentEngine && (
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">
                      🤖
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">
                  <Link href={`/blog/${article.slug}`} className="hover:underline">
                    {article.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm">{article.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <time className="text-xs text-muted-foreground">
                    {new Date(article.publishedDate).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Read →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Daily Publishing Notice */}
      <Card className="bg-primary/10 border-primary/20 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📅 Daily Publishing Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            <strong>New articles published daily.</strong> Each article is analyzed through systems thinking 
            and optimized for SEO, user experience, and conversion. GenAI Content Engine helps create and optimize content.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Article Types:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Systems Thinking</li>
                <li>• AI Automation</li>
                <li>• Business Success</li>
                <li>• Case Studies</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">RSS Feed:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• AI & Tech News</li>
                <li>• Systems Thinking Analysis</li>
                <li>• Daily Curation</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">Comments:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• AI-Moderated</li>
                <li>• Systems Thinking Focus</li>
                <li>• Quality Discussions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GenAI Content Engine */}
      <Card className="bg-primary/10 border-primary/20 mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">GenAI Content Engine</CardTitle>
          <CardDescription>
            Convert your blog posts into optimized website pages automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Upload your blog posts and articles. Our GenAI Content Engine uses systems thinking to analyze your content 
            from 6 perspectives (SEO, UX, structure, conversion, technical, systems), then automatically generates 
            optimized website pages with proper SEO, user experience, and conversion optimization.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Systems Thinking Tools:</strong> When building your content system, consider 
            <AffiliateLink product="Notion"> Notion</AffiliateLink> for interconnected knowledge management, 
            <AffiliateLink product="Zapier"> Zapier</AffiliateLink> for process automation (remember: automation alone isn't enough — apply systems thinking), or 
            <AffiliateLink product="Make"> Make</AffiliateLink> for advanced workflow orchestration. 
            Each tool is powerful, but systems thinking ensures they work together effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/genai-content-engine">Try GenAI Content Engine</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/systems-thinking">Learn About Systems Thinking</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RSS News Feed */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">AI & Tech News RSS Feed</CardTitle>
          <CardDescription>
            Curated AI and tech news analyzed through systems thinking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Get daily AI and tech news from top sources (TechCrunch, The Verge, MIT Technology Review, Hacker News, etc.) 
            analyzed through our systems thinking framework. Each news item is evaluated for systems thinking relevance 
            and provided with insights.
          </p>
          <Button asChild>
            <Link href="/rss-news">View News Feed</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Subscribe */}
      <div className="text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Stay Updated</CardTitle>
            <CardDescription>
              Get daily articles and AI/tech news delivered to your inbox. Systems thinking insights included.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2 border rounded-md"
              />
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Subscribe to Daily Updates
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function BlogPage() {
  return (
    <div className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Canadian Business Automation Blog
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tips, tutorials, and case studies for Canadian businesses automating with AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {blogPosts.map((post) => (
          <Card key={post.slug} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-sm text-muted-foreground mb-2">
                {post.category} • {new Date(post.date).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
              </div>
              <CardTitle className="text-xl">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription>{post.excerpt}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/blog/${post.slug}`}
                className="text-primary hover:underline text-sm font-medium"
              >
                Read more →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 space-y-8">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">GenAI Content Engine</CardTitle>
            <CardDescription>
              Convert your blog posts into optimized website pages automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Upload your blog posts and articles. Our GenAI Content Engine uses systems thinking to analyze your content 
              from 6 perspectives (SEO, UX, structure, conversion, technical, systems), then automatically generates 
              optimized website pages with proper SEO, user experience, and conversion optimization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link href="/genai-content-engine">Try GenAI Content Engine</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/systems-thinking">Learn About Systems Thinking</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            More articles coming soon. Subscribe to get notified.
          </p>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Stay Updated</CardTitle>
              <CardDescription>
                Get the latest tips and case studies delivered to your inbox.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border rounded-md"
                />
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Subscribe
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
