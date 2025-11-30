/**
 * Seed Round Database Helper
 * Database operations for Customer Health, LOIs, Investors, and Case Studies
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const seedRoundDB = {
  // Customer Health Scores
  async getCustomerHealthScores() {
    const { data, error } = await supabase
      .from("customer_health_scores")
      .select("*")
      .order("health_score", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCustomerHealthScore(id: string) {
    const { data, error } = await supabase
      .from("customer_health_scores")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async upsertCustomerHealthScore(score: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("customer_health_scores")
      .upsert(score, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // LOIs
  async getLOIs() {
    const { data, error } = await supabase
      .from("lois")
      .select("*")
      .order("date_created", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getLOI(id: string) {
    const { data, error } = await supabase
      .from("lois")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createLOI(loi: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("lois")
      .insert(loi)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLOI(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("lois")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Investors
  async getInvestors() {
    const { data, error } = await supabase
      .from("investors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getInvestor(id: string) {
    const { data, error } = await supabase
      .from("investors")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createInvestor(investor: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("investors")
      .insert(investor)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInvestor(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("investors")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Case Studies
  async getCaseStudies() {
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCaseStudy(id: string) {
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createCaseStudy(caseStudy: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("case_studies")
      .insert(caseStudy)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCaseStudy(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("case_studies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
