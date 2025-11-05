# SOP: Customer Support — AIAS Platform

**Version:** 1.0  
**Last Updated:** January 15, 2024  
**Owner:** Support Team

---

## Overview

This SOP defines customer support processes, SLAs, and templates for AIAS Platform. Support is primarily email-based with 24-48 hour response times.

**Support Channels:**
- **Email:** support@aias-platform.com (primary)
- **Knowledge Base:** docs.aias-platform.com
- **Status Page:** status.aias-platform.com
- **Community Forum:** community.aias-platform.com (planned Q2 2024)

---

## Support Tiers

### Tier 1: General Support (Email)
- **Response Time:** 24-48 hours (business days)
- **Scope:** Account questions, billing, basic troubleshooting
- **Escalation:** Escalate to Tier 2 if technical issue

### Tier 2: Technical Support (Email)
- **Response Time:** 24-48 hours (business days)
- **Scope:** Technical issues, integration problems, workflow errors
- **Escalation:** Escalate to Tier 3 if critical issue

### Tier 3: Critical Support (Email)
- **Response Time:** 4-8 hours (business days)
- **Scope:** Service outages, data breaches, security incidents
- **Escalation:** Escalate to engineering team

---

## Response Time SLAs

| Priority | Response Time | Resolution Time | Examples |
|----------|--------------|-----------------|----------|
| **Critical** | 4 hours | 8 hours | Service outage, data breach |
| **High** | 24 hours | 48 hours | Workflow failures, integration errors |
| **Medium** | 48 hours | 5 business days | Feature questions, billing issues |
| **Low** | 72 hours | 10 business days | General inquiries, feedback |

---

## Support Macros (Top 10 Issues)

### 1. Account Sign-Up Issues
**Subject:** Account Sign-Up Help  
**Template:**
```
Hi [Name],

Thanks for your interest in AIAS Platform! To help you sign up:

1. Visit https://aias-platform.com/signup
2. Enter your email and create a password
3. Check your email for verification link
4. Click the verification link to activate your account

If you're having trouble:
- Check your spam folder for the verification email
- Try a different email address
- Clear your browser cache and cookies

If you're still having issues, please reply with:
- Your email address
- Screenshot of the error (if any)
- Browser and device information

Best regards,
AIAS Support Team
```

### 2. Billing/Payment Issues
**Subject:** Billing Inquiry  
**Template:**
```
Hi [Name],

Thanks for reaching out about billing! Here's how to manage your subscription:

**View Billing:**
- Log in to your account
- Go to Settings > Billing
- View invoices and payment history

**Update Payment Method:**
- Go to Settings > Billing
- Click "Update Payment Method"
- Enter new card details (processed securely by Stripe)

**Cancel Subscription:**
- Go to Settings > Billing
- Click "Cancel Subscription"
- Subscription ends at end of billing period (no refunds for partial periods)

**Refunds:**
- 30-day money-back guarantee (first-time subscribers only)
- Email support@aias-platform.com with refund request

If you need help, please reply with:
- Your account email
- Invoice number (if applicable)
- Description of the issue

Best regards,
AIAS Support Team
```

### 3. Workflow Not Running
**Subject:** Workflow Troubleshooting  
**Template:**
```
Hi [Name],

Let's troubleshoot your workflow! Here are common causes:

**Check Workflow Status:**
1. Log in to your account
2. Go to Workflows
3. Check workflow status (Active, Paused, Error)

**Common Issues:**
- **Integration Not Connected:** Check integration status (Settings > Integrations)
- **Workflow Paused:** Click "Resume" to restart workflow
- **API Error:** Check integration API status (status.aias-platform.com)
- **Rate Limits:** Check if you've exceeded usage limits (Free: 100/month)

**Troubleshooting Steps:**
1. Check workflow logs (Workflows > [Workflow Name] > Logs)
2. Verify integration credentials (Settings > Integrations)
3. Test integration connection (Settings > Integrations > Test Connection)
4. Check error messages in workflow logs

If you're still having issues, please reply with:
- Workflow name
- Error message (from logs)
- Screenshot of the error (if any)

Best regards,
AIAS Support Team
```

