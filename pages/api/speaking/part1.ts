// pages/api/speaking/part1.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pickPart1Set } from "@/lib/speaking/part1Bank";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const nTopics = clampInt(req.query.nTopics as string, 3, 1, 4);    // IELTS realistic: 2–3 topics
  const perTopic = clampInt(req.query.perTopic as string, 4, 3, 5); // 3–5 each, default 4
  const seed = req.query.seed ? Number(req.query.seed) : undefined;

  const items = pickPart1Set(nTopics, perTopic, seed);
  res.status(200).json({
    meta: {
      nTopics,
      perTopic,
      total: items.length,
      durationSeconds: 300, // 5 minutes target window
      note: "Answer in 1–3 sentences; examiner may ask quick follow-ups."
    },
    items,
  });
}

function clampInt(v: string | undefined, def: number, min: number, max: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : def;
}
