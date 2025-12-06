#!/bin/bash

# Comprehensive Repository Housekeeping Script
# Performs maintenance, security, and versioning tasks

set -e

echo "🏠 Starting repository housekeeping..."
echo ""

# 1. Security audit
echo "🔒 Running security audit..."
if [ -f "package.json" ]; then
  echo "  Checking for known vulnerabilities..."
  npm audit --audit-level=moderate 2>/dev/null || echo "  Run: npm audit"
fi

# 2. Dependency cleanup
echo "📦 Checking dependencies..."
if [ -f "package.json" ]; then
  echo "  Checking for unused dependencies..."
  if command -v depcheck &> /dev/null; then
    depcheck --json > /tmp/depcheck.json 2>&1 || true
    UNUSED=$(cat /tmp/depcheck.json | jq -r '.dependencies[]' 2>/dev/null || echo "")
    if [ ! -z "$UNUSED" ]; then
      echo "  Potentially unused: $UNUSED"
    fi
  else
    echo "  Install depcheck: npm install -g depcheck"
  fi
fi

# 3. Version check
echo "📌 Checking version consistency..."
if [ -f "package.json" ]; then
  VERSION=$(node -p "require('./package.json').version")
  echo "  Current version: $VERSION"
fi

# 4. Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf .next 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf build 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
echo "  ✅ Build artifacts cleaned"

# 5. Check for large files
echo "📊 Checking for large files..."
find . -type f -size +5M -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" \
  -exec ls -lh {} \; | awk '{print $5, $9}' | head -5

# 6. Check git status
echo "📋 Git status:"
git status --short | head -10

# 7. Check for merge conflicts
echo "🔍 Checking for merge conflicts..."
if git diff --check 2>/dev/null | grep -q "conflict"; then
  echo "  ⚠️  Potential merge conflicts found"
else
  echo "  ✅ No merge conflicts"
fi

# 8. Check for sensitive data
echo "🔐 Checking for potential sensitive data..."
find . -type f \( -name "*.env*" -o -name "*.key" -o -name "*.pem" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.next/*" 2>/dev/null | while read file; do
  if ! grep -q "$file" .gitignore 2>/dev/null; then
    echo "  ⚠️  Potentially sensitive file not in .gitignore: $file"
  fi
done

# 9. Lint check
echo "🔍 Running lint check..."
if [ -f "package.json" ] && grep -q '"lint"' package.json; then
  echo "  Run: npm run lint"
else
  echo "  No lint script found"
fi

# 10. Type check
echo "🔍 Running type check..."
if [ -f "package.json" ] && grep -q '"typecheck"' package.json; then
  echo "  Run: npm run typecheck"
else
  echo "  No typecheck script found"
fi

echo ""
echo "✅ Housekeeping complete!"
echo ""
echo "📝 Recommended actions:"
echo "   1. Review security audit results"
echo "   2. Remove unused dependencies"
echo "   3. Update version if needed"
echo "   4. Commit cleaned build artifacts"
echo "   5. Review large files"
echo "   6. Address any merge conflicts"
echo "   7. Ensure sensitive files are in .gitignore"
