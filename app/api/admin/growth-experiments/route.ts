import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch experiments from database or experiment tracking system
  // For now, return mock data structure
  return NextResponse.json({
    experiments: [],
    message: "Experiments will be tracked here. See yc/500_GLOBAL_EXPERIMENTS.md for experiment plans.",
  });
}
