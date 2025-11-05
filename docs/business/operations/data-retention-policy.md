# Data Retention Policy — AIAS Platform

**Effective Date:** January 15, 2024  
**Last Updated:** January 15, 2024  
**Compliance:** PIPEDA, GDPR

---

## Overview

This policy defines data retention periods for AIAS Platform, including account data, usage data, and billing data, in accordance with PIPEDA and GDPR requirements.

**Key Principles:**
- **Data Minimization:** Retain data only as long as necessary
- **Purpose Limitation:** Retain data only for specified purposes
- **Legal Compliance:** Comply with PIPEDA, GDPR, and tax retention requirements

---

## Data Retention Periods

### Account Data

**Data Types:**
- Email address, name, password (hashed)
- Profile information (business name, industry, location)
- Account settings, preferences

**Retention Period:**
- **Active Accounts:** Retained while account is active
- **Inactive Accounts:** Retained for 90 days after account deletion request
- **Deleted Accounts:** Deleted after 90 days (permanent deletion)

**Rationale:**
- Account data required for service provision
- 90-day retention allows account recovery (if accidental deletion)
- PIPEDA requires deletion upon request (subject to legal requirements)

---

### Usage Data

**Data Types:**
- Workflow runs, execution logs, error logs
- Feature usage, analytics data
- Integration usage, API calls

**Retention Period:**
- **Active Accounts:** Retained while account is active
- **Inactive Accounts:** Retained for 90 days after account deletion request
- **Deleted Accounts:** Deleted after 90 days (permanent deletion)
- **Aggregated Data:** Retained indefinitely (anonymized, aggregated)

**Rationale:**
- Usage data required for service provision and improvement
- 90-day retention allows troubleshooting and support
- Aggregated data (anonymized) retained for analytics (no privacy impact)

---

### Billing Data

**Data Types:**
- Invoice records, payment history
- Subscription records, billing addresses
- Payment method information (processed by Stripe, not stored)

**Retention Period:**
- **Tax Records:** Retained for 7 years (Canada Revenue Agency requirement)
- **Dispute Records:** Retained for 7 years (legal requirement)
- **Transaction Records:** Retained for 7 years (tax and legal requirements)

