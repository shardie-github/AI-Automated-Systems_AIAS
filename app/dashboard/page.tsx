import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/src/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Eye, Activity, MessageSquare, Zap } from "lucide-react";
import { enrichWithExternalData, generateSampleMetrics, getIndustryBenchmarks } from "@/lib/data-enrichment";
import { HealthMonitor } from "@/components/monitoring/health-monitor";
import { RealtimeDashboard } from "@/components/dashboard/realtime-dashboard";
import { DashboardUpgradeSection } from "@/components/dashboard/dashboard-upgrade-section";
import { WhatsNextChecklist } from "@/components/onboarding/whats-next-checklist";
import { UsageProgressBanner } from "@/components/monetization/usage-progress-banner";
import { TrialCountdownBanner } from "@/components/monetization/trial-countdown-banner";
import { DashboardClient } from "./dashboard-client";

/**
 * Public Dashboard: "Loud & High" Social Proof Metrics
 * 
 * Server Component that displays real-time aggregated metrics from Supabase.
 * This acts as "smoke signals" showing the ecosystem is alive and active.
 * 
 * Now includes Supabase Realtime subscriptions for live updates.
 */

async function getKPIData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // Return sample data if Supabase not configured
    return generateSampleMetrics();
  }

  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Fetch KPI views
    const [kpi1, kpi2, kpi3, profilesCount, postsCount] = await Promise.all([
      supabase.from("kpi_new_users_week").select("*").single(),
      supabase.from("kpi_avg_post_views").select("*").single(),
      supabase.from("kpi_actions_last_hour").select("*").single(),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }),
    ]);

    return {
      newUsersThisWeek: kpi1.data?.new_users_count || 0,
      avgPostViews: Number(kpi2.data?.avg_post_views || 0),
      actionsLastHour: kpi3.data?.actions_count || 0,
      totalUsers: profilesCount.count || 0,
      totalPosts: postsCount.count || 0,
      kpi1Met: kpi1.data?.threshold_met || false,
      kpi2Met: kpi2.data?.threshold_met || false,
      kpi3Met: kpi3.data?.threshold_met || false,
    };
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    // Return sample data on error
    return generateSampleMetrics();
  }
}

async function getRecentActivity() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return [];
  }

  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data } = await supabase
      .from("activity_log")
      .select("activity_type, created_at, metadata")
      .order("created_at", { ascending: false })
      .limit(10);

    return data || [];
  } catch {
    return [];
  }
}

async function getTopPosts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return [];
  }

  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data } = await supabase
      .from("posts")
      .select("id, title, view_count, created_at")
      .order("view_count", { ascending: false })
      .limit(5);

    return data || [];
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const kpiData = await getKPIData();
  const recentActivity = await getRecentActivity();
  const topPosts = await getTopPosts();
  const benchmarks = getIndustryBenchmarks();
  
  // Enrich with external data
  const techNews = await enrichWithExternalData("tech_news");

  const allCylindersFiring =
    (kpiData as any).kpi1Met &&
    (kpiData as any).kpi2Met &&
    (kpiData as any).kpi3Met;

  // TODO: Get user plan from session/database
  const userPlan: "free" | "trial" | "starter" | "pro" = "trial"; // Placeholder
  const isFirstVisit = false; // TODO: Check from database

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Upgrade prompts and welcome dashboard */}
      <DashboardUpgradeSection userPlan={userPlan} isFirstVisit={isFirstVisit} />
      
      {/* Quick Links */}
      <div className="mb-6 flex gap-4">
        <a
          href="/dashboard/analytics"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          View Analytics
        </a>
        <a
          href="/workflows"
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Manage Workflows
        </a>
      </div>
      
      {/* Client-side components for upgrade nudges and checklist */}
      <DashboardClient />
      
      {/* Show empty state for first-time users */}
      {isFirstVisit && (
        <div className="mb-8">
          {/* Welcome dashboard will be shown by DashboardUpgradeSection if isFirstVisit is true */}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Ecosystem Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time metrics showing our living, breathing community
        </p>
        {allCylindersFiring && (
          <Badge className="mt-4" variant="default">
            <Zap className="w-4 h-4 mr-1" />
            All Cylinders Firing ✓
          </Badge>
        )}
      </div>

      {/* Health Monitor */}
      <div className="mb-8">
        <HealthMonitor autoRefresh={true} refreshInterval={60000} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              New Users This Week
            </CardTitle>
            <CardDescription>KPI 1: Growth Momentum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpiData.newUsersThisWeek}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Threshold: 50+ users
              {(kpiData as any).kpi1Met ? (
                <Badge className="ml-2" variant="default">
                  ✓ Met
                </Badge>
              ) : (
                <Badge className="ml-2" variant="secondary">
                  Needs Growth
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Average Post Views
            </CardTitle>
            <CardDescription>KPI 2: Content Engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(kpiData.avgPostViews)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Threshold: 100+ views
              {(kpiData as any).kpi2Met ? (
                <Badge className="ml-2" variant="default">
                  ✓ Met
                </Badge>
              ) : (
                <Badge className="ml-2" variant="secondary">
                  Building
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Actions Last Hour
            </CardTitle>
            <CardDescription>KPI 3: Real-Time Engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpiData.actionsLastHour}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Threshold: 20+ actions
              {(kpiData as any).kpi3Met ? (
                <Badge className="ml-2" variant="default">
                  ✓ Met
                </Badge>
              ) : (
                <Badge className="ml-2" variant="secondary">
                  Active
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Dashboard Component */}
      <div className="mb-8">
        <RealtimeDashboard />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Community Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Users</span>
                <span className="font-semibold">{kpiData.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Posts</span>
                <span className="font-semibold">{kpiData.totalPosts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Industry Avg Sign-Up</span>
                <span className="font-semibold">{benchmarks.avgSignUpRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Most Engaged Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPosts.length > 0 ? (
              <div className="space-y-3">
                {topPosts.map((post: any) => (
                  <div key={post.id} className="flex justify-between items-center">
                    <span className="text-sm truncate flex-1">
                      {post.title || `Post #${post.id}`}
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      {post.view_count} views
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No posts yet. Be the first to create content!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Live engagement signals from the community</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((activity: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-sm capitalize">
                    {activity.activity_type?.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Activity feed will appear here as users engage with the platform.
            </p>
          )}
        </CardContent>
      </Card>

      {/* External Data Enrichment */}
      {techNews && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tech Community Insights</CardTitle>
            <CardDescription>
              Enriched with data from {techNews.source === "dev.to" ? "Dev.to API" : "sample data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {techNews.articles && techNews.articles.length > 0 ? (
              <div className="space-y-2">
                {techNews.articles.slice(0, 3).map((article: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {article.title}
                    </a>
                    <span className="text-muted-foreground ml-2">
                      by {article.author}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
            {techNews.note && (
              <p className="text-xs text-muted-foreground mt-2">{techNews.note}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
