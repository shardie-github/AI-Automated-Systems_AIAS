# MVP Specification — AIAS Platform

## MVP Scope Definition

**MVP Goal:** Launch a no-code AI agent builder that enables Canadian solo operators to automate workflows in 30 minutes or less.

**MVP Timeline:** 12 weeks (Q1 2024)  
**MVP Launch:** March 2024  
**Target Users:** 500 beta users by launch

---

## In Scope (MVP)

### Core Features

#### 1. No-Code Workflow Builder
- **What:** Drag-and-drop interface for creating automation workflows
- **Why:** Core value prop (no-code = easy setup)
- **Acceptance Criteria:**
  - User can create workflow in <30 minutes
  - Drag-and-drop works on desktop (Chrome, Safari, Firefox)
  - Saves workflows automatically (auto-save every 30 seconds)
  - Visual workflow preview (see automation flow)

#### 2. Pre-Built Templates (10 Templates)
- **What:** 10 Canadian-focused workflow templates
- **Why:** Fast setup (templates = 30-minute setup)
- **Templates:**
  1. Shopify order confirmation → email → shipping label
  2. Wave invoice → email → Slack notification
  3. Gmail → AI summary → Notion page
  4. Google Calendar → reminder → SMS
  5. Stripe payment → thank you email → receipt
  6. Lead form → qualification → CRM entry
  7. Slack message → AI response → channel post
  8. Instagram DM → auto-response → email
  9. Website form → email → calendar booking
  10. Expense receipt → Wave accounting → report

#### 3. Canadian Integrations (10 Integrations)
- **What:** 10 Canadian-first integrations
- **Why:** Differentiation (Canadian tools = competitive advantage)
- **Integrations:**
  1. Shopify (orders, products, customers)
  2. Wave Accounting (invoices, expenses)
  3. Stripe CAD (payments, subscriptions)
  4. Gmail (send, receive, search)
  5. Google Calendar (events, reminders)
  6. Slack (messages, channels, notifications)
  7. Notion (pages, databases)
  8. WhatsApp Business (messages, templates)
  9. Canada Post (shipping labels, tracking)
  10. Google Workspace (Docs, Sheets, Drive)

#### 4. AI Agent Engine
- **What:** Context-aware AI agents (GPT-4 powered)
- **Why:** Differentiation (AI agents vs. rule-based automation)
- **Acceptance Criteria:**
  - AI understands business context (e.g., "order confirmation email")
  - AI generates natural language responses
  - AI handles errors gracefully (fallback to template)
  - AI respects Canadian English spelling (colour, centre, etc.)

#### 5. User Authentication & Billing
- **What:** Sign up, login, subscription management (Stripe)
- **Why:** Required for MVP (users need accounts, billing)
- **Acceptance Criteria:**
  - Email/password sign-up (no social login MVP)
  - Email verification (double opt-in for CASL)
  - Stripe subscription (CAD $49/month Starter tier)
  - Free tier (3 agents, 100 automations/month)
  - Cancel anytime (no contracts)

#### 6. Analytics Dashboard (Basic)
- **What:** Basic analytics (workflow runs, success rate, time saved)
- **Why:** User value (see ROI)
- **Acceptance Criteria:**
  - Shows workflow runs (last 30 days)
  - Shows success rate (successful vs. failed)
  - Shows estimated time saved (calculated)
  - Mobile-responsive (basic mobile view)

---

## Out of Scope (Post-MVP)

### Phase 2 (Q2 2024)
- ❌ Mobile app (iOS/Android)
- ❌ Advanced analytics (cohorts, retention)
- ❌ Team collaboration (multi-user workspaces)
- ❌ API access (public API)
- ❌ White-label (custom branding)

### Phase 3 (Q3 2024)
- ❌ French language support
- ❌ Enterprise tier (SSO, RBAC, advanced security)
- ❌ Marketplace (user-generated templates)
- ❌ Advanced AI (custom models, fine-tuning)

### Phase 4 (Q4 2024)
- ❌ International expansion (US, UK, EU)
- ❌ Partner program (reseller/affiliate)
- ❌ Advanced integrations (50+)

---

## Day-1 Integrations

### Must-Have (MVP)
1. **Shopify** — Primary use case (e-commerce automation)
2. **Wave Accounting** — Primary use case (Canadian accounting)
3. **Stripe CAD** — Billing (subscriptions)
4. **Gmail** — Primary use case (email automation)
5. **Google Calendar** — Primary use case (scheduling)

### Nice-to-Have (MVP)
6. **Slack** — Secondary use case (notifications)
7. **Notion** — Secondary use case (documentation)
8. **WhatsApp Business** — Secondary use case (messaging)
9. **Canada Post** — Secondary use case (shipping)
10. **Google Workspace** — Secondary use case (docs)

---

## Offline-First & Small App Constraints

### Offline-First Strategy
- **What:** Workflows work offline (queue actions, sync when online)
- **Why:** Canadian users may have intermittent connectivity
- **Implementation:**
  - Queue actions locally (IndexedDB)
  - Sync when online (background sync)
  - Show offline indicator (UI feedback)
  - Retry failed actions (exponential backoff)

### Small App Constraints
- **Bundle Size:** <500KB (gzipped) for initial load
- **Performance:** <3s First Contentful Paint (FCP)
- **Storage:** <50MB local storage (workflows + queued actions)
- **API Calls:** <100 requests/hour per user (rate limiting)

**Mitigation:**
- Code splitting (lazy load workflows)
- Image optimization (WebP, lazy loading)
- API batching (batch multiple actions)
- Caching (service worker for offline)

---

## Consent-Gated Telemetry

### Telemetry Collection
- **What:** User behavior tracking (workflow runs, errors, feature usage)
- **Why:** Product improvement (understand user behavior)
- **Consent:** Explicit opt-in (GDPR/PIPEDA compliant)

