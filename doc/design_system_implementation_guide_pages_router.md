# Design System Implementation Guide (Pages Router)

This is the single source of truth for how we build pages and components in this project. Follow it and your pages will match the system automatically.

---

## 1) Stack & Folders

- **Framework:** Next.js (Pages Router)
- **Styling:** Tailwind CSS
- **Theming:** `next-themes` (`attribute="class"`)
- **Design tokens:** `design-system/tokens/colors.js` (imported into `tailwind.config.js`)
- **Design‑system components:** `components/design-system/*`
- **Page sections:** `components/sections/*`
- **Pages:** `pages/*`

```
components/
  design-system/
    Button.tsx
    Card.tsx
    Container.tsx
    GradientText.tsx
    Skeleton.tsx
    StreakIndicator.tsx
  sections/
    Header.tsx
    Hero.tsx
    Modules.tsx
    Testimonials.tsx
    Pricing.tsx
    Waitlist.tsx
    Footer.tsx
pages/
  _app.tsx
  _document.tsx
  index.tsx
styles/globals.css
 tailwind.config.js
 design-system/tokens/colors.js
```

---

## 2) Tokens (colors) — single source of truth

- **Edit tokens here:** `design-system/tokens/colors.js`
- **Never** hardcode hex values in components/sections. Use Tailwind classes generated from tokens (e.g., `text-neonGreen`, `bg-lightBg`).
- After changing tokens, `npm run dev` (Tailwind JIT will pick them up).

Example (colors.js):

```js
module.exports = {
  primary: '#4361ee',
  primaryDark: '#3a56d4',
  secondary: '#f72585',
  accent: '#4cc9f0',
  success: '#2ec4b6',
  purpleVibe: '#9d4edd',
  electricBlue: '#00bbf9',
  neonGreen: '#80ffdb',
  sunsetOrange: '#ff6b6b',
  goldenYellow: '#ffd166',
  dark: '#0f0f1b',
  darker: '#070710',
  lightBg: '#f0f2f5',
  lightText: '#1a1a2e',
  grayish: '#8a8a9c'
};
```

**Exposed classes via Tailwind:**

- Text: `text-primary`, `text-lightText`, `text-neonGreen`, etc.
- Background: `bg-lightBg`, `bg-dark`, `bg-purpleVibe/10`, etc.
- Border: `border-primary`, `border-purpleVibe/20`, etc.

**Naming rules:**

- Lower camel for token keys (e.g., `electricBlue`).
- Add shade/opacity at usage, not in tokens (e.g., `bg-purpleVibe/10`).

---

## 3) Theming (light default, dark override)

- Light is the **default**. Dark theme applies when `<html class="dark">` (handled by `next-themes`).
- Use `dark:` variants for overrides. Don’t use CSS variables or inline styles for colors.
- **Body:**
  - Light: `text-lightText bg-lightBg`
  - Dark: `dark:text-white dark:bg-gradient-to-br dark:from-darker dark:to-dark`
- **Surfaces:**
  - Cards: `card-surface` (light) + `dark:...` built into the class.
  - Sections: `bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90`
- **Header:** `.header-glass` has both modes baked in.

**Theme toggle:** use `components/design-system/ThemeToggle.tsx`.

---

## 4) Reusable primitives

- **Container** — page width and horizontal padding.
- **Card** — surface for content (`card-surface` class encapsulates border/background in both themes).
- **Button** — variants: `primary`, `secondary`, `accent`.
- **GradientText** — brand gradient title text.
- **StreakIndicator** — example chip (pattern for badges/pills).
- **Skeleton** — loading placeholder component for content.

**Extending Button (example):**

```tsx
// Add a new variant
// 1) Update type Variant
// 2) Add a class in globals.css (e.g., .btn-ghost)
// 3) Map variant -> class in Button component
```

**Rule:** If a style appears 2+ times across pages, promote it to a DS component or utility class.

---

## 5) Layout & spacing

