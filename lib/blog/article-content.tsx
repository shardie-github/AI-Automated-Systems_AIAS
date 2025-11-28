// Blog Article Content with Affiliate Links
// Renders article content with automatic affiliate link insertion

// import { AffiliateLink } from "@/components/monetization/affiliate-link"; // Will be used for affiliate link insertion

export function renderArticleContent(article: {
  slug: string;
  title: string;
  tags: string[];
  category: string;
}): string {
  // This would be used to generate HTML content with affiliate links
  // For now, returns structured content
  return JSON.stringify({
    slug: article.slug,
    content: generateContentWithAffiliateLinks(article),
  });
}

function generateContentWithAffiliateLinks(article: {
  slug: string;
  tags: string[];
}): string {
  let content = "";

  // Add affiliate links based on tags
  if (article.tags.includes("shopify")) {
    content += `<p>If you're running an e-commerce store, <a href="#" class="affiliate-link" data-product="Shopify">Shopify</a> is one of the most powerful platforms for Canadian businesses.</p>`;
  }

  if (article.tags.includes("wave")) {
    content += `<p><a href="#" class="affiliate-link" data-product="Wave">Wave Accounting</a> is a Canadian-made accounting tool that's perfect for small businesses.</p>`;
  }

  if (article.tags.includes("stripe")) {
    content += `<p><a href="#" class="affiliate-link" data-product="Stripe">Stripe</a> offers powerful payment processing with excellent Canadian support.</p>`;
  }

  return content;
}
