# CRM Setup Guide
## HubSpot / Salesforce Configuration for AIAS Platform

**Purpose**: Configure CRM for sales, marketing, and customer success  
**Platform**: HubSpot (recommended for SMB) or Salesforce (for enterprise)  
**Last Updated**: [Date]

---

## CRM SELECTION

### HubSpot (Recommended for Seed Stage):

**Pros**:
- Free tier available
- Easy to set up and use
- Integrated marketing automation
- Good for SMB sales teams
- Affordable pricing ($0-$1,200/month)

**Cons**:
- Limited customization (free tier)
- May need to upgrade as you scale

### Salesforce (For Enterprise):

**Pros**:
- Highly customizable
- Enterprise-grade features
- Large ecosystem
- Scalable

**Cons**:
- Expensive ($25-$300/user/month)
- Complex setup
- Requires admin resources

**Recommendation**: Start with HubSpot, migrate to Salesforce at Series A if needed.

---

## HUBSPOT SETUP GUIDE

### Step 1: Account Setup

**1.1 Create Account**:
- [ ] Sign up at hubspot.com
- [ ] Choose plan (Start with Free, upgrade to Starter/Professional as needed)
- [ ] Complete onboarding wizard

**1.2 Initial Configuration**:
- [ ] Set company name: "AIAS Platform"
- [ ] Add company logo
- [ ] Configure timezone and currency
- [ ] Set up user accounts

**1.3 Integration Setup**:
- [ ] Connect email (Gmail/Outlook)
- [ ] Connect calendar (Google Calendar/Outlook)
- [ ] Connect phone (if using HubSpot calling)

---

### Step 2: Contact Management

**2.1 Contact Properties**:

**Standard Properties** (Already included):
- First Name
- Last Name
- Email
- Phone
- Company
- Job Title
- Lifecycle Stage
- Lead Status

**Custom Properties** (Add these):
- **ICP Fit Score** (Number, 1-10)
- **Pain Points** (Multi-select)
- **Current Tools** (Multi-select)
- **Budget Range** (Single-select: <$100, $100-$500, $500+)
- **Decision Timeline** (Single-select: <1 month, 1-3 months, 3-6 months, 6+ months)
- **Source** (Single-select: Website, Referral, Cold Outreach, Event, etc.)
- **LOI Status** (Single-select: None, Draft, Sent, Signed)
- **Health Score** (Number, 0-100)

**2.2 Contact Segmentation**:
- [ ] Create lists:
  - Qualified Leads
  - Customers
  - At-Risk Customers
  - LOI Candidates
  - Beta Testers

---

### Step 3: Company Management

**3.1 Company Properties**:

**Standard Properties**:
- Company Name
- Domain
- Industry
- Number of Employees
- Annual Revenue

**Custom Properties** (Add these):
- **ICP Fit** (Checkbox: Yes/No)
- **Company Size** (Single-select: 1-10, 11-50, 51-200, 201-500, 500+)
- **Tier** (Single-select: Starter, Pro, Enterprise)
- **ARR** (Number)
- **MRR** (Number)
- **Churn Risk** (Single-select: Low, Medium, High)
- **Health Score** (Number, 0-100)
- **Renewal Date** (Date)
- **Onboarding Status** (Single-select: Not Started, In Progress, Complete)

**3.2 Company Segmentation**:
- [ ] Create lists:
  - Target Accounts
  - Customers
  - At-Risk Accounts
  - Expansion Opportunities

---

### Step 4: Deal Pipeline

**4.1 Deal Stages**:

Create these stages:
1. **Qualification** (BANT qualification)
2. **Discovery** (Discovery call scheduled/completed)
3. **Demo** (Demo scheduled/completed)
4. **Proposal** (Proposal sent)
5. **Negotiation** (Negotiating terms)
6. **Closed Won** (Contract signed)
7. **Closed Lost** (Lost to competitor, no budget, etc.)

**4.2 Deal Properties**:

**Standard Properties**:
- Deal Name
- Amount
- Close Date
- Deal Stage

