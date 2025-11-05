"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "@/components/gamification/Haptics";

export default function ReportButton({ postId, commentId }: { postId?: number; commentId?: number }) {
  const [reported, setReported] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");

  async function submitReport() {
    hapticTap();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !reason.trim()) return;
    
    await supabase.from("moderation_flags").insert({
      flagged_by: user.id,
      post_id: postId || null,
      comment_id: commentId || null,
      reason: reason,
      status: "pending"
    });
    
    setReported(true);
    setShowForm(false);
    setReason("");
    setTimeout(() => setReported(false), 3000);
  }

  if (reported) {
    return <div className="text-xs text-muted-foreground">Reported ✓</div>;
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Report
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <select
        value={reason}
        onChange={e => setReason(e.target.value)}
        className="w-full rounded-lg border border-border p-2 text-sm"
      >
        <option value="">Select reason...</option>
        <option value="spam">Spam</option>
        <option value="harassment">Harassment</option>
        <option value="inappropriate">Inappropriate Content</option>
        <option value="misinformation">Misinformation</option>
        <option value="other">Other</option>
      </select>
      <div className="flex gap-2">
        <button
          onClick={submitReport}
          disabled={!reason}
          className="flex-1 h-8 rounded-lg bg-primary text-primary-fg text-xs disabled:opacity-50"
        >
          Submit
        </button>
        <button
          onClick={() => { setShowForm(false); setReason(""); }}
          className="flex-1 h-8 rounded-lg bg-muted text-xs"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
