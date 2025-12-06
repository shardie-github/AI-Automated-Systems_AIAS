#!/bin/bash

# Dead Code Removal Script
# Identifies and helps remove unused code

set -e

echo "🔍 Analyzing codebase for dead code..."

# Check for unused exports
echo "📦 Checking for unused exports..."
if command -v ts-prune &> /dev/null; then
  ts-prune | head -20
else
  echo "  Install ts-prune: npm install -g ts-prune"
fi

# Check for unused dependencies
echo "📦 Checking for unused dependencies..."
if command -v depcheck &> /dev/null; then
  depcheck --json 2>/dev/null | jq -r '.dependencies[]' 2>/dev/null || echo "  Run: npm run audit:deps"
else
  echo "  Run: npm run audit:deps"
fi

# Find commented out code blocks
echo "💬 Finding large commented code blocks..."
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.git/*" \
  -exec grep -l "^[[:space:]]*\/\/.*\{$" {} \; | head -10

# Find TODO/FIXME comments
echo "📝 Finding TODO/FIXME comments..."
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.git/*" \
  -exec grep -Hn "TODO\|FIXME\|XXX\|HACK" {} \; | head -20

echo ""
echo "✅ Analysis complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Review unused exports"
echo "   2. Review unused dependencies"
echo "   3. Remove commented code blocks"
echo "   4. Address TODO/FIXME items"
