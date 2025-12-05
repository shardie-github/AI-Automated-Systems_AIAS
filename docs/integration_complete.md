# Integration Complete: Supabase + Resend

**Date:** 2025-01-27  
**Status:** ✅ Fully Integrated

---

## What Was Integrated

### 1. Database Integration (Supabase)

#### User Plan Management
**File:** `lib/trial/user-plan.ts`

- ✅ `getUserPlanData()` - Gets user plan, trial dates, and activation status from Supabase
- ✅ `savePretestAnswers()` - Saves pre-test questionnaire answers to database
- ✅ `markEmailConnected()` - Marks email as connected
- ✅ `markWorkflowCreated()` - Marks first workflow as created
- ✅ `startTrial()` - Starts trial for user

**Database Tables:**
- `profiles` - Extended with trial fields (subscription_tier, trial_started_at, pretest_completed, etc.)
- `pretest_answers` - Stores detailed pre-test answers
- `trial_emails_sent` - Tracks which emails were sent to which users

#### Migration
**File:** `supabase/migrations/20250127000000_trial_system.sql`

- ✅ Extends profiles table with trial-related fields
- ✅ Creates pretest_answers table
- ✅ Creates trial_emails_sent table
- ✅ Adds indexes for performance
- ✅ Sets up RLS policies

---

### 2. Email Integration (Resend)

#### Email Cadence Sender
**File:** `lib/email-cadence/sender.ts`

- ✅ `sendTrialEmail()` - Sends trial email for specific day
- ✅ `processTrialEmailsForUser()` - Processes emails for a single user
- ✅ `processAllTrialEmails()` - Processes all trial users (for cron)

**Integration:**
- Uses existing `emailService` from `lib/email/email-service.ts`
- Automatically uses Resend if `RESEND_API_KEY` is set
- Falls back to SendGrid or SMTP if Resend not available

---

### 3. API Routes

#### Pre-Test API
**File:** `app/api/trial/pretest/route.ts`
- `POST /api/trial/pretest` - Save pre-test answers

#### User Data API
**File:** `app/api/trial/user-data/route.ts`
- `GET /api/trial/user-data` - Get user plan and trial data

#### Email Sending API
**File:** `app/api/trial/emails/send/route.ts`
- `POST /api/trial/emails/send` - Send email for specific user or all users
- `GET /api/trial/emails/send?userId=xxx` - Trigger email (for testing)

#### Activation Tracking APIs
**File:** `app/api/trial/mark-email-connected/route.ts`
- `POST /api/trial/mark-email-connected` - Mark email as connected

**File:** `app/api/trial/mark-workflow-created/route.ts`
- `POST /api/trial/mark-workflow-created` - Mark workflow as created

#### Cron Job API
**File:** `app/api/cron/trial-emails/route.ts`
- `POST /api/cron/trial-emails` - Process all trial emails (cron job)
- Protected with `CRON_SECRET` environment variable

---

### 4. Component Updates

#### Dashboard
**File:** `components/dashboard/dashboard-upgrade-section.tsx`
- ✅ Fetches user data from `/api/trial/user-data`
- ✅ Shows welcome dashboard on first visit
- ✅ Shows upgrade prompts for trial/free users
- ✅ Falls back to localStorage if API fails

#### Pre-Test Questionnaire
**File:** `components/onboarding/pre-test-questionnaire.tsx`
- ✅ Saves answers to `/api/trial/pretest` on completion
- ✅ Falls back to localStorage if API fails

#### Welcome Dashboard
**File:** `components/dashboard/welcome-dashboard.tsx`
- ✅ Marks email connected when user clicks "Connect Email"
- ✅ Uses real user data from API

#### Onboarding Wizard
**File:** `components/onboarding/wizard.tsx`
- ✅ Marks workflow created when first workflow is created

#### Systems Thinking Page
**File:** `app/systems-thinking/page.tsx`
- ✅ Gets user plan from database
- ✅ Uses `GatedSystemsThinking` component with real plan data

#### Case Studies Page
**File:** `app/case-studies/page.tsx`
- ✅ Gets user plan from database
- ✅ Uses `GatedCaseStudy` component for all case studies
- ✅ Consultancy builds always show full (not gated)

---

### 5. Cron Job Setup

**File:** `vercel.json`
- ✅ Daily cron job at 9 AM UTC
- ✅ Calls `/api/cron/trial-emails`
- ✅ Protected with `CRON_SECRET`

**To Set Up:**
1. Add `CRON_SECRET` to environment variables
2. Vercel will automatically set up the cron job
3. Or use external cron service (cron-job.org, etc.) to call the endpoint

---

## Environment Variables Required

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Already configured
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Already configured
- `SUPABASE_SERVICE_ROLE_KEY` - Already configured

### Resend
- `RESEND_API_KEY` - Already configured (or use SendGrid/SMTP)

### Cron
- `CRON_SECRET` - Set this for cron job protection (optional but recommended)

---

## Database Schema

