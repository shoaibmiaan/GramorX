import { env } from "@/lib/env";
// pages/api/admin/set-pin.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/admin';

type Resp = { ok: true; status: string } | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  // 1) Verify requester is logged-in admin (from cookies)
  const supabaseSSR = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL as string,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { cookies: { get: (k) => req.cookies[k], set: () => {}, remove: () => {} } }
  );

  const {
    data: { user },
    error: userErr,
  } = await supabaseSSR.auth.getUser();

  if (userErr || !user?.email) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  if (!isAdminEmail(user.email)) return res.status(403).json({ ok: false, error: 'Forbidden' });

  // 2) Input validation
  const { email, newPin } = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {};
  if (!email || !newPin) return res.status(400).json({ ok: false, error: 'Missing email or newPin' });
  if (!/^\d{4,6}$/.test(String(newPin))) return res.status(400).json({ ok: false, error: 'PIN must be 4–6 digits' });

  // 3) Call admin RPC with service_role (server only)
  const svc = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL as string,
    env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  const { data, error } = await svc.rpc('admin_set_premium_pin', { user_email: email, new_pin: String(newPin) });
  if (error) return res.status(500).json({ ok: false, error: error.message });

  if (data === 'SET_OK') return res.status(200).json({ ok: true, status: 'PIN updated' });
  if (data === 'NO_SUCH_USER') return res.status(404).json({ ok: false, error: 'User not found' });
  if (data === 'INVALID_NEW') return res.status(400).json({ ok: false, error: 'Invalid new PIN' });

  return res.status(400).json({ ok: false, error: 'Unexpected result' });
}
