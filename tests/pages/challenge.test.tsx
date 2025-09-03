// tests/pages/challenge.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import ChallengeIndexPage from "@/pages/challenge/index";
import * as supa from "@/lib/supabaseBrowser";

vi.mock("@/lib/supabaseBrowser", () => ({
  supabaseBrowser: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    from: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [] }) }),
  },
}));

describe("ChallengeIndexPage", () => {
  it("renders header and cohorts", async () => {
    render(<ChallengeIndexPage />);
    expect(await screen.findByText("Challenges")).toBeInTheDocument();
    expect(
      screen.getByText(/14-Day Band-Boost \(Sep 2025\)/i)
    ).toBeInTheDocument();
  });

  it("shows deep links", async () => {
    render(<ChallengeIndexPage />);
    expect(
      await screen.findByRole("link", { name: /\/challenge\/BandBoost-Sep2025/i })
    ).toBeInTheDocument();
  });
});
