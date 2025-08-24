import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type WaitlistIn = {
  name: string;
  email: string;
  phone: string;     // raw input
  country: string;   // ISO-3166 alpha-2 (e.g., "US")
  targetBand?: number;
  testMonth?: string; // YYYY-MM
};
type WaitlistOut = { ok: true } | { error: string };

const CC: Record<string, string> = {
  US: '1', CA: '1', GB: '44', AU: '61', IN: '91', PK: '92', AE: '971',
};

function toE164(raw: string, iso2: string): string | null {
  const digits = (raw || '').replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return /^\+[\d]{8,15}$/.test(digits) ? digits : null;
  const cc = CC[iso2.toUpperCase()];
  if (!cc) return null;
  const local = digits.replace(/\D/g, '');
  const e164 = `+${cc}${local}`;
  return /^\+[\d]{8,15}$/.test(e164) ? e164 : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<WaitlistOut>) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, email, phone, country, targetBand, testMonth }: WaitlistIn = req.body ?? {};

  if (!country) return res.status(400).json({ error: 'Country is required' });
  const phone_e164 = toE164(phone, country);
  if (!phone_e164) return res.status(400).json({ error: 'Phone must be valid international (E.164)' });

  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

  // table: waitlist_submissions
  const { error } = await supabaseAdmin.from('waitlist_submissions').upsert(
    { name, email, phone_e164, country, target_band: targetBand ?? null, test_month: testMonth ?? null },
    { onConflict: 'email' }
  );
  if (error) return res.status(500).json({ error: 'Failed to save' });

  return res.status(200).json({ ok: true });
}
