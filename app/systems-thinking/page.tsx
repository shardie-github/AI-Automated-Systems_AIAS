import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserPlanData } from "@/lib/trial/user-plan";
import { GatedSystemsThinking } from "@/components/systems-thinking/gated-systems-thinking";

export const metadata: Metadata = {
  title: "Systems Thinking: The Critical Skill for the AI Age | AIAS Platform",
  description: "Systems thinking is THE skill needed more than ever in the AI age. It's what makes you stand out in the job market, succeed in business, and achieve optimal outcomes. Learn how systems thinking works with AI.",
};

export default async function SystemsThinkingPage() {
  // Get user plan from database
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userPlan: "free" | "trial" | "starter" | "pro" = "free";
  if (user) {
    const userData = await getUserPlanData(user.id);
    userPlan = userData.plan;
  }

  return (
    <GatedSystemsThinking userPlan={userPlan} />
  );
}
