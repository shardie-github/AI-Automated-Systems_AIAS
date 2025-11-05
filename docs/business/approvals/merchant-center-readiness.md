# Google Merchant Center Readiness — AIAS Platform

## Overview

**Purpose:** Enable AIAS Platform to appear in Google Shopping results and Google Ads (if selling products/services through Google).

**Note:** AIAS Platform is primarily a SaaS subscription service, but we may sell one-time products (templates, courses) through Google Merchant Center.

---

## Merchant Center Account Setup

### Account Information
- **Business Name:** AIAS Platform
- **Business Address:** [Your Canadian Address]
- **Country:** Canada
- **Currency:** CAD (Canadian Dollars)
- **Language:** English (Primary), French (Secondary)

### Contact Information
- **Email:** support@aias-platform.com
- **Phone:** 1-800-AIAS-HELP (toll-free Canada)
- **Website:** https://aias-platform.com

### Tax Information
- **GST/HST Number:** [Your GST/HST Number]
- **Province:** Ontario (default)
- **Tax Rate:** 13% (Ontario HST)

---

## Product Feed Requirements

### Feed Format
- **Format:** XML or CSV
- **Delivery:** Scheduled fetch (daily) or manual upload
- **Update Frequency:** Daily (at minimum)

### Required Product Attributes

#### Basic Information
- **id** (Required): Unique product ID (e.g., `aias-starter-monthly`)
- **title** (Required): Product name (e.g., "AIAS Platform — Starter Plan")
- **description** (Required): Product description (500 characters max)
- **link** (Required): Product URL (e.g., `https://aias-platform.com/pricing`)
- **image_link** (Required): Product image URL (1200x1200 px minimum)
- **availability** (Required): `in_stock` or `preorder`
- **price** (Required): Price with currency (e.g., `49.00 CAD`)
- **brand** (Required): `AIAS Platform`
- **condition** (Required): `new`

#### Additional Attributes (Recommended)
- **gtin** (Optional): GTIN/UPC/EAN (if applicable)
- **mpn** (Optional): Manufacturer Part Number (if applicable)
- **google_product_category** (Required): Category (e.g., `Software > Business Software`)
- **product_type** (Optional): Product type (e.g., `SaaS Subscription`)
- **shipping** (Required): Shipping information (e.g., `CA::0.00 CAD` for digital products)

### Product Feed Example (CSV)

```csv
id,title,description,link,image_link,availability,price,brand,condition,google_product_category,shipping
aias-starter-monthly,AIAS Platform — Starter Plan,AI automation for Canadian businesses. No-code workflows with Shopify, Wave, Stripe.,https://aias-platform.com/pricing,https://aias-platform.com/images/starter-plan.png,in_stock,49.00 CAD,AIAS Platform,new,Software > Business Software,CA::0.00 CAD
aias-pro-monthly,AIAS Platform — Pro Plan,Advanced AI automation with 50 agents, advanced analytics, and dedicated support.,https://aias-platform.com/pricing,https://aias-platform.com/images/pro-plan.png,in_stock,149.00 CAD,AIAS Platform,new,Software > Business Software,CA::0.00 CAD
```

---

## Product Data Requirements

### Product Images
- **Dimensions:** 1200x1200 px minimum (square)
- **Format:** JPEG or PNG
- **Requirements:**
  - High quality (no compression artifacts)
  - White background (recommended)
  - Product-focused (no text overlays)
  - Multiple images per product (recommended)

### Product Titles
- **Length:** 150 characters max
- **Requirements:**
  - Clear and descriptive
  - Include brand name (AIAS Platform)
  - Include key features (e.g., "Starter Plan — 10 Agents")

### Product Descriptions
- **Length:** 5,000 characters max (recommended: 500-1,000)
- **Requirements:**
  - Clear and informative
  - Include key features and benefits
  - Include pricing and plan details
  - No misleading claims

---

## Shipping & Tax Configuration

### Shipping
- **Shipping Method:** Digital delivery (no physical shipping)
- **Shipping Cost:** CAD $0.00 (free shipping)
- **Shipping Regions:** Canada (primary), US (secondary)

### Tax
- **Tax Calculation:** Automatic (Google calculates tax based on location)
- **Tax Rates:**
  - Ontario: 13% HST
  - BC: 12% GST+PST
  - Alberta: 5% GST
  - Quebec: 14.975% GST+QST
  - Other provinces: Varies

### Tax Settings
- **Tax Category:** Digital Services
- **Tax Rate:** Set per province (or use Google's automatic calculation)

---

## Policies & Compliance

### Return Policy
- **URL:** https://aias-platform.com/refund-policy
- **Content:** 30-day money-back guarantee for subscriptions

### Privacy Policy
- **URL:** https://aias-platform.com/privacy
- **Content:** PIPEDA-compliant privacy policy

### Terms of Service
- **URL:** https://aias-platform.com/terms
- **Content:** Terms of service for SaaS subscriptions

---

## Feed Submission Checklist

### Pre-Submission
- [ ] Merchant Center account created
- [ ] Business information completed
- [ ] Tax information configured
- [ ] Product feed created (XML or CSV)
- [ ] Product images uploaded (1200x1200 px)
- [ ] Product descriptions written
- [ ] Shipping and tax configured

### Merchant Center
- [ ] Product feed submitted
- [ ] Feed status: Approved (no errors)
- [ ] Products appearing in Merchant Center
- [ ] Google Shopping enabled (if applicable)

### Post-Submission
- [ ] Monitor feed status (daily)
- [ ] Fix any feed errors
- [ ] Update product information (pricing, availability)
- [ ] Monitor performance (impressions, clicks, conversions)

---

## Feed Maintenance

### Daily Tasks
- [ ] Check feed status (errors, warnings)
- [ ] Update product availability (if changed)
- [ ] Update pricing (if changed)

### Weekly Tasks
- [ ] Review product performance (impressions, clicks)
- [ ] Optimize product titles and descriptions
- [ ] Update product images (if needed)

### Monthly Tasks
- [ ] Review feed quality score
- [ ] Update product categories (if needed)
- [ ] Review and update policies (if changed)

---

## Common Issues & Solutions

### Issue: Feed Errors
- **Solution:** Check feed format (XML/CSV), required attributes, data quality

### Issue: Products Not Appearing
- **Solution:** Check feed status, product availability, Google Shopping eligibility

### Issue: Low Performance
- **Solution:** Optimize product titles, descriptions, images; improve product quality score

---

## Performance Tracking

### Key Metrics
- **Impressions:** Number of times products appear in Google Shopping
- **Clicks:** Number of clicks on products
- **Conversion Rate:** Percentage of clicks that convert to sign-ups
- **Cost per Click (CPC):** Average cost per click (if using Google Ads)

### Goals
- **Impressions:** 10,000+ per month (target)
- **Clicks:** 500+ per month (target)
- **Conversion Rate:** 5%+ (target)
- **CPC:** CAD $1.00 or less (target)

---

## Best Practices

### Product Feed Optimization
- ✅ Use high-quality images (1200x1200 px minimum)
- ✅ Write clear, descriptive titles (150 characters max)
- ✅ Include key features in descriptions
- ✅ Use accurate pricing (including currency)
- ✅ Update feeds regularly (daily recommended)

### Performance Optimization
- ✅ Optimize product titles (include keywords)
- ✅ Use relevant product categories
- ✅ Include shipping and tax information
- ✅ Monitor and fix feed errors quickly

---

**Last Updated:** 2024-01-15  
**Status:** Draft (Ready for Google Merchant Center setup)