### 4. Integration Connection Issues
**Subject:** Integration Help  
**Template:**
```
Hi [Name],

Here's how to connect integrations:

**Connect Integration:**
1. Log in to your account
2. Go to Settings > Integrations
3. Click "Connect" next to the integration (e.g., Shopify, Wave)
4. Follow OAuth flow (authorize AIAS Platform)
5. Integration connected!

**Common Issues:**
- **OAuth Failed:** Try again, clear browser cache
- **Permission Denied:** Check integration permissions (allow AIAS Platform access)
- **API Error:** Check integration API status (status.aias-platform.com)

**Supported Integrations:**
- Shopify (orders, products, customers)
- Wave Accounting (invoices, expenses)
- Stripe (payments, subscriptions)
- Gmail (send, receive emails)
- Google Calendar (events, reminders)
- Slack (messages, notifications)
- And 15+ more!

If you need help, please reply with:
- Integration name
- Error message (if any)
- Screenshot of the error (if any)

Best regards,
AIAS Support Team
```

### 5. Password Reset
**Subject:** Password Reset Help  
**Template:**
```
Hi [Name],

Here's how to reset your password:

**Reset Password:**
1. Go to https://aias-platform.com/forgot-password
2. Enter your email address
3. Check your email for reset link
4. Click reset link and enter new password

**Security Tips:**
- Use a strong password (8+ characters, uppercase, lowercase, numbers, symbols)
- Don't share your password with anyone
- Enable two-factor authentication (2FA) for extra security

If you're having trouble:
- Check your spam folder for reset email
- Try a different email address (if you have multiple)
- Clear your browser cache and cookies

If you're still having issues, please reply with:
- Your email address
- Screenshot of the error (if any)

Best regards,
AIAS Support Team
```

### 6. Feature Request
**Subject:** Feature Request Received  
**Template:**
```
Hi [Name],

Thanks for your feature request! We appreciate your feedback.

**What Happens Next:**
1. We'll review your request with the product team
2. If approved, we'll add it to our roadmap
3. We'll notify you when the feature is available (if you opt-in)

**Our Roadmap:**
- Q1 2024: MVP launch (no-code builder, 10 templates, 10 integrations)
- Q2 2024: Mobile app, 5 more integrations, team collaboration
- Q3 2024: French language support, enterprise tier, API access
- Q4 2024: US expansion, advanced AI features, white-label

**Vote for Features:**
- Visit https://feedback.aias-platform.com
- Vote for your favorite features
- See what's coming next

Thanks again for your feedback!

Best regards,
AIAS Support Team
```

### 7. Refund Request
**Subject:** Refund Request  
**Template:**
```
Hi [Name],

Thanks for your refund request. Here's our refund policy:

**30-Day Money-Back Guarantee:**
- Full refund within 30 days of initial subscription (first-time subscribers only)
- Refund processed within 5-10 business days
- Refunded to original payment method

**Refund Eligibility:**
- ✅ First-time subscribers (within 30 days)
- ❌ Renewals (no refunds for renewals)
- ❌ Partial billing periods (no prorated refunds)

**Process Refund:**
1. We'll review your request (24-48 hours)
2. If approved, we'll process refund (5-10 business days)
3. You'll receive confirmation email

**Next Steps:**
Please reply with:
- Your account email
- Reason for refund (optional, but helpful)
- Invoice number (if applicable)

Best regards,
AIAS Support Team
```

### 8. Account Deletion
**Subject:** Account Deletion Request  
**Template:**
```
Hi [Name],

We're sorry to see you go! Here's how to delete your account:

**Delete Account:**
1. Log in to your account
2. Go to Settings > Account
3. Click "Delete Account"
4. Confirm deletion (this action cannot be undone)

**What Gets Deleted:**
- Account data (email, name, profile)
- Workflow data (workflows, logs)
- Integration data (third-party data access revoked)
- Billing data (retained for 7 years for tax records)

**Data Retention:**
- Account data: Deleted within 90 days
- Usage data: Deleted within 90 days
- Billing data: Retained for 7 years (tax records)

**Export Your Data:**
Before deleting, export your data:
- Go to Settings > Account > Export Data
- Download your data (JSON format)

If you need help, please reply with:
- Your account email
- Confirmation that you want to delete your account

Best regards,
AIAS Support Team
```

