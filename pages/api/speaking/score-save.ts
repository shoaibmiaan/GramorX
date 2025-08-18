import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { attemptId, part, audioBase64, mime, path, clipId } = req.body || {};
    if (!attemptId || !part || !audioBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // TODO: plug in Gemini/Grok; for now, return fast, friendly advice.
    const advice = 'Good start—add 1–2 supporting details to each answer.';

    return res.status(200).json({ ok: true, advice, attemptId, path, clipId, mime });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
