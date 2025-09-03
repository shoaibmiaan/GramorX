// tests/api/challenge.progress.test.ts
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/challenge/progress";
import * as supa from "@/lib/supabaseBrowser";
import * as lib from "@/lib/challenge";

vi.mock("@/lib/supabaseBrowser", () => ({
  supabaseBrowser: {
    auth: { getUser: vi.fn() },
  },
}));

vi.mock("@/lib/challenge", () => ({
  updateChallengeProgress: vi.fn(),
}));

function mockReqRes(body: any = {}, method = "POST") {
  const req = { method, body } as unknown as NextApiRequest;
  let statusCode = 0;
  let jsonData: any;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      jsonData = data;
      return this;
    },
    end() {
      return this;
    },
  } as unknown as NextApiResponse;
  return { req, res, get: () => ({ statusCode, jsonData }) };
}

describe("POST /api/challenge/progress", () => {
  it("401 when not logged in", async () => {
    (supa.supabaseBrowser.auth.getUser as any).mockResolvedValue({ data: { user: null } });
    const { req, res, get } = mockReqRes({ enrollmentId: "e", day: 1, status: "done" });
    await handler(req, res);
    expect(get().statusCode).toBe(401);
    expect(get().jsonData.ok).toBe(false);
  });

  it("updates progress when logged in", async () => {
    (supa.supabaseBrowser.auth.getUser as any).mockResolvedValue({ data: { user: { id: "u1" } } });
    (lib.updateChallengeProgress as any).mockResolvedValue({
      ok: true,
      progress: { day1: "done" },
    });
    const { req, res, get } = mockReqRes({ enrollmentId: "e", day: 1, status: "done" });
    await handler(req, res);
    expect(get().statusCode).toBe(200);
    expect(get().jsonData.ok).toBe(true);
    expect(get().jsonData.progress.day1).toBe("done");
  });
});
