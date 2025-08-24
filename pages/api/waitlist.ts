<<<<<<< HEAD
// pages/api/waitlist.ts
=======
import { env } from "@/lib/env";
>>>>>>> 4e94e6322611b22f93ab3e6364502036ed9a3d29
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

<<<<<<< HEAD
type Ok = { ok: true; id: string | null; duplicate: boolean; message: string };
type Fail = { ok: false; error: string; issues?: { field: string; message: string }[] };
type Out = Ok | Fail;
=======
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY; // keep secret
>>>>>>> 4e94e6322611b22f93ab3e6364502036ed9a3d29

// Accept both your UI keys and earlier variants; mark optionals as optional.
const InSchema = z.object({
  name: z.string().optional(),
  full_name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),                 // optional
  country: z.string().optional(),               // optional (can be blank)
  target_band: z.union([z.string(), z.number()]).optional(),
  planned_test: z.string().optional(),          // "YYYY-MM" or "Nov 2025"
  planned_test_date: z.string().optional(),     // alternate key
  experience: z.string().max(240).optional(),
  referrer_code: z.string().max(64).optional(), // optional
  referral_code: z.string().max(64).optional(), // optional (db col might be NOT NULL)
  ref_code: z.string().max(64).optional(),      // optional (alt col)
  source: z.string().max(64).optional(),
});

const isE164 = (v: string) => /^\+[1-9]\d{7,14}$/.test(v);

function getClientIp(req: NextApiRequest): string | null {
  const xf = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
  return xf || (req.socket?.remoteAddress ?? null);
}

function monthToYYYYMM(s?: string | null): string | null {
  if (!s) return null;
  const t = s.trim();
  const m1 = t.match(/^(\d{4})-(\d{2})$/);
  if (m1) return `${m1[1]}-${m1[2]}-01`;
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const m2 = t.match(/^([A-Za-z]{3,})\s+(\d{4})$/);
  if (m2) {
    const idx = months.findIndex(m => m === m2[1].slice(0,3).toLowerCase());
    if (idx >= 0) return `${m2[2]}-${String(idx+1).padStart(2,'0')}-01`;
  }
  return null;
}

// Upsert with schema-flexibility + duplicate detection
async function upsertWithDuplicate(email: string, payload: Record<string, unknown>) {
  const existing = await supabaseAdmin.from('waitlist_signups')
    .select('id').eq('email', email).maybeSingle();
  const already = !!existing.data?.id;
  const existingId = existing.data?.id ?? null;

  let { data, error, status } = await supabaseAdmin
    .from('waitlist_signups')
    .upsert(payload, { onConflict: 'email', ignoreDuplicates: false })
    .select('id')
    .single();

  if (!error) return { id: data?.id ?? existingId, duplicate: already };

  // eslint-disable-next-line no-console
  console.error('[waitlist upsert error]', status, error);
  const msg = (error as any)?.message?.toString() ?? '';
  const code = (error as any)?.code as string | undefined;

  // Unknown column -> drop and retry
  if (code === '42703') {
    const bad = msg.match(/column\s+"?([a-zA-Z0-9_]+)"?\s+of/i)?.[1];
    if (bad) {
      const next = { ...payload }; delete (next as any)[bad];
      return upsertWithDuplicate(email, next);
    }
  }
  // ON CONFLICT not available -> select/insert fallback
  if (code === '42P10' || msg.includes('ON CONFLICT')) {
    if (already) return { id: existingId, duplicate: true };
    const inserted = await supabaseAdmin.from('waitlist_signups')
      .insert(payload).select('id').single();
    if (inserted.error) throw inserted.error;
    return { id: inserted.data?.id ?? null, duplicate: false };
  }
  // Unique race
  if (code === '23505') return { id: existingId, duplicate: true };

  throw error;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Out>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const parsed = InSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Please check the form and try again.' });
  }
  const d = parsed.data;

  const issues: { field: string; message: string }[] = [];

  const full_name = (d.name ?? d.full_name ?? '').trim();
  if (!full_name) issues.push({ field: 'name', message: 'Enter your full name.' });

  const email = d.email?.toLowerCase().trim();
  if (!email) issues.push({ field: 'email', message: 'Enter a valid email address.' });

  // Optional fields: validate only if provided; otherwise store BLANK ("")
  const phoneRaw = (d.phone ?? '').trim();
  if (phoneRaw && !isE164(phoneRaw)) {
    issues.push({ field: 'phone', message: 'Phone must be like +14155552671.' });
  }

  const band =
    d.target_band !== undefined && d.target_band !== null && d.target_band !== ''
      ? Math.max(0, Math.min(9, Number(d.target_band)))
      : null;

  const planned_test_date = monthToYYYYMM(d.planned_test ?? d.planned_test_date);
  if ((d.planned_test || d.planned_test_date) && !planned_test_date) {
    issues.push({ field: 'planned_test', message: 'Pick a valid month (e.g., 2025-12).' });
  }

  // 🔑 Optional text fields stored as BLANK strings (not NULL) to satisfy NOT NULL schemas.
  const country = (d.country ?? '').trim(); // "" if omitted
  const experience = (d.experience ?? '').toString().trim(); // "" if omitted
  const ref = (d.referrer_code ?? d.referral_code ?? d.ref_code ?? '')
    .toString().trim().slice(0, 64); // "" if omitted

  if (issues.length) {
    return res.status(400).json({
      ok: false,
      error: 'Please fix the highlighted fields.',
      issues,
    });
  }

  const payload: Record<string, unknown> = {
    // Support both schema variants that might exist in your table:
    full_name,
    name: full_name,
    email,
    target_band: band,
    planned_test_date,                 // null when not provided (date column usually allows null)
    experience,                        // "" when optional/blank
    phone: phoneRaw,                   // "" when optional/blank
    country,                           // "" when optional/blank (avoids NOT NULL errors)
    referral_code: ref,                // "" when optional/blank
    ref_code: ref,                     // "" when optional/blank
    utm: ref ? { ref } : null,
    source: d.source ?? 'site:waitlist',
    ip: getClientIp(req),
    user_agent: (req.headers['user-agent'] as string | undefined) ?? '',
  };

  try {
    const { id, duplicate } = await upsertWithDuplicate(email!, payload);
    return res.status(200).json({
      ok: true,
      id,
      duplicate,
      message: duplicate ? 'You are already on the waitlist.' : 'Added to the waitlist!',
    });
  } catch (e: any) {
    const detail = e?.message || 'Database error';
    return res.status(500).json({ ok: false, error: detail });
  }
}
