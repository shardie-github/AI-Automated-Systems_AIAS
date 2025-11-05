"use client";
import Leaderboard from "@/components/gamification/Leaderboard";
import { useState } from "react";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "all_time">("weekly");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <div className="flex gap-2">
          {(["weekly", "monthly", "all_time"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm capitalize ${
                period === p ? "bg-primary text-primary-fg" : "bg-muted"
              }`}
            >
              {p.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <Leaderboard period={period} />
    </div>
  );
}
