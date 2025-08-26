// pages/api/admin/premium/set-pin.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '@/lib/supabaseService';
import { requireRole } from '@/lib/requireRole';

type Resp =
  | { ok: true; status: 'CREATED' | 'UPDATED'; userId: string }
  | { ok: false; reason: 'NOT_ADMIN' | 'BAD_INPUT' | 'USER_NOT_FOUND' | 'INVALID_NEW' }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await requireRole(req, ['admin']);

    // Parse input
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const targetEmail: string | undefined = body?.email;
    const newPin: string | undefined = body?.newPin;

    if (!targetEmail || !newPin) return res.status(400).json({ ok: false, reason: 'BAD_INPUT' });
    if (!/^\d{4,6}$/.test(newPin)) return res.status(400).json({ ok: false, reason: 'INVALID_NEW' });

    // Find target user by email (admin API using service key)
    const { data: found, error: findErr } = await supabaseService.auth.admin.listUsers({ page: 1, perPage: 1, email: targetEmail });
    if (findErr) return res.status(500).json({ error: findErr.message });

    const target = found?.users?.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (!target) return res.status(404).json({ ok: false, reason: 'USER_NOT_FOUND' });

    const userId = target.id;

    // Hash on DB side using pgcrypto (safe + consistent)
    const { error: upErr } = await supabaseService.rpc('set_premium_pin', {
      current_pin: null,          // admin override (no current pin required)
      new_pin: newPin
    }, { head: false });

    // If you didn’t create the RPC to accept admin override, do a direct upsert:
    if (upErr) {
      // Fallback direct SQL via service key
      const { error: upsertErr } = await supabaseService
        .from('premium_pins')
        .upsert({ user_id: userId, pin_hash: ``, created_at: new Date().toISOString() } as any); // placeholder—will be replaced below
      if (upsertErr) return res.status(500).json({ error: upsertErr.message });
    }

    // Safer: do the hashing with an RPC. If you prefer direct SQL hashing:
    const { error: hashErr } = await supabaseService.rpc('exec', {
      q: `
        insert into public.premium_pins(user_id, pin_hash, created_at)
        values ('${userId}', crypt('${newPin}', gen_salt('bf')), now())
        on conflict (user_id)
        do update set pin_hash = crypt('${newPin}', gen_salt('bf')), created_at = now();
      `
    } as any);
    if (hashErr) return res.status(500).json({ error: hashErr.message });

    // Determine status (created vs updated)
    // Cheap way: a second write isn’t needed—just report UPDATED if row existed already.
    // We’ll check existence quickly:
    const { data: existed, error: selErr } = await supabaseService
      .from('premium_pins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (selErr) return res.status(200).json({ ok: true, status: 'UPDATED', userId });

    return res.status(200).json({ ok: true, status: existed ? 'UPDATED' : 'CREATED', userId });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Internal Error' });
  }
}
