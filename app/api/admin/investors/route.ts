import { NextRequest, NextResponse } from "next/server";
import { createGETHandler, createPOSTHandler, RouteContext } from "@/lib/api/route-handler";

/**
 * Investor Outreach Tracking API
 * Tracks investor meetings, follow-ups, and deal status for Seed Round
 */

interface Investor {
  id: string;
  name: string;
  firm?: string;
  title: string;
  email: string;
  phone?: string;
  linkedin?: string;
  type: "vc" | "angel" | "strategic";
  tier: "tier1" | "tier2" | "tier3";
  checkSize?: string;
  focus?: string[];
  portfolio?: string[];
  status: "not_contacted" | "warm_intro" | "cold_outreach" | "meeting_scheduled" | "meeting_completed" | "interested" | "passed" | "committed";
  source: "warm_intro" | "cold_outreach" | "event" | "referral";
  dateContacted?: string;
  dateMeeting?: string;
  dateFollowUp?: string;
  notes?: string;
  dealAmount?: number;
  dealStatus?: "pending" | "committed" | "declined";
}

export async function GET(request: NextRequest) {
  return createGETHandler(async () => {
    // TODO: Replace with real database queries
    const investors: Investor[] = [
      {
        id: "inv_001",
        name: "John Smith",
        firm: "First Round Capital",
        title: "Partner",
        email: "john@firstround.com",
        linkedin: "linkedin.com/in/johnsmith",
        type: "vc",
        tier: "tier1",
        checkSize: "$500K-$2M",
        focus: ["B2B SaaS", "Marketplaces"],
        portfolio: ["Notion", "Uber", "Square"],
        status: "meeting_completed",
        source: "warm_intro",
        dateContacted: "2024-01-15",
        dateMeeting: "2024-01-25",
        dateFollowUp: "2024-02-01",
        notes: "Very interested, asked for customer references. Follow up in 1 week.",
        dealStatus: "pending",
      },
      {
        id: "inv_002",
        name: "Sarah Johnson",
        firm: "Accel Partners",
        title: "Principal",
        email: "sarah@accel.com",
        type: "vc",
        tier: "tier1",
        checkSize: "$1M-$5M",
        focus: ["Enterprise Software", "AI/ML"],
        portfolio: ["Slack", "Atlassian"],
        status: "meeting_scheduled",
        source: "cold_outreach",
        dateContacted: "2024-02-01",
        dateMeeting: "2024-02-15",
        notes: "Scheduled for 30 min call. Sent deck in advance.",
      },
      {
        id: "inv_003",
        name: "Mike Davis",
        firm: undefined,
        title: "Angel Investor",
        email: "mike@example.com",
        type: "angel",
        tier: "tier1",
        checkSize: "$50K-$100K",
        focus: ["Automation", "B2B SaaS"],
        portfolio: ["Ex-Zapier Executive"],
        status: "interested",
        source: "warm_intro",
        dateContacted: "2024-01-20",
        dateMeeting: "2024-01-28",
        notes: "Strong domain expertise. Committed $75K pending term sheet.",
        dealAmount: 75000,
        dealStatus: "committed",
      },
      {
        id: "inv_004",
        name: "Emily Chen",
        firm: "Y Combinator",
        title: "Partner",
        email: "emily@ycombinator.com",
        type: "vc",
        tier: "tier1",
        checkSize: "$125K-$500K",
        focus: ["B2B SaaS", "AI", "Developer Tools"],
        portfolio: ["Zapier", "Stripe", "Airbnb"],
        status: "not_contacted",
        source: "cold_outreach",
        notes: "Top priority - need warm intro if possible.",
      },
      {
        id: "inv_005",
        name: "David Wilson",
        firm: "Shopify Ventures",
        title: "Investment Director",
        email: "david@shopify.com",
        type: "strategic",
        tier: "tier1",
        checkSize: "$250K-$1M",
        focus: ["E-commerce Ecosystem"],
        portfolio: ["Shopify Partners"],
        status: "cold_outreach",
        source: "cold_outreach",
        dateContacted: "2024-02-05",
        notes: "Sent cold email. No response yet. Follow up in 1 week.",
        dateFollowUp: "2024-02-12",
      },
    ];

    // Calculate summary
    const totalInvestors = investors.length;
    const contacted = investors.filter((i) => i.status !== "not_contacted").length;
    const meetingsScheduled = investors.filter((i) => 
      i.status === "meeting_scheduled" || i.status === "meeting_completed"
    ).length;
    const meetingsCompleted = investors.filter((i) => i.status === "meeting_completed").length;
    const interested = investors.filter((i) => i.status === "interested" || i.status === "committed").length;
    const committed = investors.filter((i) => i.status === "committed").length;
    const totalCommitted = investors
      .filter((i) => i.dealStatus === "committed" && i.dealAmount)
      .reduce((sum, i) => sum + (i.dealAmount || 0), 0);

    const byType = {
      vc: investors.filter((i) => i.type === "vc").length,
      angel: investors.filter((i) => i.type === "angel").length,
      strategic: investors.filter((i) => i.type === "strategic").length,
    };

    const byStatus = {
      not_contacted: investors.filter((i) => i.status === "not_contacted").length,
      warm_intro: investors.filter((i) => i.status === "warm_intro").length,
      cold_outreach: investors.filter((i) => i.status === "cold_outreach").length,
      meeting_scheduled: investors.filter((i) => i.status === "meeting_scheduled").length,
      meeting_completed: investors.filter((i) => i.status === "meeting_completed").length,
      interested: investors.filter((i) => i.status === "interested").length,
      passed: investors.filter((i) => i.status === "passed").length,
      committed: investors.filter((i) => i.status === "committed").length,
    };

    return NextResponse.json({
      investors,
      summary: {
        total: totalInvestors,
        contacted,
        meetingsScheduled,
        meetingsCompleted,
        interested,
        committed,
        totalCommitted: Math.round(totalCommitted),
        byType,
        byStatus,
      },
    });
  })(request);
}

export async function POST(request: NextRequest) {
  return createPOSTHandler(async (context: RouteContext) => {
    const body = await context.request.json() as Partial<Investor>;
    // TODO: Implement database insert
    const newInvestor: Investor = {
      id: `inv_${Date.now()}`,
      name: body.name || "",
      firm: body.firm,
      title: body.title || "",
      email: body.email || "",
      phone: body.phone,
      linkedin: body.linkedin,
      type: body.type || "vc",
      tier: body.tier || "tier1",
      checkSize: body.checkSize,
      focus: body.focus,
      portfolio: body.portfolio,
      status: body.status || "not_contacted",
      source: body.source || "cold_outreach",
      dateContacted: body.dateContacted,
      dateMeeting: body.dateMeeting,
      dateFollowUp: body.dateFollowUp,
      notes: body.notes,
      dealAmount: body.dealAmount,
      dealStatus: body.dealStatus,
    };

    return NextResponse.json({
      success: true,
      investor: newInvestor,
    });
  })(request);
}
