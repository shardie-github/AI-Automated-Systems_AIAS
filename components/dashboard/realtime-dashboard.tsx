"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Radio } from "lucide-react";

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
    // Use the existing supabase client from the integration
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      // Subscribe to activity_log changes
      channel = supabase
        .channel("activity-feed")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "activity_log",
          },
          (payload) => {
            if (payload.new) {
              setActivities((prev) => [payload.new, ...prev].slice(0, 20));
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "posts",
          },
          () => {
            // Post creation can trigger UI updates if needed
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsConnected(true);
            setConnectionError(null);
          } else if (status === "CHANNEL_ERROR") {
            setIsConnected(false);
            setConnectionError("Subscription error");
          } else if (status === "TIMED_OUT") {
            setIsConnected(false);
            setConnectionError("Connection timeout");
          } else if (status === "CLOSED") {
            setIsConnected(false);
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
    } catch (error) {
      setConnectionError("Failed to initialize realtime connection");
      setIsConnected(false);
    }

    // Cleanup on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
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
