import type { NextApiRequest, NextApiResponse } from 'next';
import { getMetrics } from '@/lib/metrics';
import { rateLimit } from '@/lib/rateLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await rateLimit(req, res))) return;
  res.status(200).json(getMetrics());
}
