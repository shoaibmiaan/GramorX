import { env } from "@/lib/env";
// pages/api/premium/verify-pin.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type Resp =
  | { success: true }
  | { success: false; reason?: 'INVALID_PIN' | 'NO_PIN_SET' }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { pin } = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {};
    if (!pin || !/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4–6 digits' });
    }

    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL as string,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Call secure RPC
    const { data, error } = await supabase.rpc('verify_premium_pin', { input_pin: pin });

    if (error) {
      // If table row doesn’t exist for the user, treat as "NO_PIN_SET"
      if (error.message?.toLowerCase().includes('permission') || error.code === 'PGRST301') {
        return res.status(200).json({ success: false, reason: 'NO_PIN_SET' });
      }
      return res.status(500).json({ error: error.message });
    }

    if (data === true) return res.status(200).json({ success: true });
    return res.status(200).json({ success: false, reason: 'INVALID_PIN' });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Internal Error' });
  }
}
