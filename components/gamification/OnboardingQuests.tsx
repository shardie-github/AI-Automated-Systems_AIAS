"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { awardXp } from "../gamification/GamificationProvider";
import Confetti from "../gamification/Confetti";
import { hapticTap } from "../gamification/Haptics";

interface OnboardingQuest {
  quest_type: string;
  completed_at?: string;
}

const ONBOARDING_QUESTS = [
  { type: "profile_setup", title: "Complete your profile", xp: 10 },
  { type: "first_post", title: "Create your first post", xp: 15 },
  { type: "first_journal", title: "Write your first journal entry", xp: 20 },
  { type: "first_reaction", title: "React to a post", xp: 5 },
  { type: "invite_friend", title: "Invite a friend", xp: 25 },
];

export default function OnboardingQuests() {
  const [quests, setQuests] = useState<OnboardingQuest[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    loadQuests();
  }, []);

  async function loadQuests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from("onboarding_quests")
      .select("*")
      .eq("user_id", user.id);
    
    if (data) {
      setQuests(data);
      setCompletedCount(data.filter(q => q.completed_at).length);
    }
  }

  async function completeQuest(questType: string) {
    hapticTap();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const quest = ONBOARDING_QUESTS.find(q => q.type === questType);
    if (!quest) return;
    
    const { data: existing } = await supabase
      .from("onboarding_quests")
      .select("*")
      .eq("user_id", user.id)
      .eq("quest_type", questType)
      .single();
    
    if (existing?.completed_at) return;
    
    await supabase.from("onboarding_quests").upsert({
      user_id: user.id,
      quest_type: questType,
      completed_at: new Date().toISOString()
    });
    
    awardXp(quest.xp);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2000);
    loadQuests();
  }

  const completedTypes = new Set(quests.filter(q => q.completed_at).map(q => q.quest_type));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Getting Started</div>
        <div className="text-xs text-muted-foreground">{completedCount}/{ONBOARDING_QUESTS.length} completed</div>
      </div>
      
      <div className="space-y-2">
        {ONBOARDING_QUESTS.map((quest) => {
          const completed = completedTypes.has(quest.type);
          return (
            <div
              key={quest.type}
              className={`rounded-xl border p-3 flex items-center justify-between ${
                completed ? "bg-secondary/50" : "bg-card"
              }`}
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{quest.title}</div>
                <div className="text-xs text-muted-foreground">{quest.xp} XP</div>
              </div>
              {completed ? (
                <div className="text-lg">✓</div>
              ) : (
                <button
                  onClick={() => completeQuest(quest.type)}
                  className="h-8 px-3 rounded-lg bg-primary text-primary-fg text-xs"
                >
                  Complete
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      <Confetti when={celebrating} />
    </div>
  );
}
