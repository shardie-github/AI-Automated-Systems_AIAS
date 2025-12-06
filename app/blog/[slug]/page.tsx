import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getLatestArticles, type BlogArticle } from "@/lib/blog/articles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CommentsSection } from "@/components/blog/comments-section";
import { AffiliateDisclosure } from "@/components/monetization/affiliate-disclosure";
import { AffiliateLink } from "@/components/monetization/affiliate-link";
import { sanitizeHTMLServer } from "@/lib/utils/sanitize-html";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  
  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${article.title} | AIAS Platform Blog`,
    description: article.excerpt,
    keywords: article.seoKeywords || article.tags,
  };
}

export async function generateStaticParams() {
  const articles = getLatestArticles(100);
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default function BlogArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);
  const relatedArticles = getLatestArticles(3).filter(a => a.slug !== params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="container py-16 max-w-4xl">
      <article>
        {/* Back to Blog */}
        <div className="mb-6">
          <Link href="/blog" className="text-sm text-muted-foreground hover:underline">
            ← Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {article.category}
            </span>
            {article.systemsThinking && (
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                🧠 Systems Thinking
              </span>
            )}
            {article.genAIContentEngine && (
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                🤖 GenAI Content Engine
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{article.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>By {article.author}</span>
            <span>•</span>
            <time dateTime={article.publishedDate}>
              {new Date(article.publishedDate).toLocaleDateString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        {/* Affiliate Disclosure */}
        {(article.tags.includes("shopify") || article.tags.includes("wave") || article.tags.includes("stripe") || article.tags.includes("notion") || article.tags.includes("zapier")) && (
          <div className="mb-6">
            <AffiliateDisclosure />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHTMLServer(article.content) }} />
          ) : (
            <ArticleContent article={article} />
          )}

          {/* Systems Thinking Callout */}
          {article.systemsThinking && (
            <div className="bg-primary/10 border-l-4 border-primary p-6 my-8 rounded-r-lg">
              <h3 className="font-semibold text-lg mb-2">🧠 Systems Thinking Perspective</h3>
              <p className="text-muted-foreground">
                This article emphasizes systems thinking — THE critical skill for the AI age. 
                Systems thinking is what makes you stand out in the job market, succeed in business, 
                and achieve optimal outcomes.
              </p>
            </div>
          )}

          {/* GenAI Content Engine Callout */}
          {article.genAIContentEngine && (
            <div className="bg-primary/10 border-l-4 border-primary p-6 my-8 rounded-r-lg">
              <h3 className="font-semibold text-lg mb-2">🤖 GenAI Content Engine</h3>
              <p className="text-muted-foreground mb-4">
                This article was analyzed and optimized using our GenAI Content Engine with systems thinking.
              </p>
              <Button asChild variant="outline">
                <Link href="/genai-content-engine">Try GenAI Content Engine</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <CommentsSection articleSlug={params.slug} />

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((related) => (
              <Card key={related.slug} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href={`/blog/${related.slug}`} className="hover:underline">
                      {related.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm">{related.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/blog/${related.slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Read more →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="mt-12 text-center bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Want More Systems Thinking Content?</h2>
        <p className="text-muted-foreground mb-6">
          Get daily articles on systems thinking, AI automation, and business success. 
          Plus RSS feed of AI and tech news analyzed through systems thinking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/blog">View All Articles</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/rss-news">AI & Tech News Feed</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Component to render article content with affiliate links
function ArticleContent({ article }: { article: BlogArticle }) {
  // Check if article has affiliate-related tags
  const hasAffiliateContent = article.tags.some((tag: string) => 
    ["shopify", "wave", "stripe", "notion", "zapier", "make", "automation", "e-commerce", "accounting"].includes(tag.toLowerCase())
  );

  if (!hasAffiliateContent) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Full article content will be displayed here. This is a placeholder for the article body.
        </p>
        <p className="text-muted-foreground">
          The article will be fully formatted with proper headings, paragraphs, images, and formatting.
        </p>
      </div>
    );
  }

  // Render content with affiliate links based on article tags
  return (
    <div className="space-y-6">
      <p className="text-lg">
        {article.excerpt}
      </p>
      
      {article.tags.includes("shopify") && (
        <div className="space-y-4">
          <h2>E-Commerce Automation with Shopify</h2>
          <p>
            If you're running an e-commerce store, <AffiliateLink product="Shopify">Shopify</AffiliateLink> is one of the most powerful platforms 
            for Canadian businesses. Automating your Shopify store can save you 10+ hours per week on order processing, 
            inventory management, and customer support.
          </p>
        </div>
      )}

      {article.tags.includes("wave") && (
        <div className="space-y-4">
          <h2>Accounting Automation with Wave</h2>
          <p>
            <AffiliateLink product="Wave">Wave Accounting</AffiliateLink> is a Canadian-made accounting tool that's perfect for small businesses. 
            Automating your bookkeeping with Wave can save you 5+ hours per week on invoicing, expense tracking, and financial reporting.
          </p>
        </div>
      )}

      {article.tags.includes("stripe") && (
        <div className="space-y-4">
          <h2>Payment Processing with Stripe</h2>
          <p>
            <AffiliateLink product="Stripe">Stripe</AffiliateLink> offers powerful payment processing with excellent Canadian support. 
            Automating payment workflows can reduce manual errors and save time on reconciliation.
          </p>
        </div>
      )}

      {article.tags.includes("notion") && (
        <div className="space-y-4">
          <h2>Productivity with Notion</h2>
          <p>
            <AffiliateLink product="Notion">Notion</AffiliateLink> is an excellent tool for knowledge management and productivity. 
            When combined with systems thinking, it becomes a powerful platform for organizing your business processes.
          </p>
        </div>
      )}

      {article.tags.includes("automation") && (
        <div className="space-y-4">
          <h2>Automation Tools</h2>
          <p>
            While tools like <AffiliateLink product="Zapier">Zapier</AffiliateLink> and <AffiliateLink product="Make">Make</AffiliateLink> are powerful, 
            they require systems thinking to design effective workflows. Automation alone isn't enough — you need to understand 
            the systems you're automating.
          </p>
        </div>
      )}

      <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
        <h3 className="font-semibold text-lg mb-2">Ready to Start Automating?</h3>
        <p className="text-muted-foreground mb-4">
          AIAS Platform helps Canadian businesses automate their workflows with AI agents. 
          Connect Shopify, Wave, Stripe, and 100+ other tools. Start your free trial today.
        </p>
        <Button asChild>
          <Link href="/signup">Start Free Trial</Link>
        </Button>
      </div>
    </div>
  );
}
