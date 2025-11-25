# 500 Global Growth Levers Inventory — AIAS Platform

**Last Updated:** 2025-01-29  
**Purpose:** Comprehensive inventory of all growth levers, their status, and experiment ideas

---

## Growth Lever Overview

| Lever | Status | Priority | Metrics Tracked | Experiment Ideas |
|-------|--------|----------|----------------|------------------|
| Shopify App Store | Planned | High | Installs, Activations, Conversions | Submit app, optimize listing |
| SEO Landing Pages | Partial | High | Organic traffic, Conversions | Create 5-10 landing pages |
| Referrals | Implemented | Medium | Referral rate, Signups, Conversions | Optimize rewards, add viral flow |
| Embeds | Planned | Medium | Embed views, Signups | Build embeddable widget |
| Marketplace Apps | Planned | Low | Marketplace installs | List on app marketplaces |
| Content Marketing | Partial | Medium | Blog traffic, Signups | SEO-optimized blog posts |
| Paid Ads | Not Started | Medium | Ad spend, CAC, Conversions | Test Google Ads, Facebook Ads |
| Partnerships | Planned | Medium | Partner referrals, Conversions | Shopify, Wave Accounting partnerships |
| Email Marketing | Partial | Medium | Open rate, Click rate, Conversions | Newsletter, drip campaigns |
| Social Media | Not Started | Low | Followers, Engagement, Signups | LinkedIn, Twitter, Instagram |

---

## 1. Shopify App Store

### Status: Planned (Not Yet Listed)

**Description:**
List AIAS Platform app in Shopify App Store to reach 100K+ Shopify stores in Canada.

**Implementation:**
- Create Shopify app listing (app name, description, screenshots)
- Submit to Shopify App Store for review
- Optimize listing (keywords, reviews, ratings)
- Track installs and conversions

**Metrics to Track:**
- App Store impressions
- Install rate (impressions → installs)
- Activation rate (installs → activated users)
- Conversion rate (activated → paying)

**Current Status:**
- Shopify integration exists (`app/api/integrations/shopify/route.ts`)
- App listing: Not created
- Submission: Not submitted

**Experiment Ideas:**
1. **Experiment:** Optimize app listing copy (features vs. benefits)
   - **Metrics:** Install rate, activation rate
   - **Timeline:** 2 weeks

2. **Experiment:** A/B test app screenshots (product vs. results)
   - **Metrics:** Install rate
   - **Timeline:** 2 weeks

**Goal:** 100 installs/month → 20 activations → 4 paying customers

---

## 2. SEO Landing Pages

### Status: Partial (Blog Exists, Landing Pages Missing)

**Description:**
Create SEO-optimized landing pages for high-intent keywords to drive organic traffic.

**Implementation:**
- Create 5-10 SEO-optimized landing pages
- Target keywords: "Shopify automation Canada", "Canadian business automation", "Wave Accounting integration"
- Track organic traffic and conversions per page

**Metrics to Track:**
- Organic search traffic (Google Analytics)
- Keyword rankings
- Conversion rate (organic → signup → paying)
- Time on page, bounce rate

**Current Status:**
- Blog exists (`app/blog/page.tsx`)
- SEO metadata exists (`next.config.ts`)
- Landing pages: Not created

**Experiment Ideas:**
1. **Experiment:** Test landing page copy (problem-focused vs. solution-focused)
   - **Metrics:** Conversion rate, time on page
   - **Timeline:** 2 weeks

2. **Experiment:** Test CTA placement (above fold vs. below fold)
   - **Metrics:** Conversion rate
   - **Timeline:** 2 weeks

**Goal:** 1,000 organic visitors/month → 50 signups → 10 paying customers

---

## 3. Referrals

### Status: Implemented (System Exists)

**Description:**
Referral system where users get rewards for referring friends.

**Implementation:**
- Referral tracking exists (`components/gamification/ReferralWidget.tsx`)
- Referral code system implemented
- Rewards: XP, credits, commission (to be tested)

**Metrics to Track:**
- Referral rate (% of users who refer friends)
- Referral signups (number of signups from referrals)
- Referral conversions (referral signups → paying customers)
- Referral LTV (lifetime value of referred customers)

