# Day 1 — Ranked Risks & Fix Plan

## P1 (Blockers / UX breakage)
1) Floating “Need help?” FAB can overlap content on small screens.
   - Fix: Reserve bottom space on pages with the FAB.
     - Add container padding: `pb-24 md:pb-0` (or DS util).
     - Safe area utility: `padding-bottom: max(env(safe-area-inset-bottom), 1rem);` via `.pb-safe`.
2) Focus rings not fully migrated (many `focus:ring-*` remain in `pages/*`).
   - Fix: replace with tokens: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`.
   - Add CI grep guard for `focus:ring-` (Day 2).
3) `<img>` tags on user-facing pages (hurts LCP/CLS).
   - Files: `pages/placement/run.tsx:215`, `pages/profile/index.tsx:171`, `pages/profile/setup.tsx:589`, `pages/blog/[slug].tsx:72`, `pages/learning/[slug].tsx:215`.
   - Fix: switch to `next/image` with explicit width/height (or `fill` + `sizes`).

## P2 (Important but not blocking)
1) Pricing gradient uses arbitrary color classes.
   - Fix: move to DS tokens / CSS vars (keep contrast).
2) Currency selector tap target may be <44px.
   - Fix: enforce `min-h-[44px] px-4 rounded-full`.
3) Auth pages: keyboard safe-area on mobile.
   - Fix: apply `.pb-safe` on forms so CTAs aren’t obscured.

## P3 (Polish / consistency)
1) Home page LCP tuning (hero).
   - Fix: preload key font; compress hero assets; lazy-load below-the-fold sections.
2) Spacing scale consistency on card grids (16/20/24).
3) Brand SVGs with hex are allowed; document as exceptions.

## Owners & Next Steps (Day 2–3)
- Sweep `focus:ring-*` across `pages/*` → **FE**
- Replace 5 `<img>` → `next/image` → **FE**
- Add `.pb-safe` utility and apply where FAB appears → **FE**
- Pricing gradient → DS tokens → **Design/FE**
- LCP tuning on `/` → **FE**

### `.pb-safe` utility (drop in `styles/globals.css`)
:root { --safe-bottom: env(safe-area-inset-bottom, 0px); }
.pb-safe { padding-bottom: max(var(--safe-bottom), 1rem); }
