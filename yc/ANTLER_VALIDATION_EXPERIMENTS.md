# Antler Validation Experiments — AIAS Platform

**Last Updated:** 2025-01-29  
**Purpose:** 3-5 validation experiments to run in next 2-4 weeks

---

## Experiment 1: Customer Interviews

### Hypothesis
"We believe 80%+ of Canadian SMBs (Shopify store owners, consultants, real estate agents) waste 10+ hours/week on repetitive tasks and would pay $49/month to automate them."

### Experiment Design
- **Target:** 20 customer interviews
- **Segments:** Shopify store owners (10), Consultants (5), Real estate agents (5)
- **Format:** 30-minute video calls
- **Duration:** 2 weeks

### Success Criteria
- 80%+ confirm problem exists
- Average time wasted: 10+ hours/week
- 50%+ willing to pay $49/month
- 70%+ see value in solution

### Implementation
- **Recruitment:** Email, LinkedIn, partnerships
- **Script:** See `ANTLER_VALIDATION.md` for interview script
- **Tracking:** Document insights in `ANTLER_VALIDATION.md`

### Results
- **Status:** [TODO: Planned/Running/Completed]
- **Interviews Completed:** [TODO: Count]
- **Problem Confirmed:** [TODO: %]
- **Willingness to Pay:** [TODO: %]
- **Validation:** [TODO: Validated/Not Validated]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment 2: Landing Page Test

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

## Experiment 3: Concierge MVP

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

## Experiment 4: Willingness to Pay Test

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

## Experiment 5: Survey

### Hypothesis
"We believe running a survey will validate problem at scale (100+ responses) and provide quantitative data on willingness to pay."

### Experiment Design
- **Target:** 100+ responses
- **Channels:** Email, social media, partnerships
- **Duration:** 2 weeks
- **Questions:** See `ANTLER_VALIDATION.md` for survey questions

### Success Criteria
- 100+ responses
- 75%+ spend 10+ hours/week on repetitive tasks
- 60%+ interested in automation
- Average willingness to pay: $40-60/month

### Implementation
- **Survey Tool:** Google Forms, Typeform, or custom form
- **Distribution:** Email list, social media, partnerships
- **Tracking:** Document results in `ANTLER_VALIDATION.md`

### Results
- **Status:** [TODO: Planned/Running/Completed]
- **Responses:** [TODO: Count]
- **Problem Confirmed:** [TODO: %]
- **Willingness to Pay:** [TODO: Average]
- **Validation:** [TODO: Validated/Not Validated]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment Prioritization

### High Priority (Run First)
1. **Customer Interviews** — Validates problem and willingness to pay
2. **Landing Page Test** — Validates demand quickly
3. **Concierge MVP** — Validates solution works

### Medium Priority (Run Next)
4. **Willingness to Pay Test** — Validates pricing
5. **Survey** — Validates problem at scale

---

## Experiment Timeline

### Week 1-2
- Run customer interviews (20 interviews)
- Run landing page test (50+ signups target)
- Run survey (100+ responses target)

### Week 3-4
- Run concierge MVP (10 customers)
- Run willingness to pay test (A/B test)
- Document results and learnings

---

## Resources

- **Validation Framework:** `yc/ANTLER_VALIDATION_FRAMEWORK.md`
- **Validation Evidence:** `yc/ANTLER_VALIDATION.md`
- **Problem Scale Evidence:** `yc/ANTLER_PROBLEM_SCALE.md`
- **Founder-Market Fit:** `yc/ANTLER_FOUNDER_FIT.md`
