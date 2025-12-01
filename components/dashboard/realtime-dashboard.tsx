"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Radio } from "lucide-react";
import type { Database } from "@/src/integrations/supabase/types";

/**
 * Realtime Dashboard Component
 * 
 * Client Component that subscribes to Supabase Realtime for live updates.
 * Displays real-time activity feed and metrics.
 */

export function RealtimeDashboard() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setConnectionError("Supabase configuration missing");
      return;
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Subscribe to activity_log changes
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_log",
        },
        (payload) => {
          console.log("New activity received:", payload);
          setActivities((prev) => [payload.new, ...prev].slice(0, 20));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          console.log("New post received:", payload);
          // You can add post-specific handling here
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          setConnectionError(null);
          console.log("✅ Realtime subscription active");
        } else if (status === "CHANNEL_ERROR") {
          setIsConnected(false);
          setConnectionError("Subscription error");
          console.error("❌ Realtime subscription error");
        } else if (status === "TIMED_OUT") {
          setIsConnected(false);
          setConnectionError("Connection timeout");
          console.warn("⚠️ Realtime connection timeout");
        } else if (status === "CLOSED") {
          setIsConnected(false);
          console.log("🔌 Realtime connection closed");
        }
      });

    // Load initial activities
    supabase
      .from("activity_log")
      .select("activity_type, created_at, metadata, user_id")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!error && data) {
          setActivities(data);
        }
      });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Live Activity Feed
          {isConnected ? (
            <Badge variant="default" className="ml-auto">
              <Radio className="w-3 h-3 mr-1 animate-pulse" />
              Live
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-auto">
              Offline
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Real-time updates from Supabase Realtime subscriptions
          {connectionError && (
            <span className="block text-xs text-destructive mt-1">
              {connectionError}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">
                    {activity.activity_type?.replace(/_/g, " ") || "Unknown activity"}
                  </p>
                  {activity.metadata && typeof activity.metadata === "object" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {JSON.stringify(activity.metadata).substring(0, 100)}
                    </p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </p>
                  {idx === 0 && isConnected && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            {isConnected
              ? "Waiting for activity... Real-time updates will appear here."
              : "Connecting to real-time feed..."}
          </p>
        )}

        {!isConnected && !connectionError && (
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Establishing real-time connection...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
