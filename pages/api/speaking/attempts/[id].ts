// pages/api/speaking/attempts/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data =
  | { ok: true; id: string }
  | { ok: false; error: string };

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { id } = req.query;
  const idStr = Array.isArray(id) ? id[0] : id ?? '';
  if (!idStr) {
    res.status(400).json({ ok: false, error: 'Missing attempt id' });
    return;
  }

  if (req.method === 'GET') {
    // 🔧 TEMP response so build succeeds
    res.status(200).json({ ok: true, id: idStr });
    return;
  }

  res.setHeader('Allow', 'GET');
  res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}
