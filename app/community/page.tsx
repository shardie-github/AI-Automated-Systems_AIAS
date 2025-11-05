"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import ReactionBar from "@/components/social/ReactionBar";
import CommentSection from "@/components/community/CommentSection";
import FollowButton from "@/components/social/FollowButton";
import ReportButton from "@/components/community/ReportButton";
import ActivityFeed from "@/components/community/ActivityFeed";
import ShareButton from "@/components/social/ShareButton";

interface Post {
  id: number;
  body: string;
  title?: string;
  user_id: string;
  created_at: string;
  profiles?: { display_name: string; avatar_url?: string; id: string };
}

export default function Community(){
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");

  useEffect(() => {
    loadPosts();
    const channel = supabase
      .channel("posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        loadPosts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadPosts() {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(display_name, avatar_url, id)")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setPosts(data);
  }

  async function createPost() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !newPost.trim()) return;
    
    await supabase.from("posts").insert({
      user_id: user.id,
      body: newPost,
      title: newPostTitle || undefined
    });
    
    // Create activity
    await supabase.from("activities").insert({
      user_id: user.id,
      activity_type: "post_created",
      metadata: { title: newPostTitle || "Untitled" }
    });
    
    setNewPost("");
    setNewPostTitle("");
    loadPosts();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold">Community</h1>
        
        <div className="rounded-2xl border p-4 bg-card space-y-3">
          <input
            value={newPostTitle}
            onChange={e => setNewPostTitle(e.target.value)}
            placeholder="Post title (optional)"
            className="w-full rounded-xl border border-border p-2 text-sm"
          />
          <textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Share your progress, ask questions, give kudos..."
            rows={4}
            className="w-full rounded-xl border border-border p-3 text-sm"
          />
          <div className="flex justify-end">
            <button
              onClick={createPost}
              className="h-10 px-4 rounded-xl bg-primary text-primary-fg text-sm font-medium"
            >
              Post
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl border p-4 bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm">
                    {post.profiles?.display_name?.[0] || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{post.profiles?.display_name || "Anonymous"}</div>
                      {post.profiles?.id && <FollowButton userId={post.profiles.id} />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <ReportButton postId={post.id} />
              </div>
              
              {post.title && <div className="text-sm font-semibold mb-2">{post.title}</div>}
              <div className="text-sm mb-3">{post.body}</div>
              
              <div className="flex items-center justify-between">
                <ReactionBar />
                <ShareButton title={post.title || "Community Post"} text={post.body} url={`/community#post-${post.id}`} />
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <CommentSection postId={post.id} />
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <ActivityFeed limit={10} />
      </div>
    </div>
  );
}
