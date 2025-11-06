import { NextRequest, NextResponse } from "next/server";
import { moderateComment, generateSystemsThinkingInsight, type Comment } from "@/lib/blog/comments";

// GET comments for an RSS item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID required" },
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

// POST new comment on RSS item (with AI moderation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, itemTitle, author, email, content, parentId } = body;

    if (!itemId || !author || !email || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create comment
    const comment: Comment = {
      id: `rss-comment-${Date.now()}`,
      articleSlug: `rss-${itemId}`, // Use RSS item ID as slug
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
    const insight = generateSystemsThinkingInsight(comment, { slug: `rss-${itemId}`, title: itemTitle });
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
