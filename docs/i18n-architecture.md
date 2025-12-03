# Internationalization (i18n) Architecture

**Version:** 1.0.0  
**Last Updated:** 2025-02-01  
**Status:** Active - Phase 8

---

## Overview

This document describes the internationalization (i18n) architecture for the AI Automated Systems platform. The system supports multiple languages and is designed for easy expansion to additional locales.

---

## 1. Architecture Overview

### Technology Stack

- **i18next:** Core internationalization framework
- **react-i18next:** React bindings for i18next
- **i18next-browser-languagedetector:** Automatic language detection

### Current Languages

- **English (en):** Default language
- **Spanish (es):** Secondary language

### Future Languages

The architecture supports easy addition of new languages. To add a language:

1. Create locale file: `/public/locales/{locale}/translation.json`
2. Add language to `LanguageSwitcher` component
3. Update language detection configuration

---

## 2. Folder Structure

```
/public
  /locales
    /en
      translation.json    # English translations
    /es
      translation.json    # Spanish translations
    /fr
      translation.json    # French (future)
    /de
      translation.json    # German (future)

/src
  /lib
    i18n.ts              # i18n configuration and initialization

/components
  /ui
    language-switcher.tsx # Language selection component
```

---

## 3. Translation Key Structure

### Namespace Organization

Translations are organized into logical namespaces:

```json
{
  "nav": { ... },           // Navigation items
  "common": { ... },        // Common UI elements
  "forms": { ... },         // Form labels and errors
  "auth": { ... },         // Authentication
  "dashboard": { ... },     // Dashboard
  "platform": { ... },     // Platform features
  "pricing": { ... },       // Pricing
  "errors": { ... },       // Error messages
  "success": { ... },       // Success messages
  "time": { ... },          // Time and date
  "upload": { ... },        // File upload
  "ai": { ... }             // AI features
}
```

### Key Naming Convention

- **Use dot notation:** `nav.home`, `forms.email`
- **Be descriptive:** `errors.pageNotFound` not `errors.notFound`
- **Group logically:** Related keys in same namespace
- **Use camelCase:** `getStarted` not `get_started`

### Example Structure

```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "services": "Services"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "save": "Save",
    "cancel": "Cancel"
  },
  "forms": {
    "required": "This field is required",
    "email": "Please enter a valid email address"
  }
}
```

---

## 4. Component Usage Patterns

### Basic Translation Hook

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Translation with Variables

```tsx
const { t } = useTranslation();

// Translation: "Welcome back, {{name}}!"
<h1>{t('dashboard.welcome', { name: 'John' })}</h1>

// Translation: "Save {{percent}}%"
<span>{t('pricing.save', { percent: 20 })}</span>
```

### Pluralization

```tsx
// Translation supports plural forms
// "{{count}} project" vs "{{count}} projects"
<span>{t('time.days', { count: 1 })}</span>      // "1 day"
<span>{t('time.days', { count: 5 })}</span>      // "5 days"
```

### Conditional Translation

```tsx
const { t, i18n } = useTranslation();
const isEnglish = i18n.language === 'en';

// Use different translations based on context
const message = isEnglish 
  ? t('common.welcome') 
  : t('common.bienvenido');
```

---

## 5. Language Detection

### Detection Order

1. **localStorage:** User's saved preference
2. **navigator:** Browser language
3. **htmlTag:** HTML lang attribute

### Configuration

```typescript
detection: {
  order: ['localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage'],
}
```

### Manual Language Change

```tsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <button onClick={() => changeLanguage('es')}>
      Switch to Spanish
    </button>
  );
}
```

---

## 6. Translation File Format

### JSON Structure

```json
{
  "translation": {
    "namespace": {
      "key": "Value",
      "keyWithVariable": "Value with {{variable}}",
      "key_plural": "Plural form",
      "key_plural_other": "Other plural form"
    }
  }
}
```

### Example Translation File

```json
{
  "translation": {
    "nav": {
      "home": "Home",
      "about": "About"
    },
    "common": {
      "loading": "Loading...",
      "save": "Save Changes"
    },
    "forms": {
      "required": "This field is required",
      "email": "Please enter a valid email address"
    },
    "time": {
      "days": "{{count}} day",
      "days_plural": "{{count}} days"
    }
  }
}
```

---

## 7. Best Practices

### Do's ✅

1. **Externalize all user-facing strings**
   - Never hardcode text in components
   - Use translation keys for all visible text

2. **Use descriptive keys**
   - `errors.pageNotFound` not `errors.notFound`
   - `forms.emailRequired` not `forms.email`

3. **Group related translations**
   - Keep related keys in same namespace
   - Use logical grouping (nav, forms, errors)

4. **Provide context in keys**
   - `buttons.saveChanges` not `buttons.save`
   - `errors.invalidEmail` not `errors.invalid`

5. **Use variables for dynamic content**
   - `"Welcome, {{name}}"` not separate translations
   - `"{{count}} items"` with pluralization

6. **Test translations**
   - Verify all keys are translated
   - Check for missing translations
   - Test with different languages

### Don'ts ❌

1. **Don't hardcode text**
   ```tsx
   // ❌ Bad
   <button>Save</button>
   
   // ✅ Good
   <button>{t('common.save')}</button>
   ```

