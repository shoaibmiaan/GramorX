// pages/api/check-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// If you have a central env helper, feel free to replace process.env reads with it.
const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY as string;

// Safety checks to fail fast in CI if envs are missing
function assertEnv() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    assertEnv();

    const { phone, token } = req.body as { phone?: string; token?: string };

    if (!phone || !token) {
      return res.status(400).json({ ok: false, error: 'phone and token are required' });
    }

    // ✅ Proper Supabase client (has .from, .auth, etc.)
    const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    // 1) Verify the OTP sent via SMS
    const { data: verifyData, error: verifyErr } = await supa.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (verifyErr) {
      return res.status(401).json({ ok: false, error: verifyErr.message });
    }

    // 2) Upsert profile (optional: adjust table/columns to your schema)
    // Assumptions:
    //  - profiles table exists
    //  - it has columns: id (uuid), phone (text), phone_verified (bool), updated_at (timestamptz)
    //  - user id is available after verifyOtp in verifyData.session?.user
    const userId = verifyData?.session?.user?.id;
    if (userId) {
      const { error: upsertErr } = await supa
        .from('profiles')
        .upsert(
          {
            id: userId,
            phone,
            phone_verified: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (upsertErr) {
        // Not fatal for the verification, but useful to surface
        return res.status(200).json({
          ok: true,
          message: 'Phone verified',
          warning: `Profile upsert warning: ${upsertErr.message}`,
        });
      }
    }

    // 3) Respond with the message your test expects
    return res.status(200).json({ ok: true, message: 'Phone verified' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message ?? 'Internal Server Error' });
  }
}
