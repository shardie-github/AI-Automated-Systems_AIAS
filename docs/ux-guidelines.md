# UX Guidelines

**Version:** 1.0.0  
**Last Updated:** 2025-01-31  
**Status:** Active

---

## Overview

This document defines the UX standards for the AI Automated Systems platform, ensuring consistency, accessibility, and professional polish across all user interfaces.

---

## 1. Spacing Scale

### Base Unit
- **Base unit:** 4px (0.25rem)
- All spacing values are multiples of 4px

### Spacing Scale
```
0px   = 0      (no spacing)
4px   = 1      (0.25rem) - tight spacing
8px   = 2      (0.5rem)  - compact spacing
12px  = 3      (0.75rem) - default spacing
16px  = 4      (1rem)    - comfortable spacing
20px  = 5      (1.25rem) - relaxed spacing
24px  = 6      (1.5rem)  - section spacing
32px  = 8      (2rem)    - large section spacing
40px  = 10     (2.5rem)  - extra large spacing
48px  = 12     (3rem)    - hero spacing
64px  = 16     (4rem)    - page spacing
```

### Usage Guidelines
- **Between related elements:** 8px–12px
- **Between sections:** 24px–32px
- **Between major page sections:** 48px–64px
- **Card padding:** 16px–24px
- **Input padding:** 12px–16px
- **Button padding:** 12px–24px (horizontal), 10px–16px (vertical)

