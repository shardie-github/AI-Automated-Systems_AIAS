# Microcopy Guidelines

**Version:** 1.0.0  
**Last Updated:** 2025-01-31  
**Status:** Active

---

## Overview

This document defines the writing standards, tone, and voice for all user-facing text in the AI Automated Systems platform. Consistent microcopy creates clarity, builds trust, and improves user experience.

---

## 1. Tone & Voice Framework

### Core Tone
**Calm, Authoritative, Minimal**

### Characteristics
- **Measured and confident:** Present facts without hedging
- **No urgency language:** Avoid pressure tactics
- **Declarative statements:** Use active voice, clear statements
- **Short, focused sentences:** One clear message per sentence
- **One message per section:** Avoid information overload

### Voice Principles
1. **Active:** Use active voice ("Create project" not "Project can be created")
2. **Empowering:** Help users feel capable, not patronized
3. **Direct:** Get to the point quickly
4. **Positive:** Frame positively when possible ("Save changes" not "Don't lose changes")
5. **Non-verbose:** Remove unnecessary words

---

## 2. Writing Rules

### Do's ✅

#### Clarity
- Use simple, everyday language
- Write in plain English (avoid jargon unless necessary)
- Be specific ("Save changes" not "Save")
- Use action verbs ("Create," "Delete," "Update")

#### Consistency
- Use consistent terminology throughout
- Standardize button labels (e.g., always "Save Changes" not "Save" or "Update")
- Use consistent capitalization (sentence case for most UI, title case for headings)
- Use consistent punctuation (no exclamation marks in CTAs)

#### Brevity
- Keep CTAs under 3 words when possible
- Remove unnecessary words ("Click here" → "Get started")
- One idea per sentence
- Short paragraphs (2–3 sentences max for UI)

### Don'ts ❌

#### Avoid These Phrases
- "Click here" → Use descriptive link text
- "Please note" → Remove or integrate naturally
- "You can try" → "Try" or "Get started"
- "This might take a moment" → "Processing..." or "Loading..."
- "Maybe you should" → Direct instruction
- "Don't forget to" → Positive framing

#### Avoid These Patterns
- **Hedging:** "Maybe," "Perhaps," "Might" → Use declarative statements
- **Urgency:** "Limited time," "Act now" → Remove pressure
- **Passive voice:** "Changes were saved" → "Changes saved"
- **Vague instructions:** "Do something" → "Create project"
- **Exclamation marks:** In CTAs or UI text (rare exceptions)

---

## 3. Terminology Standards

### Standardized Terms
- **GenAI Content Engine** (not "GenAI Engine" or "AI Engine")
- **Systems Thinking** (capitalized, not "systems thinking" in UI)
- **AI** (not "A.I." or "artificial intelligence" in UI)
- **Dashboard** (not "Control Panel" or "Home")
- **Project** (not "Task" or "Item")
- **Save Changes** (not "Save" or "Update")

### Consistent Labels
- **Buttons:** Use action verbs ("Create Project," "Save Changes," "Delete Item")
- **Links:** Use descriptive text ("Learn more about pricing" not "Click here")
- **Form labels:** Clear and specific ("Email address" not "Email" if ambiguous)
- **Error messages:** Specific and actionable ("Email address is required" not "Error")

---

## 4. Component-Specific Guidelines

### Buttons & CTAs

#### Primary Actions
- **Action verb + object:** "Create Project," "Save Changes," "Delete Account"
- **Keep under 3 words** when possible
- **No exclamation marks**
- **Title case** for primary CTAs

#### Secondary Actions
- **Simple verbs:** "Cancel," "Back," "Close"
- **Sentence case** for secondary actions

#### Examples
✅ **Good:**
- "Create Project"
- "Save Changes"
- "Get Started"
- "Learn More"
- "View Dashboard"

❌ **Avoid:**
- "Click here to create!"
- "Save Now!"
- "You can try it"
- "Maybe create a project?"

### Form Labels & Placeholders

