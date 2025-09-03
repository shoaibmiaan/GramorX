// pages/api/challenge/leaderboard.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getChallengeLeaderboard } from "@/lib/challenge";
import { ChallengeLeaderboardResponse } from "@/types/challenge";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChallengeLeaderboardResponse>
) {
  if (req.method !== "GET") return res.status(405).end();

  const { cohort } = req.query;
  if (!cohort || typeof cohort !== "string")
    return res.status(400).json({ ok: false, error: "Missing cohort" });

  const result = await getChallengeLeaderboard(cohort);
  res.status(result.ok ? 200 : 400).json(result);
}
