#!/bin/bash
# Pre-commit checks
# Usage: ./scripts/pre-commit-check.sh

set -e

echo "🔍 Running pre-commit checks..."
echo ""

# Type check
echo "📝 Type checking..."
pnpm typecheck || {
    echo "❌ Type check failed. Please fix type errors before committing."
    exit 1
}

# Lint
echo ""
echo "🔍 Linting..."
pnpm lint --max-warnings 0 || {
    echo "❌ Lint check failed. Run 'pnpm lint:fix' to auto-fix issues."
    exit 1
}

# Format check
echo ""
echo "💅 Formatting check..."
pnpm format:check || {
    echo "❌ Format check failed. Run 'pnpm format' to fix."
    exit 1
}

# Tests
echo ""
echo "🧪 Running tests..."
pnpm test --run || {
    echo "❌ Tests failed. Please fix failing tests before committing."
    exit 1
}

echo ""
echo "✅ All pre-commit checks passed!"