**Custom Properties** (Add these):
- **Tier** (Single-select: Starter, Pro, Enterprise)
- **ACV** (Number, Annual Contract Value)
- **ARR** (Number, Annual Recurring Revenue)
- **Sales Cycle** (Number, days)
- **Competitor** (Single-select: Zapier, Make, Custom, None)
- **Decision Criteria** (Multi-line text)
- **Champion** (Contact, single-select)
- **Decision Maker** (Contact, single-select)
- **LOI** (Checkbox: Yes/No)
- **Pilot** (Checkbox: Yes/No)

**4.3 Deal Pipeline Views**:
- [ ] Create views:
  - All Deals
  - My Deals
  - This Month
  - This Quarter
  - At Risk
  - High Value (>$10K)

---

### Step 5: Sales Automation

**5.1 Workflows** (Automation):

**Lead Qualification Workflow**:
- **Trigger**: Contact created, Lifecycle Stage = "Lead"
- **Actions**:
  - Send welcome email
  - Assign to SDR
  - Create task: "Qualify lead"
  - Add to "Qualified Leads" list (if qualified)

**Demo Follow-Up Workflow**:
- **Trigger**: Deal stage = "Demo"
- **Actions**:
  - Send follow-up email
  - Create task: "Follow up on demo"
  - Set reminder (2 days)

**Proposal Sent Workflow**:
- **Trigger**: Deal stage = "Proposal"
- **Actions**:
  - Send proposal email
  - Create task: "Follow up on proposal"
  - Set reminder (3 days)

**5.2 Sequences** (Email Automation):

**Cold Outreach Sequence**:
- Email 1: Introduction (Day 0)
- Email 2: Value proposition (Day 3)
- Email 3: Case study (Day 7)
- Email 4: Final follow-up (Day 10)

**Demo Follow-Up Sequence**:
- Email 1: Thank you (Day 0)
- Email 2: Resources (Day 2)
- Email 3: Check-in (Day 5)

---

### Step 6: Reporting & Dashboards

**6.1 Sales Dashboard**:

Create these reports:
- **Pipeline Overview**: Total pipeline value, deals by stage
- **Sales Activity**: Calls, emails, meetings
- **Conversion Rates**: By stage
- **Win Rate**: By month/quarter
- **Average Deal Size**: By tier
- **Sales Cycle**: Average days to close

**6.2 Customer Success Dashboard**:

Create these reports:
- **Customer Health**: Health score distribution
- **Churn Risk**: At-risk customers
- **Adoption**: Feature adoption rates
- **Support Tickets**: Volume, resolution time
- **Renewals**: Upcoming renewals, renewal rate

**6.3 Marketing Dashboard**:

Create these reports:
- **Lead Generation**: Leads by source
- **Conversion Funnel**: Website → Lead → Customer
- **Campaign Performance**: Email opens, clicks, conversions
- **ROI**: Marketing spend vs. revenue

---

### Step 7: Integrations

**7.1 Essential Integrations**:

- [ ] **Email**: Gmail/Outlook (sync emails)
- [ ] **Calendar**: Google Calendar/Outlook (schedule meetings)
- [ ] **Phone**: HubSpot calling or Twilio (call tracking)
- [ ] **Website**: HubSpot tracking code (visitor tracking)
- [ ] **Forms**: HubSpot forms (lead capture)

**7.2 Optional Integrations**:

- [ ] **Slack**: Notifications, deal updates
- [ ] **Zoom**: Meeting scheduling, recording
- [ ] **DocuSign**: Contract signing
- [ ] **Stripe**: Payment processing
- [ ] **Intercom**: Customer support
- [ ] **Google Analytics**: Website analytics

---

## SALESFORCE SETUP GUIDE (Alternative)

### Step 1: Account Setup

**1.1 Create Account**:
- [ ] Sign up at salesforce.com
- [ ] Choose edition (Start with Essentials/Professional)
- [ ] Complete setup wizard

**1.2 Initial Configuration**:
- [ ] Set company information
- [ ] Configure users and profiles
- [ ] Set up data import

---

### Step 2: Object Configuration

**2.1 Lead Object**:
- [ ] Configure lead fields
- [ ] Set up lead assignment rules
- [ ] Configure lead conversion

