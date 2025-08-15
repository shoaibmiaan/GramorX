# Premium Exam Room – 7-Day Developer Plan & Summary

> **Goal**: Build an isolated, PIN-gated Premium Exam Room with its own design system, multi-theme support, and elite exam experience.

---

## **7-Day Task Plan**

### **Day 1 – Design System Setup**
**Objectives**
- Create `/components/premium-ui` and `/styles/premium-theme.css`.
- Configure Tailwind with `prefix: 'pr-'` for Premium namespace isolation.
- Define theme tokens in CSS variables:
  - `Light`, `Dark`, `Aurora`, `Gold`.
- Implement `ThemeSwitcher` component for instant theme switching + persistence.

**Deliverables**
- `tailwind.config.premium.js`
- `styles/premium-theme.css`
- `ThemeSwitcher.tsx`
- Working theme toggle in a sample page.

---

### **Day 2 – PIN Gate**
**Objectives**
- Build `PinGate.tsx` component with:
  - PIN input field (masked).
  - Error handling + feedback.
  - API call to verify PIN.
- Create `premium_pins` table in Supabase with RLS.
- API route `POST /api/premium/verify-pin`.

**Deliverables**
- `PinGate.tsx`
- `premium_pins` table + RLS policy.
- API route `verify-pin.ts`.

---

### **Day 3 – Eligibility & Device Check**
**Objectives**
- Create `ExamGate.tsx` to:
  - Verify user subscription / credits via API.
  - Check microphone & camera permissions.
  - Request fullscreen permission.
- API route `POST /api/premium/eligibility`.

**Deliverables**
- `ExamGate.tsx`
- `/api/premium/eligibility` route.
- Flow: **PIN Verified → Eligibility → Device Check → Exam Start**.

---

### **Day 4 – Exam Shell & Layout**
**Objectives**
- Create `ExamShell.tsx`:
  - Fullscreen fixed layout.
  - HUD with timer & status indicators.
  - Question canvas (main column).
  - Media/notes dock (side column).
  - Footer with navigation & submit.
- Placeholder for `QuestionCanvas.tsx` (MCQ only for now).
- Placeholder for `TimerHUD.tsx`.

**Deliverables**
- `ExamShell.tsx` scaffold.
- `QuestionCanvas.tsx` (MCQ placeholder).
- `TimerHUD.tsx`.

---

### **Day 5 – Anti-Cheat & Event Logging**
**Objectives**
- Create `AntiCheatSentry.tsx`:
  - Detect focus loss (visibility API).
  - Detect paste/copy events.
  - Detect fullscreen exit.
- API route `POST /api/exam/[attemptId]/event` for event logging.
- `exam_events` table in Supabase with RLS.

**Deliverables**
- `AntiCheatSentry.tsx`
- `/api/exam/[attemptId]/event` route.
- `exam_events` table.

---

### **Day 6 – Submission & Scoring**
**Objectives**
- Implement `/api/exam/[attemptId]/submit` to:
  - Mark attempt as submitted.
  - Trigger scoring job.
- Implement `/api/exam/[attemptId]/score` to:
  - Return AI score + feedback.
- Create `ResultPanel.tsx` with:
  - Band dial.
  - Rubric breakdown.
  - AI feedback cards.

**Deliverables**
- Submit + score API routes.
- `ResultPanel.tsx`.

---

### **Day 7 – Polishing & QA**
**Objectives**
- Apply animations, glass effects, micro-interactions.
- Test all themes.
- Stress test:
  - Tab switch handling.
  - Autosave reliability.
  - PIN + eligibility bypass prevention.
- Bug fixes & deployment.

**Deliverables**
- Fully themed, PIN-gated Premium Exam Room.
- QA checklist completed.
- Deployed to production.

---

## **Developer Daily Summary**

### **Day 1 – Design System Isolation**
**Work Done:**
- Created `/components/premium-ui` for isolated UI components.
- Added `/styles/premium-theme.css` with **Light, Dark, Aurora, Gold** themes.
- Configured `tailwind.config.premium.js` with `prefix: 'pr-'` to avoid style conflicts.
- Implemented `ThemeSwitcher` for instant theme changes & persistence.
- Verified theme tokens work with sample UI.

