# GramorX — GTM & Launch Implementation Tracker (90-Day)

**Last updated:** 2025-09-01 04:38 PKT  
**Scope:** Ship IELTS 4 modules E2E + AI evaluation, monetization (trial/paywall/subscriptions), referrals/partners, Band Predictor, WhatsApp/SMS sequences, retention systems.  
**North Star:** AI-graded tasks / user / week.

---

## Legend
- **Status:** ☐ Not started · ◐ In progress · ⛔ Blocked · ✅ Done
- **Pri:** H (High) · M (Medium) · L (Low)
- All routes use **Pages Router**, all UI uses **Design System tokens** (no inline hex), `next/image`, `Link/NavLink`, `const` by default, `@ts-expect-error` (not `@ts-ignore`).

---

## Phase 0 — Developer Summary (Completed)

**Outcome:** Core plumbing ready. Database schemas with RLS are live, design tokens wired, analytics/monitoring hooks scaffolded, health check passing, and environment validated. Next developer can begin Phase 1 (Onboarding + Study Plan) immediately.

### Files added (16)
```
design-system/tokens/scale.js                 # tokens (using your existing content)
lib/env.ts                                    # zod-validated env + helpers
lib/flags.ts                                  # feature flags
lib/analytics/events.ts                       # typed event names
lib/analytics/track.ts                        # single track() entry
lib/analytics/providers/ga4.ts                # GA4 bootstrap + event
lib/analytics/providers/meta.ts               # Meta Pixel bootstrap + event
lib/monitoring/sentry.ts                      # Sentry lightweight init
pages/api/healthz.ts                          # env + flags status JSON
db/migrations/001_core.sql                    # subscriptions, entitlements, usage_counters (+RLS)
db/migrations/002_referrals_partners.sql      # referrals + partners (+RLS)
db/migrations/003_learning_progress.sql       # study_plans, streaks, notifications_opt_in (+RLS)
db/migrations/004_attempts.sql                # attempts_* (L/R/W/S) (+RLS)
db/migrations/005_challenge_certificates.sql  # challenge_enrollments, certificates (+RLS)
types/supabase.ts                              # minimal DB types (handwritten)
scripts/gen-types.ts                           # optional supabase types generator
```

### Tailwind / Design System
- **tailwind.config.js** imports DS tokens and exposes: `borderRadius.ds`, `spacing` (custom steps), and `fontSize` via `typeScale`.
- Color tokens use CSS vars (`rgb(var(--color-*) / <alpha-value>)`) so `/opacity` utilities work.
- No inline hex; **token classes** only.

