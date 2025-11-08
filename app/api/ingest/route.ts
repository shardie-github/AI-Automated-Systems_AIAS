import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "edge";

/**
 * Event ingestion endpoint
 * Proxies to Supabase Edge Function (avoids exposing service key)
 * All configuration loaded dynamically from environment variables
 */
export async function POST(req: NextRequest){
  const body = await req.text();
  const r = await fetch(`${env.supabase.url}/functions/v1/ingest-events`, {
    method: "POST",
    headers: { 
      "content-type":"application/json", 
      "authorization": `Bearer ${env.supabase.anonKey}` 
    },
    body
  });
  return new NextResponse(await r.text(), { status: r.status, headers: { "content-type":"application/json" } });
}
