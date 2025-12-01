/**
 * Data Enrichment Utilities
 * 
 * Leverages external APIs and secondary data sources to enrich
 * website content and provide value to customers.
 * 
 * Uses sample/demo data where appropriate without lying or embellishing.
 */

/**
 * Fetch real-time data from public APIs to enrich content
 */
export async function enrichWithExternalData(type: string) {
  try {
    switch (type) {
      case "tech_news":
        // Use a real tech news API (e.g., NewsAPI, Dev.to API)
        return await fetchTechNews();
      case "github_stats":
        // Use GitHub API for real repository stats
        return await fetchGitHubStats();
      case "market_data":
        // Use public market data APIs
        return await fetchMarketData();
      default:
        return null;
    }
  } catch (error) {
    console.error(`Data enrichment error for ${type}:`, error);
    return null;
  }
}

/**
 * Fetch tech news from Dev.to API (public, no auth required)
 */
async function fetchTechNews() {
  try {
    const response = await fetch(
      "https://dev.to/api/articles?top=5&per_page=5",
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      return getSampleTechNews();
    }

    const articles = await response.json();
    return {
      source: "dev.to",
      articles: articles.slice(0, 5).map((article: any) => ({
        title: article.title,
        url: article.url,
        publishedAt: article.published_at,
        author: article.user?.name || "Unknown",
      })),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return getSampleTechNews();
  }
}

/**
 * Sample tech news (fallback when API unavailable)
 */
function getSampleTechNews() {
  return {
    source: "sample",
    articles: [
      {
        title: "AI Development Trends in 2025",
        url: "#",
        publishedAt: new Date().toISOString(),
        author: "Tech Community",
      },
      {
        title: "Building Scalable Next.js Applications",
        url: "#",
        publishedAt: new Date().toISOString(),
        author: "Developer Community",
      },
    ],
    fetchedAt: new Date().toISOString(),
    note: "Sample data - API unavailable",
  };
}

/**
 * Fetch GitHub repository statistics
 */
async function fetchGitHubStats() {
  try {
    // Example: Fetch stats for a public repository
    // Replace with actual repository if available
    const repo = "vercel/next.js"; // Public repo for demo
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/vnd.github.v3+json",
        // Note: GitHub API allows unauthenticated requests with rate limits
      },
    });

    if (!response.ok) {
      return getSampleGitHubStats();
    }

    const data = await response.json();
    return {
      source: "github",
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      language: data.language,
      updatedAt: data.updated_at,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return getSampleGitHubStats();
  }
}

/**
 * Sample GitHub stats (fallback)
 */
function getSampleGitHubStats() {
  return {
    source: "sample",
    stars: 120000,
    forks: 25000,
    openIssues: 450,
    language: "TypeScript",
    updatedAt: new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    note: "Sample data - API unavailable",
  };
}

/**
 * Fetch market data (example: crypto prices, stock indices)
 */
async function fetchMarketData() {
  try {
    // Example: Use a public API like CoinGecko for crypto data
    // Or use Alpha Vantage for stock data (requires free API key)
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      return getSampleMarketData();
    }

    const data = await response.json();
    return {
      source: "coingecko",
      bitcoin: data.bitcoin?.usd || 0,
      ethereum: data.ethereum?.usd || 0,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return getSampleMarketData();
  }
}

/**
 * Sample market data (fallback)
 */
function getSampleMarketData() {
  return {
    source: "sample",
    bitcoin: 45000,
    ethereum: 2800,
    fetchedAt: new Date().toISOString(),
    note: "Sample data - API unavailable",
  };
}

/**
 * Enrich user profile with public data sources
 */
export async function enrichUserProfile(userId: string, email: string) {
  // Example: Use email domain to infer company info
  // Or use LinkedIn API (with proper auth) for professional data
  const domain = email.split("@")[1];
  
  return {
    inferredCompany: domain?.split(".")[0] || "Unknown",
    domain: domain,
    enrichedAt: new Date().toISOString(),
  };
}

/**
 * Get industry benchmarks for comparison
 */
export function getIndustryBenchmarks() {
  // Sample industry benchmark data (based on real SaaS metrics)
  return {
    avgSignUpRate: 2.5, // %
    avgActivationRate: 30, // %
    avgRetentionRate: 70, // % (30-day)
    avgTimeToValue: 7, // days
    source: "industry_benchmarks",
    note: "Based on SaaS industry averages",
  };
}

/**
 * Generate realistic sample metrics for demo purposes
 */
export function generateSampleMetrics() {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return {
    newUsersThisWeek: Math.floor(Math.random() * 30) + 40, // 40-70 range
    totalUsers: Math.floor(Math.random() * 500) + 1000,
    avgPostViews: Math.floor(Math.random() * 50) + 80, // 80-130 range
    actionsLastHour: Math.floor(Math.random() * 15) + 15, // 15-30 range
    totalPosts: Math.floor(Math.random() * 200) + 300,
    engagementRate: (Math.random() * 10 + 5).toFixed(2), // 5-15%
    periodStart: oneWeekAgo.toISOString(),
    periodEnd: now.toISOString(),
    note: "Sample metrics for demonstration",
  };
}
