# Day 1 — Ranked Risks & Fix Plan

## P1 (Blockers / UX breakage)
1) Floating “Need help?” FAB can overlap content on small screens.
   - Fix: Reserve bottom space on pages with FAB.
     - Add container padding: `pb-24 md:pb-0` (or a DS util).
     - Safe-area: `padding-bottom: max(env(safe-area-inset-bottom), 1rem);` via a `pb-safe` utility.
   - QA: Pixel 5/iPhone 12, focus inputs & open drawers.

2) Focus rings not fully migrated (many `focus:ring-*` remain in pages/*).
   - Fix: Replace with tokenized, accessible pattern:
     - `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`
   - Scope: pages/admin/reviews/*, faq.tsx, ai/index.tsx, mock/*.[id].tsx inputs.
   - Add CI grep to fail on `focus:ring-` (Day 2).

3) `<img>` tags on user-facing pages (hurts LCP/CLS).
   - Files: placement/run.tsx:215, profile/index.tsx:171, profile/setup.tsx:589, blog/[slug].tsx:72, learning/[slug].tsx:215
   - Fix: `next/image` with width/height or `fill` + sizes.

## P2 (Important but not blocking)
1) Pricing page gradient uses arbitrary colors in Tailwind class.
   - Fix: move to DS tokens (e.g., bg via CSS vars) or lighter gradient; ensure contrast.
2) Currency selector minimum touch target.
   - Fix: enforce `min-h-[44px] px-4`, `rounded-full`.
3) Auth pages on mobile — keyboard safe area.
   - Fix: add `pb-safe` on forms; ensure CTA not obscured.

## P3 (Polish / consistency)
1) Ultra-long home page: ensure LCP under 2.5s (hero).
   - Fix: preload key font, compress hero assets, lazy-load below-the-fold sections.
2) Consistent spacing scale on card grids (check 16/20/24).
3) Review icons with hardcoded hex in brand SVGs — allowed, but document exceptions.

## Owners & Next Steps (Day 2–3)
- DS sweep: replace `focus:ring-*` across pages — **owner: FE**
- Replace 5 `<img>` → `next/image` — **owner: FE**
- Add `pb-safe` utility and apply where FAB appears — **owner: FE**
- Pricing gradient → DS tokens — **owner: Design/FE**
- LCP tuning on `/` — **owner: FE**
