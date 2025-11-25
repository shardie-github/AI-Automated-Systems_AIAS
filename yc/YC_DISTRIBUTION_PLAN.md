# YC Distribution Plan — AIAS Platform

**Generated:** 2025-01-29  
**Status:** Draft — Founders to validate and execute

---

## Overview

YC heavily probes distribution. This document makes the distribution strategy explicit, with concrete experiments and implementation paths.

**Key Principle:** YC wants to see that founders know how to get users and have a plan to scale distribution.

---

## Current User Acquisition Channels (Inferred from Repo)

### 1. Shopify App Store

**Evidence:**
- `docs/GTM_ENGINE.md` mentions Shopify App Store as primary channel
- Product targets Shopify store owners (40% of market)
- Shopify integration exists (`app/api/integrations/shopify/route.ts`)

**Status:** ✅ **PLANNED** (not yet implemented)

**How It Works:**
- List AIAS Platform app in Shopify App Store
- Users discover app when searching for "automation" or "order processing"
- Install app → OAuth connection → Start using

**Implementation Path:**
1. Create Shopify app listing (app name, description, screenshots)
2. Submit to Shopify App Store for review
3. Optimize listing (keywords, reviews, ratings)
4. Track installs and conversions

**Files to Create/Modify:**
- `app/api/integrations/shopify/route.ts` (already exists)
- Shopify app manifest (new file)
- App Store listing content (new file)

**Metrics to Track:**
- App Store impressions
- Install rate (impressions → installs)
- Activation rate (installs → activated users)
- Conversion rate (activated → paying)

**Goal:** 100 installs/month → 20 activations → 4 paying customers

---

### 2. SEO / Content Marketing

**Evidence:**
- `docs/GTM_ENGINE.md` mentions SEO as channel
- Blog exists (`app/blog/page.tsx`)
- SEO metadata exists (`next.config.ts` has SEO headers)

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**How It Works:**
- Create content targeting keywords: "Canadian business automation", "Shopify automation", "Canadian e-commerce tools"
- Rank in Google search results
- Users click → sign up

**Implementation Path:**
1. Create blog content targeting keywords
2. Optimize existing pages for SEO
3. Build backlinks (partnerships, guest posts)
4. Track organic traffic and conversions

**Files to Create/Modify:**
- `app/blog/[slug]/page.tsx` (already exists)
- Blog content (new files in `app/blog/`)
- SEO optimization (`next.config.ts`, `app/sitemap.ts`)

**Metrics to Track:**
- Organic search traffic (Google Analytics)
- Keyword rankings
- Conversion rate (organic → signup → paying)

**Goal:** 1,000 organic visitors/month → 50 signups → 10 paying customers

---

### 3. Referrals

**Evidence:**
- `components/gamification/ReferralWidget.tsx` exists
- Referral tracking exists (`supabase/migrations/20250128000000_pmf_analytics.sql`)

**Status:** ✅ **IMPLEMENTED**

**How It Works:**
- Users get referral code
- Share link with friends
- Friend signs up → referrer gets XP/rewards
- Friend converts → referrer gets commission (if implemented)

**Implementation Path:**
1. Enable referral widget (already exists)
2. Add referral rewards (XP, credits, commission)
3. Track referral conversions
4. Optimize referral flow

**Files to Modify:**
- `components/gamification/ReferralWidget.tsx` (already exists)
- Add referral rewards logic (new)

**Metrics to Track:**
- Referral clicks
- Referral signups
- Referral conversions (signup → paying)
- Referral LTV (lifetime value of referred customers)

**Goal:** 10% of users refer 1 friend/year → 100 referrals/year → 50 paying customers

---

### 4. Paid Ads (Future)

**Evidence:**
- `docs/GTM_ENGINE.md` mentions paid ads as channel
- No implementation yet

**Status:** ❌ **NOT IMPLEMENTED**

**How It Works:**
- Run Google Ads, Facebook Ads targeting Canadian SMBs
- Users click ad → landing page → sign up

**Implementation Path:**
1. Create landing pages for ads
2. Set up Google Ads, Facebook Ads accounts
3. Create ad campaigns targeting keywords/audiences
4. Track CAC and conversion rates

**Files to Create:**
- Landing pages (`app/landing/[campaign]/page.tsx`)
- Ad tracking (UTM parameters)

**Metrics to Track:**
- Ad spend
- Click-through rate (CTR)
- Conversion rate (click → signup → paying)
- CAC by channel

