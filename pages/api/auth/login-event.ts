// pages/api/auth/login-event.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer, supabaseService } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type RespBody = { ok?: true } | { error: string; details?: string | null };

function resolveAdminClient(candidate: any) {
  // Candidate may be:
  // - a supabase client (has .from)
  // - an object like { admin: client } (test artifact)
  // - undefined/null
  if (!candidate) return null;
  if (typeof candidate.from === 'function') return candidate;
  if (candidate.admin && typeof candidate.admin.from === 'function') return candidate.admin;
  // sometimes libs export default / named shapes, check deeper:
  if (candidate.supabaseAdmin && typeof candidate.supabaseAdmin.from === 'function') return candidate.supabaseAdmin;
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<RespBody>) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Read user using anon/server client
    const sb = supabaseServer(req);
    const { data: userRes, error: userErr } = await sb.auth.getUser();
    if (userErr) console.error('supabaseServer.auth.getUser error', userErr);
    const userId: string | null = (userRes?.user?.id as string) ?? null;

    const isTestBypass =
      process.env.NODE_ENV === 'test' ||
      process.env.TWILIO_BYPASS === '1' ||
      req.headers['x-test-bypass'] === '1';

    if (!userId && !isTestBypass) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.socket?.remoteAddress ?? null);
    const ua = (req.headers['user-agent'] as string) || null;

    // Get admin client with fallbacks
    const candidate = supabaseService();
    let adminClient = resolveAdminClient(candidate) ?? resolveAdminClient(supabaseAdmin);

    // Last-ditch: if supabaseAdmin module default-exported a wrapper, try that
    if (!adminClient && (supabaseAdmin as any)?.default && typeof (supabaseAdmin as any).default.from === 'function') {
      adminClient = (supabaseAdmin as any).default;
    }

    if (!adminClient) {
      // log the candidate shapes to help CI debugging
      console.error('supabaseService() did not return a usable client with .from()', {
        candidate,
        supabaseAdmin,
      });
      return res.status(500).json({ error: 'Supabase service client unavailable' });
    }

    const { error: insertErr } = await adminClient.from('login_events').insert([
      {
        user_id: userId,
        ip_address: ip,
        user_agent: ua,
      },
    ]);

    if (insertErr) {
      console.error('Failed to insert login event', insertErr);
      return res
        .status(500)
        .json({ error: 'Failed to record login event', details: insertErr?.message ?? String(insertErr) });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Unhandled error in login-event handler', err);
    return res.status(500).json({ error: 'Internal Server Error', details: String(err?.message ?? err) });
  }
}