**Current Status:**
- Referral widget exists
- Tracking implemented
- Rewards: XP only (credits/commission to be tested)

**Experiment Ideas:**
1. **Experiment:** Test referral rewards (XP vs. credits vs. commission)
   - **Metrics:** Referral rate, referral conversions
   - **Timeline:** 2 weeks

2. **Experiment:** Add viral invite flow after onboarding
   - **Metrics:** Referral rate, invite completion rate
   - **Timeline:** 1 week

**Goal:** 10% of users refer 1 friend/year → 100 referrals/year → 50 paying customers

---

## 4. Embeds

### Status: Planned (Not Implemented)

**Description:**
Build embeddable workflow preview widget that users can embed on their websites.

**Implementation:**
- Create embeddable widget (`components/embeds/workflow-preview.tsx`)
- Allow users to embed workflows on their websites
- Track embed views and signups from embeds

**Metrics to Track:**
- Embed views
- Embed signups (signups from embeds)
- Embed conversion rate (views → signups)
- Viral coefficient (signups per embed)

**Current Status:**
- Widget: Not created
- Embed functionality: Not implemented

**Experiment Ideas:**
1. **Experiment:** Test embed design (minimal vs. feature-rich)
   - **Metrics:** Embed views, signup rate
   - **Timeline:** 2 weeks

2. **Experiment:** Test embed placement (homepage vs. blog vs. product pages)
   - **Metrics:** Embed views, signup rate
   - **Timeline:** 2 weeks

**Goal:** 100 embeds → 10 signups → 2 paying customers

---

## 5. Marketplace Apps

### Status: Planned (Not Implemented)

**Description:**
List AIAS Platform on app marketplaces (Zapier, Make, etc.) to reach automation users.

**Implementation:**
- Create marketplace app listings
- Submit to marketplaces (Zapier, Make, etc.)
- Track marketplace installs and conversions

**Metrics to Track:**
- Marketplace installs
- Activation rate (installs → activated)
- Conversion rate (activated → paying)

**Current Status:**
- Marketplace listings: Not created
- Submissions: Not submitted

**Experiment Ideas:**
1. **Experiment:** Test marketplace positioning (automation vs. AI vs. Canadian)
   - **Metrics:** Install rate, activation rate
   - **Timeline:** 2 weeks

**Goal:** 50 marketplace installs/month → 10 activations → 2 paying customers

---

## 6. Content Marketing

### Status: Partial (Blog Exists, SEO Optimization Needed)

**Description:**
Create SEO-optimized blog content targeting keywords to drive organic traffic.

**Implementation:**
- Create blog content targeting keywords
- Optimize existing pages for SEO
- Build backlinks (partnerships, guest posts)
- Track organic traffic and conversions

**Metrics to Track:**
- Blog traffic (page views, unique visitors)
- Keyword rankings
- Conversion rate (blog → signup → paying)
- Backlinks (number and quality)

**Current Status:**
- Blog exists (`app/blog/page.tsx`)
- SEO optimization: Partial
- Backlinks: Not built

**Experiment Ideas:**
1. **Experiment:** Test blog post formats (how-to vs. case study vs. listicle)
   - **Metrics:** Traffic, conversion rate
   - **Timeline:** 2 weeks

2. **Experiment:** Test CTA placement in blog posts (inline vs. end)
   - **Metrics:** Conversion rate
   - **Timeline:** 2 weeks

**Goal:** 500 blog visitors/month → 25 signups → 5 paying customers

---

## 7. Paid Ads

### Status: Not Started

**Description:**
Run paid advertising campaigns (Google Ads, Facebook Ads) to drive signups.

**Implementation:**
- Set up Google Ads campaigns
- Set up Facebook Ads campaigns
- Track ad spend, CAC, conversions
- Optimize campaigns based on performance

**Metrics to Track:**
- Ad spend
- Impressions, clicks, CTR
- Signups from ads
- CAC (ad spend / signups)
- Conversion rate (signups → paying)

**Current Status:**
- Google Ads: Not set up
- Facebook Ads: Not set up
- Ad tracking: Not implemented

**Experiment Ideas:**
1. **Experiment:** Test ad copy (features vs. benefits vs. social proof)
   - **Metrics:** CTR, conversion rate, CAC
   - **Timeline:** 2 weeks

