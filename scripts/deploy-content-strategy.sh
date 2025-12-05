#!/bin/bash
# Deploy Content Strategy Script
# Automated deployment script for content strategy components

set -e

echo "🚀 Deploying Content Strategy..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check required environment variables
check_env_var() {
  if [ -z "${!1}" ]; then
    echo -e "${RED}❌ Missing required environment variable: $1${NC}"
    echo "   Set it in:"
    echo "   - GitHub: Repository → Settings → Secrets"
    echo "   - Vercel: Dashboard → Settings → Environment Variables"
    echo "   - Local: .env.local file"
    exit 1
  else
    echo -e "${GREEN}✅ $1 is set${NC}"
  fi
}

echo "📋 Validating environment variables..."
check_env_var "SUPABASE_URL"
check_env_var "SUPABASE_SERVICE_ROLE_KEY"
check_env_var "SUPABASE_ACCESS_TOKEN"
check_env_var "SUPABASE_PROJECT_REF"

# Check email provider (at least one required)
if [ -z "$RESEND_API_KEY" ] && [ -z "$SENDGRID_API_KEY" ] && [ -z "$SMTP_HOST" ]; then
  echo -e "${RED}❌ Missing email provider configuration${NC}"
  echo "   Set one of: RESEND_API_KEY, SENDGRID_API_KEY, or SMTP_HOST"
  exit 1
else
  echo -e "${GREEN}✅ Email provider configured${NC}"
fi

echo ""
echo "📦 Deploying email cadence function..."

# Deploy Supabase function
if command -v supabase &> /dev/null; then
  echo "Deploying to Supabase..."
  supabase functions deploy email-cadence-scheduler \
    --project-ref "$SUPABASE_PROJECT_REF" \
    --no-verify-jwt
  
  echo -e "${GREEN}✅ Email function deployed${NC}"
else
  echo -e "${YELLOW}⚠️  Supabase CLI not found. Install with: npm install -g supabase${NC}"
  echo "   Or deploy via GitHub Actions workflow"
fi

echo ""
echo "🌐 Deploying content pages..."

# Deploy to Vercel (if Vercel CLI is available)
if command -v vercel &> /dev/null && [ -n "$VERCEL_TOKEN" ]; then
  echo "Deploying to Vercel..."
  vercel --prod --token "$VERCEL_TOKEN"
  echo -e "${GREEN}✅ Content pages deployed${NC}"
else
  echo -e "${YELLOW}⚠️  Vercel CLI not found or VERCEL_TOKEN not set${NC}"
  echo "   Install with: npm install -g vercel"
  echo "   Or deploy via GitHub Actions workflow"
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "📊 Next steps:"
echo "  1. Verify email function: Supabase Dashboard → Edge Functions"
echo "  2. Verify pages: Check your site URLs"
echo "  3. Test email delivery: Trigger test email"
echo "  4. Monitor: Check email provider dashboard"