### Consent Flow
1. **Onboarding:** Show consent modal (explain what we track, why)
2. **Granular Consent:** Allow users to opt-out of specific tracking
3. **Privacy Policy:** Link to PIPEDA-compliant privacy policy
4. **Data Access:** Users can request data (DSR/PIPEDA)

### What We Track (Consent Required)
- Workflow runs (success/failure, duration)
- Feature usage (which templates used, which integrations)
- Errors (error types, frequency)
- User journey (sign-up → first workflow → paid conversion)

### What We Don't Track (No Consent Needed)
- Personal data (name, email, phone — only if provided)
- Payment data (handled by Stripe, not tracked)
- Third-party data (Shopify orders, Wave invoices — not stored)

---

## Cloud Backup Toggle

### Cloud Backup Feature
- **What:** Optional cloud backup of workflows (Supabase storage)
- **Why:** User value (backup = peace of mind)
- **Default:** Off (users opt-in)

### Implementation
- **Storage:** Supabase storage (encrypted at rest)
- **Frequency:** Daily backup (or manual trigger)
- **Retention:** 90 days (configurable)
- **Access:** Users can download backups (JSON format)

### Privacy
- **Encryption:** AES-256 encryption (at rest)
- **Access:** Only user can access backups (auth required)
- **Deletion:** Users can delete backups anytime (PIPEDA compliance)

---

## Acceptance Criteria (MVP)

### Functional Requirements
- ✅ User can create workflow in <30 minutes
- ✅ User can use 10 pre-built templates
- ✅ User can connect 10 Canadian integrations
- ✅ User can run workflows (automated execution)
- ✅ User can see basic analytics (runs, success rate)
- ✅ User can subscribe (CAD $49/month)
- ✅ User can cancel subscription (no contracts)

### Non-Functional Requirements
- ✅ Page load <3s (First Contentful Paint)
- ✅ Works offline (queue actions, sync when online)
- ✅ Mobile-responsive (basic mobile view)
- ✅ PIPEDA-compliant (privacy policy, consent)
- ✅ CASL-compliant (double opt-in email)

### Performance Requirements
- ✅ API response <500ms (p95)
- ✅ Workflow execution <5s (p95)
- ✅ 99.9% uptime (SLA)
- ✅ <1% error rate (workflow failures)

---

## Risks & Mitigations

### Risk 1: Integration Failures
- **Risk:** Shopify/Wave API changes break workflows
- **Impact:** High (core value prop broken)
- **Mitigation:** 
  - Monitor API changes (webhooks/alerts)
  - Version API integrations (backward compatibility)
  - Error handling (graceful degradation)

### Risk 2: AI Costs
- **Risk:** GPT-4 API costs exceed revenue (CAD $0.03/1K tokens)
- **Impact:** Medium (unit economics negative)
- **Mitigation:**
  - Rate limit AI usage (100 requests/user/month free tier)
  - Cache AI responses (reduce API calls)
  - Optimize prompts (reduce token usage)

### Risk 3: Offline Sync Failures
- **Risk:** Offline actions fail to sync (data loss)
- **Impact:** Medium (user frustration)
- **Mitigation:**
  - Retry logic (exponential backoff)
  - User notifications (failed sync alerts)
  - Manual sync button (user control)

### Risk 4: Scaling Issues
- **Risk:** MVP can't handle 500+ users (performance degradation)
- **Impact:** High (user churn)
- **Mitigation:**
  - Load testing (test with 1,000 users)
  - Auto-scaling (Supabase/cloud auto-scale)
  - Rate limiting (prevent abuse)

---

## MVP Success Metrics

### Launch Metrics (Week 1)
- **Sign-ups:** 100 users (target: 100)
- **Activations:** 60% create first workflow (target: 60%)
- **Paid Conversions:** 10% convert to paid (target: 10%)

### 30-Day Metrics
- **Active Users:** 300 users (target: 300)
- **7-Day Retention:** 70% (target: 70%)
- **Paid Conversions:** 20% (target: 20%)
- **NPS:** 50+ (target: 50+)

### 90-Day Metrics
- **Active Users:** 500 users (target: 500)
- **30-Day Retention:** 60% (target: 60%)
- **Paid Conversions:** 25% (target: 25%)
- **MRR:** CAD $6,125 (target: CAD $5,000)

---

## MVP Testing Plan

### Alpha Testing (Week 1-4)
- **Users:** 10 internal testers
- **Focus:** Core workflows (Shopify, Wave, Gmail)
- **Metrics:** Setup time, success rate, errors

### Beta Testing (Week 5-8)
- **Users:** 50 beta users (invite-only)
- **Focus:** All features (10 templates, 10 integrations)
- **Metrics:** Activation, retention, paid conversion

### Public Beta (Week 9-12)
- **Users:** 100 public beta users (open sign-up)
- **Focus:** Scale testing (500+ users)
- **Metrics:** Performance, uptime, error rate

---

## MVP Launch Checklist

### Pre-Launch (Week 11)
- ✅ All integrations tested (10/10 working)
- ✅ All templates tested (10/10 working)
- ✅ Privacy policy published (PIPEDA compliant)
- ✅ Terms of service published
- ✅ Support email setup (support@aias-platform.com)
- ✅ Status page setup (status.aias-platform.com)

### Launch Day (Week 12)
- ✅ Public beta sign-up open
- ✅ Email announcement (waitlist + social)
- ✅ Product Hunt launch (planned)
- ✅ Shopify App Store submission (pending)
- ✅ Google Play Store submission (Q2 2024)

---

**Last Updated:** 2024-01-15  
**Next Review:** Post-MVP launch (Q2 2024)
