import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const InSchema = z.object({ minutes: z.number().min(1).max(300) });

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const parsed = InSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { minutes } = parsed.data;
  const start = Date.now();
  const end = start + minutes * 60 * 1000;

  return res.status(200).json({ start, end });
}