**2.2 Account Object**:
- [ ] Configure account fields
- [ ] Set up account hierarchy
- [ ] Configure account teams

**2.3 Opportunity Object**:
- [ ] Configure opportunity stages
- [ ] Set up opportunity products
- [ ] Configure probability

---

### Step 3: Sales Process

**3.1 Sales Process**:
- [ ] Define sales stages
- [ ] Configure stage probabilities
- [ ] Set up sales process automation

**3.2 Workflow Rules**:
- [ ] Create workflow rules for automation
- [ ] Set up email templates
- [ ] Configure task creation

---

## DATA MIGRATION

### Step 1: Data Preparation

**1.1 Export Existing Data**:
- [ ] Export contacts from current system (CSV)
- [ ] Export companies (CSV)
- [ ] Export deals/opportunities (CSV)
- [ ] Clean data (remove duplicates, fix formatting)

**1.2 Data Mapping**:
- [ ] Map fields from old system to new system
- [ ] Create import templates
- [ ] Validate data

---

### Step 2: Data Import

**2.1 Import Contacts**:
- [ ] Import contacts CSV
- [ ] Map fields
- [ ] Validate import
- [ ] Review duplicates

**2.2 Import Companies**:
- [ ] Import companies CSV
- [ ] Map fields
- [ ] Link to contacts

**2.3 Import Deals**:
- [ ] Import deals CSV
- [ ] Map fields
- [ ] Link to companies/contacts

---

## TRAINING & ONBOARDING

### Step 1: Team Training

**1.1 Sales Team**:
- [ ] CRM basics training
- [ ] Deal management training
- [ ] Reporting training
- [ ] Best practices

**1.2 Customer Success**:
- [ ] Contact management
- [ ] Health score tracking
- [ ] Support ticket integration

**1.3 Marketing**:
- [ ] Lead management
- [ ] Campaign tracking
- [ ] Reporting

---

### Step 2: Documentation

**2.1 Create Guides**:
- [ ] User guide
- [ ] Process documentation
- [ ] FAQ
- [ ] Video tutorials

---

## BEST PRACTICES

### Data Hygiene:
- **Regular Cleanup**: Monthly data cleanup
- **Duplicate Prevention**: Use duplicate detection
- **Data Validation**: Validate on import
- **Field Completion**: Require key fields

### Process Adherence:
- **Deal Stages**: Use consistent deal stages
- **Activity Logging**: Log all activities
- **Note Taking**: Document all interactions
- **Follow-Up**: Set reminders for follow-ups

### Reporting:
- **Weekly Reviews**: Review pipeline weekly
- **Monthly Forecasts**: Forecast monthly
- **Quarterly Reviews**: Review metrics quarterly

---

## METRICS TO TRACK

### Sales Metrics:
- Pipeline value
- Win rate
- Sales cycle
- Average deal size
- Conversion rates by stage

### Customer Success Metrics:
- Health score
- Churn risk
- Support tickets
- Renewal rate
- Expansion rate

### Marketing Metrics:
- Lead generation
- Conversion rates
- Campaign ROI
- Cost per lead
- Lead quality

---

## COST ESTIMATE

### HubSpot:
- **Free**: $0/month (up to 5 users)
- **Starter**: $50/month (up to 10 users)
- **Professional**: $1,200/month (up to 10 users, advanced features)

### Salesforce:
- **Essentials**: $25/user/month (up to 10 users)
- **Professional**: $75/user/month
- **Enterprise**: $150/user/month

**Recommendation**: Start with HubSpot Free, upgrade to Starter ($50/month) when you have 5+ users.

---

## APPENDICES

- [HubSpot Setup Checklist](./HUBSPOT_SETUP_CHECKLIST.md)
- [Salesforce Setup Checklist](./SALESFORCE_SETUP_CHECKLIST.md)
- [Data Import Templates](./DATA_IMPORT_TEMPLATES.md)
- [Training Materials](./CRM_TRAINING_MATERIALS.md)

---

**Guide Version**: 1.0  
**Last Updated**: [Date]  
**Next Review**: Quarterly