- Use `Container` inside sections.
- Default section padding: `py-24` (desktop), adjust with responsive variants if necessary.
- Use Tailwind grid utilities for layouts: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`.
- Keep headings consistent:
  - Section title: `font-slab text-4xl mb-3 text-gradient-primary`
  - Section subtitle: `text-grayish text-lg`

**Page skeleton:**

```tsx
export default function Page() {
  return (
    <>
      <Header streak={0} />
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <h1 className="font-slab text-4xl text-gradient-primary">Page Title</h1>
          <p className="text-grayish max-w-2xl">Subtitle / lead text.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card className="p-6">...</Card>
            <Card className="p-6">...</Card>
          </div>
        </Container>
      </section>
      <Footer />
    </>
  );
}
```

---

## 6) Patterns (how to build common sections)

- **Hero:** If it uses time/localStorage/randomness -> make it **client-only** using `next/dynamic` with `ssr:false` to avoid hydration errors. Keep the shell SSR-safe.
- **Feature grid / Modules:** Card list in a 3‑column grid. Use tokens for status badges.
- **Testimonials:** Avatar circle with gradient bg + Card. Keep text `italic` and highlight deltas with `text-electricBlue`.
- **Pricing:** 3 cards, middle `featured` with `scale-105 shadow-glow` and ribbon.
- **Forms (Waitlist):** Inputs use light/dark surfaces: `bg-dark/50 text-white dark:` etc.; borders `border-purpleVibe/30`.

**Do:** keep headings and CTA button variants consistent across pages.

---

## 7) Accessibility & interaction

- Buttons and links must have discernible text.
- Ensure focus indicators are visible; Tailwind default outlines are fine. Don’t remove outlines.
- Color contrast: when adding tokens, check light/dark contrast (WCAG AA) and adjust if needed.
- Icons are decorative unless labeled; add `aria-hidden` when appropriate.

---

## 8) State views (loading/empty/error)

- **Loading:** use simple content placeholders or a CSS pulse. Keep layout height stable to prevent CLS.
- **Empty:** short guidance line + primary CTA.
- **Error:** neutral text + secondary button to retry.

**Example:**

```tsx
<Card className="p-6">
  <Skeleton className="h-6 w-40" />
</Card>
```

---

## 9) Performance & hydration

- Any component that renders **time**, **random**, or reads **localStorage** must be client-only (`dynamic(..., { ssr:false })`).
- Avoid inline styles for colors; use classes so Tailwind can optimize.
- Fonts: preconnect is already configured in `_document.tsx`.
- Images/SVG: prefer inline SVG for simple illustrations (as done in Hero).

---

## 10) Creating a new DS component

**Checklist:**

1. Lives in `components/design-system/`.
2. Accepts `className` to allow composition.
3. Uses token classes only. No hex, no CSS variables.
4. Supports light/dark via `dark:` classes where needed.
5. Accessible semantics (`button` vs `a`, labels, `aria-*` where needed).
6. Export named component; keep props typed.

**Template:**

```tsx
import React from 'react';

type Props = React.HTMLAttributes<HTMLDivElement> & { size?: 'sm'|'md'|'lg' };
export const Widget: React.FC<Props> = ({ size='md', className='', ...rest }) => {
  const sizeCls = size==='sm' ? 'p-3' : size==='lg' ? 'p-8' : 'p-5';
  return (
    <div className={`card-surface ${sizeCls} ${className}`} {...rest} />
  );
};
```

---

## 11) Building a new page (step‑by‑step)

1. Create section components under `components/sections/YourSection.tsx` using `Container`, `Card`, and token classes.
2. Add the page file in `pages/your-page.tsx` and import your sections.
3. Keep `Header` and `Footer` at top/bottom. Use `py-24` sections.
4. If a section needs timers/random/localStorage, import it dynamically with `ssr:false`.
5. Run and visually compare with existing pages for consistency.

---

## 12) Change management

- **Add/edit token:** update `design-system/tokens/colors.js` → Tailwind classes update across the app.
- **Add new variant:** add utility class to `styles/globals.css` and map it in the DS component.
- **Refactor duplication:** if you copy styles twice, promote them into a DS component.

---

## 13) PR checklist (don’t skip)

-

---

## 14) Quick recipes

**Gradient headline:** `className="font-slab text-4xl text-gradient-primary"`

**CTA row:**

```tsx
<div className="flex gap-4">
  <a className="btn btn-primary">Primary</a>
  <a className="btn btn-secondary">Secondary</a>
</div>
```

**Section wrapper:** `className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90"`

**Card:** `className="card-surface p-6 rounded-2xl"`

---

## 15) What not to do

- Don’t add new hex colors directly in components.
- Don’t use CSS variables for colors; tokens + Tailwind only.
- Don’t ship client-only effects as SSR components.
- Don’t override spacing randomly; use the grid and the standard paddings.

---

## 16) Roadmap (nice-to-have)

- Tokens for **radius**, **spacing**, **typography scale**.
- Storybook for DS components (when we’re ready).
- Theming presets (brand variants, seasonal themes) reading from tokens.

---

**That’s it.** Use this guide as your checklist when you build a new page or component. Changes to `colors.js` flow across the entire app automatically.

