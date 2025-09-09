
## **Phase 1 – Audit & Planning (Weeks 1–2)**

**Objectives:**

* Identify existing issues in the current design system and site structure.
* Define responsive breakpoints, navigation hierarchy and gamification requirements.

**Key Actions:**

1. **Component & page audit:** Document all components and pages, noting where they lack responsive classes, semantic HTML or accessibility labels.
2. **User research:** Gather feedback from learners, teachers and other stakeholders to prioritize pain points (e.g. difficulty navigating on mobile, lack of progress tracking).
3. **Requirements gathering:** Define the scope for navigation changes, dashboards, personalization, gamification and accessibility.
4. **Design guidelines:** Finalize breakpoints (e.g. 0–640 px, 641–1024 px, 1025 px+), typography scales, colour palettes and iconography.  Draft a simple style guide for consistent usage.

**Deliverables:** Audit report, prioritized requirements document, style guide draft, timeline approval.

---

## **Phase 2 – Mobile‑First & Responsive Refactoring (Weeks 3–6)**

**Objectives:**

* Ensure the platform works seamlessly on phones, tablets and desktops.
* Establish a solid foundation for future features.

**Key Actions:**

1. **Refactor core components:** Update Container, Card, Button, Input and Modal components to use mobile‑first layouts with responsive utility classes.  Test stacking/reflow behavior across breakpoints.
2. **Build responsive navigation:** Create a new `Navbar` component with a hamburger menu for small screens and a horizontal bar for larger screens.  Include persistent access to profile/settings.
3. **Adjust layouts:** Redesign landing pages and existing module pages (Listening, Reading, Writing, Speaking) to use responsive grids or flex layouts.  Ensure modals and drawers expand to full screen on mobile.
4. **Cross-device testing:** Use browser emulators and real devices to check for layout, overflow or interaction issues.  Iterate until each page scales gracefully.

**Deliverables:** Updated design-system components, responsive page templates, mobile navigation design, test report.

---

## **Phase 3 – Navigation & Information Architecture (Weeks 7–9)**

**Objectives:**

* Simplify how users discover and move between modules.
* Surface key actions and content through an intuitive dashboard.

**Key Actions:**

1. **Dashboard design:** Develop a personalized dashboard that includes cards for each module, quick actions and highlights (e.g. upcoming lessons, band score trajectory).
2. **Breadcrumbs & in-module navigation:** Implement breadcrumb trails within modules.  Provide “Back to dashboard” and “Next/Previous” links for a smooth learning flow.
3. **Search & filtering:** Add a global search bar and module‑specific filters (e.g. by topic, difficulty level).  Provide a tag system for easier discovery.
4. **Content reorganization:** Break long text pages or single large documents into smaller, self‑contained sections or tabs.  Use anchors for quick navigation within a page.

**Deliverables:** Dashboard mockups and implementation, updated module layouts with breadcrumbs, search and filter components.

---

## **Phase 4 – Gamification & Engagement (Weeks 10–13)**

**Objectives:**

* Increase learner motivation through rewards and feedback loops.
* Encourage consistent usage by making learning fun.

**Key Actions:**

1. **Define gamification mechanics:** Finalize points system, badge criteria, streak logic and leaderboard rules.
2. **Build progress tracking:** Implement a `ProgressBar` component and integrate it into module headers and the dashboard.  Display completion percentages and estimated time to finish.
3. **Add badges & streak counters:** Design a set of badges (e.g. “Listening Master”, “7‑Day Streak”) and a streak counter.  Trigger visual celebrations (animations or confetti) when users achieve milestones.
4. **Leaderboard & social elements:** Create a leaderboard page that ranks users within cohorts.  Add sharing features or community boards if appropriate.
5. **Micro‑interactions:** Add subtle feedback like button animations, progress indicators, and success toasts.

**Deliverables:** Badge designs, progress bar component, streak counter, leaderboard, gamified UI deployed to staging.

---

## **Phase 5 – Personalization & Analytics (Weeks 14–16)**

**Objectives:**

* Tailor the learning experience to individual needs.
* Provide actionable insights for both learners and educators.

**Key Actions:**

1. **Data infrastructure:** Ensure events (e.g. lesson completion, quiz scores, time spent) are captured and stored securely.  Comply with privacy laws and provide clear user consent messaging.
2. **Recommendation engine:** Develop logic to recommend next lessons or practice tests based on performance and goals.  Display “Recommended for you” sections on the dashboard and inside modules.
3. **Goal‑setting & reminders:** Allow users to set target band scores and weekly study goals.  Add push/email reminders and track progress.
4. **Analytics dashboards:** Build an admin/teacher dashboard that displays aggregated data (e.g. average scores, completion rates, topic difficulty).  Use charts and tables for clarity.

**Deliverables:** Data pipelines, recommendation algorithms, goal-setting interface, analytics dashboards for learners and admins.

---

## **Phase 6 – Accessibility & Inclusive Design (Weeks 17–19)**

**Objectives:**

* Ensure the platform is usable by all learners, including those with disabilities.
* Meet WCAG 2.1 AA standards.

**Key Actions:**

1. **Accessibility audit:** Conduct thorough testing with tools (WAVE, Lighthouse) and manual checks.  Document issues.
2. **Add ARIA roles & labels:** Ensure all custom components (modals, tabs, dropdowns) have appropriate ARIA attributes.  Provide alt text for images and transcripts for audio/video.
3. **Improve color contrast & theming:** Adjust color variables to meet contrast ratios; expand dark mode and introduce a high‑contrast theme.
4. **Keyboard & screen‑reader support:** Test navigation with only a keyboard; adjust tab order; make interactive elements (e.g. slider, timer) screen‑reader friendly.
5. **User preference options:** Provide toggles for text size, motion reduction, and theme selection.

**Deliverables:** Accessibility checklist, updated components with ARIA support, contrast‑compliant color palette, user‑controlled settings.

---

## **Phase 7 – Visual & Branding Refinement (Weeks 20–21)**

**Objectives:**

* Enhance the aesthetic appeal and reflect the IELTS brand.
* Maintain consistency across all screens and modules.

**Key Actions:**

1. **Finalize a visual style guide:** Document colour usage, typography, button styles, card layouts and iconography.  Include sample pages for reference.
2. **Upgrade imagery:** Replace placeholder images with bespoke or high-quality photos and illustrations tailored to IELTS themes (exams, study, international students).
3. **Spacing & typography cleanup:** Adjust line spacing and margin/padding to improve readability.  Standardize headings, subheadings and body text across modules.
4. **Prototype review:** Build prototypes of key pages (home, dashboard, module page, exam flow) and run quick usability tests with target users (students, teachers).

**Deliverables:** Finalized style guide, updated graphics, refined typography and layouts, usability test report.

---

## **Phase 8 – Testing, QA & Launch (Weeks 22–24)**

**Objectives:**

* Validate all new features and design improvements.
* Prepare for a smooth rollout.

**Key Actions:**

1. **Integration testing:** Ensure responsive layouts, navigation flows, gamification mechanics, personalization features and accessibility improvements work together without conflicts.
2. **User acceptance testing (UAT):** Engage a small group of students/teachers in using the updated platform, collecting feedback on usability, performance and engagement.
3. **Performance & security testing:** Validate load times on mobile and desktop; ensure data privacy and secure storage of user information.
4. **Documentation & training:** Update documentation for developers and support staff.  Provide internal training on new components and features.
5. **Incremental rollout:** Deploy changes to staging first, then to production gradually (e.g. starting with a subset of modules), monitoring analytics and user feedback.  Fix any bugs before full launch.

**Deliverables:** Test plans and reports, updated documentation, final release package, rollout timeline.

---

**Ongoing Work:**

* **Iteration and feedback loops:** After launch, continue collecting user feedback and usage data.  Apply lessons learned to refine features in future sprints.
* **Continuous documentation:** Keep design and engineering documentation up to date, ensuring that new features align with established guidelines.
* **Monitor key metrics:** Track engagement (time on platform, streaks), success rates (band score improvements), accessibility issues and performance metrics to inform future development priorities.


Awesome—here’s exactly what **Phase 1 (Audit & Planning)** includes, broken into tight, do-able workstreams with concrete outputs and acceptance criteria.

---

## 1) UI/Codebase Audit (Design System + Pages)

**What you’ll do**

* Inventory every DS primitive and composite: `components/design-system/*` (Button, Card, Input, Modal, NavLink, etc.) and page shells.
* Flag issues: missing responsive classes, inline styles, inconsistent tokens, a11y gaps (labels, contrast, focus, keyboard traps), dark-mode leaks.
* Map each page to its composing components; capture screenshots at **sm/md/lg**.
* Run automated checks (Lighthouse/Axe) + manual keyboard pass.

**How you’ll do it (repo-specific)**

* Verify token usage in `tailwind.config.js`, `design-system/tokens/*`.
* Check `NavLink` for mobile patterns (hamburger / collapse) and focus rings.
* Scan for legacy classes (`text-lightText`, `grayish`, etc.) and inline hex colours; note replacements with semantic tokens.

**Outputs**

* Component Matrix (coverage & issues)
* Page-by-page Responsive Findings (screenshots + notes)
* A11y Findings Log (quick severity tags)

**Accept when**

