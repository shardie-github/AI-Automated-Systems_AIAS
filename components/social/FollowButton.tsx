"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "../gamification/Haptics";

export default function FollowButton({ userId }: { userId: string }) {
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    checkFollowStatus();
    loadFollowerCount();
  }, [userId]);

  async function checkFollowStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === userId) return;
    
    const { data } = await supabase
      .from("user_follows")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .single();
    
    setFollowing(!!data);
  }

  async function loadFollowerCount() {
    const { count } = await supabase
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);
    
    if (count !== null) setFollowerCount(count);
  }

  async function toggleFollow() {
    hapticTap();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === userId) return;
    
    if (following) {
      await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);
      setFollowing(false);
      setFollowerCount(c => Math.max(0, c - 1));
    } else {
      await supabase.from("user_follows").insert({ follower_id: user.id, following_id: userId });
      setFollowing(true);
      setFollowerCount(c => c + 1);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleFollow}
        className={`h-10 px-4 rounded-xl text-sm font-medium ${
          following ? "bg-secondary" : "bg-primary text-primary-fg"
        }`}
      >
        {following ? "Following" : "Follow"}
      </button>
      <div className="text-sm text-muted-foreground">{followerCount} followers</div>
    </div>
  );
}