**Goal:** $2,000/month ad spend → 40 signups → 8 paying customers (CAC: $250)

---

## Likely Short-Term Channels (Low-Hanging Fruit)

### 1. Shopify Community Forums

**Why:**  
Shopify store owners hang out in Shopify community forums. They ask questions about automation, order processing, etc.

**Implementation:**
1. Join Shopify community forums
2. Answer questions about automation
3. Mention AIAS Platform when relevant (not spam)
4. Link to product in profile/signature

**Effort:** LOW (1-2 hours/week)  
**Expected:** 5-10 signups/month

---

### 2. Canadian Business Facebook Groups

**Why:**  
Canadian SMB owners are active in Facebook groups (e.g., "Canadian E-Commerce Entrepreneurs", "Shopify Canada").

**Implementation:**
1. Join relevant Facebook groups
2. Share helpful content (not just product pitches)
3. Answer questions about automation
4. Mention AIAS Platform when relevant

**Effort:** LOW (1-2 hours/week)  
**Expected:** 10-20 signups/month

---

### 3. LinkedIn Content

**Why:**  
Consultants and service business owners are active on LinkedIn. They need proposal automation, client follow-ups.

**Implementation:**
1. Create LinkedIn content (tips, case studies)
2. Post regularly (2-3x/week)
3. Engage with comments
4. Link to product in profile

**Effort:** MEDIUM (3-5 hours/week)  
**Expected:** 20-30 signups/month

---

### 4. YouTube Tutorials

**Why:**  
Users learn through video. YouTube tutorials can rank in search and drive organic traffic.

**Implementation:**
1. Create YouTube channel
2. Post tutorials: "How to Automate Shopify Orders", "Canadian Business Automation Guide"
3. Optimize for SEO (keywords, descriptions)
4. Link to product in video descriptions

**Effort:** MEDIUM (5-10 hours/week)  
**Expected:** 30-50 signups/month

---

## 3-5 Concrete Growth Experiments

### Experiment 1: Add Invite Flow

**Goal:** Increase referral rate from 5% to 15% of users.

**Implementation:**
1. Add invite flow to onboarding (`app/onboarding/page.tsx`)
2. Prompt users to invite 3 friends after activation
3. Offer rewards (1 month free, XP bonus)
4. Track invite clicks, signups, conversions

**Files to Modify:**
- `app/onboarding/page.tsx` - Add invite prompt after activation
- `components/gamification/ReferralWidget.tsx` - Enhance with rewards
- `app/api/referrals/invite/route.ts` - New API endpoint for invites

**Metrics:**
- Invite rate (users who invite friends)
- Referral signups
- Referral conversions

**Success Criteria:**  
- 15% of users invite friends (up from 5%)
- 50+ referral signups/month
- 20% referral conversion rate (signup → paying)

**Timeline:** 2 weeks to implement, 1 month to measure

---

### Experiment 2: SEO Landing Pages for Niche Keywords

**Goal:** Rank #1 for "Canadian Shopify automation" and drive 100 organic signups/month.

**Implementation:**
1. Create landing page: `/canadian-shopify-automation`
2. Optimize for keyword: "Canadian Shopify automation"
3. Create content: "Complete Guide to Canadian Shopify Automation"
4. Build backlinks (partnerships, guest posts)
5. Track rankings and conversions

**Files to Create:**
- `app/canadian-shopify-automation/page.tsx` - Landing page
- `app/blog/canadian-shopify-automation-guide/page.tsx` - Blog post

**Metrics:**
- Keyword ranking (Google Search Console)
- Organic traffic (Google Analytics)
- Conversion rate (organic → signup → paying)

**Success Criteria:**  
- Rank #1 for "Canadian Shopify automation"
- 1,000+ organic visitors/month
- 10% conversion rate (visitor → signup)
- 100 signups/month

**Timeline:** 1 month to create, 3 months to rank

---

### Experiment 3: Integrate with Platform Y (Shopify App Store)

**Goal:** Get listed in Shopify App Store and drive 50 installs/month.

**Implementation:**
1. Create Shopify app listing
2. Submit to Shopify App Store
3. Optimize listing (screenshots, description, reviews)
4. Track installs and conversions

**Files to Create:**
- Shopify app manifest (`shopify-app.toml`)
- App Store listing content
- App Store screenshots

**Metrics:**
- App Store impressions
- Install rate (impressions → installs)
- Activation rate (installs → activated)
- Conversion rate (activated → paying)

