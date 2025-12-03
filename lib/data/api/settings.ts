/**
 * Settings Data Access Layer
 * 
 * Centralized functions for fetching user/application settings.
 */

import { createClient } from "@/lib/supabase/client";

export interface UserSettings {
  id: string;
  user_id: string;
  theme?: "light" | "dark" | "system";
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  language?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get current user's settings
 */
export async function getCurrentUserSettings(): Promise<UserSettings | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found - return default settings
      return null;
    }
    throw new Error(error.message || "Failed to fetch settings");
  }

  return data as UserSettings;
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  updates: Partial<Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<UserSettings> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Try to update existing settings
  const { data: existing } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from("user_settings")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Failed to update settings");
    }

    return data as UserSettings;
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        ...updates,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Failed to create settings");
    }

    return data as UserSettings;
  }
}
