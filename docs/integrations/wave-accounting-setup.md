# Wave Accounting Integration Setup Guide

Connect your Wave Accounting account to AIAS Platform and automate invoicing, payment reminders, and financial reporting.

## Prerequisites

- Active Wave Accounting account
- Admin access to your Wave account
- AIAS Platform account (Free, Starter, or Pro plan)

---

## Step 1: Navigate to Integrations

1. Log in to your AIAS Platform account
2. Go to **Settings** → **Integrations**
3. Find **Wave Accounting** in the list
4. Click **Connect**

---

## Step 2: Authorize AIAS

1. You'll be redirected to Wave's authorization page
2. Sign in to your Wave account if not already signed in
3. Review the permissions AIAS is requesting:
   - Read invoices
   - Read payments
   - Create invoices
   - Read business information

4. Click **Authorize** or **Allow**

**Note:** AIAS only requests the minimum permissions needed for automation. Your financial data is secure and encrypted.

---

## Step 3: Select Business (If Multiple)

If you have multiple businesses in Wave:
1. Select which business to connect
2. Click **Continue**
3. You can connect multiple businesses later if needed

---

## Step 4: Verify Connection

1. After authorization, you'll be redirected back to AIAS Platform
2. You should see a success message: "Wave Accounting connected successfully"
3. In **Settings** → **Integrations**, Wave Accounting should show as **Connected** (green badge)

---

## Step 5: Test the Connection

1. Go to **Workflows** → **Create Workflow**
2. Select **Wave Invoice Reminder** template
3. Configure the workflow:
   - Select your Wave business
   - Set reminder schedule (e.g., 7 days overdue)
   - Configure email template

4. Click **Test Workflow**
5. Create a test invoice in Wave (or use existing overdue invoice)
6. Verify the workflow executed and reminder was sent

---

## Available Wave Accounting Automations

### Invoicing
- **Invoice Reminders:** Automatically remind customers about overdue invoices
- **Invoice Creation:** Create invoices from other systems
- **Payment Tracking:** Track invoice payments automatically

### Financial Reporting
- **Daily Revenue Summary:** Get daily revenue reports
- **Monthly Financial Reports:** Automatically generate monthly reports
- **Expense Tracking:** Track and categorize expenses

### Payment Processing
- **Payment Notifications:** Get notified when payments are received
- **Payment Reconciliation:** Automatically reconcile payments
- **Payment Reminders:** Send payment reminders to customers

### Data Sync
- **Sync with E-commerce:** Sync orders from Shopify to Wave invoices
- **Sync with Banking:** Sync bank transactions
- **Multi-system Sync:** Keep data consistent across tools

---

## Troubleshooting

### Connection Issues

**Problem:** "Failed to connect Wave Accounting"

**Solutions:**
1. Verify you're signed in to the correct Wave account
2. Make sure you have admin access to the business
3. Check if your Wave account is active
4. Try disconnecting and reconnecting
5. Clear browser cache and cookies
6. Contact support if issues persist

### Permission Errors

**Problem:** "Insufficient permissions"

**Solutions:**
1. Disconnect Wave Accounting integration
2. Reconnect and ensure all permissions are granted
3. Check your Wave app permissions in Wave settings

### Workflow Not Triggering

**Problem:** Workflow doesn't run when invoices are created/updated

**Solutions:**
1. Verify the workflow is activated
2. Check workflow configuration (correct business selected)
3. Review execution logs for errors
4. Test the workflow manually
5. Verify webhook is set up correctly

### Invoice Not Found

**Problem:** "Invoice not found" error

**Solutions:**
1. Verify the invoice exists in Wave
2. Check if you have access to the invoice
3. Ensure the invoice ID is correct
4. Try refreshing the integration connection

---

## Security & Privacy

- **Data Encryption:** All financial data is encrypted in transit and at rest
- **Secure Storage:** Integration credentials are stored securely
- **Access Control:** Only authorized users can access integrations
- **PIPEDA Compliant:** Canadian privacy law compliance
- **Read-Only by Default:** Most workflows are read-only unless explicitly configured

---

## Best Practices

1. **Start with Read-Only:** Begin with reporting workflows before creating invoices
2. **Test Thoroughly:** Test invoice creation workflows with small amounts first
3. **Monitor Performance:** Check execution logs regularly
4. **Backup Data:** Keep backups of important financial data
5. **Review Regularly:** Review automated invoices and payments regularly
6. **Keep Updated:** Update integration when new features are available

---

## Advanced Configuration

### Webhook Setup

For real-time automation, webhooks are automatically configured when you connect Wave. No manual setup required.

### Custom Workflows

Create custom workflows using Wave triggers:
- Invoice created
- Invoice updated
- Payment received
- Invoice overdue
- Business updated

### Multi-Business Setup

If you have multiple Wave businesses:
1. Connect each business separately
2. Create workflows for each business
3. Use business selection in workflow configuration

---

## Support

- **Documentation:** [Full Wave integration docs](/help/integrations/wave)
- **Templates:** [Wave workflow templates](/templates?integration=wave)
- **Support:** support@aias-platform.com
- **Setup Call:** [Book a call](/demo) ($99 one-time)

---

## Next Steps

1. ✅ Connect Wave Accounting integration
2. ✅ Create your first Wave workflow
3. ✅ Test and verify it works
4. ✅ Explore more Wave templates
5. ✅ Build custom financial automation workflows

**Ready to automate?** Browse [Wave Accounting workflow templates](/templates?integration=wave) to get started.
