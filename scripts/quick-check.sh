#!/bin/bash
# Quick health check script
# Usage: ./scripts/quick-check.sh

set -e

echo "🔍 Running Quick Health Check"
echo ""

# Type check
echo "📝 Type checking..."
pnpm typecheck && echo "✅ Type check passed" || echo "❌ Type check failed"

# Lint check
echo ""
echo "🔍 Linting..."
pnpm lint --max-warnings 0 && echo "✅ Lint check passed" || echo "❌ Lint check failed"

# Format check
echo ""
echo "💅 Formatting check..."
pnpm format:check && echo "✅ Format check passed" || echo "❌ Format check failed"

# Test check
echo ""
echo "🧪 Running tests..."
pnpm test --run && echo "✅ Tests passed" || echo "❌ Tests failed"

echo ""
echo "✨ Health check complete!"
