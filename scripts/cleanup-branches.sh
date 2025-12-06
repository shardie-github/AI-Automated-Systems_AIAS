#!/bin/bash

# Branch Cleanup Script
# Identifies and helps remove dead branches

set -e

echo "🌿 Analyzing git branches..."

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Find merged branches
echo "✅ Branches merged into main:"
git branch -r --merged origin/main | grep -v "HEAD\|main" | while read branch; do
  echo "  $branch"
done

echo ""
echo "⚠️  Branches not merged into main:"
git branch -r --no-merged origin/main | while read branch; do
  # Check last commit date
  LAST_COMMIT=$(git log -1 --format="%ci" "$branch" 2>/dev/null || echo "unknown")
  echo "  $branch (last commit: $LAST_COMMIT)"
done

echo ""
echo "📋 Branch cleanup recommendations:"
echo ""
echo "1. Safe to delete (merged branches):"
git branch -r --merged origin/main | grep -v "HEAD\|main" | head -10 | while read branch; do
  echo "   git push origin --delete ${branch#origin/}"
done

echo ""
echo "2. Review before deleting (not merged):"
git branch -r --no-merged origin/main | head -10 | while read branch; do
  echo "   Review: $branch"
done

echo ""
echo "⚠️  IMPORTANT: Review branches before deleting!"
echo "   Use: git log origin/main..<branch> to see commits"
echo "   Use: git diff origin/main..<branch> to see changes"