* Every DS component and top-15 pages have a row in the matrix.
* Each finding is tagged with **Severity (P1–P3)** and **Fix Type** (tokens, layout, a11y, content).

---

## 2) Rapid User & Stakeholder Discovery

**What you’ll do**

* 4–6 quick interviews (learners + a teacher/admin).
* Lightning survey: top tasks, device split, pain points, desired rewards.
* Define success metrics (e.g., **mobile task success**, **avg time to start a mock test**, **7-day streak retention**).

**Outputs**

* Top-Tasks List (ranked)
* Target Metrics (baseline + goals)
* Key Personas (lean one-pager each)

**Accept when**

* We have 3–5 measurable UX goals tied to Phase 2–4 features.

---

## 3) Requirements & Prioritization

**What you’ll do**

* Convert audit + research into a prioritized backlog using **MoSCoW**.
* Group into epics: **Responsiveness**, **Navigation/IA**, **Gamification**, **Personalization**, **Accessibility**, **Visual Polish**.
* Identify dependencies (e.g., tokens before component refactors).

**Outputs**

* Prioritized Backlog (epics → stories with DoD)
* Risk Register (scope/tech/UX)
* Cut-lines for each upcoming phase

**Accept when**

* Each epic has sized stories and a “definition of done”.

---

## 4) Design Foundations (Tokens & Patterns)

**What you’ll do**

* Lock mobile-first breakpoints and grids (columns, gutters).
* Finalize typography scale, spacing, elevation, motion rules (reduce-motion support).
* Confirm colour tokens and contrast targets (WCAG 2.1 AA).
* Specify patterns: **mobile navbar**, **card grid reflow**, **full-screen mobile modal**.

**Outputs**

* Tokens Spec v1 (type scale, spacing, colour roles, radii)
* Responsive Patterns Spec (diagrams)
* Component Behaviour Notes (sm/md/lg rules per component)

**Accept when**

* Tokens pass contrast checks and patterns cover top page layouts.

---

## 5) Technical Groundwork

**What you’ll do**

* Enforce linting & a11y: `eslint-plugin-jsx-a11y`, focus-visible.
* Decide on preview/docs (Storybook or MDX) for DS components.
* Create utility helpers (e.g., `cx`, responsive helpers), and a template for DS stories/tests.
* Define image guidelines (sizes, formats, lazy-load).

**Outputs**

* Updated lint/prettier configs
* DS Docs skeleton (stories or MDX)
* Engineer-facing “How to build a DS component” playbook

**Accept when**

* CI fails on a11y/lint regressions; Storybook (or equivalent) runs locally with ≥10 key components.

---

## 6) Planning & Resourcing

**What you’ll do**

* Build a sprint plan for Phases 2–4 (two-week sprints).
* RACI for each epic (Design, FE, QA, Content).
* Test strategy: device matrix, assistive tech coverage.

**Outputs**

* Sprint Schedule (milestones & demos)
* RACI Matrix
* Test Plan (devices, tools, owners)

**Accept when**

* Everyone knows **who does what** and **when it’s demoed**.

---

### Phase 1 Deliverables (short list)

| Deliverable                 | Owner       | Notes                        |
| --------------------------- | ----------- | ---------------------------- |
| Component Matrix            | FE Lead     | Coverage, issues, severity   |
| Responsive Findings (pages) | FE + Design | sm/md/lg screenshots         |
| A11y Findings               | QA          | Axe/Lighthouse + manual      |
| Tokens & Patterns Spec v1   | Design      | Type, spacing, colour, grids |
| Prioritized Backlog         | PM          | MoSCoW, epics, DoD           |
| Sprint Plan & RACI          | PM          | Next 2–3 sprints             |
| Test Plan                   | QA Lead     | Devices, tools, criteria     |

---

### Phase 1 Acceptance Criteria (single glance)

* ✅ All DS components and key pages audited with **actionable** findings.
* ✅ Tokens & responsive patterns signed off by Design + FE.
* ✅ Backlog groomed and **Phase 2 stories** are ready to start (clear DoD).
* ✅ A11y baseline measured; contrast and keyboard targets set.
* ✅ Sprint plan agreed; owners and demo dates confirmed.

---


Of course. Here is **Phase 2 – Mobile‑First & Responsive Refactoring** broken down into the same detailed, workstream-based format as Phase 1.

---

## **Phase 2 – Mobile‑First & Responsive Refactoring (Weeks 3–6)**

**Primary Objective:** To systematically rebuild the core UI to be fluid, responsive, and robust across all device sizes, establishing a future-proof foundation for all subsequent features.

**Success Metric:** 100% of key user tasks (e.g., starting a lesson, navigating to a module, completing a quiz) can be completed without friction or visual breakage on phones, tablets, and desktops.

---

## 1) Foundational Responsive Scaffolding

**What you’ll do**

*   Finalize and implement the responsive grid system and base HTML structure across all pages.
*   Ensure all base styles are defined with a mobile-first approach.

**How you’ll do it (Technical Execution)**

*   **Container Component:** Create/Update a `Container` component that uses `max-width` and responsive padding (e.g., `mx-auto px-4 sm:px-6 lg:px-8`).
*   **Root Layout:** Ensure the root layout uses modern CSS like `min-height: 100dvh` (dynamic viewport height) for better mobile handling.
*   **Viewport Meta Tag:** Verify `<meta name="viewport" content="width=device-width, initial-scale=1">` is present in all pages.
*   **HTML Semantics:** Audit and replace generic `div` containers with semantic HTML elements (`<main>`, `<section>`, `<article>`, `<header>`, `<nav>`) for better structure and accessibility.

**Outputs**

*   A standardized, reusable `Container` component.
*   Audited and corrected HTML structure for top-level page layouts.

**Accept when**

*   The `Container` component is used consistently across all new and refactored pages.
*   All pages pass a semantic HTML validator check.

---

## 2) Core Design System Component Refactoring

**What you’ll do**

*   Refactor the most critical, atomic DS components to be fully responsive and token-driven.

**How you’ll do it (Technical Execution)**

*   **Button:** Ensure it uses `inline-flex`, `items-center`, has padding that scales (e.g., `py-2 px-4`), and a disabled state. Test text doesn't wrap awkwardly.
*   **Input/Textarea:** Use `w-full` for mobile, with `max-width` constraints on larger screens. Ensure font size is at least `16px` to prevent iOS zoom.
*   **Card:** This is critical. Use `flex` or `grid` internally. Ensure images are responsive (`w-full h-auto object-cover`). The root element should have `overflow-hidden`, `rounded-lg`, and a shadow.
*   **Modal/Drawer:** Build a responsive modal. On mobile (`sm`), it should be `fixed`, `inset-0`, `w-screen h-screen`, potentially with a `flex` layout to push content to the bottom (sheet-like). On desktop (`lg+`), it becomes a centered box with `max-w-lg` or similar.

**Outputs**

*   A set of updated, tested, and documented DS components (Button, Input, Card, Modal).
*   A "DS Responsive Checklist" for future components.

**Accept when**

*   Each component resizes and reflows correctly at all breakpoints without horizontal overflow.
*   All hardcoded values (colors, sizes) are replaced with design tokens from `tailwind.config.js`.

---

## 3) Responsive Navigation Implementation

**What you’ll do**

*   Build a new `Navbar` component that provides intuitive navigation on both mobile and desktop.

**How you’ll do it (Technical Execution)**

*   **Desktop (`lg+`):** Horizontal flexbox (`flex`, `items-center`, `space-x-8`). Logo on left, nav links in center, user profile/actions on right.
*   **Mobile (default):** Use a `flex` layout between logo (left), a hamburger menu button (right), and key icons (e.g., profile, search).
*   **Mobile Menu Drawer:** The menu links should be in a hidden drawer. Use a headless UI component (like `@headlessui/react` `Dialog`) or manage state with `useState`. The drawer should:
    *   Be `fixed`, `inset-0`, with a translucent backdrop.
    *   Have a sliding or fading animation.
    *   Be dismissible by clicking the backdrop or a close button.
    *   **Crucially:** Manage focus trapping and aria attributes (`aria-labelledby`, `aria-modal="true"`) for accessibility.

**Outputs**

*   A new, accessible `Navbar` component.
*   Documented component props and usage examples.

**Accept when**

*   The navigation works perfectly on real mobile and desktop devices.
*   It passes keyboard navigation and screen reader tests (tab order, aria labels, focus management).

---

## 4) Page Layout & Reflow Overhaul

**What you’ll do**

*   Apply responsive principles to overhaul the layout of key pages (Home, Module listings, Lesson pages).

**How you’ll do it (Technical Execution)**

*   **Grids & Flexbox:** Replace old float-based or fixed-width layouts with `grid` and `flex` using responsive modifiers.
    *   *Example:* A lesson list: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
    *   *Example:* A header with a title and button: `flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`.
*   **Text & Images:** Ensure text is readable without zooming (use `text-sm`/`text-base`). Make images `max-w-full` to prevent overflow.
*   **Spacing:** Adjust margins and padding to be tighter on mobile (`p-4`) and more spacious on desktop (`lg:p-8`).
*   **Table Overhaul:** For any data tables, implement horizontal scrolling containers (`overflow-x-auto`) on mobile to prevent layout breakage.

