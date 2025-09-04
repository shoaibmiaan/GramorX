# Design System (DS) Guide — Quick README

This document explains how the DS is wired, what tokens/utilities exist, and how to consume them in UI code.

---

## 1) Architecture at a glance

* **Tailwind + CSS variables (tokens)**
  Tailwind is extended to read colors, typography, radii, and spacing from our token files. Colors resolve via CSS variables (so `/opacity` works and theming is easy).&#x20;
* **Global styles & utilities**
  `globals.css` pulls in `tokens.css` and defines app-wide utilities (buttons, cards, nav pills, text gradients, etc.).&#x20;
* **Design tokens (raw)**
  Color hexes live in `design-system/tokens/colors.js`; type scale, radii, and spacing live in `design-system/tokens/scale.js`. Tailwind consumes these to generate classes. &#x20;

```
design-system/
  tokens/
    colors.js     # brand + surfaces
    scale.js      # type scale, radii, spacing
styles/
  globals.css     # global utilities, themes, primitives
tailwind.config.js
```

---

## 2) Tokens you can use (no hardcoded values!)

### Colors

Color utilities are backed by CSS vars and support opacity: `bg-…/10`, `text-…/80`, etc. Key tokens:

* **Surfaces:** `bg-background`, `text-foreground`, `border-border`.&#x20;
* **Brand:** `primary`, `secondary`, `accent` (+ `*-foreground`).&#x20;
* **Extended:** `purpleVibe`, `electricBlue`, `neonGreen`, `sunsetOrange`, `sunsetRed`, `goldenYellow`. &#x20;
* **Component compound:** `bg-card`, `text-card-foreground`.&#x20;

> Dynamic classes like `bg-primary/10` are safelisted to survive Purge. If you add new dynamic color utilities, extend the `safelist` in `tailwind.config.js`.&#x20;

### Typography

Custom font sizes are exposed as Tailwind classes:

* `text-displayLg`, `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-h4`, `text-body`, `text-small`, `text-caption`, `text-tiny`, `text-micro`.&#x20;
* Headings use the slab display font by default via base layer (`h1, h2, h3 { @apply font-slab }`). Use `font-slab` manually when needed.&#x20;

### Radius & Spacing

* Radii: `rounded-ds`, `rounded-ds-xl`, `rounded-ds-2xl` (+ native `sm/md/lg/xl/2xl`).&#x20;
* Spacing: additional steps `3.5`, `17.5`, `18`, `22`, `30`, `220`.&#x20;

---

## 3) Theming (light/dark)

* **Mode switch:** `.dark` on `<html>` toggles themes (works great with `next-themes`).&#x20;
* **Defaults:** Light uses `text-lightText` on `bg-lightBg`; dark uses a gradient background and flips foregrounds.&#x20;
* Use `dark:` variants with any token class, e.g. `dark:bg-purpleVibe/10`.&#x20;

---

## 4) DS utilities (ready-made building blocks)

These classes live in `globals.css`:

* **Buttons:**
  `btn` + `btn--fx` (hover sheen effect) + variant

  * Primary: `btn btn--fx btn-primary` (purple→blue gradient)
  * Secondary: `btn btn-secondary` (tokenized border)
  * Accent: `btn btn--fx btn-accent` (orange→red gradient)&#x20;

* **Cards:**

  * Solid surface: `card-surface`
  * Glassy: `card-glass`&#x20;

* **Chips & badges:** `streak-chip` (with dark-mode alt).&#x20;

* **Text gradients:** `text-gradient-primary`, `text-gradient-accent`, `text-gradient-vertical`.&#x20;

* **Nav:** `header-glass`, `nav-pill` (+ `.is-active`).&#x20;

* **Skeletons:** `skeleton`.&#x20;

* **Container:** `.container` (max width + padding).&#x20;

---

## 5) Usage examples

### Hero heading with gradient & slab

```tsx
<h1 className="text-displayLg font-slab text-gradient-primary">
  Master IELTS with Confidence
</h1>
```

Uses the custom type scale and gradient utility. &#x20;

### Primary button

```tsx
<button className="btn btn--fx btn-primary">
  Get Started
</button>
```

Pre-styled gradient, hover sheen, tokenized shadows.&#x20;

### Card surface

```tsx
<div className="card-surface p-6">
  <h3 className="text-h3 font-slab">Plan</h3>
  <p className="text-body text-foreground/80">Everything you need.</p>
</div>
```

Surface, border, and typography via tokens. &#x20;

### Sticky nav pill

```tsx
<a className="nav-pill is-active" href="#features">Features</a>
```

Automatic underline + active state; dark-mode aware.&#x20;

---

## 6) Do / Don’t (quick rules)

**Do**

* Use token classes for **all** colors, radii, spacing, and type (`bg-purpleVibe`, `border-border`, `rounded-ds`).&#x20;
* Use DS utilities for common UI (buttons, cards, chips, gradients).&#x20;
* Use `dark:` variants instead of manual color swaps.&#x20;

**Don’t**

* Don’t hardcode hex values or pixel sizes when a token exists. Use `colors.js`/`scale.js` via Tailwind. &#x20;
* Don’t copy ad-hoc gradient strings—use `text-gradient-*` or DS button variants.&#x20;

---

## 7) Adding or changing tokens

1. **Edit token source** (`colors.js` or `scale.js`). &#x20;
2. If introducing new CSS vars, map them in `tailwind.config.js` under `theme.extend.colors` (or `fontSize`, `borderRadius`, `spacing`).&#x20;
3. Optionally add utility shortcuts in `globals.css` (e.g., a new `text-gradient-*`).&#x20;
4. If you’ll use **dynamic** class names (computed strings), add a `safelist` regex entry.&#x20;

---

## 8) Integration checklist (per page / component)

* [ ] No raw hex or arbitrary values where tokens exist.
* [ ] Uses DS utilities (`btn-*`, `card-*`, `text-gradient-*`, `.container`).&#x20;
* [ ] Typography from the type scale (`text-h*`, `text-body`, etc.).&#x20;
* [ ] Light/dark supported with `dark:` variants only.&#x20;
* [ ] Borders and rings use `border-border` / default ring color.&#x20;

---





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