### Vertical Rhythm
- Maintain consistent vertical spacing between sections
- Use the spacing scale consistently across all components
- Avoid mixing spacing values (e.g., don't use 10px, 14px, 18px)

---

## 2. Typography Hierarchy

### Font Scale
```
h1: 2.5rem (40px) - Page titles, hero headlines
h2: 2rem (32px)   - Section headings
h3: 1.5rem (24px) - Subsection headings
h4: 1.25rem (20px) - Card titles, small sections
h5: 1.125rem (18px) - Labels, emphasis
h6: 1rem (16px)   - Small headings
body: 1rem (16px) - Default text
small: 0.875rem (14px) - Secondary text, captions
tiny: 0.75rem (12px) - Fine print, metadata
```

### Font Weights
- **Light (300):** Rarely used, for large display text only
- **Regular (400):** Default body text
- **Medium (500):** Emphasis, labels
- **Semibold (600):** Headings, important text
- **Bold (700):** Strong emphasis, CTAs

### Line Height
- **Headings:** 1.2–1.3 (tight)
- **Body text:** 1.5–1.6 (comfortable)
- **Small text:** 1.4–1.5

### Text Width Guidelines
- **Paragraphs:** 60–80 characters (max-width: 65ch)
- **Long-form content:** 50–75 characters
- **Avoid ultra-wide text blocks** (>90 characters)

### Visual Hierarchy Rules
1. **One H1 per page** (main page title)
2. **Logical heading order** (h1 → h2 → h3, no skipping levels)
3. **Consistent heading styles** across pages
4. **Clear contrast** between headings and body text

---

## 3. Layout Grid Rules

### Container Widths
- **Mobile:** Full width (with padding: 16px)
- **Tablet:** Max-width: 768px (padding: 24px)
- **Desktop:** Max-width: 1280px (padding: 32px)
- **Large desktop:** Max-width: 1536px (padding: 40px)

### Grid System
- **12-column grid** for complex layouts
- **Flexbox** for simple layouts
- **CSS Grid** for card grids and complex arrangements

### Alignment Rules
- **Snap to grid:** All elements align to 4px grid
- **Consistent padding:** Use spacing scale
- **No off-by-1px bugs:** Use whole pixel values
- **Visual alignment:** Related elements align visually

### Responsive Breakpoints
```
sm:  640px   (mobile landscape)
md:  768px   (tablet)
lg:  1024px  (desktop)
xl:  1280px  (large desktop)
2xl: 1536px  (extra large)
```

---

## 4. Motion & Interaction Guidelines

### Motion Principles
1. **Purposeful:** Motion should enhance understanding, not distract
2. **Subtle:** Keep animations under 300ms for most interactions
3. **Consistent:** Use the same easing curves and durations
4. **Accessible:** Respect `prefers-reduced-motion`

### Transition Durations
- **Micro-interactions:** 100–150ms (hover, focus)
- **Standard transitions:** 200–250ms (buttons, cards)
- **Page transitions:** 300–400ms (route changes)
- **Complex animations:** 500–800ms (entrance animations)

### Easing Curves
- **Standard:** `ease-out` or `cubic-bezier(0.4, 0, 0.2, 1)`
- **Entrance:** `ease-out` (smooth start, quick end)
- **Exit:** `ease-in` (quick start, smooth end)
- **Bounce:** Avoid unless specifically needed

### Interaction States

#### Buttons
- **Normal:** Base state
- **Hover:** Scale 1.02–1.05, shadow increase
- **Active:** Scale 0.95–0.98
- **Focus:** Visible outline (2px solid, 3:1 contrast)
- **Disabled:** Opacity 0.5, no interaction
- **Loading:** Spinner, disabled state

#### Links
- **Normal:** Base state
- **Hover:** Color change, underline (if applicable)
- **Focus:** Visible outline
- **Active:** Slight color darkening

#### Form Inputs
- **Normal:** Base state
- **Focus:** Border color change, shadow
- **Error:** Red border, error message visible
- **Success:** Green border (optional)
- **Disabled:** Opacity 0.5, no interaction

#### Cards
- **Normal:** Base state
- **Hover:** Shadow increase, slight lift (translateY: -2px to -4px)
- **Focus:** Visible outline (for interactive cards)
- **Active:** Slight scale down (if clickable)

### Reduced Motion
- **Always respect `prefers-reduced-motion`**
- Disable or minimize animations when user prefers reduced motion
- Use CSS: `@media (prefers-reduced-motion: reduce)`

---

## 5. Color & Contrast

### Contrast Requirements (WCAG 2.2 AA)
- **Normal text:** 4.5:1 contrast ratio minimum
- **Large text (18pt+ or 14pt+ bold):** 3:1 contrast ratio minimum
- **UI components:** 3:1 contrast ratio (borders, focus indicators)
- **Interactive elements:** Clear visual distinction

### Color Usage
- **Never rely on color alone** to convey information
- Use icons, text, or patterns in addition to color
- Ensure colorblind-friendly palettes
- Test with contrast checkers

---

## 6. Touch Targets & Interactive Elements

### Minimum Sizes
- **Touch targets:** 44×44px minimum (iOS/Android guidelines)
- **Clickable areas:** 44×44px minimum
- **Form inputs:** Minimum height 44px

### Spacing Between Targets
- **Minimum spacing:** 8px between interactive elements
- **Comfortable spacing:** 12px–16px preferred

---

## 7. Empty States

### Standard Empty State Template
1. **Icon/Illustration** (optional, 48px–64px)
2. **Headline** (h3 or h4, clear and actionable)
3. **Description** (1–2 sentences, helpful context)
4. **Primary CTA** (if applicable)
5. **Secondary action** (optional, e.g., "Learn more")

### Spacing
- **Icon to headline:** 16px–24px
- **Headline to description:** 8px–12px
- **Description to CTA:** 24px–32px

---

## 8. Error States

### Error Message Structure
1. **Clear error title** (what went wrong)
2. **Specific description** (why it happened, if helpful)
3. **Actionable next step** (how to fix it)
4. **Retry/refresh option** (if applicable)

### Visual Design
- **Error color:** Red/destructive color
- **Icon:** Alert icon (optional)
- **Contrast:** Ensure error text meets contrast requirements

---

## 9. Loading States

### Loading Patterns
1. **Skeleton loaders** (for content placeholders)
2. **Spinner** (for actions/operations)
3. **Progress bar** (for known progress)
4. **Shimmer effect** (for cards/lists)

### Best Practices
- **Show loading state immediately** (<100ms)
- **Provide context** (what is loading)
- **Avoid multiple spinners** on same screen
- **Use skeletons** for better perceived performance

---

## 10. Component Consistency

### Standard Patterns
- **Consistent padding** across similar components
- **Consistent border radius** (use design tokens)
- **Consistent shadows** (use elevation scale)
- **Consistent spacing** between elements

### Design Tokens
Use CSS variables or design tokens for:
- Colors
- Spacing
- Typography
- Shadows
- Border radius
- Transitions

---

## 11. Responsive Design

### Mobile-First Approach
1. **Design for mobile first**
2. **Progressive enhancement** for larger screens
3. **Touch-friendly** interactions
4. **Readable text** without zooming

### Breakpoint Strategy
- **Mobile:** < 768px
- **Tablet:** 768px – 1023px
- **Desktop:** 1024px+

### Responsive Patterns
- **Stack vertically** on mobile
- **Side-by-side** on desktop
- **Hide non-essential** content on mobile
- **Adaptive navigation** (hamburger menu on mobile)

---

## 12. Accessibility Considerations

### Keyboard Navigation
- **All interactive elements** must be keyboard accessible
- **Logical tab order** (visual order matches DOM order)
- **Visible focus indicators** (2px solid outline, 3:1 contrast)
- **Skip links** for main content

### Screen Readers
- **Semantic HTML** (use correct elements)
- **ARIA labels** for icon-only buttons
- **Descriptive alt text** for images
- **Live regions** for dynamic content

### Visual Accessibility
- **Color contrast** meets WCAG 2.2 AA
- **Text resize** up to 200% without loss of functionality
- **Focus indicators** visible and clear

---

## 13. Performance Considerations

### Optimization Rules
- **Lazy load** images and heavy components
- **Debounce** user inputs (search, filters)
- **Throttle** scroll events
- **Minimize** re-renders

### Perceived Performance
- **Show loading states** immediately
- **Use skeletons** instead of spinners where possible
- **Optimistic updates** for better UX
- **Progressive loading** for long lists

---

## 14. Implementation Checklist

### For Each Component
- [ ] Spacing follows the spacing scale
- [ ] Typography follows hierarchy rules
- [ ] Interaction states are implemented
- [ ] Motion respects reduced motion preference
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Touch targets meet minimum size
- [ ] Color contrast meets requirements
- [ ] Responsive design works on all breakpoints
- [ ] Empty/error/loading states are handled

---

## Resources

- **WCAG 2.2 Guidelines:** https://www.w3.org/WAI/WCAG22/quickref/
- **Material Design Guidelines:** https://material.io/design
- **Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines/
- **WebAIM:** https://webaim.org/

---

**Last Updated:** 2025-01-31  
**Next Review:** Quarterly or when design system updates