### Environment (validated)
Minimum variables in `.env.local` now recognized by `lib/env.ts`:
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
SUPABASE_URL, SUPABASE_SERVICE_KEY (service role), SUPABASE_SERVICE_ROLE_KEY,
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID, TWILIO_WHATSAPP_FROM
# Optional: NEXT_PUBLIC_GA4_ID, NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_SENTRY_DSN
```
Validation can be skipped using `SKIP_ENV_VALIDATION=true` (dev/test only).

### Database (applied with RLS)
- **Core:** subscriptions, entitlements, usage_counters (owner read/write).
- **Growth:** referral_codes, referral_redemptions (owner read/insert), partner_* (service-role only).
- **Learning:** study_plans, streaks, notifications_opt_in (owner read/write).
- **Attempts:** attempts_listening/reading/writing/speaking (owner read/write) + indexes.
- **Cohorts/Proof:** challenge_enrollments, certificates (owner read/write).

### Health & Verification
- **/api/healthz** returns env readiness + feature flag snapshot.
- GA4/Meta/Sentry are optional; safe no-ops if IDs/DSN not provided.
- Build passes with Pages Router; DS tokens are discovered by Tailwind.

### Contracts for Phase 1
- Use `study_plans.plan_json` to store generated 4-week plan.
- Use `notifications_opt_in` for WhatsApp/SMS/email choices during onboarding.
- Fire events via `track()`:
  - `signup`, **`onboarding_completed`**, `mock_started`, `mock_completed`, `ai_feedback_viewed`.
- Feature flags available via `flags.enabled('trial' | 'paywall' | 'predictor' | 'referral' | 'partner' | 'challenge')`.

### Known constraints
- Partner tables purposely lack public policies; access via **service role** only.
- Sentry init is gated; install `@sentry/nextjs` before enabling in production.

### Handover Checklist for Phase 1
- [ ] Create routes: `/onboarding/goal`, `/onboarding/date`, `/onboarding/skills`, `/onboarding/schedule`.
- [ ] Write `profiles.locale` and `study_plans.plan_json` on completion.
- [ ] Add **Urdu/English** switch; persist to `profiles.locale`.
- [ ] Instrument `onboarding_completed` and show **dashboard** with next 7-day plan.
- [ ] Add opt-in toggles to fill `notifications_opt_in`.
- [ ] Seed one sample listening & reading paper for Week-1 “Aha” slice.

---

## Phase 0 — Prep (Day 0–2)

- ✅ **P0.1 Env & Tokens** (Pri: H)  
  **Deliverables:** Supabase keys, Twilio (SMS/WhatsApp), GA4, Meta Pixel, Sentry. Feature flags `NEXT_PUBLIC_FEATURE_*`.  
  **Acceptance:** All secrets present locally & on Vercel; flags toggle UIs.

- ✅ **P0.2 Data Model Migrations** (Pri: H)  
  **Tables:** `subscriptions`, `entitlements`, `usage_counters`, `referral_codes`, `referral_redemptions`, `partner_accounts`, `partner_codes`, `partner_payouts`, `study_plans`, `streaks`, `notifications_opt_in`, `challenge_enrollments`, `certificates`, `attempts_*` (L/R/W/S).  
  **Acceptance:** Migrations run clean; RLS policies added; TS types generated.

- ✅ **P0.3 Analytics Events** (Pri: H)  
  **Events:** `signup`, `onboarding_completed`, `mock_started`, `mock_completed`, `ai_feedback_viewed`, `paywall_view`, `subscribe_clicked`, `plan_purchased`, `referral_link_created`, `referral_redeemed`, `partner_code_applied`, `predictor_completed`, `challenge_joined`, `certificate_shared`.  
  **Acceptance:** `track(event, props)` helper works client/server; events visible in GA4 debug.

---

## Phase 1 — Foundation & “Aha” (Week 1–2)

- ☐ **F1.1 Onboarding (4-step) + Study Plan** (Pri: H)  
  **Routes:** `/onboarding/goal`, `/onboarding/date`, `/onboarding/skills`, `/onboarding/schedule` → dashboard.  
  **DB:** write `profiles.locale`, `study_plans.plan_json`.  
  **Acceptance:** User completes onboarding; auto-plan for 4 weeks; event `onboarding_completed`.

- ☐ **F1.2 IELTS E2E Minimum Slice** (Pri: H)  
  **Routes:**  
  - Listening `/mock/listening/[id]` → `/review/listening/[id]`  
  - Reading `/mock/reading/[id]` → `/review/reading/[id]`  
  - Writing `/mock/writing/[id]` (autosave editor) → AI → `/review/writing/[id]`  
  - Speaking `/mock/speaking/[id]` (record/timer) → AI → `/review/speaking/[id]`  
  **APIs:** `POST /api/ai/writing/grade`, `POST /api/ai/speaking/grade`, `POST /api/ai/explain`  
  **Acceptance:** New user can complete **1 mock** and view **AI feedback < 10 min** end-to-end.

- ☐ **F1.3 Trial & Paywall (groundwork)** (Pri: H)  
  **Free limits:** 1 full mock + 2 AI essay checks + 10 speaking-AI min/day (configurable).  
  **Mechanics:** `usage_counters`+`entitlements`; `<PaywallGate>` wraps protected components; nudges show locked insights.  
  **Acceptance:** Counters enforced server-side; paywall appears at thresholds; `paywall_view` fired.

- ☐ **F1.4 Pricing Page (plans + student badge)** (Pri: M)  
  **Route:** `/pricing?highlight=booster`  
  **Acceptance:** Plan grid renders; “Booster” defaults; CTA routes to `/checkout` with plan param.

- ☐ **F1.5 Messaging (5-message sequence)** (Pri: M)  
  **Channels:** Email/SMS/WhatsApp via Twilio; opt-in captured in onboarding.  
  **Acceptance:** Test users receive welcome → quick win → proof → offer → last call; unsubscribe works.

---

## Phase 2 — Monetization & Growth Loops (Week 3–6)

- ☐ **G2.1 Payments + Subscriptions (Card + Easypaisa/JazzCash)** (Pri: H)  
  **Route:** `/checkout?plan=booster|master&code=...`  
  **Webhooks:** `/api/webhooks/payment` (idempotent); update `subscriptions` + entitlements.  
  **Buddy Pass:** 2 seats @ 1.6×; `teammates` table (owner, invitee, status).  
  **Acceptance:** Upgrade reflected ≤ 30s; invoices/receipts visible; Buddy invite/accept works.

- ☐ **G2.2 Referral Engine (14-day Booster reward)** (Pri: H)  
  **Routes:** `/account/referrals` (create/share code). Redeem at signup/checkout.  
  **DB:** `referral_codes`, `referral_redemptions`; fraud guard (IP/device/cooldowns).  
  **Acceptance:** Codes generate, redeem, and apply trial extension to both parties.

- ☐ **G2.3 Partner Dashboard (rev-share)** (Pri: M)  
  **Routes:** `/partners` (stats), `/admin/partners` (manage).  
  **DB:** `partner_accounts`, `partner_codes`, `partner_payouts`; attribution stored on `subscriptions`.  
  **Acceptance:** Partners see clicks→paid funnel + payout CSV export.

- ☐ **G2.4 Band Predictor (lead magnet)** (Pri: H)  
  **Route:** `/predictor` (8–10 inputs) → provisional band & fixers; capture email/phone; auto-start trial.  
  **Acceptance:** Quiz < 90s; completion ≥ 70%; `predictor_completed` fired; trial flag set.

- ☐ **G2.5 Social Proof & Landing CTA** (Pri: M)  
  **Assets:** Generate 6 anonymized “before/after” feedback snippets (PNG).  
  **Landing:** Add 3 proof points + “Do a free mock” CTA.  
  **Acceptance:** Assets render crisply; landing updated and tracked.

---

## Phase 3 — Scale & Retention (Month 2–3)

- ☐ **R3.1 14-day Band-Boost Challenge** (Pri: M)  
  **Route:** `/challenge` (cohorts, daily tasks from study plan, leaderboard).  
  **DB:** `challenge_enrollments`; progress tracking.  
  **Acceptance:** Users complete cohort; certificate generated; share page OG-ready.

- ☐ **R3.2 Certificates** (Pri: M)  
  **Route:** `/cert/[id]` (shareable).  
  **DB:** `certificates` (image_url, meta_json).  
  **Acceptance:** High-res PNG; social share preview OK; `certificate_shared` event.

- ☐ **R3.3 Teacher (B2B) Pilot** (Pri: M)  
  **Route:** `/teacher` (assign tasks, view cohort progress, send nudges).  
  **Acceptance:** Two academies onboarded; teachers manage cohorts successfully.

- ☐ **R3.4 Localization & Accessibility** (Pri: M)  
  **Scope:** Urdu/English parity for onboarding, paywall, pricing, predictor, challenge, notifications. WCAG AA pass.  
  **Acceptance:** Toggle persists; aXe checks pass.

---

## Global Acceptance Criteria
- Aha moment: 1st mock → AI feedback **< 10 min**
- Trial gating shows at the exact thresholds; upgrade < 3 clicks
- Payments/webhooks reliable (≥ 95%); retries with idempotency keys
- Referrals/partners attribution ≥ 98% accuracy
- Predictor completion ≥ 70%; starts trial for ≥ 60% finishers
- Challenge D7 completion ≥ 40%
- Performance: LCP < 2.5s on slow 3G for key pages
- Accessibility: WCAG AA

---

## Routes (master list)
`/onboarding/*`, `/mock/(listening|reading|writing|speaking)/[id]`, `/review/*`, `/ai`, `/pricing`, `/checkout`, `/account/(billing|referrals|progress)`, `/partners`, `/admin/partners`, `/predictor`, `/challenge`, `/cert/[id]`, `/teacher`, `/api/webhooks/payment`

---

## Database — New/Updated Tables (summary)
- **subscriptions** (user_id, plan, status, started_at, renews_at, trial_ends_at, source, seats)  
- **entitlements** (user_id, key, value_json)  
- **usage_counters** (user_id, feature, period_utc_date, count)  
- **referral_codes** / **referral_redemptions**  
- **partner_accounts** / **partner_codes** / **partner_payouts**  
- **study_plans**, **streaks**, **notifications_opt_in**  
- **challenge_enrollments**, **certificates**  
- **attempts_listening/reading/writing/speaking** (+ `score_json`, `ai_feedback_json`)

---

## Analytics Events (instrument exactly)
`signup`, `onboarding_completed`, `mock_started`, `mock_completed`, `ai_feedback_viewed`, `paywall_view`, `subscribe_clicked`, `plan_purchased`, `referral_link_created`, `referral_redeemed`, `partner_code_applied`, `predictor_completed`, `challenge_joined`, `certificate_shared`

---

## Files by Phase (authoritative list)

> This section consolidates the code/file deliverables per phase. Keep Pages Router + DS guardrails: token classes only, `Link/NavLink` for internal nav, `next/image` for real images, and typed API inputs/outputs.

### Phase 0 — Prep (core plumbing)
**Files**
```
design-system/tokens/scale.js
lib/env.ts
lib/flags.ts
lib/analytics/events.ts
lib/analytics/track.ts
lib/analytics/providers/ga4.ts
lib/analytics/providers/meta.ts
lib/monitoring/sentry.ts
pages/api/healthz.ts
db/migrations/001_core.sql
db/migrations/002_referrals_partners.sql
db/migrations/003_learning_progress.sql
db/migrations/004_attempts.sql
db/migrations/005_challenge_certificates.sql
types/supabase.ts
scripts/gen-types.ts
```

### Phase 1 — Foundation & “Aha”
**Pages (Onboarding)**
```
pages/onboarding/goal.tsx
pages/onboarding/date.tsx
pages/onboarding/skills.tsx
pages/onboarding/schedule.tsx
```
**Pages (Mocks & Reviews)**
```
pages/mock/listening/[id].tsx
pages/review/listening/[id].tsx
pages/mock/reading/[id].tsx
pages/review/reading/[id].tsx
pages/mock/writing/[id].tsx
pages/review/writing/[id].tsx
pages/mock/speaking/[id].tsx
pages/review/speaking/[id].tsx
pages/speaking/simulator.tsx
```
**Pages (Pricing / Checkout / Core)**
```
pages/pricing/index.tsx
pages/checkout/index.tsx
pages/study-plan/index.tsx
pages/progress/index.tsx
pages/settings/billing.tsx
pages/dashboard/index.tsx
pages/listening/index.tsx
pages/reading/index.tsx
pages/writing/index.tsx
```
**API routes**
```
pages/api/healthz.ts
pages/api/ai/writing/grade.ts
pages/api/ai/speaking/grade.ts
pages/api/ai/explain.ts
pages/api/onboarding/complete.ts
pages/api/counters/increment.ts
```
**Components**
```
components/paywall/PaywallGate.tsx
components/paywall/UsageCounterBadge.tsx
components/exam/ExamShell.tsx
components/exam/TimerHUD.tsx
components/exam/QuestionPalette.tsx
components/exam/AnswerControls/Input.tsx
components/exam/AudioPlayerSegmented.tsx
components/review/AIFeedbackPanel.tsx
components/review/AnswerDiff.tsx
components/onboarding/StepShell.tsx
components/nav/CommandCenter.tsx
```
**Lib**
```
lib/env.ts
lib/flags.ts
lib/analytics/events.ts
lib/analytics/track.ts
lib/analytics/providers/ga4.ts
lib/analytics/providers/meta.ts
lib/ai/writing.ts
lib/ai/speaking.ts
lib/ai/explain.ts
lib/studyPlan.ts
lib/usage.ts
lib/routes.ts
lib/supabaseBrowser.ts
lib/supabaseServer.ts
```
**Types**
```
types/attempts.ts
types/questions.ts
types/plan.ts
types/pricing.ts
types/supabase.ts
```
**Data (samples)**
```
data/listening/sample-001.json
data/reading/sample-001.json
data/writing/sample-001.json
data/speaking/sample-001.json
```
**Styling / Tracking**
```
tailwind.config.js
pages/_document.tsx
```

### Phase 2 — Monetization & Growth Loops
**Pages (routes)**
```
pages/checkout/index.tsx
pages/checkout/success.tsx
pages/checkout/cancel.tsx
pages/account/billing.tsx
pages/account/referrals.tsx
pages/partners/index.tsx
pages/admin/partners/index.tsx
pages/predictor/index.tsx
pages/predictor/result.tsx
```
**API routes**
```
pages/api/payments/create-checkout-session.ts
pages/api/payments/create-easypaisa-session.ts
pages/api/payments/create-jazzcash-session.ts
pages/api/subscriptions/portal.ts
pages/api/webhooks/payment.ts
pages/api/referrals/create.ts
pages/api/referrals/redeem.ts
pages/api/partners/summary.ts
pages/api/predictor/score.ts
```
**DB migrations**
```
db/migrations/006_teammates.sql
db/migrations/007_payment_events.sql
db/migrations/008_referral_guards.sql
```
**Lib / services**
```
lib/payments/index.ts
lib/payments/stripe.ts
lib/payments/easypaisa.ts
lib/payments/jazzcash.ts
lib/payments/verify.ts
lib/subscriptions.ts
lib/entitlements.ts
lib/referrals.ts
lib/partners.ts
lib/predictor.ts
```
**UI components**
```
components/payments/PlanPicker.tsx
components/payments/CheckoutForm.tsx
components/payments/InvoiceTable.tsx
components/referrals/ReferralCard.tsx
components/referrals/ShareLink.tsx
components/partners/PartnerSummary.tsx
components/predictor/BandPredictorForm.tsx
components/predictor/BandBreakdown.tsx
components/marketing/SocialProofStrip.tsx
```
**Emails**
```
emails/ReceiptEmail.tsx
emails/PaymentFailedEmail.tsx
emails/BuddyInviteEmail.tsx
emails/ReferralInviteEmail.tsx
emails/ReferralRewardEmail.tsx
```
**Types & tests**
```
types/payments.ts
types/referrals.ts
types/partners.ts
types/predictor.ts
tests/api/payments.webhook.test.ts
tests/pages/predictor.test.tsx
```
**Scripts**
```
scripts/generate_social_proof.ts
scripts/backfill_entitlements.ts
```

### Phase 3 — Scale & Retention
**Pages (routes)**
```
pages/challenge/index.tsx
pages/challenge/[cohort].tsx
pages/cert/[id].tsx
pages/teacher/index.tsx
pages/teacher/cohorts/[id].tsx
pages/accessibility.tsx
pages/settings/language.tsx
```
**API routes**
```
pages/api/challenge/enroll.ts
pages/api/challenge/progress.ts
pages/api/challenge/leaderboard.ts
pages/api/certificates/create.ts
pages/api/certificates/sign.ts
pages/api/teacher/cohorts.ts
pages/api/teacher/assignments.ts
pages/api/notifications/nudge.ts
```
**DB migrations**
```
db/migrations/010_challenge_progress.sql
db/migrations/011_teacher_cohorts.sql
db/migrations/012_certificates_assets.sql
```
**Lib / services**
```
lib/challenge.ts
lib/certificates.ts
lib/teacher.ts
lib/i18n/index.ts
lib/i18n/config.ts
lib/locale.ts
```
**UI components**
```
components/challenge/ChallengeCohortCard.tsx
components/challenge/TaskList.tsx
components/challenge/Leaderboard.tsx
components/certificates/CertificateCanvas.tsx
components/teacher/CohortTable.tsx
components/teacher/AssignTaskModal.tsx
components/common/LocaleSwitcher.tsx
```
**Emails**
```
emails/ChallengeWelcomeEmail.tsx
emails/DailyTaskEmail.tsx
emails/CertificateEmail.tsx
emails/TeacherNudgeEmail.tsx
```
**Types & tests**
```
types/challenge.ts
types/certificates.ts
types/teacher.ts
tests/pages/challenge.test.tsx
tests/api/challenge.progress.test.ts
tests/pages/cert/[id].test.tsx
tests/a11y/wcag-axe.test.ts
```
**Scripts**
```
scripts/seed_challenge.ts
scripts/generate_certificate_template.ts
scripts/l10n_extract.ts
```
**i18n content**
```
locales/en/*.json
locales/ur/*.json
```

### Phase 4 — Ecosystem (Coaching, Institutions, Proctoring, PWA, AI v2)
**Pages (routes)**
```
pages/marketplace/index.tsx
pages/coach/[id].tsx
pages/bookings/index.tsx
pages/bookings/[id].tsx
pages/classes/index.tsx
pages/classes/[id].tsx
pages/institutions/index.tsx
pages/institutions/[orgId]/index.tsx
pages/institutions/[orgId]/students.tsx
pages/institutions/[orgId]/reports.tsx
pages/proctoring/check.tsx
pages/proctoring/exam/[id].tsx
pages/labs/ai-tutor.tsx
pages/content/studio/index.tsx
pages/content/studio/[id].tsx
pages/reports/band-analytics.tsx
pages/pwa/app.tsx
```
**API routes**
```
pages/api/marketplace/coaches.ts
pages/api/marketplace/apply.ts
pages/api/bookings/availability.ts
pages/api/bookings/create.ts
pages/api/bookings/cancel.ts
pages/api/classes/create.ts
pages/api/classes/join-token.ts
pages/api/classes/attendance.ts
pages/api/proctoring/start.ts
pages/api/proctoring/verify.ts
pages/api/proctoring/flags.ts
pages/api/ai/speaking/score-v2.ts
pages/api/ai/writing/score-v2.ts
pages/api/ai/reading/explanations.ts
pages/api/institutions/orgs.ts
pages/api/institutions/students.ts
pages/api/institutions/reports.ts
pages/api/content/upload.ts
pages/api/content/publish.ts
```
**DB migrations**
```
db/migrations/013_coaches.sql
db/migrations/014_availability_bookings.sql
db/migrations/015_classes_sessions.sql
db/migrations/016_institutions.sql
db/migrations/017_proctoring.sql
db/migrations/018_ai_assessments_v2.sql
db/migrations/019_content_items.sql
db/migrations/020_reports_materialized.sql
```
**Lib / services**
```
lib/marketplace.ts
lib/booking.ts
lib/classes.ts
lib/proctoring.ts
lib/ai/speaking_v2.ts
lib/ai/writing_v2.ts
lib/ai/reading.ts
lib/institutions.ts
lib/content.ts
lib/reports.ts
lib/rbac.ts
lib/ratelimit.ts
lib/pwa.ts
```
**UI components**
```
components/marketplace/CoachCard.tsx
components/marketplace/ApplyCoachForm.tsx
components/bookings/SchedulePicker.tsx
components/bookings/TimezoneSelect.tsx
components/classes/ClassRoom.tsx
components/proctoring/SystemCheck.tsx
components/proctoring/CameraMicTile.tsx
components/ai/SpeakingRecorderV2.tsx
components/ai/EssayRubricV2.tsx
components/institutions/OrgSwitcher.tsx
components/institutions/StudentTable.tsx
components/institutions/ReportsFilters.tsx
components/content/ContentEditor.tsx
components/common/PWAInstallBanner.tsx
```
**Emails**
```
emails/CoachApplicationReceived.tsx
emails/CoachApplicationDecision.tsx
emails/BookingConfirmed.tsx
emails/BookingRescheduled.tsx
emails/ClassReminder.tsx
emails/OrgInviteEmail.tsx
```
**Types & tests**
```
types/marketplace.ts
types/bookings.ts
types/classes.ts
types/proctoring.ts
types/ai_v2.ts
types/institutions.ts
types/content.ts
tests/api/bookings.logic.test.ts
tests/api/proctoring.flags.test.ts
tests/lib/ai.writing_v2.rules.test.ts
tests/pages/institutions.reports.test.tsx
```
**Public / PWA**
```
public/manifest.webmanifest
public/icons/*
service-worker.ts
pages/api/pwa/ping.ts
```
**Scripts & cron**
```
scripts/cron/send_class_reminders.ts
scripts/cron/slots_cleanup.ts
scripts/cron/proctoring_review_digest.ts
scripts/backfill_ai_v2.ts
```

### Phase 5 — Platform & Enterprise (White-Label, Dev Portal, Data/Experiments, Compliance)
**Pages (routes)**
```
pages/enterprise/index.tsx
pages/enterprise/tenants/[id].tsx
pages/enterprise/tenants/[id]/brand.tsx
pages/enterprise/tenants/[id]/sso.tsx
pages/enterprise/tenants/[id]/admins.tsx
pages/developers/index.tsx
pages/developers/keys.tsx
pages/developers/webhooks.tsx
pages/integrations/index.tsx
pages/integrations/[slug].tsx
pages/analytics/index.tsx
pages/experiments/index.tsx
pages/experiments/[id].tsx
pages/compliance/gdpr.tsx
pages/compliance/dpa.tsx
pages/status.tsx
```
**API routes**
```
pages/api/enterprise/tenants/create.ts
pages/api/enterprise/tenants/update.ts
pages/api/enterprise/tenants/invite.ts
pages/api/enterprise/sso/saml/acs.ts
pages/api/enterprise/sso/saml/metadata.ts
pages/api/enterprise/sso/oidc/callback.ts
pages/api/developers/keys.ts
pages/api/developers/webhooks.ts
pages/api/integrations/slack/oauth.ts
pages/api/integrations/slack/events.ts
pages/api/integrations/zapier/hooks.ts
pages/api/integrations/make/hooks.ts
pages/api/analytics/events.ts
pages/api/experiments/assign.ts
pages/api/experiments/track.ts
pages/api/compliance/gdpr/export.ts
pages/api/compliance/gdpr/delete.ts
pages/api/compliance/dsar/status.ts
pages/api/status/health.ts
```
**DB migrations**
```
db/migrations/021_tenants.sql
db/migrations/022_sso.sql
db/migrations/023_api_keys.sql
db/migrations/024_webhooks.sql
db/migrations/025_integrations.sql
db/migrations/026_events_dw.sql
db/migrations/027_experiments.sql
db/migrations/028_compliance_audit.sql
```
**Lib / services**
```
lib/tenant.ts
lib/sso/saml.ts
lib/sso/oidc.ts
lib/devportal/keys.ts
lib/webhooks/dispatch.ts
lib/integrations/slack.ts
lib/integrations/zapier.ts
lib/integrations/make.ts
lib/analytics/ingest.ts
lib/analytics/warehouse.ts
lib/experiments/assign.ts
lib/experiments/analysis.ts
lib/compliance/gdpr.ts
lib/rate-limit.ts
lib/status.ts
```
**UI components**
```
components/enterprise/TenantSwitcher.tsx
components/enterprise/BrandForm.tsx
components/enterprise/SSOConfigForm.tsx
components/developers/ApiKeyList.tsx
components/developers/WebhookList.tsx
components/integrations/IntegrationCard.tsx
components/integrations/InstallButton.tsx
components/analytics/KPIWidgets.tsx
components/analytics/FunnelChart.tsx
components/experiments/ExperimentTable.tsx
components/compliance/DSARRequestForm.tsx
components/common/ScopeBadge.tsx
```
**Emails**
```
emails/EnterpriseInvite.tsx
emails/ApiKeyRotated.tsx
emails/WebhookBounced.tsx
emails/DSARStatus.tsx
```
**Types & tests**
```
types/tenants.ts
types/sso.ts
types/devportal.ts
types/webhooks.ts
types/integrations.ts
types/analytics.ts
types/experiments.ts
types/compliance.ts
tests/api/sso.saml.test.ts
tests/api/webhooks.delivery.test.ts
tests/lib/experiments.assign.test.ts
tests/api/compliance.export_delete.test.ts
```
**Scripts & ops**
```
scripts/rotate_api_keys.ts
scripts/replay_webhooks.ts
scripts/migrate_dw.ts
scripts/backfill_experiment_assignments.ts
scripts/compliance/anonymize_old_events.ts
scripts/status/cron_ping.ts
```
**Public / docs**
```
public/api/openapi.json
public/api/schemas/*.json
docs/DEVPORTAL.md
docs/WEBHOOKS.md
```
