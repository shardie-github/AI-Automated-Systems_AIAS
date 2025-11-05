"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Confetti from "./Confetti";

interface Milestone {
  id: number;
  milestone_type: string;
  achieved_at: string;
}

const MILESTONE_TYPES: Record<string, { title: string; icon: string; xp: number }> = {
  streak_7: { title: "Week Warrior", icon: "🔥", xp: 50 },
  streak_30: { title: "Month Master", icon: "🔥🔥", xp: 200 },
  streak_100: { title: "Century Streak", icon: "🔥🔥🔥", xp: 1000 },
  level_10: { title: "Level 10 Champion", icon: "⭐", xp: 100 },
  level_25: { title: "Level 25 Legend", icon: "⭐⭐", xp: 500 },
  level_50: { title: "Level 50 Elite", icon: "⭐⭐⭐", xp: 2000 },
  xp_1000: { title: "1K XP Club", icon: "💎", xp: 100 },
  xp_10000: { title: "10K XP Master", icon: "👑", xp: 1000 },
  first_badge: { title: "First Badge", icon: "🏆", xp: 25 },
  badge_collector: { title: "Badge Collector", icon: "🎖️", xp: 150 },
};

export default function MilestoneCelebration({ milestoneType }: { milestoneType: string }) {
  const [celebrating, setCelebrating] = useState(true);
  const milestone = MILESTONE_TYPES[milestoneType];

  useEffect(() => {
    const timer = setTimeout(() => setCelebrating(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!milestone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="rounded-3xl border bg-card p-8 max-w-md mx-4 text-center space-y-4 shadow-2xl"
      >
        <div className="text-6xl">{milestone.icon}</div>
        <div className="text-2xl font-bold">Milestone Achieved!</div>
        <div className="text-lg">{milestone.title}</div>
        <div className="text-sm text-muted-foreground">+{milestone.xp} XP Bonus</div>
        <button
          onClick={() => setCelebrating(false)}
          className="w-full h-10 rounded-xl bg-primary text-primary-fg font-medium"
        >
          Awesome!
        </button>
      </motion.div>
      <Confetti when={celebrating} />
    </motion.div>
  );
}

export function MilestoneBadge({ milestoneType }: { milestoneType: string }) {
  const milestone = MILESTONE_TYPES[milestoneType];
  if (!milestone) return null;
  
  return (
    <div className="rounded-xl border p-2 bg-card flex items-center gap-2">
      <div className="text-xl">{milestone.icon}</div>
      <div>
        <div className="text-xs font-semibold">{milestone.title}</div>
        <div className="text-xs text-muted-foreground">Milestone</div>
      </div>
    </div>
  );
}