2. **Don't use generic keys**
   ```tsx
   // ❌ Bad
   t('error')
   
   // ✅ Good
   t('errors.pageNotFound')
   ```

3. **Don't concatenate translations**
   ```tsx
   // ❌ Bad
   {t('common.save') + ' ' + t('common.changes')}
   
   // ✅ Good
   {t('common.saveChanges')}
   ```

4. **Don't forget context**
   ```tsx
   // ❌ Bad
   t('button')
   
   // ✅ Good
   t('buttons.createProject')
   ```

---

## 8. Adding a New Language

### Step 1: Create Translation File

Create `/public/locales/{locale}/translation.json`:

```json
{
  "translation": {
    "nav": {
      "home": "Accueil",
      "about": "À propos"
    }
    // ... rest of translations
  }
}
```

### Step 2: Update Language Switcher

Add language to `LanguageSwitcher` component:

```tsx
const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' }, // New
];
```

### Step 3: Update i18n Configuration

Add language to resources in `src/lib/i18n.ts`:

```typescript
import frTranslation from '/public/locales/fr/translation.json';

const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
  fr: { translation: frTranslation }, // New
};
```

### Step 4: Test

1. Switch to new language
2. Verify all translations appear
3. Check for missing keys
4. Test pluralization if applicable

---

## 9. RTL (Right-to-Left) Support

### Current Status

Currently supports LTR (Left-to-Right) languages only. RTL support can be added for languages like Arabic, Hebrew.

### Implementation Plan

1. **Detect RTL languages**
   ```typescript
   const rtlLanguages = ['ar', 'he', 'fa'];
   const isRTL = rtlLanguages.includes(i18n.language);
   ```

2. **Set HTML dir attribute**
   ```tsx
   <html dir={isRTL ? 'rtl' : 'ltr'} lang={i18n.language}>
   ```

3. **Update CSS for RTL**
   ```css
   [dir="rtl"] {
     /* RTL-specific styles */
   }
   ```

4. **Test layout**
   - Verify text alignment
   - Check icon positioning
   - Test navigation flow

---

## 10. Translation Management

### Key Extraction

Use tools to extract translation keys from code:

```bash
# Example: Extract all t() calls
grep -r "t('" --include="*.tsx" --include="*.ts"
```

### Missing Translation Detection

```typescript
// Check for missing translations
const missingKeys = Object.keys(enTranslations).filter(
  key => !esTranslations[key]
);
```

### Translation Review Process

1. **Extract keys** from code
2. **Create translation files** for new language
3. **Review translations** with native speakers
4. **Test** in application
5. **Update** as needed

---

## 11. Performance Considerations

### Lazy Loading

Load translations only when needed:

```typescript
// Lazy load translation files
const loadTranslation = async (locale: string) => {
  const translation = await import(`/public/locales/${locale}/translation.json`);
  i18n.addResourceBundle(locale, 'translation', translation);
};
```

### Bundle Size

- Keep translation files focused
- Remove unused translations
- Consider code splitting for large translation files

---

## 12. Testing

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useTranslation } from 'react-i18next';

test('translates key correctly', () => {
  const { result } = renderHook(() => useTranslation());
  expect(result.current.t('nav.home')).toBe('Home');
});
```

### Integration Tests

```typescript
test('language switcher changes language', async () => {
  const { getByText } = render(<LanguageSwitcher />);
  fireEvent.click(getByText('Español'));
  await waitFor(() => {
    expect(i18n.language).toBe('es');
  });
});
```

---

## 13. Common Patterns

### Empty States

```tsx
<EmptyState
  title={t('empty.noProjects')}
  description={t('empty.noProjectsDescription')}
  action={{
    label: t('common.createProject'),
    onClick: handleCreate
  }}
/>
```

### Error Messages

```tsx
<ErrorState
  title={t('errors.pageNotFound')}
  message={t('errors.pageNotFoundDescription')}
  onRetry={() => t('common.tryAgain')}
/>
```

### Form Labels

```tsx
<Label>{t('forms.email')}</Label>
<Input 
  placeholder={t('forms.emailPlaceholder')}
  aria-label={t('forms.email')}
/>
{error && <span>{t('forms.emailRequired')}</span>}
```

---

## 14. Resources

- **i18next Documentation:** https://www.i18next.com/
- **react-i18next:** https://react.i18next.com/
- **ICU MessageFormat:** https://formatjs.io/docs/core-concepts/icu-syntax/
- **Language Codes:** https://www.loc.gov/standards/iso639-2/php/code_list.php

---

## 15. Migration Guide

### From Hardcoded Strings to Translations

1. **Identify hardcoded strings**
   ```tsx
   // Before
   <button>Save Changes</button>
   ```

2. **Add translation key**
   ```json
   {
     "common": {
       "saveChanges": "Save Changes"
     }
   }
   ```

3. **Update component**
   ```tsx
   // After
   const { t } = useTranslation();
   <button>{t('common.saveChanges')}</button>
   ```

4. **Test**
   - Verify translation appears
   - Test language switching
   - Check for missing keys

---

**Last Updated:** 2025-02-01  
**Next Review:** Quarterly or when adding new languages  
**Status:** Active - Phase 8
