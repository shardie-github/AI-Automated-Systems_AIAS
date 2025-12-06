/**
 * Cost Monitor
 * 
 * Monitors costs in real-time and provides alerts when thresholds are exceeded.
 */

import { ServiceCost, CostMetrics } from "./service-costs";
import { logger } from "@/lib/utils/logger";

export interface CostAlert {
  id: string;
  service: string;
  threshold: number;
  current: number;
  period: "daily" | "monthly";
  severity: "warning" | "critical";
  message: string;
  timestamp: number;
}

export interface CostThreshold {
  service?: string; // undefined = all services
  category?: string;
  daily?: number;
  monthly?: number;
  alertEmail?: string;
}

class CostMonitor {
  private thresholds: CostThreshold[] = [];
  private alerts: CostAlert[] = [];
  private costHistory: ServiceCost[] = [];

  /**
   * Add cost threshold
   */
  addThreshold(threshold: CostThreshold): void {
    this.thresholds.push(threshold);
  }

  /**
   * Remove threshold
   */
  removeThreshold(service?: string): void {
    if (service) {
      this.thresholds = this.thresholds.filter((t) => t.service !== service);
    } else {
      this.thresholds = [];
    }
  }

  /**
   * Record cost
   */
  recordCost(cost: ServiceCost): void {
    this.costHistory.push(cost);

    // Keep only last 90 days
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    this.costHistory = this.costHistory.filter((c) => c.timestamp >= cutoff);

    // Check thresholds
    this.checkThresholds(cost);
  }

  /**
   * Check if costs exceed thresholds
   */
  private checkThresholds(cost: ServiceCost): void {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    for (const threshold of this.thresholds) {
      // Check if threshold applies to this service/category
      if (threshold.service && threshold.service !== cost.service) continue;
      if (threshold.category && threshold.category !== cost.category) continue;

      // Calculate current costs
      const dailyCosts = this.costHistory.filter(
        (c) =>
          c.timestamp >= oneDayAgo &&
          (!threshold.service || c.service === threshold.service) &&
          (!threshold.category || c.category === threshold.category)
      );

      const monthlyCosts = this.costHistory.filter(
        (c) =>
          c.timestamp >= oneMonthAgo &&
          (!threshold.service || c.service === threshold.service) &&
          (!threshold.category || c.category === threshold.category)
      );

      const dailyTotal = dailyCosts.reduce((sum, c) => {
        if (c.period === "daily") return sum + c.amount;
        if (c.period === "monthly") return sum + c.amount / 30;
        if (c.period === "yearly") return sum + c.amount / 365;
        return sum;
      }, 0);

      const monthlyTotal = monthlyCosts.reduce((sum, c) => {
        if (c.period === "monthly") return sum + c.amount;
        if (c.period === "daily") return sum + c.amount * 30;
        if (c.period === "yearly") return sum + c.amount / 12;
        return sum;
      }, 0);

      // Check daily threshold
      if (threshold.daily && dailyTotal >= threshold.daily) {
        const severity = dailyTotal >= threshold.daily * 1.5 ? "critical" : "warning";
        this.createAlert({
          service: cost.service,
          threshold: threshold.daily,
          current: dailyTotal,
          period: "daily",
          severity,
          message: `Daily cost threshold exceeded for ${cost.service}: $${dailyTotal.toFixed(2)} / $${threshold.daily}`,
        });
      }

      // Check monthly threshold
      if (threshold.monthly && monthlyTotal >= threshold.monthly) {
        const severity = monthlyTotal >= threshold.monthly * 1.5 ? "critical" : "warning";
        this.createAlert({
          service: cost.service,
          threshold: threshold.monthly,
          current: monthlyTotal,
          period: "monthly",
          severity,
          message: `Monthly cost threshold exceeded for ${cost.service}: $${monthlyTotal.toFixed(2)} / $${threshold.monthly}`,
        });
      }
    }
  }

  /**
   * Create alert
   */
  private createAlert(alert: Omit<CostAlert, "id" | "timestamp">): void {
    const fullAlert: CostAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.alerts.push(fullAlert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Log alert
    logger.warn("Cost threshold exceeded", undefined, {
      service: alert.service,
      threshold: alert.threshold,
      current: alert.current,
      period: alert.period,
      severity: alert.severity,
    });

    // In production, send email/SMS notification
    if (process.env.NODE_ENV === "production") {
      // TODO: Integrate with notification service
    }
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit: number = 50): CostAlert[] {
    return this.alerts.slice(-limit).reverse();
  }

  /**
   * Get active alerts (not resolved)
   */
  getActiveAlerts(): CostAlert[] {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return this.alerts.filter((a) => a.timestamp >= oneHourAgo);
  }

  /**
   * Get cost history
   */
  getCostHistory(days: number = 30): ServiceCost[] {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.costHistory.filter((c) => c.timestamp >= cutoff);
  }

  /**
   * Get thresholds
   */
  getThresholds(): CostThreshold[] {
    return [...this.thresholds];
  }
}

export const costMonitor = new CostMonitor();
