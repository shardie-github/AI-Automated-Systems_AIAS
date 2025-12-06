# Troubleshooting Guide — Common Issues

This guide helps you resolve common issues when using AIAS Platform.

---

## Integration Issues

### "Integration not connected" Error

**Problem:** Workflow fails with "Integration not connected" error.

**Solutions:**
1. Go to **Settings** → **Integrations**
2. Check if the integration shows as "Connected" (green badge)
3. If not connected:
   - Click **Connect** button
   - Complete OAuth authorization
   - Verify connection status
4. If still failing:
   - Disconnect and reconnect the integration
   - Check integration status in the external service (Shopify, Wave, etc.)
   - Contact support if issues persist

**Prevention:**
- Check integration status before creating workflows
- Set up integration health monitoring
- Enable email notifications for integration failures

---

### "Access token expired" Error

**Problem:** Integration was working but now fails with token errors.

**Solutions:**
1. Go to **Settings** → **Integrations**
2. Click **Reconnect** for the failing integration
3. Re-authorize the integration
4. Test the workflow again

**Prevention:**
- We're working on automatic token refresh (coming soon)
- For now, reconnect integrations monthly or when errors occur

---

## Workflow Issues

### Workflow Not Triggering

**Problem:** Workflow is activated but doesn't run when expected.

**Solutions:**
1. **Check Workflow Status:**
   - Go to **Workflows** → Select your workflow
   - Verify it shows as "Active" (not "Paused")

2. **Check Trigger Configuration:**
   - Verify trigger settings are correct
   - For webhooks: Check webhook URL is registered
   - For schedules: Verify schedule is correct (cron format)

3. **Check Integration Status:**
   - Ensure required integrations are connected
   - Check integration health

4. **Check Execution Logs:**
   - Go to **Workflows** → Select workflow → **Execution Log**
   - Look for error messages
   - Check last execution time

**Common Causes:**
- Integration disconnected
- Invalid trigger configuration
- Webhook not registered
- Schedule format incorrect

---

### Workflow Fails Immediately

**Problem:** Workflow starts but fails right away.

**Solutions:**
1. **Check Error Message:**
   - Go to **Workflows** → Select workflow → **Execution Log**
   - Read the error message carefully

2. **Common Errors:**
   - **"Integration not connected"** → Reconnect integration
   - **"Invalid configuration"** → Check workflow settings
   - **"Rate limit exceeded"** → Upgrade plan or wait
   - **"API error"** → Check integration status

3. **Test Workflow:**
   - Use "Test Workflow" button
   - Check each step individually
   - Fix errors before activating

**Prevention:**
- Always test workflows before activating
- Check integration status regularly
- Monitor execution logs

---

### Workflow Runs But Doesn't Do Anything

**Problem:** Workflow executes successfully but no action occurs.

**Solutions:**
1. **Check Action Configuration:**
   - Verify action settings are correct
   - Check required fields are filled
   - Verify target (email, channel, etc.) is correct

2. **Check Integration Permissions:**
   - Ensure integration has required permissions
   - Reconnect if permissions changed

3. **Check External Service:**
   - Verify action occurred in external service (Shopify, Wave, etc.)
   - Check spam/junk folders for emails
   - Check Slack channels for messages

**Common Causes:**
- Incorrect action configuration
- Missing permissions
- Action filtered by external service

---

## Rate Limit Issues

### "Monthly automation limit reached" Error

**Problem:** Workflow fails with rate limit error.

**Solutions:**
1. **Check Your Plan:**
   - Free: 100 automations/month
   - Starter: 10,000 automations/month
   - Pro: 50,000 automations/month

2. **Check Usage:**
   - Go to **Analytics** → **Usage**
   - See current month's usage
   - Calculate remaining automations

3. **Options:**
   - **Upgrade Plan:** Get more automations
   - **Wait:** Reset at start of next month
   - **Optimize:** Reduce workflow frequency
   - **Archive:** Disable unused workflows

**Prevention:**
- Monitor usage regularly
- Set up usage alerts
- Optimize workflow frequency

---

## Performance Issues

### Workflows Running Slowly

**Problem:** Workflows take a long time to execute.

**Solutions:**
1. **Check Workflow Complexity:**
   - Simplify workflows with many steps
   - Remove unnecessary steps
   - Optimize conditions

2. **Check Integration Status:**
   - Slow integrations slow down workflows
   - Check integration health
   - Consider alternative integrations

3. **Check System Status:**
   - Check [status page](/status) for system issues
   - Contact support if persistent

**Optimization Tips:**
- Use conditions to skip unnecessary steps
- Combine similar actions
- Use webhooks instead of polling

---

## Account Issues

### Can't Access Account

**Problem:** Can't sign in or access account.

**Solutions:**
1. **Password Reset:**
   - Click "Forgot Password" on sign-in page
   - Check email for reset link
   - Create new password

2. **Check Email:**
   - Verify you're using correct email
   - Check spam/junk folders
   - Try different email if you have multiple

3. **Contact Support:**
   - Email: support@aias-platform.com
   - Include your email address
   - Describe the issue

---

### Billing Issues

**Problem:** Billing or subscription issues.

**Solutions:**
1. **Check Subscription:**
   - Go to **Settings** → **Billing**
   - Verify subscription status
   - Check payment method

2. **Payment Issues:**
   - Update payment method
   - Check card expiration
   - Verify sufficient funds

3. **Contact Support:**
   - Email: billing@aias-platform.com
   - Include account email
   - Describe the issue

---

## Getting Help

### Support Channels

1. **Documentation:**
   - [Getting Started Guide](/docs/getting-started)
   - [Integration Guides](/docs/integrations)
   - [API Documentation](/docs/api)

2. **Email Support:**
   - General: support@aias-platform.com
   - Billing: billing@aias-platform.com
   - Response time: 24-48 hours (Starter), 24 hours (Pro)

3. **Setup Call:**
   - Book a $99 one-time setup call
   - Get personalized help
   - [Book a call](/demo)

### Before Contacting Support

1. **Check Documentation:**
   - Search docs for your issue
   - Check troubleshooting guides
   - Review integration guides

2. **Gather Information:**
   - Error messages
   - Workflow configuration
   - Integration status
   - Execution logs

3. **Try Basic Fixes:**
   - Reconnect integrations
   - Test workflows
   - Check system status

---

## Error Codes Reference

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `INTEGRATION_NOT_CONNECTED` | Integration not connected | Reconnect integration |
| `RATE_LIMIT_EXCEEDED` | Monthly limit reached | Upgrade plan or wait |
| `INVALID_CONFIGURATION` | Workflow config invalid | Check workflow settings |
| `API_ERROR` | External API error | Check integration status |
| `TOKEN_EXPIRED` | Access token expired | Reconnect integration |
| `WORKFLOW_DISABLED` | Workflow is paused | Activate workflow |
| `PERMISSION_DENIED` | Insufficient permissions | Check integration permissions |

---

## Still Need Help?

If you've tried the solutions above and still have issues:

1. **Email Support:** support@aias-platform.com
2. **Include:**
   - Your account email
   - Error messages
   - Steps to reproduce
   - Screenshots (if helpful)

3. **Response Time:**
   - Starter: 24-48 hours
   - Pro: 24 hours

We're here to help! 🚀
