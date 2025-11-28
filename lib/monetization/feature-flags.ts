// Feature Flags for Monetization
// Enable/disable monetization features based on user base metrics

import monetizationConfig from "@/config/monetization.json";

export interface MonetizationMetrics {
  monthlyVisitors?: number;
  monthlyActiveUsers?: number;
  emailSubscribers?: number;
  revenue?: number;
}

export function shouldEnableFeature(
  feature: keyof typeof monetizationConfig.monetization.streams,
  metrics: MonetizationMetrics
): boolean {
  const stream = monetizationConfig.monetization.streams[feature];
  if (!stream) return false;

  // Check if feature is manually disabled
  if (!stream.enabled) return false;

  // Check traffic threshold
  if ('minTraffic' in stream && stream.minTraffic && metrics.monthlyVisitors) {
    if (metrics.monthlyVisitors < stream.minTraffic) return false;
  }

  // Check user threshold
  if ('minUsers' in stream && stream.minUsers && metrics.monthlyActiveUsers) {
    if (metrics.monthlyActiveUsers < stream.minUsers) return false;
  }

  // Check subscriber threshold
  if ('minSubscribers' in stream && stream.minSubscribers && metrics.emailSubscribers) {
    if (metrics.emailSubscribers < stream.minSubscribers) return false;
  }

  return true;
}

export function getEnabledFeatures(metrics: MonetizationMetrics): string[] {
  const features = Object.keys(monetizationConfig.monetization.streams) as Array<
    keyof typeof monetizationConfig.monetization.streams
  >;

  return features.filter((feature) => shouldEnableFeature(feature, metrics));
}

// Get revenue potential for enabled features
export function estimateRevenuePotential(
  enabledFeatures: string[],
  metrics: MonetizationMetrics
): number {
  let estimatedRevenue = 0;

  // Affiliate marketing estimate
  if (enabledFeatures.includes("affiliate") && metrics.monthlyVisitors) {
    const clicks = metrics.monthlyVisitors * 0.02; // 2% CTR
    const conversions = clicks * 0.05; // 5% conversion
    const avgOrderValue = 100;
    const commissionRate = 0.15;
    estimatedRevenue += conversions * avgOrderValue * commissionRate;
  }

  // Sponsored content estimate
  if (enabledFeatures.includes("sponsoredContent") && metrics.monthlyVisitors) {
    if (metrics.monthlyVisitors >= 5000) {
      estimatedRevenue += 2000; // 2 sponsored posts
    }
    if (metrics.monthlyVisitors >= 20000) {
      estimatedRevenue += 4000; // 4 sponsored posts
    }
  }

  // Premium content estimate
  if (enabledFeatures.includes("premiumContent") && metrics.monthlyVisitors) {
    const subscribers = metrics.monthlyVisitors * 0.01; // 1% conversion
    estimatedRevenue += subscribers * 12; // $12/month average
  }

  // Display ads estimate
  if (enabledFeatures.includes("displayAds") && metrics.monthlyVisitors) {
    const pageViews = metrics.monthlyVisitors * 2; // 2 pages per visitor
    const cpm = 8; // $8 CPM
    estimatedRevenue += (pageViews / 1000) * cpm;
  }

  return Math.round(estimatedRevenue);
}