**Rationale:**
- Tax law requires 7-year retention for tax records
- Legal requirement for dispute resolution and audits
- Stripe processes payments (we don't store full payment details)

---

### Support Data

**Data Types:**
- Support tickets, email communications
- Support logs, chat transcripts (if applicable)
- Feedback, feature requests

**Retention Period:**
- **Active Tickets:** Retained while ticket is open
- **Closed Tickets:** Retained for 2 years after ticket closure
- **Deleted:** Deleted after 2 years (permanent deletion)

**Rationale:**
- Support data required for customer service and dispute resolution
- 2-year retention allows reference to previous interactions
- Longer retention not necessary for customer service purposes

---

### Third-Party Integration Data

**Data Types:**
- Shopify orders, products, customers
- Wave invoices, expenses
- Gmail emails (if user authorizes)
- Other third-party data (via integrations)

**Retention Period:**
- **Active Accounts:** Retained while account is active and integration connected
- **Inactive Accounts:** Deleted immediately upon integration disconnection
- **Deleted Accounts:** Deleted immediately upon account deletion (or within 90 days if cached)

**Rationale:**
- Third-party data accessed only with user consent
- Data deleted immediately upon disconnection (per integration terms)
- No long-term retention of third-party data

---

### Telemetry Data

**Data Types:**
- Error logs, performance metrics
- Security logs, audit logs
- Application telemetry (with user consent)

**Retention Period:**
- **Error Logs:** Retained for 90 days
- **Performance Metrics:** Retained for 90 days
- **Security Logs:** Retained for 1 year (security requirement)
- **Audit Logs:** Retained for 1 year (compliance requirement)

**Rationale:**
- Telemetry data required for troubleshooting and security monitoring
- 90-day retention sufficient for troubleshooting
- Security/audit logs retained longer for compliance and security

---

## Data Deletion Process

### Automatic Deletion

**Process:**
- **Scheduled Deletion:** Automated deletion scripts run daily
- **Retention Check:** Check retention periods against deletion dates
- **Deletion:** Delete data that exceeds retention period
- **Confirmation:** Log deletion events (audit trail)

**Timing:**
- **Daily:** Check and delete expired data
- **Immediate:** Delete data upon account deletion request (if no legal requirement)

### Manual Deletion

**Process:**
- **Request:** User requests data deletion (via account settings or email)
- **Verification:** Verify user identity and authorization
- **Deletion:** Delete data within 90 days (or immediately if no legal requirement)
- **Confirmation:** Confirm deletion to user

**Response Time:**
- **PIPEDA Requirement:** 30-day response time
- **Our Standard:** 90-day deletion (or immediately if no legal requirement)

---

## Data Export

### User Export

**Process:**
- **Request:** User requests data export (via account settings or email)
- **Verification:** Verify user identity and authorization
- **Export:** Generate data export (JSON format)
- **Delivery:** Deliver export via secure download link or email

**Response Time:**
- **PIPEDA Requirement:** 30-day response time
- **Our Standard:** 7-day response time

**Export Format:**
- **Format:** JSON (machine-readable)
- **Includes:** Account data, usage data, workflow data (if applicable)
- **Excludes:** Billing data (tax records retained per legal requirement)

---

## Legal Holds

### Legal Hold Process

**Triggers:**
- **Legal Dispute:** Legal proceedings or disputes
- **Regulatory Investigation:** Regulatory investigation or audit
- **Law Enforcement:** Law enforcement request (with valid warrant/subpoena)

**Process:**
- **Identification:** Identify data subject to legal hold
- **Preservation:** Preserve data (prevent deletion)
- **Documentation:** Document legal hold (reason, duration, scope)
- **Release:** Release legal hold (delete data after legal hold expires)

**Retention:**
- **Duration:** Retained until legal hold expires (or until legal requirement expires)
- **Extension:** Extended if legal requirement continues

---

## Compliance

### PIPEDA Compliance

**Requirements:**
- **Deletion Upon Request:** Delete personal information upon request (subject to legal requirements)
- **Retention Limits:** Retain data only as long as necessary
- **Purpose Limitation:** Retain data only for specified purposes

**Compliance:**
- ✅ Data retention periods defined and documented
- ✅ Data deletion process implemented
- ✅ User can request deletion (via account settings or email)
- ✅ Data deleted within 90 days (or immediately if no legal requirement)

### GDPR Compliance (if applicable)

**Requirements:**
- **Right to Erasure:** Users can request deletion ("right to be forgotten")
- **Retention Limits:** Retain data only as long as necessary
- **Legal Basis:** Retain data only if legal basis exists

**Compliance:**
- ✅ Data retention periods defined and documented
- ✅ Data deletion process implemented
- ✅ User can request deletion (via account settings or email)
- ✅ Data deleted within 30 days (or immediately if no legal requirement)

---

## Exceptions

### Legal Requirements

**Tax Records:**
- **Retention:** 7 years (Canada Revenue Agency requirement)
- **Rationale:** Tax law requires 7-year retention

**Legal Disputes:**
- **Retention:** Until dispute resolved (legal hold)
- **Rationale:** Legal requirement for dispute resolution

**Regulatory Investigations:**
- **Retention:** Until investigation complete (legal hold)
- **Rationale:** Legal requirement for regulatory compliance

---

## Contact Information

**Data Deletion Requests:**
- **Email:** privacy@aias-platform.com
- **Subject:** Data Deletion Request
- **Response Time:** 30 days (PIPEDA requirement)

**Data Export Requests:**
- **Email:** privacy@aias-platform.com
- **Subject:** Data Export Request
- **Response Time:** 30 days (PIPEDA requirement)

**General Inquiries:**
- **Email:** privacy@aias-platform.com
- **Phone:** 1-800-AIAS-HELP (toll-free Canada)

---

## Changes to This Policy

We may update this policy from time to time. We will notify you of material changes by:
- **Email:** Sending an email to your registered email address
- **Website:** Posting a notice on our website
- **Effective Date:** Updating the "Last Updated" date at the top of this policy

**Your continued use of the Service after changes constitutes acceptance of the updated policy.**

---

**Last Updated:** January 15, 2024  
**Version:** 1.0