#### Labels
- **Clear and specific:** "Email address" (if context needed)
- **Concise:** "Email" (if context is clear)
- **Required indicator:** Use asterisk (*) or "(required)"

#### Placeholders
- **Examples, not instructions:** "name@example.com" not "Enter your email"
- **Helpful hints:** Show format or example
- **Not a replacement for labels:** Always use labels

#### Error Messages
- **Specific:** "Email address is required" not "Error"
- **Actionable:** "Password must be at least 8 characters" not "Invalid password"
- **Positive framing when possible:** "Use 8+ characters" not "Password too short"

#### Examples
✅ **Good:**
- Label: "Email address"
- Placeholder: "name@example.com"
- Error: "Please enter a valid email address"

❌ **Avoid:**
- Label: "Email (you can enter your email here)"
- Placeholder: "Enter your email address"
- Error: "Error" or "Invalid"

### Empty States

#### Structure
1. **Headline:** Clear, actionable (h3 or h4)
2. **Description:** 1–2 sentences, helpful context
3. **CTA:** Primary action (if applicable)

#### Tone
- **Encouraging but not pushy**
- **Helpful context:** Explain why it's empty
- **Clear next step:** What to do next

#### Examples
✅ **Good:**
- Headline: "No projects yet"
- Description: "Create your first project to get started."
- CTA: "Create Project"

❌ **Avoid:**
- Headline: "You don't have any projects!"
- Description: "Maybe you should create one? Click here!"
- CTA: "Create Now!"

### Error States

#### Structure
1. **Error title:** What went wrong
2. **Description:** Why it happened (if helpful)
3. **Action:** How to fix it

#### Tone
- **Clear and direct**
- **Not blaming the user**
- **Actionable:** Tell user what to do

#### Examples
✅ **Good:**
- Title: "Something went wrong"
- Description: "We couldn't load your projects. Please try again."
- Action: "Try Again" button

❌ **Avoid:**
- Title: "Error!"
- Description: "An error occurred. Please contact support."
- Action: None or vague

### Success Messages

#### Tone
- **Brief and positive**
- **Confirm the action:** "Changes saved successfully"
- **No exclamation marks** (unless truly celebratory)

#### Examples
✅ **Good:**
- "Changes saved successfully"
- "Project created"
- "Email sent"

❌ **Avoid:**
- "Success!"
- "Your changes have been saved successfully!"
- "Great! It worked!"

### Tooltips

#### Guidelines
- **Concise:** One sentence or phrase
- **Helpful:** Explain what the element does
- **Not redundant:** Don't repeat visible text

#### Examples
✅ **Good:**
- "Delete this project permanently"
- "Save your changes"
- "Learn more about pricing"

❌ **Avoid:**
- "This button deletes the project"
- "Click to save"
- "More info"

### Modals & Dialogs

#### Titles
- **Clear action or question:** "Delete project?" or "Create new project"
- **Concise:** Keep under 6 words

#### Body Text
- **Explain the action:** What will happen
- **Provide context:** Why this matters
- **Be specific:** "This will delete 'Project Name' permanently" not "This action cannot be undone"

#### Buttons
- **Primary action:** Confirm the action ("Delete," "Create")
- **Secondary action:** Cancel ("Cancel," "Go back")

#### Examples
✅ **Good:**
- Title: "Delete project?"
- Body: "This will permanently delete 'Project Name' and all its data. This action cannot be undone."
- Buttons: "Cancel" (secondary), "Delete" (primary, destructive)

❌ **Avoid:**
- Title: "Are you sure?"
- Body: "This action cannot be undone!"
- Buttons: "No" and "Yes"

---

## 5. Onboarding Messages

### Tone
- **Welcoming but not overwhelming**
- **Clear value proposition**
- **Progressive disclosure:** One step at a time

### Structure
1. **Welcome message:** Brief, warm
2. **Value proposition:** What they'll get
3. **Clear next step:** What to do first

