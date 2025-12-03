# Internationalization (i18n) Architecture

**Version:** 1.0.0  
**Last Updated:** 2025-01-31  
**Status:** Active

---

## Overview

This document describes the internationalization (i18n) architecture for the AI Automated Systems platform. The system supports multiple languages and is designed for easy expansion to additional locales.

---

## 1. Architecture Overview

### Current Setup
- **Framework:** react-i18next (i18next)
- **Language Detection:** Browser language detection with localStorage persistence
- **Fallback Language:** English (en)
- **Supported Languages:** English (en), Spanish (es)

### Technology Stack
- `i18next`: Core i18n framework
- `react-i18next`: React bindings for i18next
- `i18next-browser-languagedetector`: Automatic language detection

---

## 2. Folder Structure

```
src/
  lib/
    i18n.ts              # i18n configuration and initialization
ops/
  i18n/
    utils.ts            # i18n utility functions
i18n/                    # Translation files (future structure)
  en/
    common.json          # Common translations
    navigation.json      # Navigation translations
    forms.json           # Form translations
    errors.json          # Error messages
    success.json         # Success messages
  es/
    common.json          # Spanish translations
    navigation.json
    forms.json
    errors.json
    success.json
```

**Note:** Currently, translations are embedded in `src/lib/i18n.ts`. Future refactoring will move them to separate JSON files in the `i18n/` directory.

---

## 3. Translation Key Structure

### Namespace Organization
Translations are organized into namespaces for better organization:

- **nav:** Navigation items
- **common:** Common UI elements (buttons, labels, etc.)
- **forms:** Form labels, placeholders, validation messages
- **auth:** Authentication-related text
- **dashboard:** Dashboard-specific text
- **platform:** Platform features and terminology
- **pricing:** Pricing page content
- **errors:** Error messages
- **success:** Success messages
- **time:** Time and date formatting
- **upload:** File upload messages
- **ai:** AI feature labels

### Key Naming Convention
- **Use dot notation:** `namespace.key` (e.g., `common.save`, `forms.email`)
- **Be descriptive:** `forms.emailRequired` not `forms.error1`
- **Group related keys:** `errors.networkError`, `errors.networkErrorDescription`

### Example Structure
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "forms": {
    "email": "Email",
    "emailRequired": "Email is required",
    "emailInvalid": "Please enter a valid email address"
  }
}
```

---

## 4. Usage Patterns

### Basic Usage (React Component)

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### With Interpolation

```tsx
const { t } = useTranslation();

// Translation: "Welcome back, {{name}}!"
t('dashboard.welcome', { name: 'John' })
```

### With Pluralization

```tsx
// Translation: "{{count}} project" / "{{count}} projects"
t('common.projectCount', { count: 1 })  // "1 project"
t('common.projectCount', { count: 5 })  // "5 projects"
```

### Using the Custom Hook

```tsx
import { useT } from '@/src/lib/i18n';

function MyComponent() {
  const t = useT();
  
  return <button>{t('common.save')}</button>;
}
```

---

## 5. Component Usage Patterns

### Buttons
```tsx
import { useTranslation } from 'react-i18next';

function SaveButton() {
  const { t } = useTranslation();
  return <button>{t('common.save')}</button>;
}
```

### Form Labels
```tsx
import { useTranslation } from 'react-i18next';

function EmailInput() {
  const { t } = useTranslation();
  return (
    <div>
      <label>{t('forms.email')}</label>
      <input 
        type="email" 
        placeholder={t('forms.emailPlaceholder')}
      />
    </div>
  );
}
```

### Error Messages
```tsx
import { useTranslation } from 'react-i18next';

function ErrorDisplay({ error }) {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t(`errors.${error.type}`, { ...error.params })}</p>
    </div>
  );
}
```

---

## 6. Language Detection

### Detection Order
1. **localStorage:** Previously selected language
2. **navigator:** Browser language preference
3. **htmlTag:** HTML lang attribute
4. **fallback:** English (en)

### Changing Language

```tsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <select onChange={(e) => changeLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}
```

### Programmatic Language Change

```tsx
import { changeLanguage } from '@/src/lib/i18n';

// Change to Spanish
changeLanguage('es');

// Get current language
import { getCurrentLanguage } from '@/src/lib/i18n';
const currentLang = getCurrentLanguage(); // 'en' or 'es'
```

---

## 7. Adding New Languages

### Step 1: Add Translation Resources

In `src/lib/i18n.ts`, add a new language object:

```typescript
const resources = {
  en: { translation: { ... } },
  es: { translation: { ... } },
  fr: {  // New language
    translation: {
      common: {
        save: "Enregistrer",
        cancel: "Annuler",
        // ... more translations
      },
      // ... other namespaces
    },
  },
};
```

### Step 2: Update Language Switcher

Add the new language to any language switcher components.

### Step 3: Test

- Test all pages with the new language
- Verify all keys are translated
- Check for missing translations (fallback to English)

---

## 8. Translation Key Extraction

### Utility Function

The `ops/i18n/utils.ts` file includes utilities for:
- **Extracting keys** from source code
- **Validating** translation completeness
- **Generating CSV** for translation workflows

### Extracting Keys

```typescript
import { i18n } from '@/ops/i18n/utils';

