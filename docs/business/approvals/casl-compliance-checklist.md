# CASL Compliance Checklist — AIAS Platform

**CASL:** Canada's Anti-Spam Legislation  
**Effective Date:** July 1, 2014  
**Last Updated:** January 15, 2024  
**Status:** Compliant

---

## Overview

CASL requires express consent for sending commercial electronic messages (CEMs) to Canadian recipients. This checklist ensures AIAS Platform complies with CASL requirements.

**Key Requirements:**
- ✅ Express consent (opt-in) for commercial emails
- ✅ Unsubscribe mechanism (clear and easy)
- ✅ Sender identification (name, contact info)
- ✅ Record-keeping (consent records)

---

## 1. Consent Requirements

### 1.1 Express Consent (Required for Commercial Emails)
- ✅ **Double Opt-In:** Users must confirm email subscription (confirm email sent)
- ✅ **Clear Purpose:** Consent request clearly states purpose (marketing, updates)
- ✅ **Granular Consent:** Separate consent for marketing vs. transactional emails
- ✅ **Consent Records:** Store consent records (email, timestamp, IP address)

### 1.2 Implied Consent (Limited Use Cases)
- ✅ **Existing Business Relationship:** Implied consent for 2 years after purchase
- ✅ **Inquiry:** Implied consent for 6 months after inquiry
- ⚠️ **Note:** We use express consent (double opt-in) for all commercial emails

### 1.3 Consent Withdrawal
- ✅ **Unsubscribe Link:** Every commercial email includes unsubscribe link
- ✅ **Easy Withdrawal:** One-click unsubscribe (no barriers)
- ✅ **Processing Time:** Unsubscribe processed within 10 business days
- ✅ **Consent Records:** Update consent records upon withdrawal

---

## 2. Email Requirements

### 2.1 Sender Identification
- ✅ **Name:** "AIAS Platform" or "AIAS Platform Team"
- ✅ **Contact Info:** Email (support@aias-platform.com), phone (1-800-AIAS-HELP), address
- ✅ **Consistent:** Same sender identification across all emails

### 2.2 Unsubscribe Mechanism
- ✅ **Clear Link:** Unsubscribe link clearly visible and easy to find
- ✅ **One-Click:** One-click unsubscribe (no login required)
- ✅ **Processing Time:** Unsubscribe processed within 10 business days
- ✅ **Confirmation:** Confirmation email sent after unsubscribe

### 2.3 Content Requirements
- ✅ **Truthful:** Email content is truthful and not misleading
- ✅ **No Deceptive Subject Lines:** Subject lines accurately reflect email content
- ✅ **No False Headers:** Email headers are accurate and not spoofed

---

## 3. Record-Keeping

### 3.1 Consent Records
- ✅ **Storage:** Consent records stored securely (database, encrypted)
- ✅ **Information Stored:**
  - Email address
  - Consent timestamp
  - IP address (if available)
  - Consent method (double opt-in, sign-up form)
  - Consent purpose (marketing, updates)
- ✅ **Retention:** Consent records retained for 3 years (CASL requirement)

### 3.2 Unsubscribe Records
- ✅ **Storage:** Unsubscribe records stored securely
- ✅ **Information Stored:**
  - Email address
  - Unsubscribe timestamp
  - Unsubscribe method (link, email, phone)
- ✅ **Retention:** Unsubscribe records retained indefinitely (to prevent re-subscription)

---

## 4. Email Types & Compliance

### 4.1 Transactional Emails (No Consent Required)
- ✅ **Account Updates:** Password reset, account confirmation, security alerts
- ✅ **Service Notifications:** Workflow runs, error alerts, subscription updates
- ✅ **Support:** Support ticket responses, help documentation

**Compliance:** ✅ No consent required (transactional emails)

### 4.2 Commercial Emails (Consent Required)
- ✅ **Marketing:** Product updates, new features, promotional offers
- ✅ **Newsletters:** Weekly/monthly newsletters, blog posts
- ✅ **Partnerships:** Partnership opportunities, referral programs

**Compliance:** ✅ Express consent (double opt-in) required

---

## 5. Consent Collection Methods

### 5.1 Sign-Up Form
- ✅ **Clear Purpose:** "Subscribe to marketing emails" (not pre-checked)
- ✅ **Granular Options:** Separate checkboxes for marketing vs. transactional
- ✅ **Double Opt-In:** Confirmation email sent after sign-up

