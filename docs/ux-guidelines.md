# UX Guidelines

**Version:** 1.0.0  
**Last Updated:** 2025-02-01  
**Status:** Active - Phase 8

---

## Overview

This document defines the visual design system, spacing, typography, layout, motion, and interaction guidelines for the AI Automated Systems platform. These guidelines ensure consistency, accessibility, and professional polish across all user interfaces.

---

## 1. Spacing Scale

### Standard Spacing Units

We use a consistent spacing scale based on 4px increments:

```
xs:   4px   (0.25rem)  - Tight spacing, icon padding
sm:   8px   (0.5rem)   - Small gaps, tight groups
md:   12px  (0.75rem)  - Default gap between related elements
base: 16px  (1rem)     - Standard spacing, base unit
lg:   24px  (1.5rem)   - Section spacing, card padding
xl:   32px  (2rem)     - Large gaps, section breaks
2xl:  48px  (3rem)     - Major section separation
3xl:  64px  (4rem)     - Page-level spacing
4xl:  96px  (6rem)     - Hero sections, large breaks
```

### Usage Guidelines

- **Vertical spacing between sections:** `py-12` to `py-16` (48px-64px)
- **Card padding:** `p-6` (24px) for standard cards
- **Form field spacing:** `space-y-4` (16px) between fields
- **Button groups:** `gap-3` (12px) horizontal, `gap-4` (16px) vertical
- **Icon spacing:** `gap-2` (8px) for icons next to text

### Consistency Rules

- ✅ Use Tailwind spacing utilities consistently
- ✅ Avoid arbitrary values (`p-[13px]`) unless absolutely necessary
- ✅ Maintain visual rhythm: smaller gaps for related items, larger for sections
- ✅ Ensure touch targets have minimum 8px spacing between them

---

## 2. Typography Hierarchy

### Font Scale

```
h1: 3rem (48px)   - Page titles, hero headlines
h2: 2.25rem (36px) - Section headings
h3: 1.875rem (30px) - Subsection headings
h4: 1.5rem (24px)   - Card titles, component headings
h5: 1.25rem (20px)  - Small headings
h6: 1.125rem (18px) - Labels, small headings
body: 1rem (16px)    - Default body text
sm: 0.875rem (14px)  - Secondary text, captions
xs: 0.75rem (12px)   - Fine print, metadata
```

### Font Weights

```
light: 300    - Rarely used
normal: 400  - Body text
medium: 500  - Emphasis, labels
semibold: 600 - Headings, CTAs
bold: 700     - Strong emphasis, hero text
```

### Line Height

```
tight: 1.25   - Headings (h1-h3)
normal: 1.5   - Body text, paragraphs
relaxed: 1.75 - Long-form content, descriptions
```

### Text Width Guidelines

- **Paragraphs:** 60-80 characters (max-width: 65ch)
- **Headings:** No width restriction, but keep readable
- **Forms:** Full width on mobile, max-width on desktop
- **Cards:** Content width, not constrained

### Usage Examples

```tsx
// Page title
<h1 className="text-4xl font-bold tracking-tight">Page Title</h1>

// Section heading
<h2 className="text-3xl font-semibold mb-6">Section Heading</h2>

// Card title
<h3 className="text-2xl font-semibold">Card Title</h3>

// Body text
<p className="text-base leading-relaxed text-muted-foreground">
  Paragraph text with proper line height.
</p>

// Small text
<span className="text-sm text-muted-foreground">Caption text</span>
```

---

## 3. Layout Grid Rules

### Container System

- **Container:** `container mx-auto px-4` (max-width: 1280px on 2xl screens)
- **Padding:** `px-4` (16px) on mobile, `px-6` (24px) on desktop
- **Max content width:** 65ch for text-heavy content

### Grid Patterns

#### Two-Column Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Content */}
</div>
```

#### Three-Column Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content */}
</div>
```

#### Card Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

### Responsive Breakpoints

```
sm:  640px  - Small tablets
md:  768px  - Tablets
lg:  1024px - Small laptops
xl:  1280px - Desktops
2xl: 1536px - Large desktops
```

### Alignment Rules

- ✅ **Snap to grid:** Use consistent spacing utilities
- ✅ **Visual alignment:** Use flexbox/grid for consistent alignment
- ✅ **No off-by-1px bugs:** Use standard spacing values
- ✅ **Consistent padding:** Same padding values across similar components

---

## 4. Visual Hierarchy

### Color Usage