#### Examples
✅ **Good:**
- "Welcome! Let's set up your account."
- "Create your first project to get started."
- "You're all set! Start by creating a project."

❌ **Avoid:**
- "Welcome! We're so excited to have you! Let's get started!"
- "Maybe you should create a project?"
- "Don't forget to complete your profile!"

---

## 6. Consistency Enforcement

### Grammar & Style
- **Sentence case** for most UI text (buttons, labels, descriptions)
- **Title case** for headings and primary CTAs
- **No trailing periods** in buttons or short labels
- **Periods** in descriptions and longer text

### Capitalization Examples
- ✅ "Create project" (button, sentence case)
- ✅ "Create Project" (primary CTA, title case)
- ✅ "Project Settings" (heading, title case)
- ✅ "Email address" (label, sentence case)

### Punctuation
- **No exclamation marks** in UI text (rare exceptions)
- **Question marks** for confirmation dialogs
- **Periods** for descriptions and longer text
- **No trailing periods** in buttons or short labels

---

## 7. Before/After Examples

### Example 1: Button
❌ **Before:** "Click here to create a new project!"
✅ **After:** "Create Project"

### Example 2: Error Message
❌ **Before:** "Error: Invalid input"
✅ **After:** "Please enter a valid email address"

### Example 3: Empty State
❌ **Before:** "You don't have any projects yet! Maybe you should create one? Click here!"
✅ **After:** "No projects yet. Create your first project to get started."

### Example 4: Form Label
❌ **Before:** "Email (you can enter your email address here)"
✅ **After:** "Email address"

### Example 5: Success Message
❌ **Before:** "Success! Your changes have been saved successfully!"
✅ **After:** "Changes saved successfully"

### Example 6: Loading State
❌ **Before:** "This might take a moment, please wait..."
✅ **After:** "Loading..." or "Processing..."

---

## 8. Language & Jargon

### Plain Language
- **Use everyday words:** "Save" not "Persist"
- **Avoid jargon:** "Settings" not "Configuration"
- **Explain technical terms:** If jargon is necessary, explain it

### Technical Terms
- **When to use:** Only when necessary and precise
- **How to use:** Explain on first use, provide tooltips
- **Examples:** "API," "Webhook," "Database" (explain if needed)

---

## 9. Internationalization Considerations

### Translatable Strings
- **Externalize all user-facing text** to translation files
- **Use translation keys** not hardcoded strings
- **Provide context** for translators (comments in translation files)

### String Formatting
- **Use ICU MessageFormat** for pluralization and variables
- **Examples:** `{count} project` vs `{count} projects`
- **Date/time:** Use locale-aware formatting

### Cultural Considerations
- **Avoid idioms:** "Hit the ground running" → "Get started quickly"
- **Avoid cultural references:** Keep it universal
- **Date formats:** Use locale-aware formatting

---

## 10. Accessibility in Writing

### Screen Reader Considerations
- **Descriptive link text:** "Learn more about pricing" not "Click here"
- **Alt text:** Describe images clearly and concisely
- **ARIA labels:** Use when text is not visible

### Clarity
- **Short sentences:** Easier to understand
- **Simple words:** More accessible
- **Clear structure:** Headings, lists, paragraphs

---

## 11. Review Checklist

### For Each Piece of Copy
- [ ] Uses active voice
- [ ] No hedging ("maybe," "perhaps")
- [ ] No urgency language
- [ ] Clear and specific
- [ ] Consistent terminology
- [ ] Appropriate length (concise)
- [ ] No exclamation marks (unless truly needed)
- [ ] Actionable (if applicable)
- [ ] Accessible (screen reader friendly)
- [ ] Aligned with tone and voice

---

## 12. Resources

- **Plain Language Guidelines:** https://www.plainlanguage.gov/
- **Voice and Tone:** https://www.nngroup.com/articles/tone-of-voice-words/
- **Microcopy Best Practices:** https://www.nngroup.com/articles/microcopy/

---

**Last Updated:** 2025-01-31  
**Next Review:** Quarterly or when brand voice updates
