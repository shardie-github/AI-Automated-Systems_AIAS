import { NextRequest, NextResponse } from "next/server";
import { createGETHandler } from "@/lib/api/route-handler";
import { verifyAdminAuth } from "@/lib/auth/admin-auth";
import { getAllNotifications } from "@/lib/notifications/seed-round-notifications";

/**
 * Notifications API
 * Returns notifications for health scores, LOI expirations, investor follow-ups, etc.
 */
export async function GET(request: NextRequest) {
  return createGETHandler(request, async () => {
    // Verify admin authentication
    const { user, error: authError } = await verifyAdminAuth(request);
    if (authError || !user) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });
    }

    try {
      const notifications = await getAllNotifications();

      // Group by priority
      const byPriority = {
        critical: notifications.filter((n) => n.priority === "critical"),
        high: notifications.filter((n) => n.priority === "high"),
        medium: notifications.filter((n) => n.priority === "medium"),
        low: notifications.filter((n) => n.priority === "low"),
      };

      return NextResponse.json({
        notifications,
        summary: {
          total: notifications.length,
          critical: byPriority.critical.length,
          high: byPriority.high.length,
          medium: byPriority.medium.length,
          low: byPriority.low.length,
        },
        byPriority,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }
  });
}