2. **Experiment:** Test targeting (broad vs. narrow)
   - **Metrics:** CAC, conversion rate
   - **Timeline:** 2 weeks

**Goal:** $1,000 ad spend → 20 signups → 4 paying customers (CAC: $50)

---

## 8. Partnerships

### Status: Planned (Not Implemented)

**Description:**
Partner with Shopify, Wave Accounting, and other Canadian business tools for referrals.

**Implementation:**
- Reach out to potential partners (Shopify, Wave Accounting)
- Create partnership agreements
- Track partnership referrals and conversions

**Metrics to Track:**
- Partnership referrals
- Conversion rate (referral → signup → paying)
- Partnership LTV

**Current Status:**
- Partnerships: Not established
- Partner outreach: Not started

**Experiment Ideas:**
1. **Experiment:** Test partnership incentives (revenue share vs. fixed fee)
   - **Metrics:** Referral rate, conversion rate
   - **Timeline:** 1 month

**Goal:** 100+ referral signups/month from partnerships

---

## 9. Email Marketing

### Status: Partial (Email Templates Exist, Campaigns Not Running)

**Description:**
Email marketing campaigns (newsletter, drip campaigns) to nurture leads and drive conversions.

**Implementation:**
- Set up email campaigns (newsletter, drip campaigns)
- Track open rate, click rate, conversions
- Optimize campaigns based on performance

**Metrics to Track:**
- Email open rate
- Click rate
- Conversion rate (email → signup → paying)
- Unsubscribe rate

**Current Status:**
- Email templates exist (`app/api/email/templates/route.ts`)
- Campaigns: Not running
- Email tracking: Partial

**Experiment Ideas:**
1. **Experiment:** Test email subject lines (benefit-focused vs. curiosity-driven)
   - **Metrics:** Open rate, click rate
   - **Timeline:** 2 weeks

2. **Experiment:** Test email frequency (weekly vs. bi-weekly)
   - **Metrics:** Open rate, unsubscribe rate
   - **Timeline:** 2 weeks

**Goal:** 1,000 email subscribers → 50 signups → 10 paying customers

---

## 10. Social Media

### Status: Not Started

**Description:**
Social media marketing (LinkedIn, Twitter, Instagram) to build brand awareness and drive signups.

**Implementation:**
- Create social media accounts (LinkedIn, Twitter, Instagram)
- Post content regularly
- Track followers, engagement, signups

**Metrics to Track:**
- Followers (LinkedIn, Twitter, Instagram)
- Engagement rate (likes, comments, shares)
- Signups from social media
- Conversion rate (social → signup → paying)

**Current Status:**
- Social media accounts: Not created
- Content: Not posted

**Experiment Ideas:**
1. **Experiment:** Test content formats (text vs. image vs. video)
   - **Metrics:** Engagement rate, signups
   - **Timeline:** 2 weeks

**Goal:** 1,000 followers → 20 signups → 4 paying customers

---

## Growth Lever Prioritization

### High Priority (Focus Now)
1. **Shopify App Store** — Largest distribution channel, high intent users
2. **SEO Landing Pages** — Long-term organic growth, low CAC
3. **Referrals** — Already implemented, optimize for growth

### Medium Priority (Next Quarter)
4. **Paid Ads** — Test channels, optimize CAC
5. **Content Marketing** — Build SEO authority, drive organic traffic
6. **Partnerships** — Scale distribution through partners

### Low Priority (Future)
7. **Embeds** — Requires product development
8. **Marketplace Apps** — Lower priority than Shopify App Store
9. **Email Marketing** — Requires email list building
10. **Social Media** — Lower ROI, longer-term play

---

## Growth Lever Dashboard

**Location:** `app/admin/growth-experiments/page.tsx`

**Metrics to Display:**
- Growth lever status (implemented/partial/planned)
- Performance metrics (signups, conversions, CAC)
- Experiment results
- Next steps and priorities

---

## Resources

- **Distribution Plan:** `yc/YC_DISTRIBUTION_PLAN.md`
- **Growth Experiments:** `yc/500_GLOBAL_EXPERIMENTS.md`
- **Experiment Cadence:** `yc/EXPERIMENT_CADENCE.md`
