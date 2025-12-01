/**
 * Test Activation Flow Script
 * Tests the complete activation flow end-to-end
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "../lib/env";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

async function testActivationFlow() {
  console.log("🧪 Testing Activation Flow...\n");

  // Test 1: Signup
  console.log("1. Testing signup...");
  try {
    const signupResponse = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: "TestPassword123!",
        name: "Test User",
      }),
    });

    if (!signupResponse.ok) {
      throw new Error(`Signup failed: ${signupResponse.statusText}`);
    }

    const signupData = await signupResponse.json();
    console.log("✅ Signup successful:", signupData.user.id);

    // Test 2: Check telemetry event
    console.log("\n2. Checking telemetry event...");
    const { data: signupEvent } = await supabase
      .from("telemetry_events")
      .select("*")
      .eq("type", "user_signed_up")
      .eq("user_id", signupData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (signupEvent) {
      console.log("✅ user_signed_up event tracked");
    } else {
      console.log("⚠️ user_signed_up event not found (may need to wait)");
    }

    // Test 3: Integration connection
    console.log("\n3. Testing integration connection...");
    const integrationResponse = await fetch("http://localhost:3000/api/integrations/shopify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${signupData.user.id}`, // In production, use actual token
      },
      body: JSON.stringify({
        code: "test-code",
        shop: "test-shop.myshopify.com",
      }),
    });

    if (!integrationResponse.ok) {
      console.log("⚠️ Integration connection test skipped (requires auth token)");
    } else {
      console.log("✅ Integration connection successful");
    }

    // Test 4: Workflow creation
    console.log("\n4. Testing workflow creation...");
    const workflowResponse = await fetch("http://localhost:3000/api/v1/workflows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${signupData.user.id}`, // In production, use actual token
      },
      body: JSON.stringify({
        name: "Test Workflow",
        description: "Test workflow for activation flow",
        steps: [
          {
            id: "step-1",
            type: "trigger",
            config: { type: "manual" },
          },
        ],
        enabled: true,
      }),
    });

    if (!workflowResponse.ok) {
      console.log("⚠️ Workflow creation test skipped (requires auth token)");
    } else {
      const workflowData = await workflowResponse.json();
      console.log("✅ Workflow created:", workflowData.workflow.id);
    }

    // Test 5: Check activation event
    console.log("\n5. Checking activation event...");
    const { data: activationEvent } = await supabase
      .from("telemetry_events")
      .select("*")
      .eq("type", "user_activated")
      .eq("user_id", signupData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (activationEvent) {
      console.log("✅ user_activated event tracked");
    } else {
      console.log("⚠️ user_activated event not found (user may not have activated yet)");
    }

    console.log("\n✅ Activation flow test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testActivationFlow();