const sourceCode = `
  const { t } = useTranslation();
  t('common.save');
  t('forms.email');
`;

const keys = i18n.extractKeys(sourceCode);
// ['common.save', 'forms.email']
```

### Validating Translations

```typescript
const { missing } = i18n.validateKeys('es');
// Returns array of missing keys in Spanish
```

---

## 9. Best Practices

### 1. Externalize All User-Facing Strings
- **Never hardcode** user-facing text in components
- **Use translation keys** for all labels, messages, placeholders
- **Include context** in translation keys when needed

### 2. Use Descriptive Keys
- ✅ **Good:** `forms.emailRequired`
- ❌ **Bad:** `forms.error1`

### 3. Provide Context for Translators
- Add comments in translation files
- Use clear key names
- Group related translations

### 4. Handle Pluralization
- Use ICU MessageFormat for pluralization
- Example: `{count} project` / `{count} projects`

### 5. Test All Languages
- Test UI with all supported languages
- Check for text overflow (some languages are longer)
- Verify date/time formatting

### 6. Keep Translations Updated
- Update translations when adding new features
- Review translations for accuracy
- Maintain consistency across languages

---

## 10. RTL (Right-to-Left) Readiness

### Current Status
- **RTL not yet implemented**
- Layout direction is set in `app/layout.tsx`:
  ```tsx
  const isRTL = false;
  <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
  ```

### Future RTL Support

When adding RTL languages (e.g., Arabic, Hebrew):

1. **Update layout.tsx** to detect RTL languages
2. **Test all components** for RTL layout
3. **Adjust CSS** for RTL (use logical properties: `margin-inline-start` instead of `margin-left`)
4. **Flip icons** that are directional (arrows, etc.)

### RTL Considerations
- **Layout direction:** Use `dir="rtl"` on HTML element
- **CSS:** Use logical properties (`margin-inline-start`, `padding-inline-end`)
- **Icons:** Flip directional icons for RTL
- **Text alignment:** Default to `text-align: start` not `left`

---

## 11. Date & Time Formatting

### Current Approach
- Use browser's `Intl` API for date/time formatting
- Respect user's locale settings

### Example

```tsx
const date = new Date();
const formatted = new Intl.DateTimeFormat(i18n.language, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(date);
```

### Future Enhancement
- Consider using a date library (date-fns, dayjs) with i18n support
- Centralize date formatting utilities

---

## 12. Number Formatting

### Current Approach
- Use browser's `Intl` API for number formatting

### Example

```tsx
const number = 1234.56;
const formatted = new Intl.NumberFormat(i18n.language, {
  style: 'currency',
  currency: 'USD',
}).format(number);
```

---

## 13. Translation Workflow

### For Developers
1. **Add translation keys** to `src/lib/i18n.ts`
2. **Use keys in components** with `useTranslation()`
3. **Test with all languages**

### For Translators
1. **Extract translation keys** using utilities
2. **Translate keys** in translation files
3. **Validate completeness** using validation utilities
4. **Test translations** in the application

### Future: Translation Management
- Consider using a translation management platform (e.g., Crowdin, Lokalise)
- Set up CI/CD for translation sync
- Automate translation key extraction

---

## 14. Migration to JSON Files

### Current State
- Translations are embedded in `src/lib/i18n.ts`

### Future State
- Move translations to separate JSON files in `i18n/` directory
- Load translations dynamically
- Support lazy loading of translations

### Migration Steps
1. Create `i18n/en/` and `i18n/es/` directories
2. Split translations into namespaced JSON files
3. Update `i18n.ts` to load from JSON files
4. Test all pages

---

## 15. Testing

### Manual Testing
- Test all pages with each supported language
- Verify translations are correct
- Check for missing translations (fallback behavior)
- Test language switching

### Automated Testing
- Consider adding i18n tests
- Test translation key extraction
- Validate translation completeness

---

## 16. Resources

- **react-i18next Documentation:** https://react.i18next.com/
- **i18next Documentation:** https://www.i18next.com/
- **ICU MessageFormat:** https://formatjs.io/docs/core-concepts/icu-syntax/

---

## 17. Component: Language Switcher

### Basic Implementation

```tsx
"use client";

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ];
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={currentLang === lang.code ? 'default' : 'outline'}
          size="sm"
          onClick={() => changeLanguage(lang.code)}
          aria-label={`Switch to ${lang.label}`}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
}
```

---

**Last Updated:** 2025-01-31  
**Next Review:** Quarterly or when adding new languages
