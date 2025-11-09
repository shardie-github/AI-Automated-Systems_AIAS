"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, FileText } from "lucide-react";
import { contentCalendar, getUpcomingPosts, getPublishedPosts } from "@/lib/blog/content-calendar";
import Link from "next/link";

export function ContentCalendarView() {
  const upcomingPosts = getUpcomingPosts(14);
  const publishedPosts = getPublishedPosts(10);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {publishedPosts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {upcomingPosts.filter(p => p.status === "scheduled").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {upcomingPosts.filter(p => p.status === "draft").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Target: 4 Posts/Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {publishedPosts.length >= 4 ? "✓" : publishedPosts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Posts (Next 14 Days)
          </CardTitle>
          <CardDescription>
            Scheduled and draft posts for the next two weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingPosts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No upcoming posts scheduled. Create a new post to get started.
              </p>
            ) : (
              upcomingPosts.map((post) => (
                <div
                  key={post.date}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <time className="text-sm font-medium">
                        {new Date(post.date).toLocaleDateString("en-CA", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <Badge
                        variant={
                          post.status === "published"
                            ? "default"
                            : post.status === "scheduled"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {post.status}
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{post.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.affiliateProducts.map((product) => (
                        <Badge key={product} variant="outline" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.status === "scheduled" ? (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Published Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recently Published
          </CardTitle>
          <CardDescription>
            Posts published in the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {publishedPosts.map((post) => (
              <div
                key={post.date}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <time className="text-sm text-muted-foreground">
                      {new Date(post.date).toLocaleDateString("en-CA", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <Badge variant="default">Published</Badge>
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                  <h4 className="font-semibold mb-1">{post.title}</h4>
                  <Link
                    href={`/blog/${post.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View Post →
                  </Link>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/admin/content-calendar/new">Create New Post</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/genai-content-engine">Use GenAI Content Engine</Link>
        </Button>
      </div>
    </div>
  );
}