- **Primary:** Actions, links, important elements
- **Secondary:** Secondary actions, less important elements
- **Muted:** Supporting text, disabled states
- **Destructive:** Delete actions, errors
- **Accent:** Highlights, special elements

### Contrast Requirements (WCAG 2.2 AA)

- **Normal text:** 4.5:1 contrast ratio minimum
- **Large text (18px+):** 3:1 contrast ratio minimum
- **UI components:** 3:1 contrast ratio minimum
- **Focus indicators:** 3:1 contrast ratio minimum

### Visual Weight

1. **High:** Primary CTAs, important headings, alerts
2. **Medium:** Secondary actions, card titles, body text
3. **Low:** Muted text, captions, metadata

### Depth & Shadows

```
sm:  shadow-sm    - Subtle elevation, cards
md:  shadow-md    - Standard cards, buttons
lg:  shadow-lg    - Elevated cards, modals
xl:  shadow-xl    - High elevation, dropdowns
2xl: shadow-2xl   - Maximum elevation, modals
```

---

## 5. Motion & Interaction Guidelines

### Motion Principles

1. **Purposeful:** Motion should enhance understanding, not distract
2. **Subtle:** 100-200ms for micro-interactions
3. **Consistent:** Same easing curves and durations across UI
4. **Accessible:** Respect `prefers-reduced-motion`

### Standard Durations

- **Micro-interactions:** 100-150ms (hover, focus)
- **Standard transitions:** 200ms (buttons, cards)
- **Page transitions:** 300ms (entrance animations)
- **Complex animations:** 400-500ms (modals, complex states)

### Easing Curves

- **Standard:** `cubic-bezier(0.4, 0, 0.2, 1)` - Most interactions
- **Enter:** `cubic-bezier(0.0, 0, 0.2, 1)` - Entrances
- **Exit:** `cubic-bezier(0.4, 0, 1, 1)` - Exits

### Interaction States

All interactive elements must have consistent states:

#### Buttons
- **Default:** Base style
- **Hover:** Scale 1.02-1.05, shadow increase, color shift
- **Active:** Scale 0.95-0.98, pressed appearance
- **Focus:** 2px solid outline, 2px offset
- **Disabled:** Opacity 0.5, no pointer events, no hover

#### Links
- **Default:** Primary color
- **Hover:** Underline or color shift
- **Focus:** 2px solid outline
- **Visited:** Slightly muted color

#### Form Inputs
- **Default:** Border, background
- **Focus:** Ring 2px, border color change
- **Error:** Red border, red ring
- **Success:** Green border, green ring
- **Disabled:** Opacity 0.5, muted appearance

#### Cards
- **Default:** Subtle shadow
- **Hover:** Shadow increase, slight lift (-2px translateY)
- **Focus:** Ring outline (if interactive)

### Motion Examples

```tsx
// Button hover
className="transition-all duration-200 hover:scale-105 hover:shadow-lg"

// Card hover
className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1"

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
>
```

---

## 6. Component Patterns

### Cards

**Standard Card:**
- Padding: `p-6` (24px)
- Border radius: `rounded-xl` (14px)
- Shadow: `shadow-sm` default, `shadow-lg` hover
- Border: `border border-border`

**Card Spacing:**
- Between cards: `gap-6` (24px)
- Card content: `space-y-4` (16px) vertical

### Buttons

**Sizes:**
- `sm`: `h-9 px-4` (36px height)
- `md`: `h-10 px-5` (40px height) - default
- `lg`: `h-12 px-8` (48px height)
- `xl`: `h-14 px-10` (56px height)

**Touch Targets:**
- Minimum: 44×44px (WCAG 2.2 AA)
- Spacing between: 8px minimum

### Forms

**Field Spacing:**
- Between fields: `space-y-4` (16px)
- Label to input: `mb-2` (8px)
- Error message: `mt-2` (8px) below input

**Input Heights:**
- Standard: `h-11` (44px) - meets touch target minimum
- Large: `h-12` (48px)

### Navigation

**Link Spacing:**
- Horizontal nav: `px-3 py-2` (12px horizontal, 8px vertical)
- Vertical nav: `py-2 px-4` (8px vertical, 16px horizontal)
- Touch target: Minimum 44×44px

---

## 7. Empty States

### Standard Template

