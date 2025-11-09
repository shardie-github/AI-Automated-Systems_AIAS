# Metrics Dashboard Specification

**Created:** 2025-01-28  
**Purpose:** Define metrics dashboard requirements for Finance → Automation → Growth tracking

---

## Overview

The metrics dashboard provides real-time visibility into financial performance, marketing efficiency, and growth experiment results. It aggregates data from the `metrics_daily` table and related sources.

---

## Key Metrics to Display

### 1. Financial Metrics

#### Revenue Section
- **Total Revenue** (MTD, YTD)
- **Net Revenue** (Revenue - Refunds)
- **Refund Rate** (%)
- **Revenue Trend** (7-day, 30-day moving average)
- **Revenue by Channel** (if applicable)

#### Cost Metrics
- **COGS** (Cost of Goods Sold)
- **COGS Percentage** (% of revenue)
- **Gross Margin** ($ and %)
- **Operating Expenses** (from financial model)
- **EBITDA** ($ and %)

#### Cash Metrics
- **Cash Balance**
- **Cash Runway** (days/months)
- **Burn Rate** (monthly)

### 2. Marketing Metrics

#### Spend Section
- **Total Spend** (MTD, YTD)
- **Spend by Channel** (Meta, TikTok, Other)
- **Spend Trend** (7-day, 30-day)

#### Performance Metrics
- **Impressions** (total)
- **Clicks** (total)
- **Conversions** (total)
- **CTR** (Click-Through Rate)
- **CPC** (Cost Per Click)
- **CPM** (Cost Per Mille/1000 impressions)

### 3. Unit Economics

#### CAC (Customer Acquisition Cost)
- **Overall CAC**
- **CAC by Channel** (Meta, TikTok, Other)
- **CAC Trend** (7-day, 30-day moving average)
- **CAC Payback Period** (days)

#### LTV (Lifetime Value)
- **Average LTV**
- **LTV Trend** (30-day, 90-day)
- **LTV:CAC Ratio**
- **Target LTV:CAC** (3.0+)

### 4. Customer Metrics

- **New Customers** (daily, MTD)
- **Active Customers** (30-day active)
- **Churned Customers**
- **Churn Rate** (%)
- **Customer Growth Rate** (MoM)

### 5. Growth Experiments

- **Active Experiments** (count)
- **Completed Experiments** (count)
- **Experiment Results** (win/loss rate)
- **Top Performing Experiments** (by impact)

---

## Dashboard Views

### 1. Executive Dashboard
**Audience:** C-suite, investors  
**Update Frequency:** Real-time (refreshes every 15 minutes)  
**Key Metrics:**
- Revenue (MTD, YTD)
- EBITDA Margin
- Cash Runway
- LTV:CAC Ratio
- Active Experiments

### 2. Finance Dashboard
**Audience:** Finance team, CFO  
**Update Frequency:** Daily (after ETL runs)  
**Key Metrics:**
- P&L Summary
- Cash Flow
- Unit Economics
- Scenario Comparison (Base/Optimistic/Conservative)

### 3. Marketing Dashboard
**Audience:** Marketing team, CMO  
**Update Frequency:** Real-time (refreshes every hour)  
**Key Metrics:**
- Spend by Channel
- CAC by Channel
- Conversion Funnels
- ROI by Campaign

### 4. Growth Dashboard
**Audience:** Growth team, product managers  
**Update Frequency:** Real-time (refreshes every 15 minutes)  
**Key Metrics:**
- Active Experiments
- Experiment Results
- Conversion Rates
- Feature Adoption

---

## Data Sources

### Primary Tables
- `metrics_daily` - Aggregated daily metrics
- `orders` - Order/transaction data
- `spend` - Marketing spend data
- `experiments` - Growth experiment data
- `events` - User event tracking

### Calculated Fields
- **CAC** = `spend_total / new_customers`
- **LTV** = Average revenue per customer over 90 days
- **Refund Rate** = `refund_count / order_count`
- **Gross Margin %** = `(net_revenue - cogs) / net_revenue * 100`
- **EBITDA Margin %** = `ebitda / revenue * 100`

---

## Visualization Requirements

### Charts
1. **Revenue Trend Line Chart** (time series)
2. **Spend by Channel Pie Chart**
3. **CAC Trend Line Chart** (time series)
4. **LTV:CAC Ratio Bar Chart** (by channel)
5. **Experiment Results Funnel Chart**
6. **Cash Runway Gauge Chart**

### Tables
1. **Daily Metrics Table** (sortable, filterable)
2. **Top Campaigns Table** (by ROI)
3. **Experiment Results Table**

### Alerts
- **Red Alert:** Cash runway < 12 months
- **Yellow Alert:** CAC > $60 (Base scenario threshold)
- **Yellow Alert:** Refund rate > 5%
- **Yellow Alert:** LTV:CAC < 3.0

---

## Implementation Notes

### Technology Stack
- **Frontend:** React/Next.js (existing stack)
- **Charts:** Recharts (already in dependencies)
- **Data Fetching:** Supabase client (real-time subscriptions)
- **Styling:** Tailwind CSS (existing)

### Performance
- Use Supabase real-time subscriptions for live updates
- Cache aggregated metrics for faster load times
- Implement pagination for large datasets
- Use materialized views for complex calculations

### Security
- Authenticate users before accessing dashboards
- Use RLS policies to restrict data access
- Log dashboard access for audit purposes

---

## Success Criteria

1. **Load Time:** < 2 seconds for initial render
2. **Update Frequency:** Real-time updates within 15 minutes
3. **Accuracy:** Metrics match source data (99.9% accuracy)
4. **Uptime:** 99.9% availability
5. **User Satisfaction:** > 4.5/5 rating from users

---

## Future Enhancements

1. **Custom Date Ranges:** Allow users to select custom date ranges
2. **Export Functionality:** Export metrics to CSV/PDF
3. **Email Reports:** Scheduled daily/weekly email reports
4. **Mobile App:** Native mobile dashboard app
5. **Predictive Analytics:** Forecast future metrics using ML
6. **Anomaly Detection:** Automatically detect unusual patterns

---

**Last Updated:** 2025-01-28  
**Owner:** automation_builder_agent
