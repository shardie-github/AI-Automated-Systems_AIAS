# Lean Startup Experiments — AIAS Platform

**Last Updated:** 2025-01-29  
**Purpose:** List 3-5 smallest experiments to test key hypotheses

---

## Experiment 1: Landing Page Test

### Hypothesis
"We believe creating a landing page describing the problem and solution will generate 50+ signups in 2 weeks, validating demand."

### Experiment Design
- **Landing Page:** Problem description + "Get Early Access" CTA
- **Traffic Sources:** Paid ads ($500 budget), social media, partnerships
- **Duration:** 2 weeks
- **Target:** 50+ signups

### Success Criteria
- 50+ signups in 2 weeks
- 5%+ conversion rate (visitor → signup)
- 80%+ provide email addresses
- 50%+ indicate interest in trying product

### Implementation
- **Files to Create:**
  - `app/early-access/page.tsx` — Landing page
  - `app/api/early-access/route.ts` — Signup API endpoint
- **Traffic:** Google Ads, Facebook Ads, social media

### Results
- **Status:** [TODO: Planned/Running/Completed]
- **Signups:** [TODO: Count]
- **Conversion Rate:** [TODO: %]
- **Validation:** [TODO: Validated/Not Validated]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment 2: Concierge MVP

### Hypothesis
"We believe manually executing workflows for 10 customers will validate that the solution works and users get value."

### Experiment Design
- **Target:** 10 customers (Shopify store owners)
- **Workflow:** Order processing automation (manually executed)
- **Duration:** 2 weeks
- **Tracking:** Time saved, satisfaction, willingness to pay

### Success Criteria
- 80%+ get value (time saved)
- Average time saved: 5+ hours/week
- 70%+ satisfaction score (1-10 scale)
- 70%+ willing to pay $49/month

### Implementation
- **Recruitment:** From customer interviews or early access signups
- **Process:** Manually execute workflows (order confirmations, shipping labels)
- **Tracking:** Document time saved, satisfaction, willingness to pay

### Results
- **Status:** [TODO: Planned/Running/Completed]
- **Customers:** [TODO: Count]
- **Time Saved:** [TODO: Hours]
- **Satisfaction:** [TODO: Score]
- **Validation:** [TODO: Validated/Not Validated]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment 3: Pricing Test

### Hypothesis
"We believe showing pricing ($49/month) on landing page will validate willingness to pay without significantly reducing signups."

### Experiment Design
- **Control:** Landing page without pricing
- **Variant:** Landing page with pricing ($49/month)
- **Sample Size:** 200+ visitors per variant
- **Duration:** 2 weeks

### Success Criteria
- 10%+ click-through rate on pricing
- No significant drop in signups when showing pricing (< 20% reduction)
- 5%+ conversion rate (pricing page → checkout)

### Implementation
- **Files to Modify:**
  - `app/early-access/page.tsx` — Add pricing variant
  - `app/api/leads/ab-test/assign/route.ts` — Use A/B test API

### Results
- **Status:** [TODO: Planned/Running/Completed]
- **Click-Through Rate:** [TODO: %]
- **Signup Rate (Control):** [TODO: %]
- **Signup Rate (Variant):** [TODO: %]
- **Validation:** [TODO: Validated/Not Validated]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment 4: Onboarding Optimization

### Hypothesis
"We believe reducing onboarding steps from 5 to 3 will increase activation rate from [current]% to 40%+."

### Experiment Design
- **Control:** Current 5-step onboarding
- **Variant:** Optimized 3-step onboarding with progress indicators
- **Sample Size:** 100+ users per variant
- **Duration:** 2 weeks

### Success Criteria
- Activation rate increases to 40%+
- Time-to-activation reduces to < 2 days
- Drop-off rate decreases

### Implementation
- **Files to Modify:**
  - `app/onboarding/page.tsx` — Add A/B test assignment
  - `components/onboarding/wizard.tsx` — Create optimized variant

### Results
- **Status:** [TODO: Planned/Running/Completed]
- **Activation Rate (Control):** [TODO: %]
- **Activation Rate (Variant):** [TODO: %]
- **Validation:** [TODO: Validated/Not Validated]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment 5: Referral Rewards Test

### Hypothesis
"We believe offering commission-based referral rewards (vs. XP) will increase referral rate from 5% to 15%."

### Experiment Design
- **Variant A:** XP rewards (current)
- **Variant B:** Commission rewards (revenue share)
- **Sample Size:** 50+ users per variant
- **Duration:** 2 weeks

### Success Criteria
- Referral rate increases to 15%+
- Referral signups increase
- Referral conversions increase

### Implementation
- **Files to Modify:**
  - `components/gamification/ReferralWidget.tsx` — Add reward variants
  - `app/api/referrals/invite/route.ts` — Create invite API endpoint

### Results
- **Status:** [TODO: Planned/Running/Completed]
- **Referral Rate (Variant A):** [TODO: %]
- **Referral Rate (Variant B):** [TODO: %]
- **Validation:** [TODO: Validated/Not Validated]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment Prioritization

### High Priority (Run First)
1. **Landing Page Test** — Validates demand quickly
2. **Concierge MVP** — Validates solution works
3. **Pricing Test** — Validates willingness to pay

### Medium Priority (Run Next)
4. **Onboarding Optimization** — Improves activation
5. **Referral Rewards Test** — Improves growth

---

## Experiment Timeline

### Week 1-2
- Run landing page test (50+ signups target)
- Run concierge MVP (10 customers)
- Run pricing test (A/B test)

### Week 3-4
- Run onboarding optimization (A/B test)
- Run referral rewards test (A/B test)
- Document results and learnings

---

## Resources

- **Hypotheses:** `yc/LEAN_STARTUP_HYPOTHESES.md`
- **Feature Map:** `yc/LEAN_STARTUP_FEATURE_MAP.md`
- **Validation Board:** `yc/LEAN_STARTUP_VALIDATION_BOARD.md`
- **Learnings:** `yc/LEAN_STARTUP_LEARNINGS.md`
