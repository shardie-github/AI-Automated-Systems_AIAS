/**
 * Seed Round Notifications System
 * Sends notifications for health scores, LOI expirations, investor follow-ups, etc.
 */

import { seedRoundDB } from "@/lib/database/seed-round-db";

export interface Notification {
  id: string;
  type: "health_score" | "loi_expiration" | "investor_followup" | "case_study_approval";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  actionUrl?: string;
  createdAt: string;
}

/**
 * Check for customer health score alerts
 */
export async function checkHealthScoreAlerts(): Promise<Notification[]> {
  const notifications: Notification[] = [];

  try {
    const customers = await seedRoundDB.getCustomerHealthScores();

    for (const customer of customers) {
      // Red status - critical alert
      if (customer.status === "red") {
        notifications.push({
          id: `health-${customer.id}`,
          type: "health_score",
          title: `Critical: ${customer.company_name} Health Score`,
          message: `${customer.company_name} has a critical health score of ${customer.health_score}. Immediate action required.`,
          priority: "critical",
          actionUrl: `/admin/metrics/customer-health?customer=${customer.id}`,
          createdAt: new Date().toISOString(),
        });
      }
      // Yellow status - warning
      else if (customer.status === "yellow") {
        notifications.push({
          id: `health-${customer.id}`,
          type: "health_score",
          title: `Warning: ${customer.company_name} At Risk`,
          message: `${customer.company_name} has an at-risk health score of ${customer.health_score}. Review recommended.`,
          priority: "high",
          actionUrl: `/admin/metrics/customer-health?customer=${customer.id}`,
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error("Error checking health score alerts:", error);
  }

  return notifications;
}

/**
 * Check for LOI expiration alerts
 */
export async function checkLOIExpirations(): Promise<Notification[]> {
  const notifications: Notification[] = [];

  try {
    const lois = await seedRoundDB.getLOIs();
    const now = new Date();

    for (const loi of lois) {
      if (loi.valid_until) {
        const expirationDate = new Date(loi.valid_until);
        const daysUntilExpiration = Math.ceil(
          (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Alert 30 days before expiration
        if (daysUntilExpiration <= 30 && daysUntilExpiration > 0 && loi.status === "signed") {
          notifications.push({
            id: `loi-exp-${loi.id}`,
            type: "loi_expiration",
            title: `LOI Expiring Soon: ${loi.company_name}`,
            message: `LOI from ${loi.company_name} expires in ${daysUntilExpiration} days. Follow up to convert to customer.`,
            priority: daysUntilExpiration <= 7 ? "critical" : "high",
            actionUrl: `/admin/lois?loi=${loi.id}`,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking LOI expirations:", error);
  }

  return notifications;
}

/**
 * Check for investor follow-up reminders
 */
export async function checkInvestorFollowUps(): Promise<Notification[]> {
  const notifications: Notification[] = [];

  try {
    const investors = await seedRoundDB.getInvestors();
    const now = new Date();

    for (const investor of investors) {
      if (investor.date_follow_up) {
        const followUpDate = new Date(investor.date_follow_up);
        const daysUntilFollowUp = Math.ceil(
          (followUpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Alert on follow-up date or if overdue
        if (daysUntilFollowUp <= 0) {
          notifications.push({
            id: `investor-followup-${investor.id}`,
            type: "investor_followup",
            title: `Follow Up: ${investor.name}`,
            message: `Follow-up reminder for ${investor.name}${investor.firm ? ` at ${investor.firm}` : ""}. ${daysUntilFollowUp < 0 ? "Overdue!" : "Due today."}`,
            priority: daysUntilFollowUp < -7 ? "critical" : "high",
            actionUrl: `/admin/investors?investor=${investor.id}`,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking investor follow-ups:", error);
  }

  return notifications;
}

/**
 * Get all notifications
 */
export async function getAllNotifications(): Promise<Notification[]> {
  const [healthAlerts, loiExpirations, investorFollowUps] = await Promise.all([
    checkHealthScoreAlerts(),
    checkLOIExpirations(),
    checkInvestorFollowUps(),
  ]);

  return [...healthAlerts, ...loiExpirations, ...investorFollowUps].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
