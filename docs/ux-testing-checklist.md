# UX Testing Checklist

This checklist helps ensure consistent user experience across all pages and flows.

## First-Time Visitor Experience

### Homepage
- [ ] Clear value proposition visible above the fold
- [ ] Primary CTA is prominent and clear
- [ ] Navigation is intuitive and accessible
- [ ] Trust signals visible (testimonials, badges, stats)
- [ ] Mobile layout is readable and functional
- [ ] Page loads quickly (< 3 seconds)
- [ ] No console errors or warnings

### Sign-Up Flow
- [ ] Form is clear and easy to understand
- [ ] Validation messages are helpful, not technical
- [ ] Error states are clear and actionable
- [ ] Success state provides next steps
- [ ] Loading states show progress
- [ ] Mobile form is usable (no horizontal scroll)
- [ ] Keyboard navigation works throughout

### Onboarding
- [ ] Steps are clearly numbered or indicated
- [ ] Progress indicator shows completion
- [ ] Each step has clear instructions
- [ ] Can skip optional steps
- [ ] Can go back to previous steps
- [ ] Success celebration is appropriate
- [ ] Next steps are clear after completion

## Returning User Experience

### Dashboard
- [ ] Quick access to most-used features
- [ ] Clear navigation to all sections
- [ ] Data loads with appropriate loading states
- [ ] Empty states are helpful, not just "no data"
- [ ] Error states allow recovery
- [ ] Mobile dashboard is functional

### Forms & Inputs
- [ ] Labels are clear and descriptive
- [ ] Placeholder text is helpful
- [ ] Validation happens at appropriate times
- [ ] Error messages are specific and actionable
- [ ] Success feedback is clear
- [ ] Required fields are marked
- [ ] Help text is available where needed

## Error Handling

### Error Messages
- [ ] Use plain language, not technical jargon
- [ ] Explain what went wrong
- [ ] Suggest how to fix it
- [ ] Provide a clear action (retry, go back, contact support)
- [ ] Don't blame the user

### Error States
- [ ] Visual indicator (icon, color)
- [ ] Clear heading
- [ ] Helpful message
- [ ] Action button (retry, go back, etc.)
- [ ] Accessible (screen reader friendly)

### Loading States
- [ ] Show progress indicator
- [ ] Use descriptive text ("Loading your workflows..." not just "Loading...")
- [ ] Don't block entire UI unnecessarily
- [ ] Skeleton screens for content that takes time

## Mobile Experience

### Responsive Design
- [ ] No horizontal scrolling
- [ ] Touch targets are at least 44x44px
- [ ] Text is readable without zooming
- [ ] Forms are usable on mobile
- [ ] Navigation is accessible (hamburger menu works)
- [ ] Images scale appropriately

### Performance
- [ ] Page loads in < 3 seconds on 3G
- [ ] Images are optimized
- [ ] No layout shift during load
- [ ] Smooth scrolling

## Accessibility

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Can complete all tasks with keyboard only
- [ ] Escape key closes modals/dialogs

### Screen Readers
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text
- [ ] Headings are in logical order
- [ ] Landmarks are properly marked
- [ ] ARIA labels where needed

### Visual
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Information isn't conveyed by color alone
- [ ] Focus indicators are visible
- [ ] Text is resizable up to 200%

## Performance

### Load Times
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Total Blocking Time < 300ms

### Perceived Performance
- [ ] Loading states show immediately
- [ ] Skeleton screens for slow content
- [ ] Progressive enhancement
- [ ] No layout shift (CLS < 0.1)

## Trust & Security

### Trust Signals
- [ ] Security badges visible
- [ ] Privacy policy accessible
- [ ] Terms of service accessible
- [ ] Contact information visible
- [ ] Clear refund/cancellation policy

### Security
- [ ] HTTPS everywhere
- [ ] No sensitive data in URLs
- [ ] Forms use POST, not GET
- [ ] CSRF protection on forms
- [ ] Rate limiting on API routes

## Content Quality

### Copy
- [ ] Clear and concise
- [ ] Uses active voice
- [ ] No jargon unless necessary
- [ ] Consistent tone
- [ ] Helpful, not condescending

### Visual Hierarchy
- [ ] Most important content is most prominent
- [ ] Headings create clear structure
- [ ] Whitespace guides the eye
- [ ] CTAs stand out appropriately

## Testing Workflow

1. **Desktop Testing**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)

2. **Mobile Testing**
   - iOS Safari
   - Android Chrome
   - Test on actual devices when possible

3. **Accessibility Testing**
   - Keyboard navigation
   - Screen reader (VoiceOver, NVDA)
   - Automated tools (axe, Lighthouse)

4. **Performance Testing**
   - Lighthouse (90+ scores)
   - WebPageTest
   - Real device testing

5. **User Testing**
   - First-time user flow
   - Returning user flow
   - Error scenarios
   - Mobile experience

## Quick Wins Checklist

- [ ] Add loading states to all async operations
- [ ] Improve error messages (remove technical jargon)
- [ ] Add alt text to all images
- [ ] Test keyboard navigation on all pages
- [ ] Verify color contrast ratios
- [ ] Add focus indicators if missing
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit
- [ ] Check console for errors
- [ ] Verify all forms have labels

---

**Last Updated:** 2025-01-27  
**Next Review:** After each major feature release
