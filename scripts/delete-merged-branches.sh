#!/bin/bash

# Delete Merged Branches Script
# SAFELY deletes branches that have been merged into main
# 
# WARNING: Review branches before running this script!
# Run with --dry-run first to see what would be deleted.

set -e

DRY_RUN=${1:-"--dry-run"}

echo "🌿 Analyzing merged branches..."
echo ""

if [ "$DRY_RUN" != "--dry-run" ] && [ "$DRY_RUN" != "--execute" ]; then
  echo "Usage: $0 [--dry-run|--execute]"
  echo "  --dry-run: Show what would be deleted (default)"
  echo "  --execute: Actually delete branches"
  exit 1
fi

# Get merged branches
MERGED_BRANCHES=$(git branch -r --merged origin/main | grep -v "HEAD\|main" | sed 's|origin/||' | sort -u)

if [ -z "$MERGED_BRANCHES" ]; then
  echo "✅ No merged branches found to delete"
  exit 0
fi

echo "Found $(echo "$MERGED_BRANCHES" | wc -l) merged branches:"
echo ""

if [ "$DRY_RUN" == "--dry-run" ]; then
  echo "DRY RUN - No branches will be deleted"
  echo ""
  echo "$MERGED_BRANCHES" | while read branch; do
    echo "  Would delete: $branch"
  done
  echo ""
  echo "To actually delete, run: $0 --execute"
else
  echo "EXECUTING - Branches will be deleted"
  echo ""
  echo "$MERGED_BRANCHES" | while read branch; do
    echo "Deleting: $branch"
    git push origin --delete "$branch" 2>/dev/null || echo "  ⚠️  Failed to delete $branch (may already be deleted)"
  done
  echo ""
  echo "✅ Branch cleanup complete"
fi
