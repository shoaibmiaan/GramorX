// tests/pages/cert/[id].test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CertificatePage from "@/pages/cert/[id]";
import * as router from "next/router";
import * as supa from "@/lib/supabaseBrowser";

vi.mock("next/router", () => ({
  useRouter: () => ({ query: { id: "cert-1" }, asPath: "/cert/cert-1", push: vi.fn() }),
}));

vi.mock("@/lib/supabaseBrowser", () => ({
  supabaseBrowser: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    from: vi.fn(),
  },
}));

function mockSelectOnce(row: any) {
  (supa.supabaseBrowser.from as any).mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: row, error: null }),
      }),
    }),
  });
}

describe("CertificatePage", () => {
  it("renders loading then certificate", async () => {
    mockSelectOnce({
      id: "cert-1",
      user_id: "user-1",
      created_at: "2025-09-01T00:00:00Z",
      meta_json: { band: 7.5, cohort: "BandBoost-Sep2025" },
    });

    // mock profiles fetch
    (supa.supabaseBrowser.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { full_name: "Test User" }, error: null }),
        }),
      }),
    });

    render(<CertificatePage />);
    expect(screen.getByText(/Loading certificate/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText(/Certificate/i)).toBeInTheDocument());
    expect(screen.getByText(/Share your achievement/i)).toBeInTheDocument();
  });
});
