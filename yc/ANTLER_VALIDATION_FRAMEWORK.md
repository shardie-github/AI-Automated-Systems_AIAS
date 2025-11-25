# Antler Validation Framework — AIAS Platform

**Last Updated:** 2025-01-29  
**Purpose:** Structured framework for validating hypotheses using the Antler zero-to-one approach

---

## Validation Framework Overview

### Core Principles
1. **Start with Problem:** Validate problem before building solution
2. **Test Assumptions:** Every assumption is a hypothesis to test
3. **Measure Everything:** Track metrics for every validation test
4. **Iterate Quickly:** Fail fast, learn fast, pivot fast

---

## Validation Hypotheses

### Hypothesis 1: Problem Exists
**Statement:** "Canadian SMBs waste 10-30 hours/week on repetitive manual tasks (order processing, lead qualification, proposal writing)."

**Validation Methods:**
1. Customer interviews (20 interviews)
2. Surveys (100+ responses)
3. Market research (TAM/SAM/SOM)

**Success Criteria:**
- 80%+ of interviewees confirm problem exists
- Average time wasted: 10+ hours/week
- 50%+ of survey respondents have this problem

**Status:** Partially Validated
**Evidence:** Personas defined, market research done
**Confidence:** Medium

---

### Hypothesis 2: Solution Works
**Statement:** "Visual workflow builders solve the problem by allowing users to automate tasks without coding."

**Validation Methods:**
1. Concierge MVP (manually execute workflows for 10 customers)
2. Prototype testing (show workflow builder to potential users)
3. Beta testing (invite 50 users to try product)

**Success Criteria:**
- 80%+ of concierge MVP customers get value
- Average time saved: 5+ hours/week
- 70%+ of beta testers successfully create workflows

**Status:** Not Validated
**Evidence:** No customer interviews, no MVP testing
**Confidence:** Low

---

### Hypothesis 3: Willingness to Pay
**Statement:** "Users will pay $49/month for automation that saves 10+ hours/week."

**Validation Methods:**
1. Pricing tests (show pricing on landing page)
2. Customer interviews (ask about willingness to pay)
3. Pre-orders (collect payment before product is ready)

**Success Criteria:**
- 50%+ of interviewees willing to pay $49/month
- 10%+ conversion rate on pricing page
- 10+ pre-orders collected

**Status:** Not Validated
**Evidence:** Pricing exists, no payment tests
**Confidence:** Low

---

### Hypothesis 4: Market Size
**Statement:** "500K+ Canadian SMBs have this problem and can afford $49/month."

**Validation Methods:**
1. Market research (TAM/SAM/SOM calculation)
2. Competitive analysis (size of competitor markets)
3. Bottom-up validation (can we reach 1,000 customers in Year 1?)

**Success Criteria:**
- TAM: $10B+ (validated)
- SAM: $2.94M-5.88M ARR potential (validated)
- SOM: 1,000 customers in Year 1 (feasible)

**Status:** Validated
**Evidence:** Market sizing documented in `YC_MARKET_VISION.md`
**Confidence:** High

---

### Hypothesis 5: Founder-Market Fit
**Statement:** "Founders have personal connection to problem and skills to solve it."

**Validation Methods:**
1. Founder story (document personal connection)
2. Skills assessment (technical, product, business skills)
3. Previous experience (relevant projects, domain expertise)

**Success Criteria:**
- Founders have personal connection to problem
- Founders have relevant skills (technical + product + business)
- Founders have domain expertise (automation, Canadian SMB market)

**Status:** Not Validated
**Evidence:** Team notes inferred, no explicit founder story
**Confidence:** Low

---

## Validation Methods

### Method 1: Customer Interviews
**Purpose:** Validate problem, solution, willingness to pay
**Process:**
1. Recruit 20 customers (Shopify store owners, consultants, real estate agents)
2. Conduct 30-minute video calls
3. Ask structured questions (see `ANTLER_VALIDATION.md`)
4. Document insights and quotes

**Success Metrics:**
- 80%+ confirm problem exists
- 70%+ see value in solution
- 50%+ willing to pay $49/month

---

### Method 2: Surveys
**Purpose:** Validate problem at scale
**Process:**
1. Create survey (see `ANTLER_VALIDATION.md`)
2. Distribute via email, social media, partnerships
3. Target 100+ responses
4. Analyze results

**Success Metrics:**
- 75%+ spend 10+ hours/week on repetitive tasks
- 60%+ interested in automation
- Average willingness to pay: $40-60/month

---

### Method 3: Landing Page Test
**Purpose:** Validate demand
**Process:**
1. Create landing page with problem description and "Get Early Access" CTA
2. Drive traffic via paid ads, social media, partnerships
3. Track signups and email addresses
4. Measure conversion rate

**Success Metrics:**
- 50+ signups in 2 weeks
- 5%+ conversion rate (visitor → signup)
- 80%+ provide email addresses

---

### Method 4: Concierge MVP
**Purpose:** Validate solution works
**Process:**
1. Recruit 10 customers (Shopify store owners)
2. Manually execute workflows for them (order processing automation)
3. Track time saved, satisfaction, willingness to pay
4. Document learnings

**Success Metrics:**
- 80%+ get value (time saved)
- Average time saved: 5+ hours/week
- 70%+ willing to pay $49/month

---

### Method 5: Pricing Tests
**Purpose:** Validate willingness to pay
**Process:**
1. Create landing page with pricing ($49/month)
2. Track click-through rate on pricing tiers
3. Run A/B test: show vs. hide pricing
4. Measure conversion rate

**Success Metrics:**
- 10%+ click-through rate on pricing
- 5%+ conversion rate (pricing page → checkout)
- No significant drop in signups when showing pricing

---

## Validation Status Dashboard

| Hypothesis | Status | Method | Results | Next Steps |
|------------|--------|--------|---------|------------|
| Problem Exists | Partially Validated | Interviews, Surveys | [TODO] | Run 20 interviews |
| Solution Works | Not Validated | Concierge MVP | [TODO] | Run concierge MVP |
| Willingness to Pay | Not Validated | Pricing Tests | [TODO] | Run pricing tests |
| Market Size | Validated | Market Research | TAM/SAM/SOM calculated | - |
| Founder-Market Fit | Not Validated | Founder Story | [TODO] | Document founder story |

---

## Validation Timeline

### Week 1-2: Problem Validation
- Run 20 customer interviews
- Run survey (100+ responses)
- Document insights

### Week 3-4: Solution Validation
- Run concierge MVP (10 customers)
- Prototype testing (show workflow builder)
- Document learnings

### Week 5-6: Willingness to Pay Validation
- Run pricing tests
- Pre-orders (if applicable)
- Document results

### Week 7-8: Founder-Market Fit Validation
- Document founder story
- Skills assessment
- Domain expertise validation

---

## Validation Learnings

### What We've Learned
- [TODO: Document learnings from validation tests]

### What We Still Need to Learn
- [TODO: Document remaining questions]

### Pivots Based on Learning
- [TODO: Document any pivots or changes based on validation]

---

## Resources

- **Validation Evidence:** `yc/ANTLER_VALIDATION.md`
- **Validation Experiments:** `yc/ANTLER_VALIDATION_EXPERIMENTS.md`
- **Problem Scale Evidence:** `yc/ANTLER_PROBLEM_SCALE.md`
- **Founder-Market Fit:** `yc/ANTLER_FOUNDER_FIT.md`
