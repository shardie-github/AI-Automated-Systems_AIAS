# Branch Cleanup Guide

**Date:** 2025-01-27  
**Purpose:** Safely clean up merged branches

---

## 📋 Branch Status

### Merged Branches (Safe to Delete)
These branches have been merged into `main` and can be safely deleted:

```bash
# View merged branches
git branch -r --merged origin/main | grep -v "HEAD\|main"
```

**Count:** ~30+ branches

### Unmerged Branches (Need Review)
These branches contain work not yet merged:

```bash
# View unmerged branches
git branch -r --no-merged origin/main
```

**Count:** ~20+ branches

---

## 🗑️ Safe Branch Deletion

### Option 1: Dry Run (Recommended First)
```bash
chmod +x scripts/delete-merged-branches.sh
./scripts/delete-merged-branches.sh --dry-run
```

### Option 2: Execute Deletion
```bash
./scripts/delete-merged-branches.sh --execute
```

### Option 3: Manual Deletion
```bash
# Review branch first
git log origin/main..origin/BRANCH_NAME

# If safe, delete
git push origin --delete BRANCH_NAME
```

---

## ⚠️ Before Deleting

1. **Verify merge**
   ```bash
   git log origin/main..origin/BRANCH_NAME
   ```
   If empty, branch is fully merged.

2. **Check for important commits**
   ```bash
   git log origin/main..origin/BRANCH_NAME --oneline
   ```

3. **Review branch purpose**
   - Check branch name for context
   - Review PR if exists
   - Ensure no important work is lost

---

## 📝 Recommended Cleanup

### Immediate (Safe)
Delete these merged branches:
- `origin/chore/docs-tidy-20251112`
- `origin/cursor/analyze-ai-pricing-and-value-promises-gemini-3-pro-preview-effe`
- `origin/cursor/build-and-resolve-dependency-errors-gemini-3-pro-preview-2763`
- Other merged cursor/* branches

### Review First
These unmerged branches need review:
- `origin/cursor/live-app-quality-and-enhancement-pass-gemini-3-pro-preview-3071` (current branch)
- `origin/cursor/aias-project-comprehensive-refactor-and-enhancement-c906`
- Other unmerged branches

---

## 🔄 Branch Naming Convention

Current branches follow pattern:
- `cursor/*` - Cursor AI generated branches
- `chore/*` - Maintenance branches
- `feat/*` - Feature branches
- `fix/*` - Bug fix branches

---

## 📊 Statistics

- **Total branches:** 50+
- **Merged (safe to delete):** ~30+
- **Unmerged (need review):** ~20+
- **Current branch:** `cursor/live-app-quality-and-enhancement-pass-gemini-3-pro-preview-3071`

---

## ✅ Checklist

- [ ] Review merged branches list
- [ ] Run dry-run script
- [ ] Verify no important work in merged branches
- [ ] Execute deletion (if safe)
- [ ] Review unmerged branches
- [ ] Merge or delete unmerged branches as appropriate

---

**Status:** Ready for cleanup  
**Script:** `scripts/delete-merged-branches.sh`