### Profiles Table (Extended)
```sql
subscription_tier TEXT DEFAULT 'free'
trial_started_at TIMESTAMPTZ
pretest_completed BOOLEAN DEFAULT FALSE
pretest_answers JSONB
email_connected BOOLEAN DEFAULT FALSE
workflows_created BOOLEAN DEFAULT FALSE
```

### New Tables

**pretest_answers**
- `user_id` (UUID, FK to profiles)
- `answers` (JSONB)
- `completed_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**trial_emails_sent**
- `user_id` (UUID, FK to profiles)
- `day` (INTEGER)
- `template_id` (TEXT)
- `sent_at` (TIMESTAMPTZ)
- `message_id` (TEXT)

---

## How It Works

### 1. User Signs Up
- User creates account
- `subscription_tier` defaults to "free"
- If they start trial, `trial_started_at` is set and `subscription_tier` = "trial"

### 2. Day 0 Welcome
- User sees welcome dashboard
- Pre-test questionnaire appears
- User completes pre-test → saved to database
- User connects email → `email_connected` = true
- User creates workflow → `workflows_created` = true

### 3. Email Cadence
- Cron job runs daily at 9 AM UTC
- Checks all users with `subscription_tier` = "trial"
- Calculates days since `trial_started_at`
- Sends appropriate email for that day
- Marks email as sent in `trial_emails_sent` table

### 4. Content Gating
- Pages check user plan via `getUserPlanData()`
- Free/trial users see teasers
- Paid users see full content
- Upgrade prompts shown based on plan

---

## Testing

### Manual Testing

1. **Test Pre-Test Save:**
   ```bash
   curl -X POST http://localhost:3000/api/trial/pretest \
     -H "Content-Type: application/json" \
     -H "Cookie: [your-auth-cookie]" \
     -d '{"answers": {"goals": "save-time", "industry": "ecommerce"}}'
   ```

2. **Test User Data:**
   ```bash
   curl http://localhost:3000/api/trial/user-data \
     -H "Cookie: [your-auth-cookie]"
   ```

3. **Test Email Send:**
   ```bash
   curl -X POST http://localhost:3000/api/trial/emails/send \
     -H "Content-Type: application/json" \
     -H "Cookie: [your-auth-cookie]" \
     -d '{"userId": "user-id-here"}'
   ```

4. **Test Cron Job:**
   ```bash
   curl -X POST http://localhost:3000/api/cron/trial-emails \
     -H "Authorization: Bearer ${CRON_SECRET}"
   ```

### Database Testing

1. **Check user plan:**
   ```sql
   SELECT id, subscription_tier, trial_started_at, pretest_completed 
   FROM profiles 
   WHERE id = 'user-id';
   ```

2. **Check pre-test answers:**
   ```sql
   SELECT * FROM pretest_answers WHERE user_id = 'user-id';
   ```

3. **Check emails sent:**
   ```sql
   SELECT * FROM trial_emails_sent WHERE user_id = 'user-id';
   ```

---

## Deployment Checklist

- [x] Database migration created
- [x] API routes created
- [x] Components updated to use real data
- [x] Email cadence system integrated
- [x] Cron job configured
- [ ] Run database migration: `supabase migration up`
- [ ] Set `CRON_SECRET` environment variable
- [ ] Test email sending (verify Resend API key works)
- [ ] Test pre-test save
- [ ] Test user data fetch
- [ ] Verify cron job runs (check Vercel logs)

---

## Next Steps

1. **Run Migration:**
   ```bash
   supabase migration up
   # Or in production:
   supabase db push
   ```

2. **Set Environment Variables:**
   - `CRON_SECRET` (for cron job protection)
   - Verify `RESEND_API_KEY` is set

3. **Test in Production:**
   - Create test user
   - Complete pre-test
   - Verify email sends
   - Check database records

4. **Monitor:**
   - Check Vercel cron logs
   - Monitor email delivery rates
   - Track trial conversion metrics

---

## Files Created/Modified

### New Files
- `lib/trial/user-plan.ts` - User plan management
- `lib/email-cadence/sender.ts` - Email sending logic
- `app/api/trial/pretest/route.ts` - Pre-test API
- `app/api/trial/user-data/route.ts` - User data API
- `app/api/trial/emails/send/route.ts` - Email sending API
- `app/api/trial/mark-email-connected/route.ts` - Email connection API
- `app/api/trial/mark-workflow-created/route.ts` - Workflow creation API
- `app/api/cron/trial-emails/route.ts` - Cron job endpoint
- `supabase/migrations/20250127000000_trial_system.sql` - Database migration

### Modified Files
- `components/dashboard/dashboard-upgrade-section.tsx` - Uses real API
- `components/onboarding/pre-test-questionnaire.tsx` - Saves to database
- `components/dashboard/welcome-dashboard.tsx` - Marks actions in DB
- `components/onboarding/wizard.tsx` - Marks workflow created
- `app/systems-thinking/page.tsx` - Uses real user plan
- `app/case-studies/page.tsx` - Uses real user plan
- `vercel.json` - Added cron job

---

**Everything is now fully integrated with Supabase and Resend!** 🎉
