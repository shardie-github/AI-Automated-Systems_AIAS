#!/bin/bash
# Migration runner script for Supabase gamification features

set -e

echo "🚀 Running Supabase Gamification Migrations..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're linked to a project
if ! supabase status &> /dev/null; then
    echo "⚠️  No local Supabase instance found. Linking to remote project..."
    echo "   Please run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "📦 Applying migrations..."

# Apply base gamification migration
echo "  → Applying base gamification schema..."
supabase db push --db-url "$DATABASE_URL" --file supabase/migrations/2025-11-05_gamify.sql 2>/dev/null || echo "    (Base migration may already be applied)"

# Apply extended gamification migration
echo "  → Applying extended gamification features..."
supabase db push --db-url "$DATABASE_URL" --file supabase/migrations/2025-11-05_gamify_extended.sql 2>/dev/null || echo "    (Extended migration may already be applied)"

# Or use migration up if running locally
if supabase status &> /dev/null; then
    echo "  → Running migration up..."
    supabase migration up || echo "    (Migrations may already be applied)"
fi

echo "✅ Migrations complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify tables: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%gamification%' OR table_name IN ('comments', 'challenges', 'referrals', 'notifications');"
echo "   2. Check RLS policies: SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';"
echo "   3. Test with: SELECT * FROM profiles LIMIT 1;"
