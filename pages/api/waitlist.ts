import { env } from "@/lib/env";
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY; // keep secret

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

function shortCode() {
  // 8‑char base36 ref code (collision probability negligible for small lists)
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { name, email, phone, country, referrer_code, source } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: 'Name and Email are required' });

    // Upsert by email to avoid duplicates
    // If email exists, do nothing and return ok
    const { data: existing, error: findErr } = await supabase
      .from('waitlist_signups')
      .select('id, referral_code')
      .eq('email', email)
      .maybeSingle();

    if (findErr) throw findErr;

    let referral_code = existing?.referral_code || shortCode();

    if (existing) {
      return res.status(200).json({ ok: true, referral_code, deduped: true });
    }

    const insertPayload = {
      name,
      email,
      phone: phone || null,
      country: country || null,
      referrer_code: referrer_code || null,
      referral_code,
      source: source || 'site:waitlist',
    };

    const { error: insErr } = await supabase.from('waitlist_signups').insert(insertPayload);
    if (insErr) throw insErr;

    res.status(200).json({ ok: true, referral_code });
  } catch (error: any) {
    console.error('waitlist error', error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}