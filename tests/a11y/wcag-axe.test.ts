// tests/a11y/wcag-axe.test.ts
import React from "react";
import { render } from "@testing-library/react";
import { default as axe } from "axe-core";
import { ChallengeCohortCard } from "@/components/challenge/ChallengeCohortCard";

async function runAxe(container: HTMLElement) {
  const results = await (axe as any).run(container, { rules: { "color-contrast": { enabled: false } } });
  // We disable color-contrast to avoid false positives in CI without real tokens.
  return results;
}

describe("A11y: ChallengeCohortCard", () => {
  it("has no major axe violations", async () => {
    const { container } = render(
      <ChallengeCohortCard
        id="BandBoost-Sep2025"
        title="14-Day Band-Boost"
        description="Daily micro-tasks"
        startDate="2025-09-05"
        endDate="2025-09-18"
        totalTasks={14}
        enrolled={false}
      />
    );
    const results = await runAxe(container);
    expect(results.violations.length).toBe(0);
  });
});
