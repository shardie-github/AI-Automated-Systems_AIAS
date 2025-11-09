// Database Integration for PMF Metrics
// Connects PMF tracker to Supabase database

import { createClient } from "@supabase/supabase-js";
import { PMFMetrics } from "./pmf-metrics";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export class DatabasePMFTracker {
  async getMetricsFromDatabase(): Promise<PMFMetrics> {
    try {
      // Call the update function first to ensure latest metrics
      await supabase.rpc("update_pmf_metrics_snapshot");

      // Get latest snapshot
      const { data, error } = await supabase
        .from("pmf_metrics_snapshots")
        .select("*")
        .order("snapshot_date", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching PMF metrics:", error);
        return this.getDefaultMetrics();
      }

      return {
        activationRate: data.activation_rate || 0,
        sevenDayRetention: data.seven_day_retention || 0,
        thirtyDayRetention: data.thirty_day_retention || 0,
        nps: data.nps || 0,
        timeToActivation: data.time_to_activation_hours || 0,
        workflowsPerUser: data.workflows_per_user || 0,
        monthlyActiveUsers: data.monthly_active_users || 0,
        weeklyActiveUsers: data.weekly_active_users || 0,
      };
    } catch (error) {
      console.error("Database connection error:", error);
      return this.getDefaultMetrics();
    }
  }

  async trackConversionEvent(
    eventType: string,
    userId?: string,
    sessionId: string,
    properties?: Record<string, any>
  ) {
    try {
      const { error } = await supabase.from("conversion_events").insert({
        event_type: eventType,
        user_id: userId || null,
        session_id: sessionId,
        properties: properties || {},
      });

      if (error) {
        console.error("Error tracking conversion event:", error);
      }
    } catch (error) {
      console.error("Database error:", error);
    }
  }

  async trackUserActivation(userId: string, signupDate: Date) {
    try {
      const { error } = await supabase.from("user_activations").insert({
        user_id: userId,
        signup_date: signupDate.toISOString(),
      });

      if (error && error.code !== "23505") {
        // Ignore duplicate key errors
        console.error("Error tracking user activation:", error);
      }
    } catch (error) {
      console.error("Database error:", error);
    }
  }

  async trackFirstWorkflow(userId: string, workflowCreatedAt: Date) {
    try {
      // Get signup date
      const { data: activation } = await supabase
        .from("user_activations")
        .select("signup_date")
        .eq("user_id", userId)
        .single();

      if (!activation) return;

      const signupDate = new Date(activation.signup_date);
      const timeToActivationHours =
        (workflowCreatedAt.getTime() - signupDate.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from("user_activations")
        .update({
          first_workflow_created_at: workflowCreatedAt.toISOString(),
          time_to_activation_hours: timeToActivationHours,
          workflows_created: 1,
          last_active_at: workflowCreatedAt.toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error tracking first workflow:", error);
      }
    } catch (error) {
      console.error("Database error:", error);
    }
  }

  async trackAffiliateClick(
    affiliateId: string,
    product: string,
    sessionId: string,
    userId?: string,
    referrerUrl?: string
  ) {
    try {
      const { error } = await supabase.from("affiliate_clicks").insert({
        affiliate_id: affiliateId,
        product,
        session_id: sessionId,
        user_id: userId || null,
        referrer_url: referrerUrl || null,
      });

      if (error) {
        console.error("Error tracking affiliate click:", error);
      }
    } catch (error) {
      console.error("Database error:", error);
    }
  }

  async submitNPSSurvey(userId: string, score: number, feedback?: string) {
    try {
      const { error } = await supabase.from("nps_surveys").insert({
        user_id: userId,
        score,
        feedback: feedback || null,
      });

      if (error) {
        console.error("Error submitting NPS survey:", error);
      }
    } catch (error) {
      console.error("Database error:", error);
    }
  }

  private getDefaultMetrics(): PMFMetrics {
    return {
      activationRate: 0,
      sevenDayRetention: 0,
      thirtyDayRetention: 0,
      nps: 0,
      timeToActivation: 0,
      workflowsPerUser: 0,
      monthlyActiveUsers: 0,
      weeklyActiveUsers: 0,
    };
  }
}

export const databasePMFTracker = new DatabasePMFTracker();
