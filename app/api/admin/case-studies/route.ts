import { NextRequest, NextResponse } from "next/server";
import { createGETHandler, createPOSTHandler, RouteContext } from "@/lib/api/route-handler";

/**
 * Case Study Management API
 * Tracks customer success stories for sales and marketing
 */

interface CaseStudy {
  id: string;
  title: string;
  customer: string; // Anonymized if needed
  industry: string;
  companySize: string;
  useCase: string;
  tier: "Starter" | "Pro" | "Enterprise";
  date: string;
  status: "draft" | "in_review" | "approved" | "published";
  challenge: {
    background: string;
    problems: string[];
    impact: {
      timeLost: string;
      cost: string;
      businessImpact: string;
    };
    previousSolutions: Array<{
      solution: string;
      whyFailed: string;
    }>;
  };
  solution: {
    whyChosen: string[];
    implementation: {
      timeline: string;
      workflowsCreated: number;
      integrationsUsed: string[];
      teamInvolved: string[];
    };
    keyWorkflows: Array<{
      name: string;
      trigger: string;
      actions: string[];
      result: string;
    }>;
  };
  results: {
    quantitative: {
      timeSaved: {
        before: string;
        after: string;
        saved: string;
        value: string;
      };
      costSavings: {
        before: string;
        after: string;
        netSavings: string;
      };
      roi: {
        investment: string;
        savings: string;
        roi: string;
        paybackPeriod: string;
      };
      businessMetrics: Record<string, { before: string; after: string; improvement: string }>;
    };
    qualitative: {
      quotes: string[];
      benefits: string[];
    };
  };
  testimonial: {
    quote: string;
    author: string;
    title: string;
    company: string;
  };
  lessonsLearned: {
    whatWorked: string[];
    bestPractices: string[];
    recommendations: string[];
  };
  nextSteps: string[];
  metadata: {
    permissionToUse: boolean;
    anonymization: boolean;
    logoUsage: boolean;
    quoteAttribution: boolean;
    useCases: string[];
    industries: string[];
    companySizes: string[];
    tags: string[];
  };
}

