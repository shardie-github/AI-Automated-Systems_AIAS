import { NextRequest, NextResponse } from "next/server";
import { moderateComment, generateSystemsThinkingInsight, type Comment } from "@/lib/blog/comments";

// GET comments for an article
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleSlug = searchParams.get("article");

    if (!articleSlug) {
      return NextResponse.json(
        { error: "Article slug required" },
        { status: 400 }
      );
    }

    // TODO: Fetch from database
    // For now, return structure
    return NextResponse.json({
      success: true,
      comments: [],
      message: "Comment system ready. Connect to database to store comments.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST new comment (with AI moderation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleSlug, author, email, content, parentId } = body;

    if (!articleSlug || !author || !email || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create comment
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      articleSlug,
      author,
      email,
      content,
      timestamp: new Date().toISOString(),
      status: "pending",
      parentId,
    };

    // AI Moderation
    const moderation = moderateComment(comment);
    comment.moderationScore = moderation.score;
    comment.status = moderation.approved ? "approved" : "pending";

    // Generate systems thinking insight
    const insight = generateSystemsThinkingInsight(comment, { slug: articleSlug });
    comment.systemsThinkingInsight = insight;

    // TODO: Save to database

    return NextResponse.json({
      success: true,
      comment: {
        ...comment,
        moderation: {
          approved: moderation.approved,
          score: moderation.score,
          reasons: moderation.reasons,
          suggestedAction: moderation.suggestedAction,
        },
        systemsThinkingInsight: insight,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }
}
