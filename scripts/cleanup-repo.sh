#!/bin/bash

# Repository Cleanup Script
# Removes dead code, cleans up files, and performs housekeeping

set -e

echo "🧹 Starting repository cleanup..."

# Remove console.log statements (keep console.error/warn)
echo "📝 Cleaning console.log statements..."
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.git/*" \
  -not -path "*/scripts/*" \
  -exec grep -l "console\.log" {} \; | while read file; do
  # Skip logger.ts and scripts
  if [[ "$file" != *"logger.ts"* ]] && [[ "$file" != *"scripts/"* ]]; then
    echo "  Found console.log in: $file"
    # Note: Actual removal should be done manually to review
  fi
done

# Find duplicate files
echo "🔍 Checking for duplicate files..."
find . -type f -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" \
  -exec md5sum {} \; | sort | uniq -d -w 32 | cut -d' ' -f3- | head -10

# Find large files
echo "📦 Finding large files (>1MB)..."
find . -type f -size +1M -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" \
  -exec ls -lh {} \; | awk '{print $5, $9}' | head -10

# Check for unused imports
echo "🔍 Checking for potentially unused files..."
# This would require more sophisticated analysis

# Clean up temporary files
echo "🗑️  Removing temporary files..."
find . -type f \( -name "*.tmp" -o -name "*.bak" -o -name "*.swp" -o -name "*.swo" -o -name ".DS_Store" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -delete 2>/dev/null || true

echo "✅ Cleanup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Review console.log statements above"
echo "   2. Check for duplicate files"
echo "   3. Review large files"
echo "   4. Run: npm run audit:deps"
echo "   5. Run: npm run scan:usage"
