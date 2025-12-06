#!/bin/bash

# Script to move sensitive business planning documents to protected directories
# Run this after setting up git-crypt

set -e

echo "🔒 Moving sensitive files to protected directories..."

# Create protected directories
mkdir -p internal/private/business-planning
mkdir -p internal/private/investor-relations
mkdir -p internal/private/yc-materials
mkdir -p internal/private/financial/aias

# Move financial model
if [ -f "models/finance_model.csv" ]; then
    echo "Moving finance_model.csv..."
    cp models/finance_model.csv internal/private/business-planning/finance_model.csv
    echo "# Financial model moved to internal/private/business-planning/" > models/finance_model.csv
    echo "# Original file encrypted in internal/private/business-planning/finance_model.csv" >> models/finance_model.csv
fi

# Move investor deck
if [ -f "docs/investor-deck.md" ]; then
    echo "Moving investor-deck.md..."
    cp docs/investor-deck.md internal/private/investor-relations/investor-deck.md
    echo "# Investor deck moved to internal/private/investor-relations/" > docs/investor-deck.md
    echo "# Original file encrypted in internal/private/investor-relations/investor-deck.md" >> docs/investor-deck.md
fi

# Move product revenue storyboard
if [ -f "product_revenue_storyboard.md" ]; then
    echo "Moving product_revenue_storyboard.md..."
    cp product_revenue_storyboard.md internal/private/business-planning/product_revenue_storyboard.md
    echo "# Product revenue storyboard moved to internal/private/business-planning/" > product_revenue_storyboard.md
    echo "# Original file encrypted in internal/private/business-planning/product_revenue_storyboard.md" >> product_revenue_storyboard.md
fi

# Move seed round financial model
if [ -f "docs/seed-round/3_YEAR_FINANCIAL_MODEL.md" ]; then
    echo "Moving 3_YEAR_FINANCIAL_MODEL.md..."
    cp docs/seed-round/3_YEAR_FINANCIAL_MODEL.md internal/private/business-planning/3_year_financial_model.md
    echo "# Financial model moved to internal/private/business-planning/" > docs/seed-round/3_YEAR_FINANCIAL_MODEL.md
    echo "# Original file encrypted in internal/private/business-planning/3_year_financial_model.md" >> docs/seed-round/3_YEAR_FINANCIAL_MODEL.md
fi

# Move investor target list
if [ -f "docs/seed-round/investor-outreach/INVESTOR_TARGET_LIST.md" ]; then
    echo "Moving INVESTOR_TARGET_LIST.md..."
    cp docs/seed-round/investor-outreach/INVESTOR_TARGET_LIST.md internal/private/investor-relations/investor_target_list.md
    echo "# Investor target list moved to internal/private/investor-relations/" > docs/seed-round/investor-outreach/INVESTOR_TARGET_LIST.md
    echo "# Original file encrypted in internal/private/investor-relations/investor_target_list.md" >> docs/seed-round/investor-outreach/INVESTOR_TARGET_LIST.md
fi

# Move investor outreach email bank
if [ -f "docs/archive/2025/general/investor-outreach-email-bank.md" ]; then
    echo "Moving investor-outreach-email-bank.md..."
    cp docs/archive/2025/general/investor-outreach-email-bank.md internal/private/investor-relations/investor_outreach_emails.md
    echo "# Investor outreach emails moved to internal/private/investor-relations/" > docs/archive/2025/general/investor-outreach-email-bank.md
    echo "# Original file encrypted in internal/private/investor-relations/investor_outreach_emails.md" >> docs/archive/2025/general/investor-outreach-email-bank.md
fi

# Move YC financial projections
if [ -f "yc/FINANCIAL_PROJECTIONS.md" ]; then
    echo "Moving FINANCIAL_PROJECTIONS.md..."
    cp yc/FINANCIAL_PROJECTIONS.md internal/private/yc-materials/financial_projections.md
    echo "# Financial projections moved to internal/private/yc-materials/" > yc/FINANCIAL_PROJECTIONS.md
    echo "# Original file encrypted in internal/private/yc-materials/financial_projections.md" >> yc/FINANCIAL_PROJECTIONS.md
fi

# Move YC fundraising plan
if [ -f "yc/FUNDRAISING_PLAN.md" ]; then
    echo "Moving FUNDRAISING_PLAN.md..."
    cp yc/FUNDRAISING_PLAN.md internal/private/yc-materials/fundraising_plan.md
    echo "# Fundraising plan moved to internal/private/yc-materials/" > yc/FUNDRAISING_PLAN.md
    echo "# Original file encrypted in internal/private/yc-materials/fundraising_plan.md" >> yc/FUNDRAISING_PLAN.md
fi

# Move business metrics dashboard
if [ -f "monitoring/grafana/dashboards/aias-business.json" ]; then
    echo "Moving aias-business.json..."
    cp monitoring/grafana/dashboards/aias-business.json internal/private/business-planning/aias_business_metrics.json
    echo "{}" > monitoring/grafana/dashboards/aias-business.json
    echo "// Business metrics dashboard moved to internal/private/business-planning/" >> monitoring/grafana/dashboards/aias-business.json
fi

echo ""
echo "✅ Files moved to protected directories"
echo ""
echo "📝 Next steps:"
echo "   1. Review moved files"
echo "   2. Commit changes"
echo "   3. Files will be encrypted with git-crypt on commit"
echo "   4. Original locations now contain redirect notices"
echo ""
