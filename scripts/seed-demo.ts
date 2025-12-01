#!/usr/bin/env tsx
/**
 * Demo Seed Script
 * 
 * Seeds the database with demo data for demonstration purposes.
 * This script creates:
 * - Demo user accounts
 * - Sample organizations/tenants
 * - Sample AI agents
 * - Sample workflows
 * - Sample integrations
 * 
 * Usage:
 *   pnpm run db:seed:demo
 * 
 * Environment Variables Required:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "../lib/env";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

interface DemoData {
  users: any[];
  tenants: any[];
  agents: any[];
  workflows: any[];
}

async function seedDemo() {
  console.log("🌱 Seeding demo data...\n");

  try {
    // Validate environment
    if (!env.supabase.url || !env.supabase.serviceRoleKey) {
      throw new Error("Missing required Supabase environment variables");
    }

    const demoData: DemoData = {
      users: [],
      tenants: [],
      agents: [],
      workflows: [],
    };

    // 1. Create demo users
    console.log("1. Creating demo users...");
    const demoUsers = [
      {
        email: "demo@aias-platform.com",
        name: "Demo User",
        avatar: null,
      },
      {
        email: "admin@aiautomatedsystems.ca",
        name: "Admin User",
        avatar: null,
      },
    ];

    for (const userData of demoUsers) {
      const { data: user, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: "demo123456", // Change in production!
        email_confirm: true,
        user_metadata: {
          name: userData.name,
        },
      });

      if (error && !error.message.includes("already registered")) {
        console.error(`  ✗ Failed to create user ${userData.email}:`, error.message);
      } else {
        console.log(`  ✓ Created user: ${userData.email}`);
        if (user) demoData.users.push(user);
      }
    }

    // 2. Create demo tenants/organizations
    console.log("\n2. Creating demo tenants...");
    const demoTenants = [
      {
        name: "Demo Company",
        slug: "demo-company",
        description: "Demo organization for showcasing the platform",
      },
      {
        name: "Acme Corp",
        slug: "acme-corp",
        description: "Sample organization",
      },
    ];

    for (const tenantData of demoTenants) {
      const { data: tenant, error } = await supabase
        .from("tenants")
        .insert({
          name: tenantData.name,
          slug: tenantData.slug,
          description: tenantData.description,
        })
        .select()
        .single();

      if (error && !error.message.includes("duplicate")) {
        console.error(`  ✗ Failed to create tenant ${tenantData.name}:`, error.message);
      } else {
        console.log(`  ✓ Created tenant: ${tenantData.name}`);
        if (tenant) demoData.tenants.push(tenant);
      }
    }

    // 3. Create sample AI agents
    console.log("\n3. Creating sample AI agents...");
    const sampleAgents = [
      {
        name: "Customer Support Bot",
        description: "Handles customer inquiries and support tickets",
        model: "gpt-4",
        instructions: "You are a helpful customer support agent. Be friendly and professional.",
        enabled: true,
      },
      {
        name: "Content Generator",
        description: "Generates blog posts and marketing content",
        model: "gpt-4",
        instructions: "You are a content writer. Create engaging, SEO-friendly content.",
        enabled: true,
      },
    ];

    for (const agentData of sampleAgents) {
      const { data: agent, error } = await supabase
        .from("agents")
        .insert({
          ...agentData,
          tenant_id: demoData.tenants[0]?.id || null,
        })
        .select()
        .single();

      if (error) {
        console.error(`  ✗ Failed to create agent ${agentData.name}:`, error.message);
      } else {
        console.log(`  ✓ Created agent: ${agentData.name}`);
        if (agent) demoData.agents.push(agent);
      }
    }

    // 4. Create sample workflows
    console.log("\n4. Creating sample workflows...");
    const sampleWorkflows = [
      {
        name: "Lead Qualification",
        description: "Automatically qualifies leads and adds them to CRM",
        enabled: true,
        steps: [
          {
            type: "trigger",
            name: "Form Submission",
            config: { formId: "contact-form" },
          },
          {
            type: "action",
            name: "AI Qualification",
            config: { agentId: demoData.agents[0]?.id || null },
          },
          {
            type: "action",
            name: "Add to CRM",
            config: { crm: "hubspot" },
          },
        ],
      },
    ];

    for (const workflowData of sampleWorkflows) {
      const { data: workflow, error } = await supabase
        .from("workflows")
        .insert({
          name: workflowData.name,
          description: workflowData.description,
          enabled: workflowData.enabled,
          steps: workflowData.steps,
          tenant_id: demoData.tenants[0]?.id || null,
        })
        .select()
        .single();

      if (error) {
        console.error(`  ✗ Failed to create workflow ${workflowData.name}:`, error.message);
      } else {
        console.log(`  ✓ Created workflow: ${workflowData.name}`);
        if (workflow) demoData.workflows.push(workflow);
      }
    }

    // Summary
    console.log("\n📊 Demo Data Summary:");
    console.log(`  Users: ${demoData.users.length}`);
    console.log(`  Tenants: ${demoData.tenants.length}`);
    console.log(`  Agents: ${demoData.agents.length}`);
    console.log(`  Workflows: ${demoData.workflows.length}`);
    console.log("\n✅ Demo seeding complete!");
    console.log("\n⚠️  Note: Demo user passwords are 'demo123456' - change in production!");

    return demoData;
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedDemo()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDemo };
