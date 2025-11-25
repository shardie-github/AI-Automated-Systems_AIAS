# Financial Projections — AIAS Platform

**Generated:** 2025-01-29  
**Status:** Template — Founders to fill in with real data

---

## Overview

This document provides financial projections for AIAS Platform, including revenue, costs, runway, and unit economics.

**Key Principle:** YC wants to see that founders understand their financials and have a plan to reach profitability.

---

## Revenue Projections

### Assumptions

**Pricing Tiers:**
- Free: $0/month (acquisition)
- Starter: $49/month (main tier)
- Pro: $149/month (power users)

**Conversion Rates (Targets):**
- Visitor → Signup: 2-5% (industry benchmark)
- Signup → Activation: 40%+ (industry benchmark)
- Activation → Paying: 10-20% (SaaS benchmark)
- Free → Starter: 70% (of paying conversions)
- Starter → Pro: 20% (upgrade within 6 months)

**Growth Rates:**
- Month 1-3: 20% MoM (early stage)
- Month 4-6: 30% MoM (growth stage)
- Month 7-12: 25% MoM (scale stage)

---

### Revenue Forecast (12 Months)

| Month | Signups | Activations | Paying Customers | Starter | Pro | MRR | ARR |
|-------|---------|-------------|------------------|---------|-----|-----|-----|
| 1 | 100 | 40 | 6 | 4 | 2 | $346 | $4,152 |
| 2 | 120 | 48 | 8 | 6 | 2 | $492 | $5,904 |
| 3 | 144 | 58 | 10 | 8 | 2 | $590 | $7,080 |
| 4 | 187 | 75 | 13 | 10 | 3 | $787 | $9,444 |
| 5 | 243 | 97 | 17 | 13 | 4 | $1,023 | $12,276 |
| 6 | 316 | 126 | 22 | 17 | 5 | $1,330 | $15,960 |
| 7 | 395 | 158 | 28 | 21 | 7 | $1,722 | $20,664 |
| 8 | 494 | 198 | 35 | 26 | 9 | $2,219 | $26,628 |
| 9 | 617 | 247 | 44 | 33 | 11 | $2,856 | $34,272 |
| 10 | 772 | 309 | 54 | 40 | 14 | $3,686 | $44,232 |
| 11 | 965 | 386 | 68 | 51 | 17 | $4,747 | $56,964 |
| 12 | 1,206 | 482 | 85 | 64 | 21 | $6,125 | $73,500 |

**Assumptions:**
- Starter: $49/month, Pro: $149/month
- 70% Starter, 20% Pro (of paying customers)
- 20% MoM growth (months 1-3), 30% MoM (months 4-6), 25% MoM (months 7-12)

**Year 1 Total:** $73,500 ARR

---

## Cost Projections

### Infrastructure Costs

| Service | Monthly Cost | Annual Cost |
|---------|--------------|-------------|
| Supabase (Database) | $25 | $300 |
| Vercel (Hosting) | $20 | $240 |
| Stripe (Payment Processing) | 2.9% + $0.30/transaction | ~$200/month (at scale) |
| **Subtotal** | **$45** | **$540** |

**Note:** Infrastructure costs scale with usage. Estimate $45/month base + $0.10 per user/month.

---

### AI API Costs

| Provider | Cost per 1K Calls | Monthly Usage (Est.) | Monthly Cost |
|----------|-------------------|----------------------|--------------|
| OpenAI (GPT-4) | $30 | 10K calls | $300 |
| Anthropic (Claude) | $15 | 5K calls | $75 |
| Google (Gemini) | $10 | 5K calls | $50 |
| **Total** | | **20K calls** | **$425** |

**Assumptions:**
- Average 2 AI API calls per workflow execution
- 10K workflow executions/month (at scale)
- Route to cheapest provider when possible (cost optimization)

**Scaling:** AI costs scale linearly with usage. Target: <20% of revenue.

---

### Other Costs

| Category | Monthly Cost | Annual Cost |
|----------|--------------|-------------|
| Domain & SSL | $2 | $24 |
| Email (Resend) | $20 | $240 |
| Monitoring (Sentry) | $26 | $312 |
| Marketing Tools | $50 | $600 |
| **Subtotal** | **$98** | **$1,176** |

