import { NextRequest, NextResponse } from "next/server";
import { createGETHandler, createPOSTHandler } from "@/lib/api/route-handler";

/**
 * LOI (Letter of Intent) Management API
 * Tracks LOIs for Seed Round fundraising
 */

interface LOI {
  id: string;
  company: string;
  contact: string;
  email: string;
  industry: string;
  companySize: string;
  tier: "Starter" | "Pro" | "Enterprise";
  monthlyCommitment: number;
  annualValue: number;
  timeline: number; // months post-launch
  status: "draft" | "sent" | "signed" | "expired";
  requirements: string[];
  dateCreated: string;
  dateSent?: string;
  dateSigned?: string;
  validUntil?: string;
  notes?: string;
}

export async function GET(request: NextRequest) {
  return createGETHandler(request, async () => {
    // TODO: Replace with real database queries
    const lois: LOI[] = [
      {
        id: "loi_001",
        company: "Acme E-commerce",
        contact: "John Smith",
        email: "john@acme.com",
        industry: "E-commerce",
        companySize: "50-200",
        tier: "Pro",
        monthlyCommitment: 499,
        annualValue: 5988,
        timeline: 3,
        status: "signed",
        requirements: ["Shopify integration", "Slack notifications"],
        dateCreated: "2024-01-15",
        dateSent: "2024-01-20",
        dateSigned: "2024-01-25",
        validUntil: "2024-07-25",
        notes: "Very interested, strong LOI candidate",
      },
      {
        id: "loi_002",
        company: "TechStart SaaS",
        contact: "Sarah Johnson",
        email: "sarah@techstart.com",
        industry: "SaaS",
        companySize: "200-500",
        tier: "Enterprise",
        monthlyCommitment: 2000,
        annualValue: 24000,
        timeline: 6,
        status: "sent",
        requirements: ["SSO", "Custom integrations", "Dedicated CSM"],
        dateCreated: "2024-02-01",
        dateSent: "2024-02-05",
        validUntil: "2024-08-05",
        notes: "Waiting for signature, follow up in 1 week",
      },
      {
        id: "loi_003",
        company: "Professional Services Co",
        contact: "Mike Davis",
        email: "mike@proservices.com",
        industry: "Professional Services",
        companySize: "10-50",
        tier: "Pro",
        monthlyCommitment: 499,
        annualValue: 5988,
        timeline: 2,
        status: "draft",
        requirements: ["Client onboarding automation"],
        dateCreated: "2024-02-10",
        notes: "Draft ready, needs review before sending",
      },
      {
        id: "loi_004",
        company: "Marketing Agency Pro",
        contact: "Emily Chen",
        email: "emily@marketingpro.com",
        industry: "Marketing Agency",
        companySize: "20-100",
        tier: "Starter",
        monthlyCommitment: 99,
        annualValue: 1188,
        timeline: 1,
        status: "signed",
        requirements: ["Client reporting automation"],
        dateCreated: "2024-01-20",
        dateSent: "2024-01-22",
        dateSigned: "2024-01-24",
        validUntil: "2024-07-24",
      },
      {
        id: "loi_005",
        company: "E-commerce Solutions",
        contact: "David Wilson",
        email: "david@ecomsolutions.com",
        industry: "E-commerce",
        companySize: "100-200",
        tier: "Enterprise",
        monthlyCommitment: 2000,
        annualValue: 24000,
        timeline: 4,
        status: "signed",
        requirements: ["Multi-store support", "Advanced analytics"],
        dateCreated: "2024-01-25",
        dateSent: "2024-01-28",
        dateSigned: "2024-02-01",
        validUntil: "2024-08-01",
      },
    ];

    // Calculate summary
    const totalLOIs = lois.length;
    const signedLOIs = lois.filter((l) => l.status === "signed").length;
    const totalARR = lois
      .filter((l) => l.status === "signed")
      .reduce((sum, l) => sum + l.annualValue, 0);
    const avgACV = signedLOIs > 0 ? totalARR / signedLOIs : 0;

    const byTier = {
      Starter: lois.filter((l) => l.tier === "Starter").length,
      Pro: lois.filter((l) => l.tier === "Pro").length,
      Enterprise: lois.filter((l) => l.tier === "Enterprise").length,
    };

    const byStatus = {
      draft: lois.filter((l) => l.status === "draft").length,
      sent: lois.filter((l) => l.status === "sent").length,
      signed: lois.filter((l) => l.status === "signed").length,
      expired: lois.filter((l) => l.status === "expired").length,
    };

    return {
      lois,
      summary: {
        total: totalLOIs,
        signed: signedLOIs,
        totalARR: Math.round(totalARR),
        avgACV: Math.round(avgACV),
        byTier,
        byStatus,
      },
    };
  });
}

export async function POST(request: NextRequest) {
  return createPOSTHandler(request, async (body) => {
    // TODO: Implement database insert
    const newLOI: LOI = {
      id: `loi_${Date.now()}`,
      ...body,
      dateCreated: new Date().toISOString(),
      status: body.status || "draft",
    };

    return {
      success: true,
      loi: newLOI,
    };
  });
}
