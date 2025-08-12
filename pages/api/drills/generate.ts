import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { topic } = req.body as { topic?: string };
  // TODO: call your AI provider here with `topic`
  const text = `Sample drill for: ${topic}\n\n1) Read the passage and answer...\n2) ...`;
  res.status(200).json({ text });
}
