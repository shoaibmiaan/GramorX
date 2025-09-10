// pages/api/auth/login-event.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { enqueueNotification } from '@/lib/notify';

type Resp =
  | { ok: true; newDevice: boolean; firstLogin: boolean }
  | { error: string; details?: string };

function getClientIp(req: NextApiRequest): string | null {
  const xfwd = (req.headers['x-forwarded-for'] as string) || '';
  if (xfwd) {
    const first = xfwd.split(',')[0]?.trim();
    if (first) return first;
  }
  // Fallback to remoteAddress
  // @ts-expect-error TODO: type for req.socket in Next 15
  return (req.socket?.remoteAddress as string) || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const sb = createSupabaseServerClient({ req });
    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();

    if (authErr) {
      return res.status(500).json({ error: 'Failed to read auth session', details: authErr.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = user.id;
    const ip = getClientIp(req);
    const ua = (req.headers['user-agent'] as string) || null;

    // ---- First-login check (count BEFORE insert)
    let firstLogin = false;
    {
      const { count, error } = await supabaseAdmin
        .from('login_events')
        .select('id', { count: 'exact', head: true } as any)
        .eq('user_id', userId);

      if (error) {
        // non-fatal; default to not first
        firstLogin = false;
      } else {
        firstLogin = (count ?? 0) === 0;
      }
    }

    // ---- New-device check: same user + same IP present?
    let newDevice = false;
    if (ip) {
      try {
        const { data } = await supabaseAdmin
          .from('login_events')
          .select('id')
          .eq('user_id', userId)
          .eq('ip_address', ip)
          .maybeSingle();

        newDevice = !data; // no prior row => new device
      } catch {
        newDevice = true; // on lookup failure, err on safe side
      }
    }

    // ---- Always record the login event
    {
      const { error } = await supabaseAdmin.from('login_events').insert([
        {
          user_id: userId,
          ip_address: ip,
          user_agent: ua,
        },
      ]);
      if (error) {
        return res.status(500).json({ error: 'Failed to record login event', details: error.message });
      }
    }

    // ---- Enqueue notifications (non-blocking; ignore failures)
    // 1) Welcome only once
    if (firstLogin) {
      try {
        await enqueueNotification({
          userId,
          template: 'welcome',
        });
      } catch {
        /* noop */
      }
    }

    // 2) New device
    if (newDevice) {
      try {
        // Optional payload (if you parse UA/geo in your stack)
        await enqueueNotification({
          userId,
          template: 'login_new_device',
          // payload: { city: 'Lahore', device: 'Chrome on Windows' },
          outOfApp: true, // respects sms/wa/email opt-ins + quiet hours
        });
      } catch {
        /* noop */
      }
    }

    return res.status(200).json({ ok: true, newDevice, firstLogin });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', details: err?.message ?? String(err) });
  }
}
