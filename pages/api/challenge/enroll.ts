// pages/api/challenge/enroll.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { enrollInChallenge } from "@/lib/challenge";
import { ChallengeEnrollRequest, ChallengeEnrollResponse } from "@/types/challenge";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChallengeEnrollResponse>
) {
  if (req.method !== "POST") return res.status(405).end();

  const { cohort } = req.body as ChallengeEnrollRequest;

  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) return res.status(401).json({ ok: false, error: "Unauthorized" });

  const result = await enrollInChallenge(user.id, { cohort });
  res.status(result.ok ? 200 : 400).json(result);
}
