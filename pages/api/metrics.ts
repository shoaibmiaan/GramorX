import type { NextApiRequest, NextApiResponse } from 'next';
import { getMetrics } from '@/lib/metrics';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(getMetrics());
}