**Impact:**  
Premium Room looks and feels completely different from the main portal — no style leaks.

---

### **Day 2 – PIN Gate**
**Work Done:**
- Created `PinGate.tsx` UI with masked input & error handling.
- Built `/api/premium/verify-pin` route for server-side PIN verification.
- Added `premium_pins` table in Supabase with **RLS** for per-user access.
- Tested incorrect & correct PIN flows.

**Impact:**  
Only authenticated users with the correct PIN can enter the exam room.

---

### **Day 3 – Eligibility & Device Check**
**Work Done:**
- Created `ExamGate.tsx` to check:
  - Premium entitlement & remaining credits.
  - Microphone & camera permissions.
  - Fullscreen readiness.
- Built `/api/premium/eligibility` endpoint.
- Hooked `ExamGate` into flow after PIN verification.

**Impact:**  
Prevents non-eligible or unprepared users from starting the exam, reducing failures mid-session.

---

### **Day 4 – Exam Shell & Layout**
**Work Done:**
- Created `ExamShell.tsx` with:
  - Fixed full-screen layout.
  - HUD with timer & status.
  - Question canvas area.
  - Media/notes dock.
  - Footer with navigation & submit.
- Added placeholder `QuestionCanvas.tsx` (MCQ type).
- Added `TimerHUD.tsx` for countdown.

**Impact:**  
Provides a distraction-free, elite exam interface ready for question rendering.

---

### **Day 5 – Anti-Cheat & Event Logging**
**Work Done:**
- Built `AntiCheatSentry.tsx` to detect:
  - Tab switch/focus loss.
  - Copy/paste attempts.
  - Fullscreen exit.
- Created `/api/exam/[attemptId]/event` route to log infractions.
- Added `exam_events` table in Supabase.

**Impact:**  
Exam sessions now log suspicious activity for review — supports fair testing.

---

### **Day 6 – Submission & Scoring**
**Work Done:**
- Created `/api/exam/[attemptId]/submit` to finalize attempts.
- Created `/api/exam/[attemptId]/score` to return AI-based scoring.
- Built `ResultPanel.tsx` with:
  - Band score dial.
  - Rubric breakdown.
  - AI feedback cards.

**Impact:**  
Provides immediate, premium-quality results with actionable feedback.

---

### **Day 7 – Polishing & QA**
**Work Done:**
- Applied glass effects, smooth animations, and micro-interactions.
- Verified all themes on desktop & mobile.
- Performed stress testing:
  - Tab switch detection.
  - Autosave under poor network.
  - PIN bypass prevention.
- Fixed bugs & deployed to staging.

**Impact:**  
Delivers a polished, high-end experience that meets elite brand expectations.

---

## **Database Tables**
- `premium_pins`
- `premium_entitlements`
- `exam_catalog`
- `exam_attempts`
- `exam_answers`
- `exam_events`
- `exam_scores`

---

## **API Routes**
- `POST /api/premium/verify-pin`
- `POST /api/premium/eligibility`
- `POST /api/exam/[slug]/start`
- `POST /api/exam/[attemptId]/save`
- `POST /api/exam/[attemptId]/event`
- `POST /api/exam/[attemptId]/submit`
- `GET  /api/exam/[attemptId]/score`

---

## **Component List**
- **Access Layer**
  - `PinGate`
  - `ExamGate`
- **UI Layer**
  - `ExamShell`
  - `TimerHUD`
  - `ThemeSwitcher`
  - `AntiCheatSentry`
  - `ResultPanel`
  - `QuestionCanvas`
  - `MediaDock`
  - `Scratchpad`

---

**Final Outcome**  
By end of Day 7, the Premium Exam Room is:
- Visually isolated with its own design system & themes.
- PIN-gated and RLS-secured.
- Exam-grade with eligibility checks, anti-cheat, and pro-level scoring.
- Polished to give users an elite, exclusive feel.
