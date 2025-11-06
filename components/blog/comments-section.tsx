"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  status: "approved" | "pending";
  systemsThinkingInsight?: string;
  likes?: number;
  replies?: Comment[];
}

interface CommentsSectionProps {
  articleSlug: string;
}

export function CommentsSection({ articleSlug }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/blog/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleSlug,
          author,
          email,
          content: newComment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setComments([...comments, data.comment]);
        setNewComment("");
        setAuthor("");
        setEmail("");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-12">
      <Card>
        <CardHeader>
          <CardTitle>AI-Moderated Comments</CardTitle>
          <CardDescription>
            Join the discussion. All comments are moderated by AI using systems thinking principles 
            to ensure quality, relevance, and constructive dialogue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Share your thoughts... (AI moderation ensures quality discussions)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                💡 Tip: Comments that demonstrate systems thinking or multiple perspectives are highly valued!
              </p>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Post Comment"}
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-4 mt-8">
            <h3 className="font-semibold">
              Comments ({comments.filter(c => c.status === "approved").length})
            </h3>
            {comments.filter(c => c.status === "approved").length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments
                .filter(c => c.status === "approved")
                .map((comment) => (
                  <Card key={comment.id} className="bg-muted/30">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{comment.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleDateString("en-CA", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">{comment.content}</p>
                      {comment.systemsThinkingInsight && (
                        <div className="bg-primary/10 border-l-4 border-primary p-3 rounded-r-lg mb-3">
                          <p className="text-xs text-muted-foreground">
                            <strong>🧠 Systems Thinking Insight:</strong> {comment.systemsThinkingInsight}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="hover:text-foreground">Like ({comment.likes || 0})</button>
                        <button className="hover:text-foreground">Reply</button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>

          {/* AI Moderation Notice */}
          <div className="bg-muted/50 p-4 rounded-lg mt-6">
            <p className="text-sm text-muted-foreground">
              <strong>AI Moderation:</strong> Comments are automatically moderated using AI systems thinking analysis. 
              Comments that demonstrate systems thinking, multiple perspectives, or constructive dialogue are prioritized. 
              Spam, toxic content, and off-topic comments are automatically filtered.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
