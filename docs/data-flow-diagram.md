# Data Flow Diagram: User Sign-Up → Profile Creation → Activity Logging

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER SIGN-UP FLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. USER INTERACTION (Vercel Frontend)
   │
   │ User fills out sign-up form
   │ Component: <SignUpForm /> (Client Component)
   │
   ▼
   
2. SERVER ACTION (Next.js)
   │
   │ File: lib/actions/auth-actions.ts
   │ Function: signUpUser(email, password, displayName)
   │
   │ "use server" directive ensures server-side execution
   │
   ▼
   
3. SUPABASE AUTH (Supabase Backend)
   │
   │ Create user in auth.users table
   │ Returns: { user: { id, email }, session }
   │
   ▼
   
4. PROFILE CREATION (Supabase Database)
   │
   │ Insert into profiles table:
   │ - id: user.id (FK to auth.users)
   │ - email: user.email
   │ - display_name: displayName
   │ - created_at: NOW()
   │
   │ RLS Policy Check: ✅ Service role bypasses RLS
   │
   ▼
   
5. ACTIVITY LOGGING (Supabase Database)
   │
   │ Insert into activity_log table:
   │ - user_id: user.id
   │ - activity_type: 'sign_up'
   │ - entity_type: 'user'
   │ - entity_id: user.id
   │ - metadata: { email, display_name, source: 'server_action' }
   │ - created_at: NOW()
   │
   │ RLS Policy Check: ✅ Service role can insert
   │
   ▼
   
6. PATH REVALIDATION (Next.js)
   │
   │ revalidatePath("/")
   │ revalidatePath("/account")
   │
   │ Ensures fresh data on next request
   │
   ▼
   
7. RESPONSE TO CLIENT (Vercel Frontend)
   │
   │ Return structured response:
   │ {
   │   success: true,
   │   data: { userId, email }
   │ }
   │
   │ Client Component handles success/error states
   │
   ▼
   
8. PROFILE PAGE RELOAD (Server Component Fetch)
   │
   │ File: app/account/page.tsx (Server Component)
   │
   │ Query Supabase:
   │ SELECT * FROM profiles WHERE id = userId
   │
   │ RLS Policy Check: ✅ User can view own profile
   │
   │ Display: User profile with fresh data
   │
   └─────────────────────────────────────────────────────────────┘
```

## Real-Time Update Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              REAL-TIME ACTIVITY FEED                             │
└─────────────────────────────────────────────────────────────────┘

1. USER ACTION (Anywhere in App)
   │
   │ User clicks, scrolls, submits form, etc.
   │
   ▼
   
2. ACTIVITY LOGGING (Server Action)
   │
   │ logActivity(userId, sessionId, activityType, ...)
   │
   │ Insert into activity_log table
   │
   ▼
   
3. SUPABASE REALTIME SUBSCRIPTION
   │
   │ Frontend subscribes to activity_log changes:
   │
   │ supabase
   │   .channel('activity-feed')
   │   .on('postgres_changes', {
   │     event: 'INSERT',
   │     schema: 'public',
   │     table: 'activity_log'
   │   }, (payload) => {
   │     // Update UI with new activity
   │   })
   │   .subscribe()
   │
   ▼
   
4. AUTOMATIC UI UPDATE (Vercel Frontend)
   │
   │ Dashboard component receives real-time update
   │ Activity feed refreshes automatically
   │ No page reload required
   │
   └─────────────────────────────────────────────────────────────┘
```

## Positioning Feedback Flow

```
┌─────────────────────────────────────────────────────────────────┐
│          POSITIONING FEEDBACK SUBMISSION                         │
└─────────────────────────────────────────────────────────────────┘

1. USER SUBMITS FEEDBACK (Client Component)
   │
   │ Component: <PositioningFeedbackForm />
   │ User selects type and enters feedback text
   │
   ▼
   
2. SERVER ACTION (Next.js)
   │
   │ submitPositioningFeedback(userId, feedbackType, feedbackText)
   │
   ▼
   
3. DATABASE INSERT (Supabase)
   │
   │ INSERT INTO positioning_feedback (
   │   user_id,
   │   feedback_type,
   │   feedback_text,
   │   impact_score  -- Calculated by trigger
   │ )
   │
   ▼
   
4. TRIGGER EXECUTION (PostgreSQL)
   │
   │ BEFORE INSERT trigger fires:
   │ calculate_impact_score()
   │
   │ Factors:
   │ - Text length (0-30 points)
   │ - User engagement history (0-40 points)
   │ - Content creation activity (0-30 points)
   │ - Feedback type multiplier (1.0-1.5x)
   │
   │ Result: impact_score (0-100)
   │
   ▼
   
5. ACTIVITY LOGGING
   │
   │ Log feedback submission to activity_log
   │
   ▼
   
6. RESPONSE WITH IMPACT SCORE
   │
   │ Return to client:
   │ {
   │   success: true,
   │   data: {
   │     feedbackId,
   │     impactScore: 75,
   │     message: "🎉 Excellent feedback! Your input has high impact..."
   │   }
   │ }
   │
   ▼
   
7. PERSONALIZED TOAST (Client Component)
   │
   │ Display thank-you message based on impact score
   │ High score (70+): "🎉 Excellent feedback!"
   │ Medium score (40-69): "✨ Great feedback!"
   │ Low score (<40): "Thank you for your feedback!"
   │
   └─────────────────────────────────────────────────────────────┘
```

## KPI Health Check Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              ALL-CYLINDER FIRING CHECK                           │
└─────────────────────────────────────────────────────────────────┘

1. HEALTH ENDPOINT REQUEST
   │
   │ GET /api/status/health
   │
   ▼
   
2. QUERY ALL 3 KPI VIEWS (Supabase)
   │
   │ Parallel queries:
   │ - SELECT * FROM kpi_new_users_week
   │ - SELECT * FROM kpi_avg_post_views
   │ - SELECT * FROM kpi_actions_last_hour
   │
   ▼
   
3. EVALUATE THRESHOLDS
   │
   │ KPI 1: new_users_count > 50 ✓
   │ KPI 2: avg_post_views > 100 ✓
   │ KPI 3: actions_count > 20 ✓
   │
   ▼
   
4. DETERMINE STATUS
   │
   │ IF all KPIs met:
   │   status = "loud_and_high"
   │   message = "Status: Loud and High ✓"
   │
   │ ELSE:
   │   status = "needs_attention"
   │   message = "Status: Needs Attention ⚠️"
   │
   ▼
   
5. RETURN RESPONSE
   │
   │ {
   │   status: "loud_and_high",
   │   kpis: { ... },
   │   allCylindersFiring: true,
   │   message: "Status: Loud and High ✓"
   │ }
   │
   └─────────────────────────────────────────────────────────────┘
```

## Key Principles

1. **Single Source of Truth:** Supabase database is the only source of truth
2. **Server Actions Only:** All mutations go through Server Actions
3. **RLS Enforcement:** Security checked at database layer
4. **Real-time Updates:** Supabase Realtime for live data
5. **Structured Responses:** All actions return consistent response format
6. **Path Revalidation:** Next.js cache invalidation for fresh data
7. **Activity Logging:** Every significant action is logged
