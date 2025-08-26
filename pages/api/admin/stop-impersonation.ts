// pages/api/admin/stop-impersonation.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireRole } from '@/lib/requireRole';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ok: true } | { error: string }>
) {
  try {
    await requireRole(req, ['admin']);
  } catch {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // You can write a DB log here if desired.
  res.status(200).json({ ok: true });
}