### 5.2 In-App Consent
- ✅ **Settings Page:** Users can manage email preferences in account settings
- ✅ **Granular Controls:** Separate toggles for marketing, updates, newsletters
- ✅ **Easy Withdrawal:** One-click unsubscribe in settings

### 5.3 Third-Party Integrations
- ✅ **Stripe:** Transactional emails (no consent required)
- ✅ **Resend:** Marketing emails (express consent required)

---

## 6. Unsubscribe Process

### 6.1 Unsubscribe Link (Email)
- ✅ **Location:** Footer of every commercial email
- ✅ **Format:** "Unsubscribe" or "Manage Email Preferences"
- ✅ **URL:** https://aias-platform.com/unsubscribe?token=[TOKEN]
- ✅ **Processing:** One-click unsubscribe (no login required)

### 6.2 Unsubscribe Page
- ✅ **Confirmation:** "You have been unsubscribed" message
- ✅ **Preferences:** Option to update preferences (not just unsubscribe)
- ✅ **Re-Subscribe:** Option to re-subscribe (with express consent)

### 6.3 Processing Time
- ✅ **CASL Requirement:** Within 10 business days
- ✅ **Our Standard:** Within 24 hours (automated processing)

---

## 7. Compliance Monitoring

### 7.1 Regular Audits
- ✅ **Frequency:** Quarterly audits of email practices
- ✅ **Checklist:** Use this checklist for audits
- ✅ **Documentation:** Document audit findings and corrections

### 7.2 Incident Response
- ✅ **Violations:** Track and investigate CASL violations
- ✅ **Corrections:** Correct violations immediately
- ✅ **Prevention:** Update practices to prevent future violations

---

## 8. Third-Party Services

### 8.1 Email Service Providers
- ✅ **Resend:** CASL-compliant (requires express consent)
- ✅ **Stripe:** Transactional emails only (no consent required)

### 8.2 Compliance Requirements
- ✅ **Vendor Agreements:** Include CASL compliance requirements in vendor agreements
- ✅ **Monitoring:** Monitor vendor compliance (audit logs, unsubscribe rates)

---

## 9. Penalties & Risks

### 9.1 CASL Penalties
- **Individual Violation:** Up to CAD $1 million per violation
- **Corporate Violation:** Up to CAD $10 million per violation
- **Private Right of Action:** Individuals can sue for damages (up to CAD $200 per day)

### 9.2 Risk Mitigation
- ✅ **Compliance:** Follow this checklist strictly
- ✅ **Documentation:** Maintain consent and unsubscribe records
- ✅ **Training:** Train employees on CASL requirements
- ✅ **Legal Review:** Have legal counsel review email practices

---

## 10. Checklist Summary

### Consent Requirements
- [x] Express consent (double opt-in) for commercial emails
- [x] Clear purpose statement
- [x] Granular consent options
- [x] Consent records stored (3 years)

### Email Requirements
- [x] Sender identification (name, contact info)
- [x] Unsubscribe link (clear, easy)
- [x] Processing time (within 10 business days)
- [x] Truthful content (no deceptive subject lines)

### Record-Keeping
- [x] Consent records stored securely
- [x] Unsubscribe records stored securely
- [x] Records retained for required periods

### Compliance Monitoring
- [x] Quarterly audits
- [x] Incident response plan
- [x] Employee training

---

## 11. Next Steps

1. ✅ **Implement Double Opt-In:** Confirm email subscription in sign-up flow
2. ✅ **Update Email Templates:** Add unsubscribe links and sender identification
3. ✅ **Set Up Consent Records:** Store consent records in database
4. ✅ **Train Team:** Train customer support team on CASL requirements
5. ✅ **Legal Review:** Have legal counsel review email practices

---

## 12. Resources

- **CASL Legislation:** https://laws-lois.justice.gc.ca/eng/acts/E-1.6/
- **CRTC CASL Guidance:** https://crtc.gc.ca/eng/internet/anti.htm
- **Privacy Commissioner:** https://www.priv.gc.ca/en/

---

**Last Updated:** January 15, 2024  
**Status:** Compliant  
**Next Review:** April 15, 2024 (Quarterly)
