import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ONE_DAY = 60 * 60 * 24;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pin } = (req.body ?? {}) as { pin?: string };
  if (!pin) return res.status(400).json({ error: 'PIN is required' });

  const { data, error } = await supabaseAdmin
    .from('premium_pins')
    .select('pin_hash');

  if (error) return res.status(500).json({ error: error.message });

  let valid = false;
  for (const row of data ?? []) {
    if (row.pin_hash && (await bcrypt.compare(pin, row.pin_hash))) {
      valid = true;
      break;
    }
  }

  if (!valid) return res.status(401).json({ error: 'Invalid PIN' });

  res.setHeader(
    'Set-Cookie',
    ['pr_pin_ok=1', 'Path=/', `Max-Age=${ONE_DAY}`, 'HttpOnly', 'SameSite=Lax'].join('; ')
  );
  return res.status(200).json({ ok: true });
}