**Outputs**

*   Refactored and responsive Home, Dashboard, and at least 2 core module pages.
*   A documented set of common layout patterns used.

**Accept when**

*   No page has horizontal scrolling on any device width between 320px and 1920px.
*   Content reflows logically and remains readable on all screen sizes.

---

## 5) Cross-Device & Browser Testing

**What you’ll do**

*   Rigorously test the refactored components and pages on a wide matrix of devices and browsers.

**How you’ll do it (Technical Execution)**

*   **BrowserStack / LambdaTest:** Use cloud services to test on various OS/browser combinations (Safari iOS, Chrome Android, Desktop Safari, Edge).
*   **Real Device Testing:** Test on at least one physical iOS and Android device. Pay special attention to:
    *   Viewport height issues (address bars hiding).
    *   Touch targets (are buttons and links easy to tap?).
    *   Performance on slower devices.
*   **Lighthouse CI:** Run Lighthouse audits for Performance, Accessibility, and Best Practices on every pull request to prevent regressions.

**Outputs**

*   A "Test Matrix" report detailing what was tested on which device/browser.
*   A bug log with assigned priorities (P0-P2).

**Accept when**

*   All P0 (critical) bugs are fixed (e.g., layout broken on iOS Safari, touch not working).
*   Lighthouse scores for Mobile Performance and Accessibility are >80 on key pages.

---

### Phase 2 Deliverables (short list)

| Deliverable                         | Owner       | Notes                                                  |
| ----------------------------------- | ----------- | ------------------------------------------------------ |
| Refactored DS Components (Core Set) | FE Engineer | Button, Input, Card, Modal - using tokens, responsive  |
| New Responsive Navbar Component     | FE Engineer | With mobile drawer and desktop horizontal nav          |
| Refactored Page Templates           | FE Engineer | Home, Dashboard, Module Listing - responsive & clean   |
| Responsive Layout Patterns Doc      | Design + FE | Documents the grid/flex patterns used for future ref   |
| Test Report & Bug Log               | QA Engineer | List of tested devices/browsers and resolved issues    |

---

### Phase 2 Acceptance Criteria (single glance)

*   ✅ **All** core DS components are refactored to use tokens and are responsive.
*   ✅ The new `Navbar` component is launched and functions perfectly on mobile and desktop.
*   ✅ The **Homepage** and **Dashboard** are fully responsive and free of visual bugs on all target devices.
*   ✅ No page or component suffers from horizontal overflow on any screen size.
*   ✅ Lighthouse CI is set up and passing for key pages, ensuring no regressions in performance or accessibility.

## **Phase 3 – Navigation & Information Architecture (Weeks 7–9) - Developer Summary**

**Objective:** To architect and implement a logical, intuitive, and efficient structural framework. This phase focuses on the backend of navigation (data flow, state management) and the frontend components that make it usable.

**Success Metric:** Reduce the number of clicks to complete key tasks (start a lesson, review progress) by >25%. Eliminate user reports of "getting lost" in the platform.

---

### **Workstream 1: Dashboard Data Architecture & Implementation**

**The Goal:** Build a personalized dashboard that is dynamic and data-driven, not a static page.

**Technical Execution:**

1.  **API Endpoint:**
    *   Create a new API route (e.g., `/api/user/dashboard`).
    *   This endpoint will aggregate data from multiple sources: user progress, course modules, recommendations (stubbed for now), and recent activity.
    *   **Database Queries:** You'll likely need to `JOIN` tables like `Users`, `UserProgress`, `Modules`, and `Lessons`.
    *   **Response Shape:** Return a structured JSON object containing all necessary data to populate the dashboard components in a single request to minimize client-side fetching.

    ```json
    {
      "user": { "name": "Jane Doe", "targetBandScore": 7.5 },
      "modules": [
        {
          "id": "listening",
          "title": "Listening",
          "progress": 65,
          "nextRecommendedLesson": { "id": "l-101", "title": "Signals and Signposts" }
        }
      ],
      "recentActivity": [...],
      "recommendations": [...]
    }
    ```

2.  **Dashboard Component (`/app/dashboard/page.tsx`):**
    *   This page will be a **Server Component** (in the App Router). It will fetch the data from the `/api/user/dashboard` endpoint (or directly from the database via a server-side function) on the server.
    *   It will pass this data as props to client-side components like the `ProgressBar` and `ModuleCard`.
    *   **Key Consideration:** Decide on the data-fetching strategy. Using a server component is more efficient as it prevents a client-side loading state and is better for SEO.

3.  **ModuleCard Component:**
    *   A client component that takes `title`, `progress`, and `nextRecommendedLesson` as props.
    *   It will display the data and link to the appropriate module or lesson page.

**Acceptance Criteria (Dev):**
*   ✅ `/api/user/dashboard` endpoint exists and returns valid, structured data.
*   ✅ Dashboard page is a Server Component that fetches data on the server.
*   ✅ Data is correctly passed down to and rendered by the `ModuleCard` and `ProgressBar` components.

---

### **Workstream 2: Hierarchical Navigation Systems**

**The Goal:** Implement context-aware navigation aids that help users understand their location within the site's hierarchy.

**Technical Execution:**

1.  **Breadcrumbs Component:**
    *   **Logic:** This component must be dynamic. It should generate its links based on the current URL pathname.
    *   **Implementation (App Router):** Use the `usePathname()` hook from `next/navigation` to get the current path (e.g., `/dashboard/listening/lesson-1`).
    *   **Algorithm:** Split the pathname and map each segment to a human-readable label (e.g., `listening` -> "Listening Module"). You might need a lookup object or function.
    *   **Rendering:** Render a `nav` with `aria-label="Breadcrumb"`. Use `ol` and `li` elements for correct semantics. The last item should have `aria-current="page"`.

2.  **In-Module Navigation (Previous/Next):**
    *   **Data Structure:** This requires a structured content model. Each lesson must know its ID, the module it belongs to, and its position within that module's hierarchy (e.g., a `position` field in the `Lessons` table).
    *   **API/Data Fetching:** On a lesson page (e.g., `/lesson/{id}`), fetch not just the lesson content, but also the `previousLessonId` and `nextLessonId` based on the current lesson's `position`.
    *   **Component:** Create a `LessonNavigation` component that receives these IDs and renders `Link` components to the previous and next lessons. Disable the "Next" button if the current lesson is not completed (check `UserProgress` table).

**Acceptance Criteria (Dev):**
*   ✅ `Breadcrumbs` component dynamically renders based on the `pathname`.
*   ✅ Lesson data model includes a `position` or `order` field.
*   ✅ The lesson page API response or data fetch includes `previousLessonId` and `nextLessonId`.
*   ✅ The `LessonNavigation` component correctly links between lessons and respects completion state.

---

### **Workstream 3: Search & Filtering Engine**

**The Goal:** Build a scalable, client-side first search and filter system for content discovery.

**Technical Execution:**

1.  **Client-Side Search (Initial Approach):**
    *   **Data Fetching:** On the modules listing page, fetch the complete list of lessons (or a summarized version with `id`, `title`, `tags`, `difficulty`) and store it in a client-side state or context.
    *   **Search Input:** Create a controlled input component. On change (`onChange` event), filter the client-side list of lessons based on the input value matching against `title` and `tags`.
    *   **Performance:** For large datasets, debounce the input handler to avoid filtering on every keystroke. Use `useDeferredValue` (React) to prevent the UI from locking up.

2.  **Filtering System:**
    *   **State Management:** Use the **URL's query string as the source of truth** for filter states.
    *   **Implementation:** For a filter like `difficulty`, the link would be `?difficulty=hard`. Use `useSearchParams()` (Next.js) to read and update the URL.
    *   **Benefits:** This allows shareable, bookmarkable URLs and simplifies state synchronization between multiple filter components.
    *   **Filtering Logic:** The displayed list of lessons is a function of the full client-side list `filter(lesson => lesson.difficulty === searchParams.get('difficulty'))`.

3.  **Tag System:**
    *   Ensure each lesson in the database has a `tags` field (an array of strings or a related table). Render these tags and make them clickable, which adds the tag to the URL query string as a filter.

**Acceptance Criteria (Dev):**
*   ✅ The modules page loads a full lesson list on the client (or server component passes it).
*   ✅ The search input filters the displayed list in real-time (debounced).
*   ✅ All filters update the URL query string without causing a full page reload (`router.push` or `replace`).
*   ✅ The UI correctly reflects the active filters from the URL on page load.

---

### **Workstream 4: Content Reorganization (Tabs & Anchors)**

**The Goal:** Break down large, monolithic pages into scannable, interactive sections without requiring multiple page loads.

**Technical Execution:**

1.  **Tabs Component:**
    *   **Accessibility is Key.** Do not use `div` and `onClick`. Use the correct ARIA roles (`tablist`, `tab`, `tabpanel`).
    *   **Recommendation:** Use a headless UI library like `@headlessui/react` which provides an accessible `Tab` component out of the box. This handles keyboard navigation (arrow keys), focus management, and ARIA attributes automatically.
    *   **State:** Manage the currently selected tab via state (e.g., `useState`). The content for each tab can be statically included in the component.

