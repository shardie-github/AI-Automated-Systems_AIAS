# Known Issues & Limitations

This document outlines current limitations, known issues, and what's coming soon in AIAS Platform.

---

## Current Limitations

### Integrations

**Available Now:**
- ✅ Shopify (order processing, basic operations)
- ✅ Wave Accounting (invoice reminders, basic operations)

**Coming Soon (Q2 2025):**
- Gmail / Google Workspace
- Slack
- Google Workspace (Docs, Sheets, Calendar)
- More Canadian integrations (RBC, TD, Interac)

**Limitations:**
- Some integration actions are still being implemented
- Token refresh may require manual reconnection (automatic refresh coming soon)
- Some advanced features require Pro plan

---

### Workflows

**Current Capabilities:**
- ✅ Create workflows with triggers, actions, and conditions
- ✅ Use pre-built templates
- ✅ Test workflows before activating
- ✅ Monitor execution logs

**Limitations:**
- Maximum 20 workflows on Pro plan (more coming soon)
- Some complex workflows may require custom development
- Webhook validation is basic (enhanced security coming soon)

**Coming Soon:**
- More workflow templates (25+ total)
- Advanced conditional logic
- Workflow versioning
- Workflow sharing

---

### Automation Limits

**Current Limits:**
- Free: 100 automations/month
- Starter: 10,000 automations/month
- Pro: 50,000 automations/month

**Limitations:**
- Limits reset monthly (not prorated)
- No rollover of unused automations
- Overage handling: Workflows pause when limit reached (upgrade prompt shown)

**Coming Soon:**
- Usage alerts before limit reached
- Overage purchase options
- Annual plans with higher limits

---

### Team Collaboration

**Current Status:** Coming Soon (Q2 2025)

**Planned Features:**
- Team workspaces
- Shared workflows
- Role-based permissions
- Activity logs

**Workaround:**
- Share workflow configurations manually
- Use API for programmatic access

---

### Advanced Analytics

**Current Status:** Basic analytics available, advanced features coming soon

**Available Now:**
- Workflow execution counts
- Success/failure rates
- Basic time savings estimates

**Coming Soon:**
- Cohort analysis
- Funnel analysis
- Predictive analytics
- Custom reports

---

## Known Issues

### Issue #1: Token Refresh

**Status:** Known issue, fix in progress

**Description:** Some integrations may require manual reconnection when tokens expire.

**Workaround:** Reconnect integration monthly or when errors occur.

**ETA:** Q2 2025 (automatic token refresh)

---

### Issue #2: Webhook Validation

**Status:** Basic validation, enhanced security coming

**Description:** Webhook signature validation is basic. Enhanced security coming soon.

**Impact:** Low (webhooks are still secure, but validation can be improved)

**ETA:** Q2 2025

---

### Issue #3: Error Messages

**Status:** Improving error messages

**Description:** Some error messages could be more helpful.

**Workaround:** Check execution logs and this troubleshooting guide.

**ETA:** Ongoing improvements

---

### Issue #4: Workflow Testing

**Status:** Basic testing available, enhanced testing coming

**Description:** Workflow testing mode is basic. Enhanced testing with previews coming soon.

**Workaround:** Test workflows manually, check execution logs.

**ETA:** Q2 2025

---

## Beta Features

The following features are in Beta (may have limitations):

- **Starter Plan:** Some features still in development
- **Pro Plan:** Team collaboration, advanced analytics coming soon
- **New Integrations:** Gmail, Slack, Google Workspace (coming soon)

**Beta Disclaimer:**
- Features may change
- Some limitations may apply
- We're actively improving based on feedback

---

## What's Coming Soon

### Q2 2025 (Next 3 Months)

- **More Integrations:** Gmail, Slack, Google Workspace, and more
- **More Templates:** 25+ workflow templates
- **Team Collaboration:** Shared workspaces, permissions
- **Advanced Analytics:** Cohort analysis, custom reports
- **Automatic Token Refresh:** No more manual reconnections
- **Enhanced Webhook Security:** Improved validation

### Q3 2025 (3-6 Months)

- **API Enhancements:** More endpoints, webhooks
- **White-label Options:** Custom branding (Pro plan)
- **Mobile App:** iOS and Android apps
- **Workflow Marketplace:** Share and discover workflows
- **AI Workflow Suggestions:** Smart recommendations

### Future (6+ Months)

- **Enterprise Features:** SSO, advanced RBAC
- **SOC 2 Certification:** Enterprise compliance
- **More Integrations:** 50+ total integrations
- **Advanced AI Features:** Natural language workflow creation

---

## Feature Requests

Have an idea for a feature or integration?

1. **Check Roadmap:** See if it's already planned
2. **Submit Request:** [Feature Request Form](/help/feature-request)
3. **Vote on Requests:** Help prioritize features

**Popular Requests:**
- More integrations (we're working on it!)
- Team collaboration (coming Q2 2025)
- Mobile app (coming Q3 2025)
- Workflow marketplace (coming Q3 2025)

---

## Workarounds

### For Missing Integrations

**Workaround:** Use webhooks or API integrations where possible.

**Example:** Instead of direct Slack integration, use Slack webhooks.

### For Team Collaboration

**Workaround:** Share workflow configurations manually, use API for automation.

**Example:** Export workflow config, share with team, import.

### For Advanced Analytics

**Workaround:** Use API to export data, analyze in external tools.

**Example:** Export execution logs, analyze in Google Sheets.

---

## Reporting Issues

Found a bug or issue?

1. **Check Known Issues:** See if it's already documented
2. **Check Troubleshooting:** See if there's a solution
3. **Report Issue:**
   - Email: support@aias-platform.com
   - Include: Steps to reproduce, error messages, screenshots

**Response Time:**
- Critical issues: 24 hours
- General issues: 48 hours
- Feature requests: Tracked for roadmap

---

## Updates

This document is updated regularly as we fix issues and add features.

**Last Updated:** 2025-01-31

**Next Update:** When new limitations are identified or issues are resolved

---

**Questions?** Contact support@aias-platform.com or check our [documentation](/docs).
