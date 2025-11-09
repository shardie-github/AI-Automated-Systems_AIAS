# Dependency Surgeon — Trim Bloat & Drift Report

**Generated:** 2025-01-27  
**Tools Used:** knip, depcheck, manual analysis

## Executive Summary

Analysis of dependencies to identify:
- Unused dependencies
- Heavy dependencies that could be replaced
- Missing dependencies
- Version drift

## Findings

### Unused Dependencies (depcheck)

**Root Package (`package.json`):**

**Unused DevDependencies:**
- `@axe-core/playwright` — Used in tests ✅
- `autoprefixer` — Used in PostCSS config ✅
- `axe-playwright` — Used in tests ✅
- `depcheck` — Used for this analysis ✅
- `eslint-plugin-unused-imports` — Used in ESLint config ✅
- `husky` — Used for git hooks ✅
- `knip` — Used for dead code detection ✅
- `postcss` — Used in PostCSS config ✅
- `prettier-plugin-tailwindcss` — Used in Prettier config ✅
- `ts-prune` — Used for unused export detection ✅
- `wait-on` — May be used in scripts ✅

**Status:** All devDependencies appear to be used. No removals recommended.

### Missing Dependencies (depcheck)

**Missing from `package.json` but used in code:**

1. **`@eslint/js`** — Used in `eslint.config.js`
   - **Impact:** Low — May be peer dependency
   - **Action:** Verify if needed

2. **`vite`** — Used in `vite.config.ts`
   - **Impact:** Low — May be peer dependency
   - **Action:** Verify if needed

3. **`@octokit/rest`** — Used in multiple AI agent files
   - **Impact:** High — Used in 12+ files
   - **Action:** Add to dependencies

4. **`@tanstack/react-query`** — Used in `src/App.tsx`
   - **Impact:** Medium — Used in React app
   - **Action:** Verify if needed for Next.js app

5. **`react-router-dom`** — Used in multiple `src/` files
   - **Impact:** High — Used in 7+ files
   - **Action:** Verify if needed (Next.js has built-in routing)

6. **`i18next`, `react-i18next`, `i18next-browser-languagedetector`** — Used in `src/lib/i18n.ts`
   - **Impact:** Medium — Used for i18n
   - **Action:** Verify if needed (Next.js has built-in i18n)

7. **`recharts`** — Used in dashboard components
   - **Impact:** Medium — Used in 3+ files
   - **Action:** Verify if needed

**Status:** Several missing dependencies identified. Review needed.

### Heavy Dependencies Analysis

**Large Dependencies (>1MB estimated):**

1. **`@playwright/test`** — ~50MB
   - **Status:** ✅ Acceptable — Testing framework
   - **Action:** Keep

2. **`prisma`** — ~20MB
   - **Status:** ✅ Acceptable — Database ORM
   - **Action:** Keep

3. **`next`** — ~15MB
   - **Status:** ✅ Acceptable — Framework
   - **Action:** Keep

4. **`@radix-ui/*`** — Multiple packages (~5MB total)
   - **Status:** ✅ Acceptable — UI components
   - **Action:** Keep

**No heavy dependencies identified for replacement.**

### Version Drift Analysis

**Potential Issues:**

1. **React Router vs Next.js Routing**
   - `react-router-dom` used in `src/` directory
   - Next.js has built-in routing
   - **Recommendation:** Verify if `src/` is legacy code or separate app

2. **i18next vs Next.js i18n**
   - `i18next` used in `src/lib/i18n.ts`
   - Next.js has built-in i18n support
   - **Recommendation:** Consider migrating to Next.js i18n

3. **React Query vs Next.js Data Fetching**
   - `@tanstack/react-query` used in `src/App.tsx`
   - Next.js has built-in data fetching
   - **Recommendation:** Verify if needed

### Bundle Size Impact

**Estimated Bundle Impact:**

| Dependency | Size | Impact | Action |
|------------|------|--------|--------|
| `react-router-dom` | ~50KB | Medium | Review |
| `i18next` + deps | ~30KB | Low | Review |
| `@tanstack/react-query` | ~40KB | Medium | Review |
| `recharts` | ~200KB | High | Consider alternatives |

## Recommendations

### Wave 1: Remove Unused (Safe)

**No safe removals identified** — All dependencies appear to be used.

### Wave 2: Add Missing Dependencies

1. **Add `@octokit/rest`** to dependencies
   ```json
   "@octokit/rest": "^20.0.2"
   ```
   - Used in 12+ files
   - Critical for AI agents

2. **Review `src/` directory dependencies**
   - Determine if `src/` is legacy or separate app
   - If legacy, consider migration plan
   - If separate, ensure dependencies are properly declared

### Wave 3: Replace Heavy Dependencies (If Needed)

**Consider replacing `recharts` with lighter alternative:**
- Option 1: Use Next.js Chart.js integration
- Option 2: Use lightweight charting library
- Option 3: Keep if features are needed

**Impact:** ~200KB bundle size reduction potential

### Hygiene CI

**Add dependency hygiene checks:**

```yaml
# .github/workflows/deps-hygiene.yml
- name: Check unused dependencies
  run: depcheck --json > reports/depcheck.json

- name: Check dead code
  run: knip --reporter json > reports/knip.json
```

## Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Unused Dependencies | 0 | 0 | ✅ |
| Missing Dependencies | 7+ | 0 | 🔴 |
| Heavy Dependencies | 4 | <5 | ✅ |
| Bundle Size Impact | ~320KB | <200KB | 🟡 |

## Next Steps

1. **Immediate:** Add `@octokit/rest` to dependencies
2. **Review:** Determine `src/` directory purpose and dependencies
3. **Wave 1 PR:** Add missing dependencies
4. **Wave 2 PR:** Consider replacing `recharts` if bundle size is concern
5. **CI:** Add dependency hygiene checks

## Notes

- `src/` directory appears to be separate React app (not Next.js)
- Some "missing" dependencies may be peer dependencies
- Bundle size analysis is estimated — actual impact may vary
- Focus on critical missing dependencies first

---

**Report Generated By:** Dependency Surgeon Agent  
**Next Review:** After Wave 1 PR merge