export async function GET(request: NextRequest) {
  return createGETHandler(async () => {
    // TODO: Replace with real database queries
    const caseStudies: CaseStudy[] = [
      {
        id: "cs_001",
        title: "How Acme E-commerce Saved 20 Hours Per Week with AI Automated Systems",
        customer: "Acme E-commerce",
        industry: "E-commerce",
        companySize: "50-200 employees",
        useCase: "Order processing automation",
        tier: "Pro",
        date: "2024-01-15",
        status: "published",
        challenge: {
          background: "Acme E-commerce is a growing online retailer processing 500+ orders per day.",
          problems: [
            "Manual order processing was taking 15 hours per week",
            "Orders were getting lost or delayed",
            "No visibility into order status",
          ],
          impact: {
            timeLost: "15 hours per week",
            cost: "$2,000 per month in inefficiencies",
            businessImpact: "Delayed customer deliveries, lost revenue",
          },
          previousSolutions: [
            {
              solution: "Hired additional staff",
              whyFailed: "Expensive and didn't scale",
            },
          ],
        },
        solution: {
          whyChosen: [
            "Fast time-to-value - first workflow in 5 minutes",
            "No code required - business team could build workflows",
            "Enterprise security features",
          ],
          implementation: {
            timeline: "2 weeks",
            workflowsCreated: 3,
            integrationsUsed: ["Shopify", "Slack", "Gmail"],
            teamInvolved: ["Operations Manager", "Customer Success"],
          },
          keyWorkflows: [
            {
              name: "Order Processing Automation",
              trigger: "New order in Shopify",
              actions: ["Send Slack notification", "Create CRM record", "Send confirmation email"],
              result: "Orders processed automatically in seconds",
            },
          ],
        },
        results: {
          quantitative: {
            timeSaved: {
              before: "15 hours per week",
              after: "0 hours (automated)",
              saved: "15 hours per week = 780 hours per year",
              value: "$39,000 per year (at $50/hour)",
            },
            costSavings: {
              before: "$2,000/month in manual labor",
              after: "$499/month (AIAS Platform cost)",
              netSavings: "$1,501/month = $18,012/year",
            },
            roi: {
              investment: "$499/month = $5,988/year",
              savings: "$39,000/year",
              roi: "651%",
              paybackPeriod: "1.8 months",
            },
            businessMetrics: {
              orderProcessingTime: {
                before: "2 hours",
                after: "5 minutes",
                improvement: "96% reduction",
              },
              errorRate: {
                before: "5%",
                after: "0.5%",
                improvement: "90% reduction",
              },
            },
          },
          qualitative: {
            quotes: [
              "AIAS Platform transformed our order processing. We went from 15 hours of manual work to zero.",
              "The time-to-value was incredible - we had our first automation running in under 5 minutes.",
            ],
            benefits: [
              "Team can focus on strategic work instead of manual tasks",
              "Faster response times improved customer satisfaction",
              "Scaled operations without hiring additional staff",
            ],
          },
        },
        testimonial: {
          quote: "AIAS Platform saved us 15 hours per week and $18,000 per year. The ROI was immediate and the platform is incredibly easy to use.",
          author: "John Smith",
          title: "Operations Manager",
          company: "Acme E-commerce",
        },
        lessonsLearned: {
          whatWorked: [
            "Starting with one workflow and expanding",
            "Involving the business team in workflow creation",
          ],
          bestPractices: [
            "Test workflows thoroughly before going live",
            "Monitor workflows regularly for optimization",
          ],
          recommendations: [
            "Start small and scale gradually",
            "Leverage pre-built templates",
          ],
        },
        nextSteps: [
          "Expand to 10 more workflows",
          "Integrate with additional tools",
          "Upgrade to Enterprise tier",
        ],
        metadata: {
          permissionToUse: true,
          anonymization: false,
          logoUsage: true,
          quoteAttribution: true,
          useCases: ["Order Processing", "E-commerce Automation"],
          industries: ["E-commerce"],
          companySizes: ["50-200 employees"],
          tags: ["e-commerce", "order-processing", "automation", "roi"],
        },
      },
    ];

    // Calculate summary
    const total = caseStudies.length;
    const published = caseStudies.filter((cs) => cs.status === "published").length;
    const byTier = {
      Starter: caseStudies.filter((cs) => cs.tier === "Starter").length,
      Pro: caseStudies.filter((cs) => cs.tier === "Pro").length,
      Enterprise: caseStudies.filter((cs) => cs.tier === "Enterprise").length,
    };
    const byIndustry = caseStudies.reduce((acc, cs) => {
      acc[cs.industry] = (acc[cs.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      caseStudies,
      summary: {
        total,
        published,
        byTier,
        byIndustry,
      },
    });
  })(request);
}

export async function POST(request: NextRequest) {
  return createPOSTHandler(async (context: RouteContext) => {
    const body = await context.request.json() as Partial<CaseStudy>;
    // TODO: Implement database insert
    const newCaseStudy: CaseStudy = {
      id: `cs_${Date.now()}`,
      title: body.title || "",
      customer: body.customer || "",
      industry: body.industry || "",
      companySize: body.companySize || "",
      useCase: body.useCase || "",
      tier: body.tier || "Starter",
      date: body.date || new Date().toISOString(),
      status: body.status || "draft",
      challenge: body.challenge || {
        background: "",
        problems: [],
        impact: { timeLost: "", cost: "", businessImpact: "" },
        previousSolutions: [],
      },
      solution: body.solution || {
        whyChosen: [],
        implementation: {
          timeline: "",
          workflowsCreated: 0,
          integrationsUsed: [],
          teamInvolved: [],
        },
        keyWorkflows: [],
      },
      results: body.results || {
        quantitative: {
          timeSaved: { before: "", after: "", saved: "", value: "" },
          costSavings: { before: "", after: "", netSavings: "" },
          roi: { investment: "", savings: "", roi: "", paybackPeriod: "" },
          businessMetrics: {},
        },
        qualitative: { quotes: [], benefits: [] },
      },
      testimonial: body.testimonial || {
        quote: "",
        author: "",
        title: "",
        company: "",
      },
      lessonsLearned: body.lessonsLearned || {
        whatWorked: [],
        bestPractices: [],
        recommendations: [],
      },
      nextSteps: body.nextSteps || [],
      metadata: body.metadata || {
        permissionToUse: false,
        anonymization: false,
        logoUsage: false,
        quoteAttribution: false,
        useCases: [],
        industries: [],
        companySizes: [],
        tags: [],
      },
    };

    return NextResponse.json({
      success: true,
      caseStudy: newCaseStudy,
    });
  })(request);
}
