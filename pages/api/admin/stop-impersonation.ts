// pages/api/admin/stop-impersonation.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(_req: NextApiRequest, res: NextApiResponse<{ok:true}>) {
  // You can write a DB log here if desired.
  res.status(200).json({ ok: true });
}
