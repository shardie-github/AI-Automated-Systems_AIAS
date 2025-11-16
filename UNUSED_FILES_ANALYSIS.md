# Unused Files Analysis

**Date:** 2025-01-27

## Files Identified as Potentially Unused

### 1. `index.html`
**Location:** `/workspace/index.html`  
**Status:** ⚠️ Potentially Unused  
**Reason:** Next.js uses the `app/` directory structure and doesn't require an `index.html` file. This file appears to be for a Vite-based application.

**Verification:**
- ❌ Not referenced in `next.config.ts`
- ❌ Not referenced in `package.json` scripts
- ✅ Referenced in `vite.config.ts` (but vite is only used for testing/analysis)

**Recommendation:** 
- If this is for a separate Vite app, keep it
- If unused, can be moved to `legacy/` or removed
- **Action:** Verify with team before deletion

### 2. `src/main.tsx`
**Location:** `/workspace/src/main.tsx`  
**Status:** ⚠️ Potentially Unused  
**Reason:** Next.js uses `app/layout.tsx` as the entry point. This file uses React Router which suggests it's for a separate Vite app.

**Verification:**
- ❌ Not referenced in `next.config.ts`
- ❌ Not referenced in `package.json` scripts
- ✅ Uses React Router (not Next.js routing)
- ✅ Imports from `src/App.tsx` (Vite-style imports)

**Recommendation:**
- Likely part of a separate Vite-based frontend
- Keep if `src/App.tsx` and related files are used
- **Action:** Verify `src/` directory usage before deletion

### 3. `src/App.tsx`
**Location:** `/workspace/src/App.tsx`  
**Status:** ⚠️ Needs Verification  
**Reason:** Uses React Router and imports from `src/pages/`, suggesting a separate Vite app.

**Recommendation:**
- Check if `src/` directory is used for a separate frontend
- If unused, entire `src/` directory could be legacy
- **Action:** Team decision required

## Decision Matrix

| File | Next.js Usage | Vite Usage | Recommendation |
|------|--------------|------------|----------------|
| `index.html` | ❌ No | ✅ Yes (testing) | Keep for now |
| `src/main.tsx` | ❌ No | ✅ Yes (if Vite app exists) | Verify usage |
| `src/App.tsx` | ❌ No | ✅ Yes (if Vite app exists) | Verify usage |

## Next Steps

1. **Verify `src/` directory usage**
   - Check if `src/pages/` exists and is used
   - Check if there's a separate Vite build process
   - Review git history for context

2. **If unused:**
   - Move to `legacy/` directory
   - Or delete if confirmed unused
   - Update `.gitignore` if needed

3. **If used:**
   - Document the dual-build setup
   - Ensure both Next.js and Vite configs are maintained

---

**Status:** Awaiting team verification before deletion
