import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * POST /api/content/ai/seo
 * Provides SEO optimization suggestions
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get("authorization");
    const token = process.env.CONTENT_STUDIO_TOKEN;
    
    if (!token) {
      return NextResponse.json(
        { error: "Content Studio not configured" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${token}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, type } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    const systemPrompt = `You are an SEO expert. Analyze the provided content and provide specific, actionable suggestions to improve SEO. Focus on:
1. Keyword optimization
2. Readability and clarity
3. Meta description quality
4. Heading structure
5. Content length and depth
6. Call-to-action effectiveness

Provide suggestions in a structured format with specific recommendations.`;

    const userPrompt = `Analyze this ${type || "content"} for SEO optimization:\n\n${content}\n\nProvide specific, actionable suggestions.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const suggestions = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error: any) {
    console.error("SEO analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze SEO" },
      { status: 500 }
    );
  }
}
