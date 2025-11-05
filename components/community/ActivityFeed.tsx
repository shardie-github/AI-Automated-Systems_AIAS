"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface Activity {
  id: number;
  activity_type: string;
  metadata: any;
  created_at: string;
  profiles?: { display_name: string; avatar_url?: string };
}

export default function ActivityFeed({ limit = 20 }: { limit?: number }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadActivities();
    const channel = supabase
      .channel("activities")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activities" }, () => {
        loadActivities();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadActivities() {
    const { data } = await supabase
      .from("activities")
      .select("*, profiles(display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (data) setActivities(data);
  }

  const activityIcons: Record<string, string> = {
    post_created: "📝",
    comment_added: "💬",
    badge_earned: "🏆",
    level_up: "⬆️",
    challenge_completed: "✅",
    streak_milestone: "🔥",
    referral_sent: "🎁",
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Recent Activity</div>
      {activities.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">No activity yet</div>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 rounded-xl border p-3 bg-card">
            <div className="text-xl">{activityIcons[activity.activity_type] || "📌"}</div>
            <div className="flex-1">
              <div className="text-sm">
                <span className="font-semibold">{activity.profiles?.display_name || "Someone"}</span>
                {" "}
                {getActivityText(activity.activity_type, activity.metadata)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(activity.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function getActivityText(type: string, metadata: any): string {
  switch (type) {
    case "post_created": return "created a new post";
    case "comment_added": return "added a comment";
    case "badge_earned": return `earned badge: ${metadata.badge_name || "Unknown"}`;
    case "level_up": return `reached level ${metadata.level || "?"}`;
    case "challenge_completed": return `completed challenge: ${metadata.challenge_title || "Unknown"}`;
    case "streak_milestone": return `hit a ${metadata.days || "?"}-day streak! 🔥`;
    case "referral_sent": return "invited a friend";
    default: return "did something";
  }
}
