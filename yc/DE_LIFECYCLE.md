# Disciplined Entrepreneurship Full Lifecycle Use Case — AIAS Platform

**Last Updated:** 2025-01-29  
**Purpose:** Map complete user journey from discover → buy → use → get value → ongoing use

---

## Full Lifecycle Use Case: Sarah's Journey

**Persona:** Sarah Chen, Shopify store owner, Toronto, Ontario  
**Use Case:** Automate order processing (order confirmations, shipping labels)

---

## Stage 1: Discover

### How Sarah Discovers AIAS Platform

**Channel 1: Shopify App Store**
- Sarah searches Shopify App Store for "order automation"
- Sees AIAS Platform listing
- Reads description: "Automate order processing, save 10+ hours/week"
- Clicks "Install" button

**Channel 2: SEO/Content Marketing**
- Sarah searches Google for "Shopify automation Canada"
- Finds AIAS Platform blog post or landing page
- Reads about order automation solution
- Clicks "Get Started" button

**Channel 3: Referral**
- Friend (Mike) refers Sarah via referral link
- Sarah clicks referral link
- Sees personalized landing page with friend's name
- Clicks "Sign Up" button

### Touchpoints
- **Shopify App Store listing:** App name, description, screenshots, reviews
- **Landing page:** Problem description, solution, social proof, CTA
- **Blog post:** Educational content, use cases, CTA

### Friction Points
- [TODO: Document friction points]
- Example: "Landing page doesn't clearly explain Canadian integrations"

### Opportunities
- [TODO: Document opportunities]
- Example: "Add video demo showing order automation in action"

---

## Stage 2: Sign Up

### How Sarah Signs Up

**Process:**
1. Sarah clicks "Sign Up" or "Get Started"
2. Lands on signup page (`app/auth/signup/page.tsx`)
3. Enters email, password, business name
4. Clicks "Create Account"
5. Receives confirmation email
6. Clicks confirmation link
7. Account created

### Touchpoints
- **Signup page:** Email, password, business name fields
- **Confirmation email:** Welcome message, next steps
- **Onboarding:** Redirected to onboarding flow

### Friction Points
- [TODO: Document friction points]
- Example: "Signup form is too long (3 fields vs. 1 field)"

### Opportunities
- [TODO: Document opportunities]
- Example: "Add social signup (Google, Shopify) to reduce friction"

---

## Stage 3: Onboard

### How Sarah Onboards

**Process:**
1. Sarah lands on onboarding page (`app/onboarding/page.tsx`)
2. Step 1: Welcome — "Let's get you set up in 30 minutes"
3. Step 2: Choose Integration — Selects Shopify
4. Step 3: Connect Shopify — OAuth connection to Shopify store
5. Step 4: Create Workflow — Selects "Order Processing" template
6. Step 5: Test Workflow — Tests workflow with sample order
7. Onboarding complete — "You're all set!"

### Touchpoints
- **Onboarding wizard:** 5 steps with progress indicators
- **Integration selection:** Shopify, Wave Accounting, etc.
- **Workflow templates:** Pre-built templates (order processing, lead qualification)
- **Test workflow:** Sample data to test workflow

### Friction Points
- [TODO: Document friction points]
- Example: "Onboarding has too many steps (5 steps vs. 3 steps)"

### Opportunities
- [TODO: Document opportunities]
- Example: "Reduce to 3 steps, add progress indicators"

---

## Stage 4: Create Workflow

### How Sarah Creates Her First Workflow

**Process:**
1. Sarah selects "Order Processing" template
2. Workflow builder opens (`app/workflows/[id]/page.tsx`)
3. Sarah customizes workflow:
   - Trigger: New Shopify order
   - Action 1: Send order confirmation email
   - Action 2: Generate shipping label
   - Action 3: Update inventory
4. Sarah saves workflow
5. Workflow is active

### Touchpoints
- **Workflow builder:** Visual drag-and-drop interface
- **Templates:** Pre-built templates for common workflows
- **Integrations:** Shopify, Wave Accounting, etc.
- **Test mode:** Test workflow before activating

### Friction Points
- [TODO: Document friction points]
- Example: "Workflow builder is confusing, need more guidance"

### Opportunities
- [TODO: Document opportunities]
- Example: "Add tooltips, guided tour, video tutorials"

---

## Stage 5: Get Value

### How Sarah Gets Value

**Process:**
1. Sarah's first order comes in
2. Workflow automatically triggers:
   - Order confirmation email sent
   - Shipping label generated
   - Inventory updated
