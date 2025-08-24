import { env } from "@/lib/env";
import type { NextApiRequest, NextApiResponse } from 'next';
import { scoreReading } from '@/lib/reading/scoring';
import { randomUUID } from 'crypto';

const ATTEMPTS: Record<string, any> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { slug, answers } = req.body as { slug: string; answers: Record<string, any> };
    if (!slug || !answers) return res.status(400).json({ error: 'Missing payload' });

    const baseUrl = env.NEXT_PUBLIC_BASE_URL || `http://${req.headers.host}`;
    const paperRes = await fetch(`${baseUrl}/api/reading/test/${slug}`);
    const paper = await paperRes.json();

    const result = scoreReading(paper, answers);
    const attemptId = randomUUID();

    ATTEMPTS[attemptId] = { attemptId, slug, paperTitle: paper.title, paper, answers, result };

    return res.json({ attemptId });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Submit failed' });
  }
}

export function getAttempt(id: string) {
  return ATTEMPTS[id];
}
