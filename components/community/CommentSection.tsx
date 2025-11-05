"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "@/components/gamification/Haptics";

interface Comment {
  id: number;
  body: string;
  user_id: string;
  parent_id?: number;
  created_at: string;
  profiles?: { display_name: string; avatar_url?: string };
}

export default function CommentSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    loadComments();
    const channel = supabase
      .channel(`comments:${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, () => {
        loadComments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(display_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
  }

  async function addComment(parentId?: number) {
    hapticTap();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !newComment.trim()) return;
    await supabase.from("comments").insert({ post_id: postId, user_id: user.id, body: newComment, parent_id: parentId });
    setNewComment("");
    setReplyingTo(null);
  }

  async function addReply() {
    if (!replyingTo || !replyText.trim()) return;
    await addComment(replyingTo);
    setReplyText("");
    setReplyingTo(null);
  }

  const topLevelComments = comments.filter(c => !c.parent_id);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {} as Record<number, Comment[]>);

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">{comments.length} Comments</div>
      
      <div className="flex gap-2">
        <input
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-xl border border-border p-2 text-sm"
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && addComment()}
        />
        <button onClick={() => addComment()} className="h-10 px-4 rounded-xl bg-primary text-primary-fg text-sm">Post</button>
      </div>

      <div className="space-y-4">
        {topLevelComments.map(comment => (
          <div key={comment.id} className="rounded-xl border p-3">
            <div className="flex items-start gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                {comment.profiles?.display_name?.[0] || "U"}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{comment.profiles?.display_name || "Anonymous"}</div>
                <div className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</div>
              </div>
              <button onClick={() => setReplyingTo(comment.id)} className="text-xs text-muted-foreground hover:text-foreground">Reply</button>
            </div>
            <div className="text-sm mb-2">{comment.body}</div>
            
            {replyingTo === comment.id && (
              <div className="flex gap-2 mt-2">
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 rounded-lg border border-border p-2 text-sm"
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && addReply()}
                />
                <button onClick={addReply} className="h-8 px-3 rounded-lg bg-secondary text-sm">Reply</button>
                <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="h-8 px-3 rounded-lg bg-muted text-sm">Cancel</button>
              </div>
            )}

            {repliesByParent[comment.id]?.map(reply => (
              <div key={reply.id} className="ml-6 mt-3 pl-3 border-l-2 border-border">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    {reply.profiles?.display_name?.[0] || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold">{reply.profiles?.display_name || "Anonymous"}</div>
                    <div className="text-xs">{reply.body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