---

### Total Monthly Costs

| Month | Infrastructure | AI APIs | Other | Total |
|-------|----------------|---------|-------|-------|
| 1-3 | $45 | $100 | $98 | $243 |
| 4-6 | $65 | $200 | $98 | $363 |
| 7-9 | $85 | $300 | $98 | $483 |
| 10-12 | $105 | $425 | $98 | $628 |

**Assumptions:**
- Infrastructure scales with users ($0.10/user/month)
- AI costs scale with workflow executions
- Other costs remain constant

---

## Unit Economics

### Month 12 Projections

**Revenue:**
- MRR: $6,125
- ARR: $73,500

**Costs:**
- Infrastructure: $105/month
- AI APIs: $425/month
- Other: $98/month
- **Total COGS: $628/month**

**Unit Economics:**
- **ARPU:** $72/month (weighted average: 70% Starter @ $49, 20% Pro @ $149)
- **CAC:** $75 (blended: Shopify App Store $50, SEO $0, Referrals $0, Paid Ads $100)
- **LTV:** $864 (ARPU $72 × 12 months average lifetime)
- **LTV:CAC:** 11.5:1 (target: 3:1) ✅
- **Gross Margin:** 90% (target: 80%+) ✅

**Status:** Unit economics positive ✅

---

## Runway Calculation

### Current Runway

**Assumptions:**
- Starting cash: $[TODO: Fill in]
- Monthly burn: $[TODO: Fill in]
- Revenue: $[TODO: Fill in] (if any)

**Runway = (Starting Cash + Revenue - Costs) / Monthly Burn**

**Example (if no revenue):**
- Starting cash: $50,000
- Monthly burn: $5,000
- Runway: 10 months

**Example (with revenue):**
- Starting cash: $50,000
- Monthly revenue: $6,125 (Month 12)
- Monthly costs: $628
- Net: +$5,497/month
- Runway: ∞ (profitable)

---

### Fundraising Plan

**How Much:** $500K - $1M

**Why:**
- Hire team (2-3 engineers, 1 designer, 1 sales)
- Scale marketing (paid ads, content, partnerships)
- Build enterprise features (white-label, SSO, SLA)
- Expand to US market (if Canadian market validated)

**When:** 6-12 months (when MRR reaches $10K-20K)

**Use of Funds:**
- 50% Team (salaries, benefits)
- 30% Marketing (ads, content, partnerships)
- 15% Product (features, infrastructure)
- 5% Operations (tools, legal, accounting)

---

## Break-Even Analysis

### Break-Even Point

**Fixed Costs:** $628/month (infrastructure + other)

**Variable Costs:** $0.10/user/month (infrastructure) + AI API costs

**Revenue per User:** $72/month (ARPU)

**Break-Even:** ~9 paying customers (at $72 ARPU)

**Current Status:** [TODO: Fill in - are you at break-even?]

---

## Financial Milestones

### Month 3: MVP Validation
- **Goal:** 10 paying customers, $500 MRR
- **Status:** [TODO: Fill in]

### Month 6: Product-Market Fit
- **Goal:** 50 paying customers, $2,500 MRR
- **Status:** [TODO: Fill in]

### Month 12: Scale
- **Goal:** 200 paying customers, $10,000 MRR
- **Status:** [TODO: Fill in]

---

## TODO: Founders to Fill In

- [ ] **Starting Cash:** How much cash do you have?
- [ ] **Monthly Burn:** What's your current monthly burn?
- [ ] **Current Revenue:** What's your current MRR (if any)?
- [ ] **Runway:** How many months until you run out of money?
- [ ] **Fundraising:** How much do you need? When? Why?
- [ ] **Update Projections:** Fill in actual numbers as you grow

---

## See Also

- `YC_METRICS_CHECKLIST.md` - Metrics definitions
- `YC_INTERVIEW_CHEATSHEET.md` - How to present financials in interview
- `YC_GAP_ANALYSIS.md` - Financial gaps to close
