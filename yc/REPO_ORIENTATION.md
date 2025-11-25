# Repo Orientation — AIAS Platform

**Generated:** 2025-01-29  
**Status:** Phase 0 Complete

---

## What Is This Product?

**AIAS Platform** is an enterprise-grade AI automation platform designed specifically for Canadian small and medium businesses (SMBs). It enables businesses to build, deploy, and manage AI agents and automation workflows without requiring deep technical expertise.

**One-sentence description:**  
AIAS Platform helps Canadian SMBs automate repetitive business tasks through visual workflow builders and AI agents, eliminating the need for expensive enterprise tools or custom development.

---

## Who Is The User?

**Primary Users:**
1. **Solo E-Commerce Operators** (40% of target market)
   - Shopify store owners
   - Revenue: $100K-$5M annually
   - Pain: Manual order processing (5-10 hrs/week)
   - Budget: $50-100/month

2. **Independent Consultants** (30% of target market)
   - Business consultants, freelancers
   - Revenue: $50K-$2M annually
   - Pain: Manual proposal writing, client follow-ups
   - Budget: $50-75/month

3. **Real Estate Agents** (Tertiary)
   - Solo agents or small teams
   - Revenue: Commission-based ($100K-$500K)
   - Pain: Manual lead qualification (30+ hrs/week)
   - Budget: $100-150/month

**Geographic Focus:** Canada (Ontario, BC, Quebec priority)

---

## What Core Problem Does It Solve?

**The Problem:**  
Canadian SMBs waste 10-30 hours per week on repetitive tasks (order processing, lead qualification, proposal writing, customer follow-ups). Existing automation tools are either:
- Too expensive ($150-500/month enterprise tools)
- Too complex (require technical expertise)
- Not Canadian-focused (missing Canadian integrations, compliance)

**The Solution:**  
AIAS Platform provides:
- **Visual workflow builder** (no coding required)
- **Pre-built templates** for common Canadian business workflows
- **Canadian-first integrations** (Shopify, Wave Accounting, RBC, TD, Interac)
- **Affordable pricing** ($49/month starter plan)
- **Enterprise security** built-in (SOC 2, GDPR, PIPEDA compliance)

**Before/After Story:**

**Before AIAS:**
- Sarah (e-commerce owner) spends 3 hours/day on order confirmations, shipping labels, customer follow-ups
- Manual order entry leads to mistakes (wrong addresses, missed shipments)
- Can't afford Zapier ($50/month for just 5 automations)
- Tools don't connect—has to manually copy data between Shopify, Wave, Canada Post

**After AIAS:**
- Sarah connects Shopify in 30 minutes
- Orders automatically sync, confirmations sent, shipping labels generated
- Saves 10 hours/week = $500+ value/month
- Focuses on designing jewelry, not admin work

---

## Architecture At A High Level

**Frontend:**
- Next.js 14 (App Router)
- React 18, TypeScript
- Tailwind CSS, Radix UI
- Deployed on Vercel

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Edge Functions (serverless API)
- Supabase Auth (authentication)
- Supabase Realtime (real-time features)

**Infrastructure:**
- **Frontend Hosting:** Vercel (automatic preview deployments, CI/CD)
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **Payments:** Stripe (subscription billing)
- **AI/ML:** OpenAI, Anthropic Claude, Google Gemini

**Key Services:**
- `/app/api/*` - Next.js API routes (route handlers)
- `/supabase/functions/*` - Supabase Edge Functions
- `/lib/*` - Shared libraries (analytics, billing, workflows)
- `/components/*` - React UI components

**Multi-Tenant Architecture:**
- Row-level security (RLS) for tenant isolation
- Tenant-aware API routes
- Shared infrastructure, isolated data

---

## Main Product Identification

**MAIN YC-RELEVANT PRODUCT:** AIAS Platform (the core SaaS platform)

**Assumption:** This is a single-product company focused on the AIAS Platform SaaS offering. The platform includes:
- AI agent marketplace
- Visual workflow builder
- Multi-tenant SaaS infrastructure
- Canadian business integrations
- Subscription billing

**Not a multi-product company** — all features (marketplace, workflows, integrations) are part of the single AIAS Platform product.

---

## Key Files & Directories

**Product Definition:**
- `README.md` - Main product overview
- `VALUE_PROPOSITION.md` - Why this exists
- `USE_CASES.md` - Real-world scenarios
- `docs/USER_PERSONAS.md` - Target customer profiles

**Architecture:**
- `next.config.ts` - Next.js configuration
- `supabase/migrations/*` - Database schema
- `app/` - Next.js App Router pages and API routes
- `lib/` - Shared libraries

**Business Logic:**
- `app/api/stripe/*` - Payment processing
- `lib/analytics.ts` - Metrics tracking
- `app/pricing/page.tsx` - Pricing page
- `components/gamification/ReferralWidget.tsx` - Referral system

**GTM/Distribution:**
- `docs/GTM_ENGINE.md` - Go-to-market strategy
- `components/home/*` - Landing page components
- `app/onboarding/*` - User onboarding flows

---

## Deployment Targets

- **Frontend:** Vercel (automatic deployments via GitHub Actions)
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **CI/CD:** GitHub Actions (`.github/workflows/*`)
- **Monitoring:** Built-in telemetry, error tracking

---

## Next Steps

See `/yc/` directory for YC readiness artifacts:
- `YC_PRODUCT_OVERVIEW.md` - Product narrative
- `YC_PROBLEM_USERS.md` - Problem and user segments
- `YC_MARKET_VISION.md` - Market opportunity
- `YC_TEAM_NOTES.md` - Team information
- `YC_METRICS_CHECKLIST.md` - Metrics instrumentation
- `YC_DISTRIBUTION_PLAN.md` - Growth strategy
- `YC_TECH_OVERVIEW.md` - Technical architecture
- `YC_INTERVIEW_CHEATSHEET.md` - Interview prep
