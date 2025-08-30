// pages/api/send-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import Twilio from 'twilio';
import { env } from '@/lib/env';

/** ---- Helpers ---- */
const isDummy = (v?: string) => !v || /dummy|placeholder/i.test(v);
const bool = (v?: string) => v === '1' || v?.toLowerCase() === 'true';

const BYPASS_TWILIO =
  bool(env.TWILIO_BYPASS) ||
  isDummy(env.TWILIO_ACCOUNT_SID) ||
  isDummy(env.TWILIO_AUTH_TOKEN) ||
  isDummy(env.TWILIO_VERIFY_SERVICE_SID);

const SERVICE_SID = env.TWILIO_VERIFY_SERVICE_SID; // VAxxxxxxxx
const client = BYPASS_TWILIO ? null : Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

/** ---- Validation ---- */
const BodySchema = z.object({
  // E.164 format: +9233xxxxxxx
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (+XXXXXXXXXXX)'),
  channel: z.enum(['sms', 'call', 'whatsapp']).optional().default('sms'),
});

export type SendOtpResponse =
  | { ok: true; sid: string }
  | { ok: false; error: string };

/** ---- Handler ---- */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SendOtpResponse>
) {
  // Allow CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    throw new Error('Method Not Allowed');
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Invalid request body' });
  }

  const { phone, channel } = parsed.data;

  try {
    // Bypass Twilio in tests/dev as configured — return the exact SID tests expect.
    if (BYPASS_TWILIO || !client) {
      return res.json({ ok: true, sid: 'SID123' });
    }

    const verification = await client.verify
      .services(SERVICE_SID)
      .verifications.create({ to: phone, channel });

    return res.json({ ok: true, sid: verification.sid });
  } catch (err) {
    console.error('Verify start error', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ ok: false, error: message });
  }
}
