# MOBILE_RELEASE_PHASES.md

> **One plan. Three phases.** 
> - **Phase 0 — Base (Cross‑Platform PWA hardening):** shared groundwork that benefits iPhone & Android. **(Now split into days with tasks/deliverables/dev summary.)**
> - **Phase 1 — Android (Google Play via TWA):** Bubblewrap → AAB → Play Console. **(Now split into days with tasks/deliverables/dev summary.)**
> - **Phase 2 — iOS (Apple App Store via Capacitor):** WKWebView shell + light native value. **(Kept as‑is.)**
>
> v1 rule: **No in‑app digital purchases** in the mobile apps; sell on web. Add store billing later only if needed.

---

## Phase 0 — Base (works for iPhone & Android)

**Objective:** Make the web app a robust, installable PWA and lock policy/legal. Everything here helps BOTH platforms.

### Day 1 — Domain, HTTPS, Policy
**To‑Do**
- Lock **production domain** (HTTPS you control). Point DNS → hosting (Vercel).
- Enable **automatic HTTPS**, HSTS, HTTP→HTTPS redirect.
- Draft **Privacy Policy** + **Account Deletion** pages (truthful to actual data flows).
- Add `robots.txt` and basic sitemap if missing.

**Create**
- `/pages/privacy.tsx` (or `/public/privacy.html`)
- `/pages/account-delete.tsx` (or a working flow link if delete is handled in dashboard)
- `/public/robots.txt`

**Developer Summary**
- **Exit**: Domain live over HTTPS; policy + deletion URLs reachable.
- **Risks**: Using preview URLs breaks later TWA/Universal Links. Policy mismatch → store rejection.
- **Notes**: Keep data claims conservative; only list what you actually collect/share.

---

### Day 2 — Manifest & Icons
**To‑Do**
- Add/verify `public/manifest.webmanifest`: `name`, `short_name`, `start_url`, `scope`, `display: "standalone"`, `theme_color`, `background_color`.
- Export **maskable icons** (192×192, 512×512) following brand tokens.
- Link manifest & icons in `<Head>`; verify `manifest` reachable at `/manifest.webmanifest`.

**Create**
- `/public/manifest.webmanifest`
- `/public/icons/icon-192.png`, `/public/icons/icon-512.png` (maskable)

**Developer Summary**
- **Exit**: App “Install” prompt appears; manifest/icons validated in DevTools → Application → Manifest.
- **Risks**: Wrong paths or missing maskable causes poor install UX.

---

### Day 3 — Service Worker & Offline UX
**To‑Do**
- Implement **SW** (Workbox or `next-pwa`). Cache static assets; network‑first for HTML.
- Add **offline fallback** page and **update UX** (“New version available — Reload”). 
- Version the SW; use `skipWaiting` + `clientsClaim` carefully.

**Create**
- `/workbox/sw.ts` (or `next-pwa` config)
- `/public/offline.html`
- `next.config.js` (wrap with `next-pwa` if chosen)

**Developer Summary**
- **Exit**: Offline navigation shows fallback; no blank white screens.
- **Risks**: Cache poisoning / infinite stale pages → include a manual refresh banner + SW version bump doc.

---

### Day 4 — Deep Links, Headers, Telemetry
**To‑Do**
- **Route map**: finalize stable paths used by both Android intents & iOS universal links (`/`, `/login`, `/learn/*`, `/practice/*`, `/reports/*`).
- Add **security headers**: CSP, HSTS, `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options`.
- Wire **analytics & error reporting** (route failures, auth errors).

**Create**
- Header config (Next.js middleware or hosting config) for CSP + security headers
- Docs: `docs/pwa-readiness.md` with route map + header snippets

**Developer Summary**
- **Exit**: No mixed content, CSP errors visible+fixed, routes stable.
- **Risks**: Over‑strict CSP can block scripts; test on multiple devices.

---

### Day 5 — Lighthouse & Readiness Gate
**To‑Do**
- Run **Lighthouse** (mobile, PWA category) on production.
- Fix any installability/contrast/perf failures.
- Snapshot scores and add them to docs.

