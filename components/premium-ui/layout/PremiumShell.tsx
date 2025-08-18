import React from "react";
import { ThemeToggle } from "../composed/ThemeToggle";
import { Badge } from "../atoms/Badge";

export function PremiumShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pr-min-h-screen pr-text-text pr-bg-bg pr-p-6">
      {/* Existing gradient stage (light/dark/aurora/gold) */}
      <div className="premium-stage" aria-hidden />

      {/* Planet stage (shows when theme = 'planet'; motion freezes in exam mode via CSS) */}
      <div className="planet-stage" aria-hidden>
        <div className="planet-stars" />
        <div className="planet-nebula" />
        <div className="planet-body">
          <div className="planet-ring" />
        </div>
      </div>

      <header className="pr-flex pr-items-center pr-justify-between pr-mb-6">
        <div className="pr-flex pr-items-center pr-gap-3">
          <div className="pr-h-9 pr-w-9 pr-rounded-xl pr-bg-primary pr-text-primaryFg pr-grid pr-place-items-center pr-font-semibold">
            EX
          </div>
          <div className="pr-text-lg pr-font-semibold">Exam Room</div>
          <Badge>Premium</Badge>
        </div>
        <ThemeToggle />
      </header>

      <main className="pr-grid pr-gap-6">{children}</main>

      <footer className="pr-pt-8 pr-text-center pr-text-xs pr-text-muted">
        Built for focus, speed, and accuracy.
      </footer>
    </div>
  );
}
