"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  xp_earned: number;
  rank: number;
  profiles?: { display_name: string; avatar_url?: string };
}

export default function Leaderboard({ period = "weekly" }: { period?: "weekly" | "monthly" | "all_time" }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  async function loadLeaderboard() {
    setLoading(true);
    let periodStart: string;
    
    if (period === "weekly") {
      periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (period === "monthly") {
      periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      periodStart = "1970-01-01T00:00:00Z";
    }

    const { data } = await supabase
      .from("leaderboard_entries")
      .select("*, profiles(display_name, avatar_url)")
      .eq("period", period)
      .gte("period_start", periodStart)
      .order("xp_earned", { ascending: false })
      .limit(10);
    
    if (data) {
      const ranked = data.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
      setEntries(ranked);
    }
    setLoading(false);
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => loadLeaderboard()}
          className={`px-3 py-1 rounded-lg text-sm ${period === "weekly" ? "bg-primary text-primary-fg" : "bg-muted"}`}
        >
          Weekly
        </button>
        <button
          onClick={() => loadLeaderboard()}
          className={`px-3 py-1 rounded-lg text-sm ${period === "monthly" ? "bg-primary text-primary-fg" : "bg-muted"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => loadLeaderboard()}
          className={`px-3 py-1 rounded-lg text-sm ${period === "all_time" ? "bg-primary text-primary-fg" : "bg-muted"}`}
        >
          All Time
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.user_id} className="flex items-center gap-3 rounded-xl border p-3 bg-card">
              <div className="text-lg w-8 text-center">
                {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm">
                {entry.profiles?.display_name?.[0] || "U"}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{entry.profiles?.display_name || "Anonymous"}</div>
                <div className="text-xs text-muted-foreground">{entry.xp_earned} XP</div>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">No entries yet</div>
          )}
        </div>
      )}
    </div>
  );
}
