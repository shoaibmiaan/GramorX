import Head from "next/head";
import "@/styles/premium-theme.css";
import { ThemeSwitcher } from "@/components/premium-ui/ThemeSwitcher";
import { Button } from "@/components/premium-ui/Button";
import { Card } from "@/components/premium-ui/Card";

export default function PremiumSandbox() {
  return (
    <>
      <Head>
        <title>Premium UI Sandbox</title>
      </Head>

      {/* Isolated Premium scope */}
      <div id="premium-root" className="premium-root" data-pr-theme="light">
        {/* Screen */}
        <main className="pr-min-h-screen pr-bg-bg pr-text-text pr-font-premium pr-py-12 pr-px-6">
          <div className="pr-max-w-5xl pr-mx-auto pr-space-y-8">

            {/* Top bar */}
            <div className="pr-flex pr-items-center pr-justify-between">
              <h1 className="pr-text-3xl pr-font-bold">Premium Exam Room — Theme Test</h1>
              <ThemeSwitcher />
            </div>

            {/* Hero / Glass */}
            <section className="premium-glass pr-rounded-2xl pr-p-8 pr-flex pr-items-center pr-justify-between">
              <div>
                <h2 className="pr-text-2xl pr-font-semibold pr-mb-2">Elite, Distraction‑Free Experience</h2>
                <p className="pr-text-muted">
                  This area is fully isolated from the main app using the <code>pr-</code> namespace and its own theme tokens.
                </p>
              </div>
              <Button onClick={() => alert('This is an isolated Premium button.')}>Try Action</Button>
            </section>

            {/* Cards */}
            <div className="pr-grid pr-grid-cols-1 md:pr-grid-cols-3 pr-gap-6">
              <Card>
                <h3 className="pr-text-lg pr-font-semibold pr-mb-1">Surface</h3>
                <p className="pr-text-muted">Cards & panels use <code>--pr-surface</code>.</p>
              </Card>
              <Card>
                <h3 className="pr-text-lg pr-font-semibold pr-mb-1">Primary</h3>
                <p className="pr-text-muted">Buttons & accents use <code>--pr-primary</code>.</p>
              </Card>
              <Card>
                <h3 className="pr-text-lg pr-font-semibold pr-mb-1">Borders & Ring</h3>
                <p className="pr-text-muted">Focus and outlines pull from <code>--pr-border</code> / <code>--pr-ring</code>.</p>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
