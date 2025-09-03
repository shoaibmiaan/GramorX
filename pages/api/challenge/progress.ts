// pages/api/challenge/progress.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { updateChallengeProgress } from "@/lib/challenge";
import { ChallengeProgressUpdateRequest, ChallengeProgressResponse } from "@/types/challenge";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChallengeProgressResponse>
) {
  if (req.method !== "POST") return res.status(405).end();

  const payload = req.body as ChallengeProgressUpdateRequest;

  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) return res.status(401).json({ ok: false, error: "Unauthorized" });

  const result = await updateChallengeProgress(user.id, payload);
  res.status(result.ok ? 200 : 400).json(result);
}