```tsx
<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
  {/* Icon (optional) */}
  <Icon className="mb-6 text-muted-foreground" />
  
  {/* Headline */}
  <h3 className="text-xl font-semibold mb-3">No items yet</h3>
  
  {/* Description */}
  <p className="text-sm text-muted-foreground mb-8 max-w-md">
    Description text explaining the empty state.
  </p>
  
  {/* CTA (optional) */}
  <Button>Create First Item</Button>
</div>
```

### Spacing
- Vertical padding: `py-12` (48px)
- Icon margin: `mb-6` (24px)
- Headline margin: `mb-3` (12px)
- Description margin: `mb-8` (32px)

---

## 8. Error States

### Standard Template

```tsx
<div className="rounded-xl border border-destructive bg-destructive/10 p-6">
  <div className="flex items-center gap-3 mb-2">
    <AlertCircle className="h-5 w-5 text-destructive" />
    <h3 className="text-lg font-semibold text-destructive">Error Title</h3>
  </div>
  <p className="text-sm text-muted-foreground mb-4">
    Error description with actionable guidance.
  </p>
  <Button variant="outline" onClick={onRetry}>
    Try Again
  </Button>
</div>
```

---

## 9. Loading States

### Skeletons

- Use skeleton loaders for content that's loading
- Match the shape of the actual content
- Subtle shimmer animation (respects reduced motion)

### Spinners

- Use for actions (buttons, forms)
- Size: `h-4 w-4` for buttons, `h-6 w-6` for standalone
- Color: Match the context (primary, muted, etc.)

---

## 10. Responsive Design

### Mobile-First Approach

1. **Design for mobile first** (320px+)
2. **Progressive enhancement** for larger screens
3. **Touch-friendly:** Minimum 44×44px touch targets
4. **Readable:** Minimum 16px font size

### Breakpoint Strategy

- **Mobile:** Default styles (no prefix)
- **Tablet:** `md:` prefix (768px+)
- **Desktop:** `lg:` prefix (1024px+)
- **Large Desktop:** `xl:` prefix (1280px+)

### Common Patterns

```tsx
// Responsive grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Responsive text
className="text-2xl md:text-3xl lg:text-4xl"

// Responsive spacing
className="py-8 md:py-12 lg:py-16"

// Responsive visibility
className="hidden md:block"
```

---

## 11. Accessibility Considerations

### Focus Management

- **Visible focus:** 2px solid outline, 2px offset
- **Focus order:** Logical tab order matches visual order
- **Skip links:** Provide skip-to-content links
- **Focus trapping:** Trap focus in modals

### Color & Contrast

- **Text contrast:** 4.5:1 for normal text, 3:1 for large text
- **UI contrast:** 3:1 for interactive elements
- **Don't rely on color alone:** Use icons, labels, patterns

### Motion

- **Respect reduced motion:** Check `prefers-reduced-motion`
- **Subtle animations:** Keep motion minimal and purposeful
- **No auto-playing:** Don't auto-play distracting animations

### Touch Targets

- **Minimum size:** 44×44px
- **Spacing:** 8px minimum between targets
- **Hit area:** Can extend beyond visible bounds

---

## 12. Design Tokens

### Colors (from CSS variables)

```css
--bg: Background color
--fg: Foreground/text color
--muted: Muted background/text
--card: Card background
--primary: Primary brand color
--secondary: Secondary color
--accent: Accent color
--destructive: Error/danger color
--border: Border color
--ring: Focus ring color
```

### Border Radius

```css
--radius: 14px (base)
lg: 14px
xl: 18px
2xl: 22px
```

### Shadows

- Use Tailwind shadow utilities
- Consistent shadow system across components

---

## 13. Quality Checklist

### For Each Component/Page

- [ ] Consistent spacing (using standard scale)
- [ ] Proper typography hierarchy
- [ ] All interactive elements have hover/focus/active states
- [ ] Touch targets meet 44×44px minimum
- [ ] Color contrast meets WCAG 2.2 AA
- [ ] Motion respects reduced motion preference
- [ ] Responsive across breakpoints
- [ ] Visual alignment is consistent
- [ ] No off-by-1px alignment issues
- [ ] Empty/error/loading states are polished

---

## 14. Resources

- **Tailwind CSS:** https://tailwindcss.com/docs
- **Framer Motion:** https://www.framer.com/motion/
- **WCAG 2.2:** https://www.w3.org/WAI/WCAG22/quickref/
- **Material Design:** https://material.io/design
- **Human Interface Guidelines:** https://developer.apple.com/design/

---

**Last Updated:** 2025-02-01  
**Next Review:** Quarterly or when design system updates  
**Status:** Active - Phase 8