**Success Criteria:**  
- Listed in Shopify App Store
- 1,000+ impressions/month
- 5% install rate (50 installs/month)
- 40% activation rate (20 activations/month)
- 20% conversion rate (4 paying customers/month)

**Timeline:** 2 weeks to submit, 2-4 weeks for review, 1 month to measure

---

### Experiment 4: A/B Test Onboarding Flow

**Goal:** Improve activation rate from 35% to 45% by optimizing onboarding.

**Implementation:**
1. Create A/B test framework (`lib/lead-generation/ab-testing.ts` exists)
2. Test variations:
   - Variation A: Current onboarding (control)
   - Variation B: Guided template selection
   - Variation C: Video tutorial
3. Track activation rate by variation
4. Implement winning variation

**Files to Modify:**
- `app/onboarding/page.tsx` - Add A/B test logic
- `lib/lead-generation/ab-testing.ts` - Enhance A/B test framework
- `app/api/leads/ab-test/assign/route.ts` - Assign users to variations

**Metrics:**
- Activation rate by variation
- Time to activation by variation
- User satisfaction by variation

**Success Criteria:**  
- 45% activation rate (up from 35%)
- <24 hours time to activation
- Higher user satisfaction (NPS)

**Timeline:** 1 week to implement, 2 weeks to measure

---

### Experiment 5: Partner with Canadian Business Associations

**Goal:** Get 10 partnerships with Canadian business associations and drive 100 signups/month.

**Implementation:**
1. Identify Canadian business associations (e.g., Canadian Federation of Independent Business, Shopify Partners)
2. Reach out with partnership proposal
3. Offer: Free/discounted access for members, co-marketing opportunities
4. Track partnership referrals

**Files to Create:**
- Partnership proposal template
- Partnership tracking system

**Metrics:**
- Partnership referrals
- Conversion rate (referral → signup → paying)
- Partnership LTV

**Success Criteria:**  
- 10 active partnerships
- 100+ referral signups/month
- 20% conversion rate (20 paying customers/month)

**Timeline:** 1 month to reach out, 1 month to close partnerships, 1 month to measure

---

## Distribution Strategy Summary

### Phase 1: Foundation (Months 1-2)
- ✅ Enable referral system (already implemented)
- ✅ Create SEO-optimized blog content
- ⚠️ Submit to Shopify App Store
- ⚠️ Add UTM parameter tracking

**Goal:** 50 signups/month

---

### Phase 2: Growth (Months 3-4)
- Run Experiment 1: Add invite flow
- Run Experiment 2: SEO landing pages
- Run Experiment 3: Shopify App Store listing
- Run Experiment 4: A/B test onboarding

**Goal:** 200 signups/month

---

### Phase 3: Scale (Months 5-6)
- Run Experiment 5: Partner with associations
- Launch paid ads (if CAC < LTV)
- Expand to US market (if Canadian market validated)
- Build marketplace (if users want to sell workflows)

**Goal:** 500 signups/month

---

## How to Measure Success

### Key Metrics:
1. **Signups by Channel:** Track where users come from
2. **CAC by Channel:** Calculate cost per acquisition by channel
3. **Conversion Rate by Channel:** Track signup → paying by channel
4. **LTV by Channel:** Calculate lifetime value by channel

### Success Criteria:
- **Blended CAC:** <$100 (for $49/month ARPU)
- **LTV:CAC:** >3:1 (industry benchmark)
- **Channel Diversity:** No single channel >50% of signups
- **Scalability:** Channels can scale without linear cost increase

---

## TODO: Founders to Execute

- [ ] **Immediate (Week 1):**
  - Add UTM parameter tracking to signup flow
  - Enable referral system (already implemented, verify it works)
  - Create Shopify App Store listing

- [ ] **Short-term (Month 1):**
  - Run Experiment 1: Add invite flow
  - Run Experiment 2: SEO landing pages
  - Join Shopify community forums, Facebook groups

- [ ] **Medium-term (Months 2-3):**
  - Run Experiment 3: Shopify App Store listing
  - Run Experiment 4: A/B test onboarding
  - Create LinkedIn content, YouTube tutorials

- [ ] **Long-term (Months 4-6):**
  - Run Experiment 5: Partner with associations
  - Launch paid ads (if validated)
  - Expand to US market (if Canadian market validated)

---

## See Also

- `YC_MARKET_VISION.md` - Market opportunity and sizing
- `YC_METRICS_CHECKLIST.md` - How to measure distribution success
- `docs/GTM_ENGINE.md` - Detailed GTM strategy
