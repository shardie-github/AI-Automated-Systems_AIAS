import { NextResponse } from "next/server";
// import { createServerClient } from "@/lib/supabase/server"; // Will be used for tracking

export async function POST(request: Request) {
  try {
    // const supabase = await createServerClient(); // Will be used for tracking
    const body = await request.json();
    const { embedId, workflowId } = body;

    // Track embed view
    // TODO: Create embed_views table if it doesn't exist
    // For now, just log it
    console.log("Embed view tracked:", { embedId, workflowId, timestamp: new Date().toISOString() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking embed view:", error);
    return NextResponse.json(
      { error: "Failed to track embed view" },
      { status: 500 }
    );
  }
}