### 9. Privacy/Data Request
**Subject:** Privacy Request  
**Template:**
```
Hi [Name],

Thanks for your privacy request! Here's how to exercise your PIPEDA rights:

**Access Your Data:**
- Go to Settings > Account > Export Data
- Download your data (JSON format)
- Or email privacy@aias-platform.com with access request

**Correct Your Data:**
- Go to Settings > Account
- Update your profile information
- Or email privacy@aias-platform.com with correction request

**Delete Your Data:**
- Go to Settings > Account > Delete Account
- Or email privacy@aias-platform.com with deletion request

**Withdraw Consent:**
- Go to Settings > Privacy
- Update your consent preferences
- Or email privacy@aias-platform.com with withdrawal request

**Response Time:**
- We'll respond within 30 days (as required by PIPEDA)

**Privacy Policy:**
- https://aias-platform.com/privacy

If you need help, please reply with:
- Your account email
- Type of request (access, correction, deletion, withdrawal)

Best regards,
AIAS Support Team
```

### 10. General Inquiry
**Subject:** General Inquiry  
**Template:**
```
Hi [Name],

Thanks for reaching out! Here are some helpful resources:

**Getting Started:**
- Quick Start Guide: https://docs.aias-platform.com/getting-started
- Video Tutorials: https://docs.aias-platform.com/videos
- Templates: https://aias-platform.com/templates

**Documentation:**
- Knowledge Base: https://docs.aias-platform.com
- API Documentation: https://docs.aias-platform.com/api
- Integration Guides: https://docs.aias-platform.com/integrations

**Support:**
- Email: support@aias-platform.com
- Status Page: https://status.aias-platform.com
- Community Forum: https://community.aias-platform.com (coming soon)

**Common Questions:**
- Pricing: https://aias-platform.com/pricing
- Features: https://aias-platform.com/features
- Privacy: https://aias-platform.com/privacy

If you need help, please reply with:
- Your question
- Account email (if applicable)
- Screenshot (if applicable)

Best regards,
AIAS Support Team
```

---

## Tone Guide

### Do's
- ✅ **Friendly:** Use warm, professional tone
- ✅ **Clear:** Use simple, jargon-free language
- ✅ **Helpful:** Provide actionable solutions
- ✅ **Empathetic:** Acknowledge user frustration
- ✅ **Canadian:** Use Canadian English (colour, centre, etc.)

### Don'ts
- ❌ **Robotic:** Don't use overly formal language
- ❌ **Technical:** Don't use technical jargon unnecessarily
- ❌ **Blame:** Don't blame the user
- ❌ **Delays:** Don't promise unrealistic timelines
- ❌ **US English:** Don't use US spelling (color, center, etc.)

---

## Escalation Process

### Level 1: Support Team
- **Response Time:** 24-48 hours
- **Scope:** General support, billing, basic troubleshooting

### Level 2: Technical Team
- **Response Time:** 24-48 hours
- **Scope:** Technical issues, integration problems, workflow errors
- **Escalation:** If issue cannot be resolved by support team

### Level 3: Engineering Team
- **Response Time:** 4-8 hours (critical issues)
- **Scope:** Service outages, data breaches, security incidents
- **Escalation:** If issue requires engineering intervention

---

## Support Metrics

### Key Metrics
- **Response Time:** Average time to first response (target: <24 hours)
- **Resolution Time:** Average time to resolution (target: <48 hours)
- **Satisfaction:** Customer satisfaction score (target: >4.5/5)
- **Ticket Volume:** Number of support tickets per month

### Reporting
- **Weekly:** Support metrics report (response time, resolution time, satisfaction)
- **Monthly:** Support trends report (common issues, escalation rates)
- **Quarterly:** Support strategy review (process improvements, training needs)

---

**Last Updated:** January 15, 2024  
**Version:** 1.0  
**Next Review:** April 15, 2024 (Quarterly)
