"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { awardXp } from "./GamificationProvider";
import { hapticTap } from "./Haptics";
import Confetti from "./Confetti";

interface Challenge {
  id: number;
  title: string;
  description: string;
  challenge_type: string;
  start_date: string;
  end_date: string;
  xp_reward: number;
  requirements: any;
}

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [participating, setParticipating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [_progress, setProgress] = useState<any>({});
  const [completedCelebration, setCompletedCelebration] = useState(false);

  useEffect(() => {
    checkParticipation();
  }, [challenge.id]);

  async function checkParticipation() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", challenge.id)
      .eq("user_id", user.id)
      .single();
    
    if (data) {
      setParticipating(true);
      setProgress(data.progress || {});
      setCompleted(!!data.completed_at);
    }
  }

  async function joinChallenge() {
    hapticTap();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from("challenge_participants").insert({
      challenge_id: challenge.id,
      user_id: user.id,
        progress: _progress
    });
    setParticipating(true);
  }

  async function completeChallenge() {
    hapticTap();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from("challenge_participants")
      .update({ completed_at: new Date().toISOString() })
      .eq("challenge_id", challenge.id)
      .eq("user_id", user.id);
    
    awardXp(challenge.xp_reward);
    setCompleted(true);
    setCompletedCelebration(true);
    setTimeout(() => setCompletedCelebration(false), 3000);
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className={`rounded-2xl border p-4 bg-card ${completed ? "ring-2 ring-accent" : ""}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="text-sm font-semibold">{challenge.title}</div>
          <div className="text-xs text-muted-foreground">{challenge.description}</div>
        </div>
        <div className="text-xs text-muted-foreground">{daysLeft}d left</div>
      </div>
      
      <div className="text-xs text-muted-foreground mb-3">
        Reward: {challenge.xp_reward} XP
      </div>

      {!participating ? (
        <button onClick={joinChallenge} className="w-full h-10 rounded-xl bg-primary text-primary-fg text-sm font-medium">
          Join Challenge
        </button>
      ) : completed ? (
        <div className="w-full h-10 rounded-xl bg-secondary flex items-center justify-center text-sm font-medium">
          ✓ Completed
        </div>
      ) : (
        <button onClick={completeChallenge} className="w-full h-10 rounded-xl bg-accent text-accent-foreground text-sm font-medium">
          Mark Complete
        </button>
      )}
      
      <Confetti when={completedCelebration} />
    </div>
  );
}
