// pages/accessibility.tsx
import * as React from "react";
import Head from "next/head";
import Link from "next/link";
import { Container } from "@/components/design-system/Container";

export default function AccessibilityPage() {
  const [announceMsg, setAnnounceMsg] = React.useState<string>("");
  const liveRef = React.useRef<HTMLDivElement | null>(null);

  const announce = (msg: string) => {
    setAnnounceMsg("");
    // brief delay ensures SR re-announces same text
    setTimeout(() => setAnnounceMsg(msg), 20);
  };

  return (
    <>
      <Head>
        <title>Accessibility · GramorX</title>
        <meta
          name="description"
          content="WCAG quick checks, keyboard playground, screen reader landmarks, and live-region demo."
        />
      </Head>

      {/* Skip link (appears when focused) */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:text-foreground"
      >
        Skip to main content
      </a>

      <div className="py-6">
        <Container>
          <header className="mb-4">
            <h1 className="text-2xl font-bold text-foreground">Accessibility</h1>
            <p className="text-sm text-muted-foreground">
              Quick WCAG checks & interactive playground to catch issues before launch.
            </p>
          </header>

          <main id="main" role="main" className="space-y-6">
            {/* Quick Checks */}
            <section aria-labelledby="quick-checks" className="rounded-xl border border-border bg-card p-4">
              <h2 id="quick-checks" className="text-base font-semibold text-foreground">
                Quick checks
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                <li>All interactive controls are reachable by <kbd>Tab</kbd> and visible on focus.</li>
                <li>Images use <code className="rounded bg-background px-1">alt</code> text or are marked decorative.</li>
                <li>Color is not the only way information is conveyed.</li>
                <li>Text has sufficient contrast; respect <code className="rounded bg-background px-1">prefers-reduced-motion</code>.</li>
                <li>Page uses landmarks: header, nav, main, footer.</li>
                <li>Form fields have associated labels; errors are announced.</li>
              </ul>
              <div className="mt-3 text-xs text-muted-foreground">
                Tip: run automated checks with axe (Browser DevTools) and Lighthouse; then do a manual keyboard pass.
              </div>
            </section>

            {/* Keyboard Playground */}
            <section aria-labelledby="keyboard-play" className="rounded-xl border border-border bg-card p-4">
              <h2 id="keyboard-play" className="text-base font-semibold text-foreground">
                Keyboard playground
              </h2>
              <p className="mb-3 text-sm text-muted-foreground">
                Use <kbd>Tab</kbd>/<kbd>Shift+Tab</kbd> and <kbd>Space</kbd>/<kbd>Enter</kbd> to operate controls below.
              </p>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <fieldset className="rounded-lg border border-border p-3">
                  <legend className="px-1 text-xs text-muted-foreground">Form sample</legend>
                  <div className="space-y-2">
                    <label className="block text-xs text-muted-foreground" htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                      placeholder="Your full name"
                    />
                    <button
                      type="button"
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => announce("Form validated. No errors found.")}
                    >
                      Validate
                    </button>
                  </div>
                </fieldset>

                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Buttons & links</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => announce("Primary action triggered")}
                    >
                      Action
                    </button>
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground opacity-60"
                    >
                      Disabled
                    </button>
                    <Link
                      href="/pricing"
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Go to pricing
                    </Link>
                  </div>
                </div>
              </div>

              {/* ARIA live region */}
              <div
                ref={liveRef}
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              >
                {announceMsg}
              </div>
            </section>

            {/* Landmarks / Motion */}
            <section aria-labelledby="landmarks" className="rounded-xl border border-border bg-card p-4">
              <h2 id="landmarks" className="text-base font-semibold text-foreground">Landmarks & motion</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                <li>
                  This page includes <code className="rounded bg-background px-1">main</code> landmark and a top-level
                  “Skip to main content” link.
                </li>
                <li>
                  Honor reduced motion: avoid non-essential animations when{" "}
                  <code className="rounded bg-background px-1">prefers-reduced-motion: reduce</code> is set.
                </li>
              </ul>
              <details className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">
                <summary className="cursor-pointer text-foreground">Why it matters</summary>
                <p className="mt-2 text-muted-foreground">
                  Clear focus styles and proper landmarks help keyboard and screen-reader users navigate quickly. Live
                  regions announce changes that aren’t triggered by focus.
                </p>
              </details>
            </section>

            {/* Resources */}
            <section aria-labelledby="resources" className="rounded-xl border border-border bg-card p-4">
              <h2 id="resources" className="text-base font-semibold text-foreground">Resources</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                <li>
                  <a
                    className="text-primary underline-offset-2 hover:underline"
                    href="https://www.w3.org/WAI/standards-guidelines/wcag/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    WCAG Overview — W3C WAI
                  </a>
                </li>
                <li>
                  <a
                    className="text-primary underline-offset-2 hover:underline"
                    href="https://developer.chrome.com/docs/lighthouse/accessibility"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Lighthouse Accessibility
                  </a>
                </li>
                <li>
                  <a
                    className="text-primary underline-offset-2 hover:underline"
                    href="https://www.deque.com/axe/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    axe DevTools
                  </a>
                </li>
              </ul>
            </section>
          </main>
        </Container>
      </div>
    </>
  );
}
