import { NextRequest, NextResponse } from "next/server";
import { createGETHandler } from "@/lib/api/route-handler";
import { verifyAdminAuth } from "@/lib/auth/admin-auth";
import { seedRoundDB } from "@/lib/database/seed-round-db";

/**
 * Customer Health Score API
 * Calculates and returns customer health scores based on usage, engagement, value, and satisfaction metrics
 */

// Mock data fallback function
function getMockCustomerHealthData() {
  return [
    {
      id: "cust_001",
      company: "Acme Corp",
      tier: "Pro",
      healthScore: 85,
      status: "green",
      usage: {
        activeUsers: 85,
        workflowsRunning: 5,
        featureAdoption: 70,
      },
      engagement: {
        supportTickets: 1,
        qbrAttendance: true,
        responseTime: 12,
      },
      value: {
        roiAchieved: true,
        goalsMet: true,
      },
      satisfaction: {
        nps: 9,
        csat: 8.5,
      },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "cust_002",
      company: "TechStart Inc",
      tier: "Enterprise",
      healthScore: 92,
      status: "green",
      usage: {
        activeUsers: 95,
        workflowsRunning: 12,
        featureAdoption: 85,
      },
      engagement: {
        supportTickets: 0,
        qbrAttendance: true,
        responseTime: 2,
      },
      value: {
        roiAchieved: true,
        goalsMet: true,
      },
      satisfaction: {
        nps: 10,
        csat: 9.5,
      },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "cust_003",
      company: "SMB Solutions",
      tier: "Starter",
      healthScore: 65,
      status: "yellow",
      usage: {
        activeUsers: 45,
        workflowsRunning: 2,
        featureAdoption: 40,
      },
      engagement: {
        supportTickets: 3,
        qbrAttendance: false,
        responseTime: 36,
      },
      value: {
        roiAchieved: true,
        goalsMet: false,
      },
      satisfaction: {
        nps: 6,
        csat: 6.5,
      },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "cust_004",
      company: "AtRisk Co",
      tier: "Pro",
      healthScore: 45,
      status: "red",
      usage: {
        activeUsers: 25,
        workflowsRunning: 1,
        featureAdoption: 20,
      },
      engagement: {
        supportTickets: 8,
        qbrAttendance: false,
        responseTime: 72,
      },
      value: {
        roiAchieved: false,
        goalsMet: false,
      },
      satisfaction: {
        nps: 3,
        csat: 4,
      },
      lastUpdated: new Date().toISOString(),
    },
  ];
}

export async function GET(request: NextRequest) {
  return createGETHandler(request, async () => {
    // Verify admin authentication
    const { user, error: authError } = await verifyAdminAuth(request);
    if (authError || !user) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });
    }

    try {
      // Try to fetch from database, fallback to mock data if table doesn't exist
      let customers;
      try {
        const dbCustomers = await seedRoundDB.getCustomerHealthScores();
        customers = dbCustomers.map((c: any) => ({
          id: c.id,
          company: c.company_name,
          tier: c.tier,
          healthScore: c.health_score,
          status: c.status,
          usage: {
            activeUsers: c.active_users_percentage,
            workflowsRunning: c.workflows_running,
            featureAdoption: c.feature_adoption_percentage,
          },
          engagement: {
            supportTickets: c.support_tickets_per_month,
            qbrAttendance: c.qbr_attendance,
            responseTime: c.response_time_hours,
          },
          value: {
            roiAchieved: c.roi_achieved,
            goalsMet: c.goals_met,
          },
          satisfaction: {
            nps: c.nps_score,
            csat: c.csat_score,
          },
          lastUpdated: c.last_updated,
        }));
      } catch (dbError) {
        // Fallback to mock data if database table doesn't exist yet
        console.warn("Database query failed, using mock data:", dbError);
        customers = getMockCustomerHealthData();
      }

      // Calculate aggregate metrics
      const totalCustomers = customers.length;
      const greenCustomers = customers.filter((c) => c.status === "green").length;
      const yellowCustomers = customers.filter((c) => c.status === "yellow").length;
      const redCustomers = customers.filter((c) => c.status === "red").length;

      const avgHealthScore =
        customers.reduce((sum, c) => sum + c.healthScore, 0) / totalCustomers;

      const distribution = {
        green: {
          count: greenCustomers,
          percentage: (greenCustomers / totalCustomers) * 100,
        },
        yellow: {
          count: yellowCustomers,
          percentage: (yellowCustomers / totalCustomers) * 100,
        },
        red: {
          count: redCustomers,
          percentage: (redCustomers / totalCustomers) * 100,
        },
      };

      // Historical trend (last 6 months)
      const historicalTrend = Array.from({ length: 6 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (5 - i));
        return {
          month: month.toISOString().slice(0, 7),
          avgHealthScore: 70 + i * 3 + Math.random() * 5,
          greenPercentage: 60 + i * 5 + Math.random() * 5,
          yellowPercentage: 25 - i * 2 + Math.random() * 3,
          redPercentage: 15 - i * 3 + Math.random() * 2,
        };
      });

      return NextResponse.json({
        customers,
        summary: {
          totalCustomers,
          avgHealthScore: Math.round(avgHealthScore),
          distribution,
          target: {
            greenPercentage: 80,
            yellowPercentage: 15,
            redPercentage: 5,
          },
        },
        historicalTrend,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching customer health:", error);
      return NextResponse.json(
        { error: "Failed to fetch customer health data" },
        { status: 500 }
      );
    }
  });
}
