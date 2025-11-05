"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";

interface ProgressData {
  date: string;
  xp: number;
}

export default function ProgressAnalytics() {
  const [data, setData] = useState<ProgressData[]>([]);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");

  useEffect(() => {
    loadData();
  }, [period]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // In a real implementation, you'd aggregate from activity logs
    // For now, we'll simulate with profile XP changes
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp, created_at")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      // Simulate daily progress (replace with actual activity aggregation)
      const dailyXP = Math.floor(profile.total_xp / days);
      const chartData: ProgressData[] = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        chartData.push({
          date: date.toISOString().split("T")[0],
          xp: dailyXP + Math.floor(Math.random() * 20),
        });
      }
      setData(chartData);
    }
  }

  const maxXp = Math.max(...data.map(d => d.xp), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Progress Analytics</div>
        <div className="flex gap-1">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 py-1 rounded text-xs ${
                period === p ? "bg-primary text-primary-fg" : "bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48 flex items-end gap-1">
        {data.map((point, idx) => (
          <motion.div
            key={idx}
            initial={{ height: 0 }}
            animate={{ height: `${(point.xp / maxXp) * 100}%` }}
            transition={{ delay: idx * 0.01 }}
            className="flex-1 bg-accent rounded-t"
            title={`${point.date}: ${point.xp} XP`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg bg-muted p-2 text-center">
          <div className="text-xs text-muted-foreground">Total XP</div>
          <div className="text-lg font-semibold">{data.reduce((sum, d) => sum + d.xp, 0)}</div>
        </div>
        <div className="rounded-lg bg-muted p-2 text-center">
          <div className="text-xs text-muted-foreground">Avg Daily</div>
          <div className="text-lg font-semibold">
            {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.xp, 0) / data.length) : 0}
          </div>
        </div>
        <div className="rounded-lg bg-muted p-2 text-center">
          <div className="text-xs text-muted-foreground">Best Day</div>
          <div className="text-lg font-semibold">{Math.max(...data.map(d => d.xp), 0)}</div>
        </div>
      </div>
    </div>
  );
}