**Create**
- `scripts/pwa-lighthouse.md` with score screenshots & fixes applied

**Developer Summary**
- **Exit**: PWA score **≥ 90**; installable; offline works.
- **Risks**: Large images or blocking scripts drag scores; lazy‑load aggressively.

---

## Phase 1 — Android (Google Play via TWA)

**Objective:** Ship Android app using **Trusted Web Activity** with **Bubblewrap**; pass Play checks fast.

### Day 1 — Bubblewrap Init & Keys
**To‑Do**
- Install Bubblewrap, **init** from production manifest.
- Generate **upload key** (if not existing). Decide **package id**.

**Create**
- Local TWA project (`twa-manifest.json`)
- `upload-key.jks` (keep secret)

**Developer Summary**
- **Exit**: TWA project scaffolding runs; package id decided.
- **Risks**: Using preview domain → later verification fails.

---

### Day 2 — Build AAB & Signing
**To‑Do**
- Configure signing with the upload key.
- `bubblewrap build` → produce **.aab**.
- Capture the **SHA‑256** cert fingerprint.

**Create**
- First **AAB** artifact
- Notes file with SHA‑256 fingerprint

**Developer Summary**
- **Exit**: Signed AAB built successfully.
- **Risks**: Mismatched keystore path/alias; document commands used.

---

### Day 3 — Digital Asset Links (Trust)
**To‑Do**
- Publish `/.well-known/assetlinks.json` on the production domain with package + SHA‑256.
- Verify no redirects; validate with Digital Asset Links checker / Chrome.

**Create**
- `/public/.well-known/assetlinks.json` (deployed to prod host)

**Developer Summary**
- **Exit**: TWA verification passes (no browser chrome, handles all URLs).
- **Risks**: Wrong fingerprint or caching → 404/old JSON served.

---

### Day 4 — Play Console Setup
**To‑Do**
- Create app; enable **Play App Signing**.
- Upload AAB to **Internal testing**; add tester emails.

**Create**
- Play Console app record
- Internal test release

**Developer Summary**
- **Exit**: Build accepted; processing complete.
- **Risks**: Target API min/target mismatches; keep up to current target requirements.

---

### Day 5 — Store Listing Assets
**To‑Do**
- Prepare icon (512×512), feature graphic (1024×500), **6–8** screenshots.
- Write **short/long description**, category, contact email/site.

**Create**
- `/design/play/icon.png`, `/design/play/feature-graphic.png`
- `/design/play/screenshots/*`

**Developer Summary**
- **Exit**: Listing filled with assets; looks professional in dark/light.
- **Risks**: Text claims must match app behavior (avoid policy flags).

---

### Day 6 — App Content & Compliance
**To‑Do**
- Complete **Data Safety**, **Target Audience**, **Content Rating**.
- Link **Privacy Policy** URL; confirm permissions minimal.

**Create**
- Console forms + exported PDF copy in `/docs/play-submission/` (optional)

**Developer Summary**
- **Exit**: All “App content” sections green.
- **Risks**: Inaccurate data declarations → rejection. Keep truthful, minimal.

---

### Day 7 — Internal Test & Pre‑launch Report
**To‑Do**
- Roll Internal test to devices; run **Pre‑launch report**.
- Fix crashes, blocked resources, deep‑link scope, mixed content.

**Create**
- Bug list + fixes PR
- Retest notes

**Developer Summary**
- **Exit**: No critical blockers in report; app opens reliably.
- **Risks**: Service worker edge cases; keep a hard refresh path in UI.

---

### Day 8 — Monetization Decision (v1)
**To‑Do**
- **Recommended**: Keep **no in‑app digital purchases**; ensure app UI doesn’t prompt in‑app payments.
- (If required) start **Play Billing v7** spike in a separate branch.

**Create**
- UX copy adjustments (if removing in‑app pay prompts)

**Developer Summary**
- **Exit**: App compliant with billing policies for v1.
- **Risks**: Hidden paywalls get flagged fast; keep purchase flows on web only.

---