3. Sarah receives notification: "Workflow executed successfully"
4. Sarah sees time saved: "You saved 15 minutes on this order"
5. Sarah realizes value: "This is amazing! I'm saving 10+ hours/week"

### Touchpoints
- **Workflow execution:** Automatic execution when trigger occurs
- **Notifications:** Success/failure notifications
- **Time saved:** Metrics showing time saved
- **Dashboard:** Workflow performance dashboard

### Friction Points
- [TODO: Document friction points]
- Example: "Notifications are too frequent, need to reduce noise"

### Opportunities
- [TODO: Document opportunities]
- Example: "Add digest emails (daily summary instead of per-execution)"

---

## Stage 6: Ongoing Use

### How Sarah Uses AIAS Platform Ongoing

**Process:**
1. Sarah creates more workflows:
   - Customer follow-up emails
   - Inventory management
   - Sales reports
2. Sarah monitors workflow performance:
   - Views dashboard (`app/admin/metrics/page.tsx`)
   - Sees time saved, errors, success rate
3. Sarah optimizes workflows:
   - Updates workflows based on learnings
   - Adds new actions
   - Removes unnecessary steps
4. Sarah upgrades to Pro plan:
   - Hits free plan limits (3 workflows)
   - Upgrades to Pro ($149/month) for unlimited workflows
5. Sarah refers friends:
   - Shares referral link
   - Gets rewards (XP, credits, commission)

### Touchpoints
- **Workflow builder:** Create and edit workflows
- **Dashboard:** View metrics and performance
- **Pricing page:** Upgrade to Pro plan
- **Referral system:** Share referral link

### Friction Points
- [TODO: Document friction points]
- Example: "Upgrade prompts are too aggressive, need to be more subtle"

### Opportunities
- [TODO: Document opportunities]
- Example: "Add usage-based upgrade triggers (show when approaching limits)"

---

## Lifecycle Metrics

### Discovery Metrics
- **Impressions:** [TODO: Track impressions per channel]
- **Click-Through Rate:** [TODO: Track CTR per channel]
- **Signup Rate:** [TODO: Track signup rate per channel]

### Signup Metrics
- **Signup Rate:** [TODO: Track signup rate]
- **Time to Signup:** [TODO: Track time from discovery to signup]
- **Drop-Off Rate:** [TODO: Track drop-off at signup]

### Onboarding Metrics
- **Activation Rate:** [TODO: Track activation rate]
- **Time-to-Activation:** [TODO: Track time from signup to activation]
- **Drop-Off Rate:** [TODO: Track drop-off at each onboarding step]

### Value Metrics
- **Time Saved:** [TODO: Track time saved per user]
- **Workflow Executions:** [TODO: Track workflow executions]
- **Satisfaction:** [TODO: Track user satisfaction]

### Ongoing Use Metrics
- **Retention Rate:** [TODO: Track 30-day retention]
- **Upgrade Rate:** [TODO: Track free → paid conversion]
- **Referral Rate:** [TODO: Track referral rate]

---

## Friction Points Summary

### High Priority Friction Points
1. [TODO: Document high priority friction points]
2. [TODO: Document high priority friction points]
3. [TODO: Document high priority friction points]

### Medium Priority Friction Points
1. [TODO: Document medium priority friction points]
2. [TODO: Document medium priority friction points]

### Low Priority Friction Points
1. [TODO: Document low priority friction points]
2. [TODO: Document low priority friction points]

---

## Opportunities Summary

### High Priority Opportunities
1. [TODO: Document high priority opportunities]
2. [TODO: Document high priority opportunities]
3. [TODO: Document high priority opportunities]

### Medium Priority Opportunities
1. [TODO: Document medium priority opportunities]
2. [TODO: Document medium priority opportunities]

### Low Priority Opportunities
1. [TODO: Document low priority opportunities]
2. [TODO: Document low priority opportunities]

---

## Next Steps

1. **Map Complete Journey:** Document all touchpoints and friction points
2. **Track Metrics:** Implement tracking for each lifecycle stage
3. **Identify Friction:** Document friction points and opportunities
4. **Optimize Journey:** Reduce friction, improve opportunities

---

## Resources

- **Beachhead:** `yc/DE_BEACHHEAD.md`
- **Persona Validation:** `yc/DE_PERSONA_VALIDATION.md`
- **Channel Strategy:** `yc/DE_CHANNEL_STRATEGY.md`
- **Competitive Alternatives:** `yc/DE_COMPETITIVE_ALTERNATIVES.md`
