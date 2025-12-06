# Workflow Templates Guide

Pre-built workflow templates to help you automate common business tasks. Get started in minutes, not hours.

## Available Templates

### E-Commerce Templates

#### 1. Shopify Order Notification
**Category:** E-Commerce  
**Difficulty:** Easy  
**Time to Setup:** 5 minutes  
**Required Integrations:** Shopify, Slack

**What It Does:**
Sends a Slack notification whenever a new order is placed in your Shopify store.

**Use Cases:**
- Get instant notifications when orders come in
- Keep your team informed in real-time
- Never miss an order

**Setup Steps:**
1. Select the template
2. Connect your Shopify store
3. Connect Slack (or choose email notification)
4. Configure the notification channel
5. Customize the message (optional)
6. Activate the workflow

**Customization Options:**
- Change notification channel
- Customize message format
- Add order details to notification
- Filter by order value or product

**Example Notification:**
```
New order: $149.99 from customer@example.com
Order #1234 - 3 items
```

---

#### 2. Shopify Order Processing
**Category:** E-Commerce  
**Difficulty:** Advanced  
**Time to Setup:** 15 minutes  
**Required Integrations:** Shopify, Wave Accounting

**What It Does:**
Automatically processes orders by creating invoices in Wave Accounting and sending order confirmations.

**Use Cases:**
- Automate order-to-invoice workflow
- Reduce manual data entry
- Keep accounting in sync with sales

**Setup Steps:**
1. Select the template
2. Connect Shopify store
3. Connect Wave Accounting business
4. Configure invoice settings
5. Set up order confirmation email
6. Test with a sample order
7. Activate the workflow

**Customization Options:**
- Invoice template customization
- Order confirmation email template
- Add custom fields to invoices
- Filter which orders to process

**What Gets Automated:**
- Invoice creation in Wave
- Order confirmation email
- Customer information sync
- Line item mapping

---

### Accounting Templates

#### 3. Wave Invoice Reminder
**Category:** Accounting  
**Difficulty:** Medium  
**Time to Setup:** 10 minutes  
**Required Integrations:** Wave Accounting, Gmail

**What It Does:**
Automatically sends email reminders to customers when invoices become overdue.

**Use Cases:**
- Reduce late payments
- Automate follow-up communications
- Improve cash flow

**Setup Steps:**
1. Select the template
2. Connect Wave Accounting
3. Connect Gmail (or email service)
4. Set days overdue threshold (default: 7 days)
5. Customize email template
6. Test with a sample invoice
7. Activate the workflow

**Customization Options:**
- Days overdue threshold
- Email template and tone
- Reminder frequency
- Add payment links
- Filter by invoice amount

**Email Template Variables:**
- `{{invoice.number}}` - Invoice number
- `{{invoice.amount}}` - Invoice amount
- `{{invoice.customer.email}}` - Customer email
- `{{invoice.due_date}}` - Due date
- `{{invoice.days_overdue}}` - Days overdue

---

### Marketing Templates

#### 4. Lead Qualification
**Category:** Marketing  
**Difficulty:** Medium  
**Time to Setup:** 10 minutes  
**Required Integrations:** Gmail, Notion (or CRM)

**What It Does:**
Automatically qualifies leads from emails and adds them to your CRM.

**Use Cases:**
- Automate lead capture
- Never miss a lead
- Organize leads automatically

**Setup Steps:**
1. Select the template
2. Connect Gmail
3. Connect Notion (or your CRM)
4. Configure email filters
5. Set up lead keywords
6. Configure CRM fields
7. Test with a sample email
8. Activate the workflow

**Customization Options:**
- Lead qualification keywords
- Email filters (from address, subject, etc.)
- CRM field mapping
- Lead scoring rules
- Notification preferences

**Qualification Keywords (Default):**
- "interested"
- "quote"
- "pricing"
- "demo"
- "consultation"

---

### Productivity Templates

#### 5. Daily Business Summary
**Category:** Productivity  
**Difficulty:** Advanced  
**Time to Setup:** 15 minutes  
**Required Integrations:** Shopify, Wave Accounting, Slack

**What It Does:**
Sends a daily summary of your business metrics (orders, revenue, tasks) to your team.

**Use Cases:**
- Daily business insights
- Team alignment
- Performance tracking

**Setup Steps:**
1. Select the template
2. Connect Shopify
3. Connect Wave Accounting
4. Connect Slack
5. Configure summary schedule (default: 9 AM daily)
6. Customize summary format
7. Test the workflow
8. Activate the workflow

**Customization Options:**
- Summary schedule (time, frequency)
- Metrics to include
- Summary format
- Recipients
- Add custom metrics

**Summary Includes:**
- Today's orders (count, value)
- Today's revenue
- Pending tasks
- Key metrics

---

## How to Use Templates

### Step 1: Browse Templates

1. Go to **Workflows** → **Create Workflow**
2. Click **Browse Templates**
3. Filter by category or integration
4. Read template descriptions
5. Select a template

### Step 2: Configure Template

1. Review required integrations
2. Connect missing integrations
3. Fill in required fields
4. Customize settings (optional)
5. Test the workflow

### Step 3: Activate

1. Review configuration
2. Test the workflow
3. Activate when ready
4. Monitor execution logs

---

## Template Customization

### Basic Customization

- **Change notification channels:** Email, Slack, Teams, etc.
- **Modify schedules:** Change timing and frequency
- **Update messages:** Customize templates and text
- **Add filters:** Only trigger under certain conditions

### Advanced Customization

- **Add steps:** Chain multiple actions
- **Add conditions:** If/then logic
- **Transform data:** Format data between systems
- **Error handling:** Add retries and fallbacks

---

## Template Best Practices

1. **Start Simple:** Begin with easy templates
2. **Test First:** Always test before activating
3. **Monitor Performance:** Check execution logs regularly
4. **Iterate:** Refine templates based on results
5. **Document:** Keep notes on customizations

---

## Troubleshooting Templates

### Template Won't Activate

**Check:**
- All required integrations are connected
- All required fields are filled
- Integration permissions are correct
- Workflow configuration is valid

### Template Not Triggering

**Check:**
- Workflow is activated
- Trigger conditions are met
- Integration is working
- Execution logs for errors

### Template Errors

**Check:**
- Integration status
- API rate limits
- Data format compatibility
- Error messages in logs

---

## Creating Custom Templates

Want to create your own template?

1. Build a custom workflow
2. Test it thoroughly
3. Document the workflow
4. Save as a template (coming soon)
5. Share with your team

---

## Coming Soon

More templates are being added regularly:
- **E-Commerce:** Inventory sync, product updates, customer segmentation
- **Accounting:** Expense tracking, financial reporting, payment processing
- **Marketing:** Email campaigns, social media automation, lead nurturing
- **Productivity:** Task management, calendar sync, document automation

**Request a Template:**
Have an idea for a template? [Contact us](mailto:support@aias-platform.com) or [request a template](/help/request-template).

---

## Support

- **Template Help:** [Template documentation](/help/templates)
- **Integration Guides:** [Integration setup guides](/help/integrations)
- **Support:** support@aias-platform.com
- **Setup Call:** [Book a call](/demo) ($99 one-time)

---

**Ready to automate?** Browse templates and get started in minutes!
