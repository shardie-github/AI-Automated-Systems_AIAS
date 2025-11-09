import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getLatestArticles } from "@/lib/blog/articles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CommentsSection } from "@/components/blog/comments-section";

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

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          {article.content || (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Full article content will be displayed here. This is a placeholder for the article body.
              </p>
              <p className="text-muted-foreground">
                The article will be fully formatted with proper headings, paragraphs, images, and formatting.
              </p>
            </div>
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
