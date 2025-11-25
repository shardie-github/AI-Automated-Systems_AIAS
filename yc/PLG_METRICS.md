# Product-Led Growth Metrics — AIAS Platform

**Last Updated:** 2025-01-29  
**Purpose:** Track PLG metrics: signup → activation → upgrade → viral

---

## PLG Funnel Metrics

### Stage 1: Signup
- **Signups:** [TODO: Count]
- **Signup Rate:** [TODO: % of visitors who sign up]
- **Target:** 5%+ signup rate

### Stage 2: Onboarding
- **Onboarding Started:** [TODO: Count]
- **Onboarding Completed:** [TODO: Count]
- **Onboarding Completion Rate:** [TODO: %]
- **Target:** 80%+ completion rate

### Stage 3: Activation
- **Activations:** [TODO: Count]
- **Activation Rate:** [TODO: % of signups who activate]
- **Time-to-Activation:** [TODO: Average days]
- **Target:** 40%+ activation rate, < 2 days time-to-activation

### Stage 4: Upgrade
- **Upgrades:** [TODO: Count]
- **Upgrade Rate:** [TODO: % of free users who upgrade]
- **Time-to-Upgrade:** [TODO: Average days]
- **Target:** 10%+ upgrade rate, < 30 days time-to-upgrade

### Stage 5: Viral
- **Referrals:** [TODO: Count]
- **Referral Rate:** [TODO: % of users who refer friends]
- **Viral Coefficient:** [TODO: Signups per user]
- **Target:** 15%+ referral rate, 0.5+ viral coefficient

---

## PLG Key Metrics

### Activation Rate
- **Definition:** % of signups who create first workflow within 7 days
- **Current:** [TODO: %]
- **Target:** 40%+
- **Trend:** [TODO: Track trend]

### Time-to-Activation
- **Definition:** Average days from signup to first workflow execution
- **Current:** [TODO: Days]
- **Target:** < 2 days
- **Trend:** [TODO: Track trend]

### Upgrade Rate
- **Definition:** % of free users who upgrade to paid within 30 days
- **Current:** [TODO: %]
- **Target:** 10%+
- **Trend:** [TODO: Track trend]

### Time-to-Upgrade
- **Definition:** Average days from signup to upgrade
- **Current:** [TODO: Days]
- **Target:** < 30 days
- **Trend:** [TODO: Track trend]

### Viral Coefficient
- **Definition:** Average number of signups per user
- **Current:** [TODO: Coefficient]
- **Target:** 0.5+
- **Trend:** [TODO: Track trend]

---

## PLG Dashboard

**Location:** `app/admin/plg-metrics/page.tsx`

**Metrics to Display:**
- PLG funnel (signup → activation → upgrade → viral)
- Activation rate, time-to-activation
- Upgrade rate, time-to-upgrade
- Referral rate, viral coefficient
- Trends and improvements

---

## Next Steps

1. **Track PLG Metrics:** Implement tracking for all PLG metrics
2. **Build Dashboard:** Create PLG metrics dashboard
3. **Optimize Funnel:** Improve conversion rates at each stage
4. **Measure Performance:** Track current performance vs. targets

---

## Resources

- **Aha Moment:** `yc/PLG_AHA_MOMENT.md`
- **Onboarding:** `app/onboarding/page.tsx`
- **Metrics Checklist:** `yc/YC_METRICS_CHECKLIST.md`
