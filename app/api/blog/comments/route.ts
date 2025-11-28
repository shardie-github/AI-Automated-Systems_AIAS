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

    // Fetch from database
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: comments, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_slug', articleSlug)
      .eq('approved', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch comments:', error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comments: comments || [],
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
    const insight = generateSystemsThinkingInsight(comment, { slug: articleSlug } as any);
    comment.systemsThinkingInsight = insight;

    // Save to database
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: _savedComment, error: saveError } = await supabase
      .from('blog_comments')
      .insert({
        post_slug: articleSlug,
        author_name: author,
        author_email: email,
        content: content,
        parent_id: parentId || null,
        approved: moderation.approved,
        moderation_score: moderation.score,
        moderation_reasons: moderation.reasons,
        systems_thinking_insight: insight,
        status: moderation.approved ? 'approved' : 'pending',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save comment:', saveError);
      return NextResponse.json(
        { error: "Failed to save comment" },
        { status: 500 }
      );
    }

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