2.  **Anchor Links (Table of Contents):**
    *   For long pages, generate a list of links based on the page's heading elements (`h2`, `h3`).
    *   **Implementation:** You can do this manually or create a component that uses the `Intersection Observer API` to highlight the current section in the ToC as the user scrolls.
    *   **Linking:** Use the `id` attribute on headings (e.g., `<h2 id="section-1">`) and standard anchor links (`<a href="#section-1">`).

**Acceptance Criteria (Dev):**
*   ✅ Tabs component is fully keyboard navigable and has correct ARIA attributes (or uses a proven library).
*   ✅ Anchor links correctly jump to the specified section on the page.
*   ✅ URL hash changes when using anchor links, allowing deep linking to a specific section.

---

### **Phase 3 Deliverables & Exit Criteria (Dev Focus)**

| Deliverable                         | Owner       | Proof of Completion                                                                                               |
| ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| Dashboard API Endpoint              | Backend     | ✅ API route exists and returns correct aggregated data structure.                                                 |
| Dynamic Dashboard Page              | Frontend    | ✅ Server Component fetches from API and renders personalized `ModuleCard` components without client-side loading. |
| Breadcrumbs Component               | Frontend    | ✅ Component dynamically renders based on `pathname`. Accessible and semantically correct.                        |
| Lesson Navigation Component         | Frontend    | ✅ "Prev/Next" buttons work, are disabled appropriately, and link to the correct lessons.                         |
| Search & Filter System              | Full-Stack  | ✅ Search filters client-side list. Filters use URL query params. State is preserved and shareable.               |
| Accessible Tabs Component           | Frontend    | ✅ Implemented (from scratch or via library) and passes keyboard & screen reader testing.                         |

**Phase 3 is complete when:** The dashboard is dynamic, navigation between and within modules is seamless and context-aware, and users can effectively discover content through search and filtering. All data flows are established and tested.

## **Phase 4 – Gamification & Engagement (Weeks 10–13) - Developer Summary**

**Objective:** To design, implement, and integrate game-like mechanics that leverage data to boost user motivation, reward progress, and encourage consistent platform usage. This phase is heavily backend-driven with critical frontend integration.

**Success Metric:** Increase daily active users (DAU) and weekly retention rates by a measurable margin (e.g., 15%). Achieve a target of X% of active users earning at least one badge per week.

---

### **Workstream 1: Gamification Data Foundation & API**

**The Goal:** Architect the backend systems to track, calculate, and award gamification elements. This is the core of the entire phase.

**Technical Execution:**

1.  **Database Schema Changes:**
    *   **`UserPoints` Table:** `id`, `userId`, `points`, `source` (e.g., 'lesson_complete', 'quiz_pass'), `sourceId` (e.g., `lessonId`), `timestamp`.
    *   **`UserBadges` Table:** `id`, `userId`, `badgeId`, `awardedAt`.
    *   **`Badges` Table:** `id`, `name`, `description`, `imageUrl`, `criteria` (e.g., `{ type: 'points', threshold: 1000 }` OR `{ type: 'streak', threshold: 7 }`). Storing criteria as JSON allows for flexibility.
    *   **`UserStreaks` Table:** `id`, `userId`, `lastActivityDate`, `currentStreak`. This is optimized for easy checking and updating.