### Day 9 — Closed Testing
**To‑Do**
- Promote to **Closed testing** (50–200 users).
- Monitor **Play Vitals** (ANR/Crash), login, push, deep links.

**Create**
- Release notes; tester survey form (optional)

**Developer Summary**
- **Exit**: Crash‑free sessions **≥ 99.5%**; key flows validated.
- **Risks**: Device‑specific quirks; collect logs/screens promptly.

---

### Day 10 — Production (Staged)
**To‑Do**
- Staged rollout **5–10% → 100%** if clean.
- Monitor vitals & reviews; prep hotfix pipeline.

**Create**
- Final release notes in Console
- Post‑release checklist in `/docs/release-checks.md`

**Developer Summary**
- **Exit**: Live in production; stable metrics.
- **Risks**: SW updates post‑release; version and communicate updates.

---

## Phase 2 — iOS (Apple App Store via Capacitor) — *kept as previously shared*

**Objective:** Wrap the PWA with **Capacitor (WKWebView)** and add **light native value** to clear App Review **Guideline 4.2**.

### Steps
1) **Capacitor shell**
   ```bash
   npm i @capacitor/core @capacitor/ios
   npx cap init "IELTS Portal" "com.company.ielts"
   npx cap add ios
   ```
   - Set `server.url` to `https://YOUR-DOMAIN` in `capacitor.config.ts`.
   - Create a simple **Native Settings** screen (theme/lang/notifications).

2) **Universal Links (Associated Domains)**
   - Enable **Associated Domains** in Xcode: `applinks:YOUR-DOMAIN`.
   - Host `/.well-known/apple-app-site-association` (JSON, **no extension**, **no redirects**).

3) **Push (APNs) — optional for v1 but recommended**
   ```bash
   npm i @capacitor/push-notifications
   ```
   - Create APNs key (.p8), register device token, send a server test.

4) **Native polish**
   - Add **Share Sheet** for key links, **Haptics**, **Pull‑to‑refresh**, safe‑area & launch screen fixes.

5) **App Store Connect**
   - Upload build via Xcode → **TestFlight** (internal → external) → **App Review**.
   - Provide reviewer test account; ensure Account Deletion link is visible.

### Deliverables
- iOS project under `/ios/` with working Capacitor shell
- AASA file deployed and verified
- TestFlight builds; release metadata & screenshots (6.7" + 5.5")

### Acceptance criteria (Phase 2)
- Universal Links open in‑app; no Safari fallback.
- No crashes across 10+ devices; cold start < 2.5s.
- App Review passes with no 4.2/3.1.1 issues (no in‑app digital paywalls in v1).

---

## Repo Map (summary)

```
/public/
  manifest.webmanifest
  icons/icon-192.png
  icons/icon-512.png
  offline.html
  .well-known/assetlinks.json                 # Android (Phase 1)
  .well-known/apple-app-site-association      # iOS (Phase 2)

/workbox/ (optional)
  sw.ts
  workbox-config.js

/ios/ (Phase 2)
  App.xcodeproj, Info.plist, Assets.xcassets, etc.

next.config.js   # if using next-pwa
docs/            # notes, reports, pre/post-release checklists
```

---

## Command Cheatsheet

```bash
# PWA & SW (Phase 0)
npm i -D next-pwa workbox-window

# Android (Phase 1)
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://YOUR-DOMAIN/manifest.webmanifest
bubblewrap build
keytool -genkey -v -keystore upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload

# iOS (Phase 2)
npm i @capacitor/core @capacitor/ios @capacitor/push-notifications
npx cap init "IELTS Portal" "com.company.ielts"
npx cap add ios
npm run build && npx cap copy ios && npx cap open ios
```

---

## Definition of Done (overall)
- **Phase 0** complete: installable PWA, offline fallback, privacy/deletion live, PWA ≥ 90.
- **Phase 1** live: Android TWA verified, AAB released, vitals clean.
- **Phase 2** live: iOS Capacitor app approved, Universal Links/Push verified.

**Post‑v1**: add store billing (Play Billing v7, StoreKit 2), deeper native features, listing A/B tests, and perf budgets.
