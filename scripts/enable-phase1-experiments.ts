/**
 * Enable Phase 1 Experiments
 * Low-risk experiments to optimize conversion
 * Run this script to enable Phase 1 experiments
 */

import { featureFlags } from "@/lib/experiments/feature-flags";

/**
 * Phase 1 Experiments (Low-Risk)
 * 1. Value Metric Presentation Test
 * 2. Annual Discount Test (already enabled)
 * 3. Feature Gating Test
 */

async function enablePhase1Experiments() {
  console.log("🚀 Enabling Phase 1 Experiments...\n");

  // Experiment 1: Value Metric Presentation
  console.log("1. Enabling Value Metric Presentation Test...");
  featureFlags.setExperimentEnabled("exp_value_metric", true);
  console.log("   ✅ Enabled: exp_value_metric");
  console.log("   Variants: Agent-focused, Automation-focused, Outcome-focused");
  console.log("   Rollout: 33% / 33% / 34%\n");

  // Experiment 2: Annual Discount (already enabled, but verify)
  console.log("2. Verifying Annual Discount Test...");
  const annualDiscount = featureFlags.getAllExperiments().find(
    (exp) => exp.id === "exp_annual_discount"
  );
  if (annualDiscount?.enabled) {
    console.log("   ✅ Already enabled: exp_annual_discount");
    console.log("   Current variant: 20% discount (100% rollout)\n");
  } else {
    featureFlags.setExperimentEnabled("exp_annual_discount", true);
    console.log("   ✅ Enabled: exp_annual_discount\n");
  }

  // Experiment 3: Feature Gating Test
  console.log("3. Enabling Feature Gating Test...");
  featureFlags.setExperimentEnabled("exp_feature_gating", true);
  console.log("   ✅ Enabled: exp_feature_gating");
  console.log("   Variants: Restrictive Starter, Generous Starter");
  console.log("   Rollout: 50% / 50%\n");

  console.log("✅ Phase 1 Experiments Enabled!");
  console.log("\n📊 Next Steps:");
  console.log("1. Monitor analytics dashboard for experiment metrics");
  console.log("2. Check guardrail metrics (churn, NPS, support load)");
  console.log("3. Review results after 30 days");
  console.log("4. Enable Phase 2 experiments if Phase 1 succeeds");
}

// Run if executed directly
if (require.main === module) {
  enablePhase1Experiments()
    .then(() => {
      console.log("\n✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error enabling experiments:", error);
      process.exit(1);
    });
}

export { enablePhase1Experiments };