2.  **Event-Driven Architecture:**
    *   **Create Event Listeners:** Instead of placing gamification logic directly inside lesson completion code, emit events (e.g., `USER_COMPLETED_LESSON`, `USER_PASSED_QUIZ`).
    *   **Create a Gamification Service:** This service listens for these events and contains all the business logic:
        ```javascript
        // Pseudocode Example: Event Handler
        eventBus.on('USER_COMPLETED_LESSON', (data) => {
          await gamificationService.awardPoints(data.userId, 10, 'lesson_complete', data.lessonId);
          await gamificationService.checkForBadges(data.userId, 'lesson_complete');
          await gamificationService.updateStreak(data.userId);
        });
        ```
    *   **Idempotency:** Ensure handlers are idempotent (processing the same event twice doesn't award points twice) to handle potential duplicate events.

3.  **API Endpoints:**
    *   `GET /api/user/{userId}/points`: Returns total points and maybe a recent history.
    *   `GET /api/user/{userId}/badges`: Returns list of earned badges.
    *   `GET /api/user/{userId}/streak`: Returns current streak count.
    *   `GET /api/leaderboard`: Fetches rankings. **Crucially:** Accept a `scope` query parameter (e.g., `?scope=all_time`, `?scope=weekly`) to filter the query.

**Acceptance Criteria (Dev):**
*   ✅ New database tables are created and relationships are defined.
*   ✅ Event listeners are set up for core user actions (lesson complete, quiz pass).
*   ✅ The `GamificationService` correctly awards points and checks for badge eligibility upon receiving events.
*   ✅ API endpoints return correct data for the current user.

---

### **Workstream 2: Progress Tracking Integration**

**The Goal:** Surface progress data consistently across the application.

**Technical Execution:**

1.  **`ProgressBar` Component:**
    *   Make it a reusable client component. It should accept a `value` prop (e.g., `65` for 65%) and optionally a `max` prop.
    *   **Styling:** Use a parent `div` for the background bar and a child `div` with `width: ${value}%` for the progress indicator. Animate the width change with a CSS transition.
    *   **Integration:** Use this component in:
        *   `ModuleCard` on the dashboard (pass `progress` from API).
        *   The header of individual lesson pages.

**Acceptance Criteria (Dev):**
*   ✅ A generic `ProgressBar` component exists in the DS and is styled correctly.
*   ✅ The dashboard and lesson pages display accurate progress using this component.

---

### **Workstream 3: Badge & Streak Systems (Frontend)**

**The Goal:** Create the UI elements that display user achievements and provide celebratory feedback.

**Technical Execution:**

1.  **`Badge` Component:**
    *   A component that takes a `badge` object (name, image, description) and displays it, often in a grid layout on a profile page.
    *   **Lazy Loading:** Consider using `next/image` to optimize badge image loading.

2.  **`StreakCounter` Component:**
    *   A small component, likely for the dashboard or navbar, that displays the current streak (e.g., "🔥 7").
    *   It will fetch data from the `/api/user/streak` endpoint.

3.  **Celebration Mechanics (`canvas-confetti`):**
    *   Install the `canvas-confetti` library.
    *   **Triggering:** Call the `confetti()` function when a significant event happens (e.g., a badge is awarded). This should be done in a `useEffect` hook that checks for new badges since the last render.
    *   **Critical Accessibility:** **Wrap this in a check for `prefers-reduced-motion`.** 
        ```javascript
        const prefersReducedMotion = usePrefersReducedMotion(); // Custom hook or window.matchMedia
        if (!prefersReducedMotion) {
          import('canvas-confetti').then((confettiModule) => confettiModule.default(...));
        }
        ```

**Acceptance Criteria (Dev):**
*   ✅ `Badge` and `StreakCounter` components are built and integrated into the UI.
*   ✅ Confetti animations fire upon badge achievement for users who have not set `prefers-reduced-motion`.
*   ✅ New badges are visually highlighted when first earned.

---

### **Workstream 4: Leaderboard Implementation**

**The Goal:** Build a performant and scalable leaderboard system.

**Technical Execution:**

1.  **Database Query Optimization:**
    *   **The Problem:** Calculating rankings with `ROW_NUMBER()` or `RANK()` over entire user tables on every request is expensive.
    *   **The Solution:** **Pre-calculate scores.** Have a scheduled job (e.g., a cron job) that runs nightly to update a `UserRank` table with the current points totals and rankings for each user. The `GET /api/leaderboard` endpoint then simply queries this pre-calculated table, which is extremely fast.
    *   **Scoping:** The `UserRank` table can have a `scope` column (e.g., 'all_time', 'weekly') to support different leaderboards.

2.  **Leaderboard Page (`/app/leaderboard/page.tsx`):**
    *   A Server Component that fetches the pre-calculated rankings.
    *   It should accept a `searchParams` prop to get the `scope` and pass it to the API call.
    *   Renders a simple table or list of users, their rank, and their score.

**Acceptance Criteria (Dev):**
*   ✅ Leaderboard data is pre-calculated to ensure the page loads quickly (<100ms).
*   ✅ The `/leaderboard` page displays a ranked list of users and allows filtering by scope (all-time, weekly).
*   ✅ The current user's position is highlighted in the list.

---

### **Workstream 5: Micro-interactions & Feedback**

**The Goal:** Add polished, performant feedback to user actions.

**Technical Execution:**

1.  **Toast Notifications (`react-hot-toast`):**
    *   Install `react-hot-toast`.
    *   Wrap your application in the `<Toaster />` component.
    *   Trigger toasts on actions like saving progress or earning points: `toast.success("+10 Points!")`.
2.  **Button Animations:**
    *   Use Tailwind's `transition` and `transform` utilities for subtle hover/click effects (e.g., `hover:scale-105 active:scale-95`).
    *   For a more engaging "complete" button, consider a looping animation (via `animate-ping`) only *after* an action is taken, to signal processing.

**Acceptance Criteria (Dev):**
*   ✅ Toasts are used for system feedback (success, errors).
*   ✅ Key interactive elements have subtle, non-intrusive animations.

---

### **Phase 4 Deliverables & Exit Criteria (Dev Focus)**

| Deliverable                         | Owner       | Proof of Completion                                                                                               |
| ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| Gamification Database Schema        | Backend     | ✅ New tables (`UserPoints`, `UserBadges`, `Badges`, `UserStreaks`) are created and populated correctly.          |
| Gamification Service & Event Handlers | Backend     | ✅ Service listens to events and correctly awards points, badges, and updates streaks. Idempotent.                |
| Gamification API Endpoints          | Backend     | ✅ Endpoints for points, badges, streak, and leaderboard return accurate data.                                    |
| Core Frontend Components            | Frontend    | ✅ `ProgressBar`, `Badge`, `StreakCounter` components are built and integrated into relevant pages.               |
| Leaderboard Page & Logic            | Full-Stack  | ✅ Page loads fast using pre-calculated data. Scoping works correctly.                                            |
| Celebration Mechanics               | Frontend    | ✅ Confetti fires on badge award and respects `prefers-reduced-motion`.                                           |

**Phase 4 is complete when:** The backend systems are reliably tracking user achievements and points. The frontend accurately displays this data through new components. The leaderboard is performant, and users receive immediate, positive feedback for their actions.

## **Phase 5 – Personalization & Analytics (Weeks 14–16) - Developer Summary**

**Objective:** To build the data infrastructure and algorithms necessary to tailor the user experience and provide actionable insights. This phase focuses on data collection, processing, and presentation.

**Success Metric:** Increase user engagement (time on platform, lesson completion rate) by serving relevant content. Provide admins/teachers with a clear view of cohort performance and problem areas.

---

### **Workstream 1: Data Pipeline & Event Tracking**

**The Goal:** Establish a reliable and privacy-compliant system for capturing user interactions.

**Technical Execution:**

1.  **Event Schema Definition:**
    *   Define a standardized event schema (e.g., using a `type`, `userId`, `timestamp`, and a flexible `payload` object) for all key user actions:
        *   `lesson_started`, `lesson_completed`
        *   `quiz_started`, `quiz_completed` (with `score` and `maxScore` in payload)
        *   `video_played` (with `progress`)

2.  **Backend Event Ingestion:**
    *   Create a simple, robust API endpoint (`POST /api/events`) to accept events from the client.
    *   **Validation:** Validate the schema of incoming events on the server.
    *   **Processing:** The handler should asynchronously write the event to a dedicated table/collection in the database (e.g., `UserEvents`) or stream it to a tool like Segment. Avoid blocking the user's request for this.
    *   **Privacy:** Ensure no PII is stored in the event payload. Use only internal `userId`.

3.  **Client-Side Instrumentation:**
    *   Create an abstraction (e.g., a custom `useTrackEvent` hook or a `trackEvent` function) to easily send events from React components.
    *   Instrument key components: Lesson player, quiz components, video player.

**Acceptance Criteria (Dev):**
*   ✅ `POST /api/events` endpoint exists and securely accepts event data.
*   ✅ Event data is validated and stored persistently in a `UserEvents` table or similar.
*   ✅ Key user flows (completing a lesson, taking a quiz) are instrumented and firing events correctly.

---

### **Workstream 2: Recommendation Engine (Rule-Based MVP)**

**The Goal:** Implement an initial, rules-based system to suggest relevant content to users.

**Technical Execution:**

1.  **Recommendation Logic Service:**
    *   Create a service (`RecommendationService`) that generates suggestions based on simple, deterministic rules. Avoid complex ML for MVP.
    *   **Example Rules:**
        *   *Weakest Topic:* Recommend lessons tagged with the topic where the user has the lowest average quiz score.
        *   *Next in Sequence:* Recommend the next lesson in the module they are actively working on.
        *   *Popular:* Recommend lessons commonly completed by users with a similar target band score.

2.  **API Endpoint:**
    *   Create `GET /api/user/{userId}/recommendations`.
    *   This endpoint calls the `RecommendationService` and returns a list of lesson IDs and reasons.

3.  **Frontend Integration:**
    *   Fetch recommendations from the new API endpoint on the dashboard and potentially lesson pages.
    *   Display them in a "Recommended for you" section.

**Acceptance Criteria (Dev):**
*   ✅ `RecommendationService` exists and implements at least 2-3 simple rules.
*   ✅ `/api/user/recommendations` endpoint returns a list of relevant lesson IDs.
*   ✅ Recommendations are displayed on the user's dashboard.

---

### **Workstream 3: Goal Setting & Tracking**

**The Goal:** Allow users to set goals and track their progress towards them.

**Technical Execution:**

1.  **Data Model:**
    *   Add a `UserGoals` table with fields for `userId`, `goalType` (e.g., 'target_band_score', 'weekly_lessons'), `targetValue` (e.g., `7.5`, `5`), and `deadline` (optional).

2.  **API & Components:**
    *   **CRUD Endpoints:** Create endpoints to `CREATE`, `READ`, and `UPDATE` user goals.
    *   **Goal Setting UI:** Build a form (e.g., in a user settings page or modal) for setting a target band score and weekly lesson goal.
    *   **Progress Calculation:** Create a function to calculate progress towards a weekly lesson goal (e.g., `lessonsCompletedThisWeek / weeklyGoal`). Display this on the dashboard with a progress circle or similar.

**Acceptance Criteria (Dev):**
*   ✅ `UserGoals` table exists and is populated via a frontend form.
*   ✅ User's goal is visible on their dashboard or profile.
*   ✅ Progress towards a weekly goal is calculated and displayed correctly.

---

### **Workstream 4: Admin & Teacher Analytics Dashboard**

**The Goal:** Provide administrators and teachers with a high-level view of aggregate platform and student performance.

**Technical Execution:**

1.  **Aggregate Data API Endpoints:**
    *   Create read-only API endpoints for aggregated data, ensuring data privacy and access controls.
    *   **Examples:**
        *   `GET /api/admin/cohort-progress`: Returns average completion rates per module for a selected cohort.
        *   `GET /api/admin/quiz-performance`: Returns average scores for specific quizzes, highlighting difficult questions.
    *   **Performance:** These queries will likely be complex. Consider using database views or pre-aggregating data periodically (e.g., with a cron job) to avoid slow queries on the fly.

2.  **Dashboard UI (Protected Route):**
    *   Build an internal dashboard page (e.g., `/app/admin/analytics`) accessible only to users with an `admin` or `teacher` role.
    *   Use a charting library like **Recharts** or **Chart.js** to visualize the data from the new APIs.
    *   Include data filters (e.g., by date range, by user cohort).

**Acceptance Criteria (Dev):**
*   ✅ Secure API endpoints return accurate aggregate data.
*   ✅ A protected admin dashboard exists with at least two different data visualizations (e.g., a bar chart of module completion, a line chart of average scores over time).
*   ✅ Queries perform acceptably (load in <2s).

---

### **Phase 5 Deliverables & Exit Criteria (Dev Focus)**

| Deliverable                         | Owner       | Proof of Completion                                                                                               |
| ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| Event Tracking Pipeline             | Backend     | ✅ API endpoint logs events. Key user actions are instrumented on the frontend.                                  |
| Recommendation API                  | Backend     | ✅ Endpoint returns lesson IDs based on rule-based logic. Integrated into the dashboard.                         |
| Goal Setting & Tracking             | Full-Stack  | ✅ Users can set and view goals. Progress is calculated and displayed.                                           |
| Admin Analytics Dashboard           | Full-Stack  | ✅ Protected route with visualizations of aggregate data. APIs are performant.                                   |
| Data Privacy Review                 | Lead        | ✅ Confirmed no PII in event streams. API endpoints have proper role-based access control.                       |

**Phase 5 is complete when:** The platform is capturing meaningful user data, using it to personalize the experience with recommendations and goals, and providing administrators with actionable insights through a dedicated dashboard.

## **Phase 6 – Accessibility & Inclusive Design (Weeks 17–19) - Developer Summary**

**Objective:** To systematically identify and remediate accessibility barriers, ensuring the platform is perceivable, operable, and understandable for all users, including those with disabilities. This phase focuses on technical compliance (WCAG 2.1 AA) and practical usability.

**Success Metric:** Achieve a score of >90 on Lighthouse Accessibility audits for all key pages. Pass manual keyboard and screen reader testing for critical user flows with zero P1 (blocking) issues.

---

### **Workstream 1: Automated and Manual Audit**

**The Goal:** Establish a baseline of a11y issues and integrate automated checks into the development workflow to prevent regressions.

**Technical Execution:**

1.  **Integrated Testing Setup:**
    *   **Lighthouse CI:** Configure Lighthouse CI to run on every pull request, failing the build if the accessibility score drops below a threshold (e.g., <90) on key pages.
    *   **Axe-Core Integration:** Integrate `axe-core` with your testing framework (e.g., `jest-axe` for Jest or `cypress-axe` for Cypress). Write unit tests for components and end-to-end tests for pages that run Axe checks.

2.  **Structured Manual Audit:**
    *   Create a spreadsheet or use a project tracking tool to log all a11y issues found. Tag each issue with:
        *   **WCAG Criterion:** (e.g., "1.1.1 Non-text Content")
        *   **Severity:** P1 (Blocking), P2 (Serious), P3 (Minor)
        *   **Component/Page:** Where the issue occurs.
        *   **Status:** Open, In Progress, Fixed.

**Acceptance Criteria (Dev):**
*   ✅ Lighthouse CI is configured and blocking PRs with a11y regressions.
*   ✅ Axe-core is integrated into the test suite, with at least one test per key component.
*   ✅ A prioritized audit log exists with all known P1 and P2 issues.

---

### **Workstream 2: ARIA Implementation & Semantic HTML**

**The Goal:** Ensure all custom interactive components are properly communicated to assistive technologies.

**Technical Execution:**

1.  **Component Audit & Remediation:**
    *   Audit all custom components (Modal, Tabs, Dropdown, Accordion). The best fix is often using native HTML elements (`<button>`, `<dialog>`). When not possible, implement ARIA.
    *   **Key Patterns:**
        *   **Modal:** `aria-modal="true"`, `aria-labelledby` (pointing to the modal title), focus trapping.
        *   **Tabs:** `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`.
        *   **Forms:** All inputs must have associated `<label>` elements or `aria-label`/`aria-labelledby`. Provide `aria-invalid` and `aria-errormessage` for validation.

2.  **Icon Buttons & Links:**
    *   Ensure all icon-only buttons (e.g., hamburger menu, close button) have an `aria-label` (e.g., `aria-label="Open main menu"`).

**Acceptance Criteria (Dev):**
*   ✅ All custom interactive components have correct ARIA attributes and roles.
*   ✅ 100% of form inputs have associated visible labels.
*   ✅ 100% of icon-only buttons have descriptive `aria-label`.

---

### **Workstream 3: Color, Contrast, and Theming**

**The Goal:** Ensure visual design is accessible to users with low vision or color vision deficiencies.

**Technical Execution:**

1.  **Contrast Automation:**
    *   Use a tool like `stylelint` with a plugin (`stylelint-a11y`) to fail builds if color combinations in CSS/Tailwind classes do not meet WCAG AA requirements (4.5:1 for normal text).
    *   Manually check and fix contrast issues in images, charts, and graphs.

2.  **High-Contrast Theme Implementation:**
    *   Extend the existing theming system (e.g., that handles light/dark mode) to support a high-contrast mode.
    *   **Implementation:** This is not just a color swap. It often involves:
        *   Forcing a black/white/grayscale color palette.
        *   Increasing border thicknesses and font weights.
        *   Using underlines for all links.
    *   Create a new set of design tokens for this theme and ensure they are applied when the user selects it.

**Acceptance Criteria (Dev):**
*   ✅ CI pipeline fails on PRs introducing low-contrast color combinations.
*   ✅ A high-contrast theme is available and can be selected from the user settings.
*   ✅ All UI elements are clearly distinguishable in the high-contrast theme.

---

### **Workstream 4: Keyboard & Screen Reader Navigation**

**The Goal:** Guarantee full functionality without a mouse.

**Technical Execution:**

1.  **Manual Keyboard Testing:**
    *   Test the entire application using only the `Tab`, `Shift+Tab`, `Enter`, `Space`, and `Arrow` keys.
    *   **Focus Indicators:** Ensure a clear, highly visible focus ring is present on all interactive elements. Do not remove `outline` without providing a custom `:focus-visible` style.
    *   **Focus Management:** For dynamic content (e.g., modals, notifications), programmatically move focus (`element.focus()`) to the appropriate element.

2.  **Screen Reader Testing:**
    *   Test critical flows (registration, starting a lesson, completing a quiz) with a screen reader (NVDA + Firefox or VoiceOver + Safari).
    *   Verify that dynamic content changes (e.g., form errors, loading states, AJAX updates) are announced using Live Regions (`aria-live="polite"`).

**Acceptance Criteria (Dev):**
*   ✅ All interactive elements are reachable and usable with a keyboard alone.
    *   ✅ Custom `:focus-visible` styles are implemented and visible.
    *   ✅ Focus is correctly trapped in modals and returned to the trigger upon close.
*   ✅ Screen reader announces dynamic content updates (e.g., "Login successful, redirecting to dashboard").

---

### **Workstream 5: User-Controlled Settings**

**The Goal:** Respect user system preferences and provide options to customize the experience.

**Technical Execution:**

1.  **`prefers-reduced-motion`:** 
    *   Wrap all CSS transitions, animations, and JavaScript-triggered animations (e.g., confetti) in a prefers-reduced-motion media query.
    *   **CSS:** `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }`
    *   **JS:** `const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;`

2.  **Text Size & Spacing:**
    *   Ensure the layout does not break when users zoom to 200%.
    *   Use relative units (`rem`, `em`) for font sizes and spacing instead of pixels (`px`) to respect browser zoom settings.

3.  **Settings UI:**
    *   Create a "Accessibility" section in user settings to allow manual overriding of system preferences (e.g., "Always disable animations").

**Acceptance Criteria (Dev):**
*   ✅ All animations are disabled when `prefers-reduced-motion` is set.
*   ✅ Layout is readable and functional at 200% zoom.
*   ✅ User settings can persist a11y preferences (stored in user profile or local storage).

---

### **Phase 6 Deliverables & Exit Criteria (Dev Focus)**

| Deliverable                         | Owner       | Proof of Completion                                                                                               |
| ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| A11y Integrated into CI/CD          | DevOps/FE   | ✅ Lighthouse CI and axe-core tests are running and blocking PRs.                                                |
| Component A11y Remediation          | Frontend    | ✅ All P1/P2 ARIA and semantic HTML issues from the audit are fixed.                                              |
| High-Contrast Theme                 | Frontend    | ✅ A functional high-contrast theme is implemented and selectable.                                               |
| Keyboard Navigation Test Report     | QA/FE       | ✅ All critical user flows can be completed with keyboard only. Focus is managed correctly in dynamic UIs.       |
| Screen Reader Test Report           | QA/FE       | ✅ Critical flows are navigable and understandable using NVDA/VoiceOver.                                         |
| Respect for User Preferences        | Frontend    | ✅ `prefers-reduced-motion` is respected. Layout is stable with 200% browser zoom.                               |

**Phase 6 is complete when:** The application is technically compliant with WCAG 2.1 AA guidelines, provides a seamless experience for keyboard and screen reader users, and respects user preferences for motion and display. Automated checks are in place to prevent future regressions.

Of course. Here is the breakdown for **Phase 7**, followed by a summary of the complete plan.

---

## **Phase 7 – Visual & Branding Refinement (Weeks 20–21) - Developer Summary**

**Objective:** To elevate the visual polish, consistency, and brand alignment of the platform. This phase focuses on applying the final layer of design to the now-functional and accessible foundation.

**Success Metric:** Achieve a consistent visual language across all components and pages. Pass a design-quality audit against the finalized style guide. Improve user perception scores in post-launch surveys.

---

### **Workstream 1: Style Guide Implementation & Enforcement**

**The Goal:** To transform the finalized style guide from a document into the enforced, single source of truth for the codebase.

**Technical Execution:**

1.  **Token Alignment:**
    *   Perform a final audit of `tailwind.config.js` to ensure all color, spacing, typography, and shadow tokens exactly match the values in the style guide.
    *   **Eradicate Inconsistencies:** Do a global search for hard-coded values (hex codes, `px` values that should be `rem`, arbitrary margins) and replace them with the defined tokens.

2.  **Component Library Alignment:**
    *   Review each component in Storybook (or your component catalog) against the style guide's component specifications.
    *   **Enforce Props:** Ensure components use the correct variants (e.g., `size="sm"`, `variant="secondary"`) defined in the guide, rather than arbitrary style overrides.

3.  **Documentation:**
    *   Ensure the style guide is living and accessible. This could be a dedicated Next.js page, a Zeroheight site, or even a well-maintained section in your README. It must include code snippets for developers.

**Acceptance Criteria (Dev):**
*   ✅ A `npm run lint:styles` command passes, confirming no hard-coded style violations.
*   ✅ All Design System components in Storybook have a "Story" demonstrating all variants as per the style guide.
*   ✅ The style guide is published and linked from the main repository README.

---

### **Workstream 2: Asset Optimization & Integration**

**The Goal:** To replace all placeholder and unoptimized assets with final, performant, branded ones.

**Technical Execution:**

1.  **Image Integration:**
    *   Replace all placeholder images (e.g., stock photos, temp illustrations) with final, curated assets provided by design.
    *   **Optimization:** Use the `next/image` component for all images. Ensure `width`, `height`, and `alt` text are defined. Specify `placeholder="blur"` where appropriate for better LCP (Largest Contentful Paint) scores.

2.  **Iconography:**
    *   Ensure all icons are from the same set (e.g., a custom SVG sprite, Lucide, or Heroicons). Inconsistencies here are highly visible.
    *   Icons must be semantically correct and have appropriate `aria-hidden="true"` or `aria-label` attributes if they are decorative or interactive, respectively.

**Acceptance Criteria (Dev):**
*   ✅ 100% of images use the `next/image` component or an optimized equivalent.
*   ✅ Lighthouse Performance audit for "Properly size images" and "Modern image formats" passes.
*   ✅ All icons are consistent in style and size across the application.

---

### **Workstream 3: Spacing & Typography Polish**

**The Goal:** To create visual harmony and improve readability through consistent spacing and hierarchical typography.

**Technical Execution:**

1.  **Global Spacing Pass:**
    *   Systematically review every page and component. Check that spacing (margin, padding, gap) between elements uses the predefined scale from the style guide (e.g., `4px`, `8px`, `16px`, `24px`).
    *   **Tools:** Use browser DevTools to inspect elements and verify the spacing values against the token scale.

2.  **Typography Hierarchy Audit:**
    *   Audit the usage of HTML heading tags (`h1`-`h6`). Ensure they are used semantically (for structure, not just visual size) and that their visual appearance matches the style guide.
    *   Fix instances where non-heading elements (e.g., a `div` with a large font) are used where a real heading tag should be.

**Acceptance Criteria (Dev):**
*   ✅ A visual audit confirms consistent spacing based on the token scale.
*   ✅ A semantic HTML validator check passes, confirming correct heading hierarchy.

---

### **Workstream 4: Prototype & Final Usability Testing**

**The Goal:** To validate the complete, polished user experience with real users before the final launch.

**Technical Execution:**

1.  **High-Fidelity Prototype:**
    *   The entire application *is* the prototype. Deploy the current state of the `main` branch to a staging environment that mirrors production.

2.  **Usability Testing Session:**
    *   Work with the PM/Designer to define 4-5 key tasks (e.g., "Find a lesson on paraphrasing and complete it", "Check your progress toward your goal").
    *   Observe 4-5 target users as they complete these tasks on the staging site. **Focus on polish and flow, not basic functionality.**
    *   Use a tool like Lookback.io to record sessions.

3.  **Bug Triage & Fix:**
    *   The findings will likely be minor visual bugs (misaligned elements, text overflow) or small UX improvements (wording on a button, order of actions). Prioritize and fix these P1/P2 issues.

**Acceptance Criteria (Dev):**
*   ✅ The staging environment is up-to-date and stable.
*   ✅ A report of usability findings is generated, and all critical (P1) visual/UX bugs are fixed.

---

### **Phase 7 Deliverables & Exit Criteria (Dev Focus)**

| Deliverable                         | Owner       | Proof of Completion                                                                                               |
| ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| Token & Style Compliance            | Frontend    | ✅ Codebase passes style linting. All components use design tokens correctly.                                     |
| Optimized Assets                    | Frontend    | ✅ All images and icons are final, optimized, and use `next/image`.                                               |
| Visual Polish Audit                 | Design/FE   | ✅ A full pass of the app is done; all spacing and typography is consistent and harmonious.                       |
| Usability Test & Fix Report         | QA/Design   | ✅ Tests are completed, and resulting P1/P2 bugs are fixed.                                                       |

**Phase 7 is complete when:** The application is visually polished, perfectly consistent, and aligns with the brand. Any last usability concerns have been addressed. The codebase is clean and adheres to the defined style guide. **The product is now considered feature-complete and ready for final testing and launch.**

---

## **Phase 8 – Testing, QA & Launch (Weeks 22–24) - Developer Summary**

**Objective:** To validate the complete, integrated application, ensure quality and stability, and execute a smooth, controlled rollout to all users with a clear rollback plan.

**Success Metric:** Successful launch with zero critical (P0) bugs. Post-launch, key performance metrics (load time, error rate) remain within acceptable thresholds. User feedback indicates a smooth transition.

---

### **Workstream 1: End-to-End (E2E) Integration Testing**

**The Goal:** To verify that all independently developed features work together correctly as a complete system.

**Technical Execution:**

1.  **Define Critical Paths:** Identify and document the top 10 most critical user journeys (e.g., "User signs up > sets a goal > completes a lesson > earns a badge > checks leaderboard").
2.  **Automate with Playwright/Cypress:** Write E2E tests for these critical paths. Tests should run on a browser instance against the **staging environment**.
    *   **Focus:** Test the integration of features (e.g., does completing a lesson correctly update the progress bar, award points, *and* trigger a celebration?).
    *   **Auth:** Use authentication bypass techniques or test users to streamline login flows.
3.  **CI Integration:** Configure these E2E tests to run automatically on a schedule (e.g., nightly) and against the staging environment after each deployment.

**Acceptance Criteria (Dev):**
*   ✅ A suite of E2E tests exists for all defined critical paths.
*   ✅ All E2E tests pass against the staging environment.
*   ✅ E2E test suite is integrated into the CI/CD pipeline.

---

### **Workstream 2: User Acceptance Testing (UAT)**

**The Goal:** To get final validation from real users that the application meets their needs and is ready for production.

**Technical Execution:**

1.  **Prepare Staging Environment:** Ensure the staging environment is an exact mirror of production (data, services, CDN). Populate it with realistic test data.
2.  **Create UAT Checklist:** Develop a simple checklist of tasks for testers (a mix of students and teachers) to complete.
3.  **Gather & Triage Feedback:** Use a structured tool (e.g., Linear, Jira, a dedicated channel) to collect bug reports and feedback. **Triage quickly:** Categorize issues as P0 (block launch), P1 (fix soon), or P2 (post-launch).
4.  **Fix P0/P1 Issues:** Allocate development resources to quickly address show-stopping and major issues found during UAT.

**Acceptance Criteria (Dev):**
*   ✅ UAT is conducted with at least 5-10 external users.
*   ✅ All P0 and P1 bugs identified during UAT are resolved.
*   ✅ Product Manager signs off on UAT results, approving the release.

---

### **Workstream 3: Performance & Security Audit**

**The Goal:** To ensure the application is fast, stable, and secure under production load.

**Technical Execution:**

1.  **Performance Testing:**
    *   **Lighthouse CI:** Ensure Lighthouse Performance scores are >90 on mobile and desktop for key pages.
    *   **Load Testing (Basic):** Use a tool like **k6** or **Loader.io** to simulate concurrent users on key endpoints (e.g., login, lesson loading). Identify and address any dramatic performance degradation.
2.  **Security Review:**
    *   **Dependency Scan:** Run `npm audit` or `snyk test` to check for vulnerable dependencies. Fix any critical issues.
    *   **Environment Check:** Verify all production environment variables are set correctly (API keys, database URLs) and that no sensitive data is exposed in client-side bundles.
    *   **Auth Review:** Double-check that all API routes and pages have correct authentication and authorization checks.

**Acceptance Criteria (Dev):**
*   ✅ Lighthouse Performance scores are consistently >90.
    *   ✅ Core Web Vitals (LCP, FID/INP, CLS) are within "good" thresholds.
*   ✅ No critical dependency vulnerabilities exist.
*   ✅ A basic load test confirms the application remains responsive under expected load.

---

### **Workstream 4: Documentation & Final Prep**

**The Goal:** To ensure the team and support staff are prepared to maintain and troubleshoot the application post-launch.

**Technical Execution:**

1.  **Update Documentation:**
    *   **Runbook:** Create a launch runbook detailing the exact steps for rollout and rollback.
    *   **README:** Update the main project README with updated setup instructions, environment variables, and links to key resources (style guide, storybook, monitoring dashboards).
2.  **Developer Handoff:** Ensure knowledge transfer. Walk the team through any complex new systems (e.g., gamification service, data pipeline).
3.  **Monitor Setup:** Verify that production monitoring (e.g., **Sentry** for errors, **Vercel Analytics** or similar for performance) is configured and active.

**Acceptance Criteria (Dev):**
*   ✅ README and launch runbook are updated and accurate.
*   ✅ Monitoring tools are configured and tested in the production environment.
*   ✅ The team has been briefed on the release plan.

---

### **Workstream 5: Incremental Rollout & Launch**

**The Goal:** To deploy the application to production in a controlled, low-risk manner.

**Technical Execution:**

1.  **Deploy to Production:** Merge the finalized `main` branch into the production branch (e.g., `production`) to trigger the deployment.
2.  **Use Feature Flags (If applicable):** For very large changes, deploy behind feature flags and enable them for internal users first.
3.  **Incremental Traffic Ramp-Up:**
    *   **Best Practice:** Use platform features (e.g., Vercel Preview/Production, AWS CodeDeploy) to gradually shift traffic from the old version to the new version.
    *   **Start:** Deploy to production but initially only make it accessible to internal team members.
    *   **Next:** Enable for a small percentage (e.g., 5%) of real users.
    *   **Monitor:** Watch error rates (Sentry), performance (LCP), and business metrics closely.
    *   **Complete:** If no errors occur, gradually ramp up to 100% of users.
4.  **Rollback Plan:** Have a clear, one-command rollback plan ready (e.g., "redeploy the previous production commit"). Practice it.

**Acceptance Criteria (Dev):**
*   ✅ The application is successfully deployed to the production environment.
*   ✅ Traffic is gradually shifted to the new version without significant errors.
*   ✅ The application is serving 100% of production traffic successfully and stably.

---

### **Phase 8 Deliverables & Exit Criteria (Dev Focus)**

| Deliverable                         | Owner       | Proof of Completion                                                                                               |
| ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| E2E Test Suite                      | QA/FE       | ✅ Critical user paths are covered by automated tests that pass.                                                 |
| UAT Sign-Off                        | PM          | ✅ UAT is complete and all blocking bugs are resolved. PM approves launch.                                       |
| Performance & Security Audit        | DevOps/BE   | ✅ Performance budgets are met. No critical security vulnerabilities exist.                                      |
| Updated Documentation               | Tech Lead   | ✅ README and runbooks are complete. The team is prepared.                                                       |
| Successful Production Launch        | All         | ✅ The new version is live for 100% of users, and monitoring shows stable operation.                             |

**Phase 8 is complete when:** The application is live in production, functioning correctly, and meeting performance and stability goals. The team is monitoring the release and is prepared to respond to any post-launch issues. **The project is officially launched.**

Perfect—here’s a **week-by-week, detailed plan** for **3 full-time devs**. I’m anchoring to your timezone (Asia/Karachi) and using **absolute dates**. If you start **today (Mon, Sep 8, 2025)**, this runs **12 weeks** through **Nov 30, 2025**.

---

## Week 1 (Sep 8–14) — Phase 1: Audit & Planning

**Goals:** Baseline the product; lock success metrics; set guardrails.
**Build:**

* Dev A (Platform): Add CI gates (Lighthouse Mobile + axe) on PRs; security headers skeleton (CSP/HSTS).
* Dev B (FE/DS): Full **Component & Page Audit** (sm/md/lg screenshots); draft **tokens & breakpoints**; list responsive/a11y gaps.
* Dev C (Full-stack): Shape **Dashboard API** (schema + response contract) and seed data outlines.
  **QA:** Manual keyboard pass on 3 key pages; Lighthouse mobile baseline recorded.
  **Exit/Gates:** Audit matrix complete; 3–5 measurable UX KPIs defined; CI gates running.

---

## Week 2 (Sep 15–21) — Phase 1 → Phase 2 bridge

**Goals:** Finalize tokens/patterns; ship PWA base (foundation for mobile quality).
**Build:**

* Dev A: **PWA base** (manifest, maskable icons, SW offline fallback, update prompt); perf budget config.
* Dev B: Refactor **Container/Card/Button/Modal** to **mobile-first** using tokens; Storybook stories with sm/md/lg viewports.
* Dev C: Implement **Dashboard (Server Component)** consuming the API; `ModuleCard` + Progress placeholders.
  **QA:** PWA audit in Chrome DevTools; contrast spot-check on new tokens.
  **Exit/Gates:** Tokens/patterns signed off; **PWA score ≥ 90 (mobile)**; dashboard loads without client waterfall.

---

## Week 3 (Sep 22–28) — Phase 2: Responsive Foundations

**Goals:** Nail navigation UX on mobile; start exam-flow shells.
**Build:**

* Dev A: Perf budgets enforced (images srcset/lazy, script defer), route prefetch on Wi-Fi only.
* Dev B: **Navbar/Mobile Drawer v2** (focus trap, aria, safe-area insets); **Sticky Bottom Action Bar** for exam rooms.
* Dev C: **Gamification schema** (points/streak/badges tables) + event bus skeleton.
  **QA:** iOS Safari + Android Chrome device tests (drawer, sticky bar, safe-area).
  **Exit/Gates:** No horizontal scroll on header/exam shells; event bus compiles and logs events.

---

## Week 4 (Sep 29–Oct 5) — Phase 2: Page Reflows

**Goals:** Reflow high-traffic screens; wire basic awards.
**Build:**

* Dev A: Feature flags framework; monitoring (Sentry) for FE errors.
* Dev B: **Exam rooms** (Listening/Reading) reflow to single-column on mobile; **Review** page accordion.
* Dev C: **Points + Streaks services** (idempotent awards, daily caps, timezone=Asia/Karachi); Reward toast.
  **QA:** Timer + submit on phones; duplicate-award regression test.
  **Exit/Gates:** Exam rooms usable end-to-end on mobile; points/streaks visible on dashboard.

---

## Week 5 (Oct 6–12) — Phase 3: IA & Discovery (round 1)

**Goals:** Make finding/continuing study effortless.
**Build:**

* Dev A: Image/CDN tuning; perf dashboards.
* Dev B: **Global Search** (debounced; keyboardable) + **Breadcrumbs**; Dashboard v1 cards finalized.
* Dev C: **Badge criteria** + **Progress widgets**; first 6–8 badge definitions.
  **QA:** Search skeletons; breadcrumb semantics; confetti behind motion-preference guard.
  **Exit/Gates:** Clicks to start an attempt reduced; badges appear when criteria met.

---

## Week 6 (Oct 13–19) — Phase 3: IA & Discovery (round 2)

**Goals:** Close responsive gaps beyond exam flows; leaderboards MVP.
**Build:**

* Dev A: Hardening perf budgets; error budgets for slow routes.
* Dev B: Pricing/Auth/Settings responsive; **Tabs/Accordions** lib usage; **On-this-page** anchors for long content.
* Dev C: **Leaderboard snapshots** (weekly/all-time) + UI tabs; highlight current user.
  **QA:** Contrast on new pages; leaderboard data freshness and pagination.
  **Exit/Gates:** No horizontal overflow site-wide (320–1920px); leaderboard loads <100ms from snapshot.

---

## Week 7 (Oct 20–26) — Phase 5: Personalization (MVP rules)

**Goals:** Surface useful next steps automatically.
**Build:**

* Dev A: Security sweep (CSP tightening; Supabase RLS re-check).
* Dev B: Dashboard v2 layout for recommendations/goals.
* Dev C: **Recommendation service (rules-based):** “Weakest topic” + “Next in sequence”; **Goals CRUD** (target band + weekly lessons).
  **QA:** Reco “reason” labels; goals progress math; RLS denies on cross-user reads.
  **Exit/Gates:** Reco CTR baseline collected; goals visible and persisted.

---

## Week 8 (Oct 27–Nov 2) — Phase 5: Analytics & Admin

**Goals:** Give admins teacher-level insight.
**Build:**

* Dev A: Build pipeline polish; logs/metrics retention.
* Dev B: Dashboard fit-and-finish; empty/edge states.
* Dev C: **Admin analytics** (2 charts: module completion, avg scores) with protected routes + performant queries/caching.
  **QA:** Role-based route protection; chart accessibility (descriptions, table fallback).
  **Exit/Gates:** Admin analytics load <2s; dashboard v2 complete.

---

## Week 9 (Nov 3–9) — Phase 6: Accessibility Sprint

**Goals:** WCAG 2.1 AA practical compliance.
**Build:**

* Dev A: **Axe + Lighthouse** in CI (blocking thresholds).
* Dev B: Remediate ARIA/labels/focus; **High-contrast theme** toggle.
* Dev C: Ensure server messages use polite live regions; form errors wired to inputs.
  **QA:** Screen reader passes (NVDA+Firefox, VoiceOver+Safari); 200% zoom tests; keyboard-only flows.
  **Exit/Gates:** Lighthouse **A11y ≥ 90** across key pages; **0 P1 a11y issues**.

---

## Week 10 (Nov 10–16) — Phase 7: Visual & Branding Polish

**Goals:** Consistency + tokens-only enforcement.
**Build:**

* Dev A: Visual regression (Chromatic/Playwright) snapshots on PRs.
* Dev B: Token audit (ban inline hex/px); spacing/typography pass; `next/image` everywhere.
* Dev C: Perf tuning on analytics/reco queries; cache review pages.
  **QA:** Visual diffs; image LCP improvements; CLS checks.
  **Exit/Gates:** Tokens-only lint passes; Perf (mobile) Lighthouse ≥ 80 on key pages.

---

## Week 11 (Nov 17–23) — Phase 8: E2E & UAT Prep

**Goals:** Validate top user journeys end-to-end.
**Build:**

* Dev A: Release runbook + rollback; feature flag matrices.
* Dev B: Fix visual/UX nits from visual regression; finalize microcopy.
* Dev C: **E2E tests** (Playwright/Cypress) for: sign-in → lesson → submit → award → leaderboard → dashboard continue.
  **QA:** Staging with realistic seed data; dry-run UAT with 5–10 users.
  **Exit/Gates:** E2E suite green; UAT blocker list at P1=0, P2 triaged.

---

## Week 12 (Nov 24–30) — Phase 8: Rollout & Stabilization

**Goals:** Ship safely; monitor; stabilize.
**Build:**

* Dev A: Canary rollout; monitor Sentry + Core Web Vitals; rollback rehearsed.
* Dev B: UAT feedback fixes; polish on empty/edge states.
* Dev C: Post-deploy checks on awards/reco correctness; analytics sanity.
  **QA:** Bake time monitoring (24–72h); smoke tests on hot paths.
  **Exit/Gates:** 0 P0 post-launch; crash-free sessions ≥ 99.5%; Core Web Vitals all “Good”.

---

### Work you can keep running in parallel (lightweight)

* **Content/microcopy & Help Center** updates every week as screens land.
* **Illustrations/brand assets** (swap when ready; doesn’t block engineering).
* **Support loop**: in-app “Report an issue” pipe hooked to your tracker.

---

### Optional accelerators (if you want to finish faster)

* Defer **leaderboards** or reduce to weekly only (−3–4 dev-days).
* Keep **recommendations** to 2 rules for MVP (−2–3 dev-days).
* Scope **admin analytics** to 2 charts (−3 dev-days).

If you want this turned into **Notion/Jira tickets** (stories + DoD, owners, estimates) I can draft them per week exactly in your format.
