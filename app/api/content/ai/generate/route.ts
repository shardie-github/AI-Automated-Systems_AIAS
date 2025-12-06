import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * POST /api/content/ai/generate
 * Uses GenAI to generate or optimize content
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication - support both admin token and legacy env token
    const authHeader = request.headers.get("authorization");
    const providedToken = authHeader?.replace("Bearer ", "");
    
    if (!providedToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let isAuthorized = false;
    
    try {
      const supabaseAdmin = createClient(
        env.supabase.url,
        env.supabase.serviceRoleKey
      );

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("content_studio_token", providedToken)
        .single();

      if (profile) {
        const { data: roleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id)
          .eq("role", "admin")
          .single();

        if (roleData) {
          isAuthorized = true;
        }
      }
    } catch {
      // Fall back to legacy token
    }

    if (!isAuthorized) {
      const legacyToken = process.env.CONTENT_STUDIO_TOKEN;
      if (legacyToken && providedToken === legacyToken) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt, type, context, currentContent } = body;

    if (!prompt || !type) {
      return NextResponse.json(
        { error: "Prompt and type are required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
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

    // Build system prompt based on type
    let systemPrompt = "";
    switch (type) {
      case "hero-title":
        systemPrompt = "You are a marketing copywriter specializing in compelling hero section titles for B2B SaaS and AI platforms. Create concise, impactful titles that highlight value propositions.";
        break;
      case "hero-description":
        systemPrompt = "You are a marketing copywriter creating hero section descriptions. Write clear, benefit-focused descriptions that convert visitors into customers.";
        break;
      case "feature-description":
        systemPrompt = "You are a product marketing writer. Create clear, benefit-focused feature descriptions that explain value to potential customers.";
        break;
      case "testimonial":
        systemPrompt = "You are a copywriter creating authentic customer testimonials. Write realistic, specific testimonials that highlight real benefits and outcomes.";
        break;
      case "faq-answer":
        systemPrompt = "You are a customer support expert writing FAQ answers. Provide clear, helpful, and accurate answers to common customer questions.";
        break;
      case "optimize":
        systemPrompt = "You are a marketing optimization expert. Improve existing copy to be more compelling, clear, and conversion-focused while maintaining the original message.";
        break;
      default:
        systemPrompt = "You are a professional marketing copywriter. Create compelling, conversion-focused content.";
    }

    // Build user prompt
    let userPrompt = prompt;
    if (context) {
      userPrompt += `\n\nContext: ${context}`;
    }
    if (currentContent) {
      userPrompt += `\n\nCurrent content: ${currentContent}`;
    }

    // Generate content
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using cost-effective model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const generatedContent = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      content: generatedContent,
    });
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}
