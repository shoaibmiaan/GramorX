// pages/api/send-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import Twilio from 'twilio';
import { env } from '@/lib/env';

/** ---- Helpers ---- */
const isDummy = (v?: string) => !v || /dummy|test|placeholder/i.test(v);
const bool = (v?: string) => v === '1' || v?.toLowerCase() === 'true';

const BYPASS_TWILIO =
  bool(process.env.TWILIO_BYPASS) ||
  isDummy(env.TWILIO_ACCOUNT_SID) ||
  isDummy(env.TWILIO_AUTH_TOKEN) ||
  isDummy(env.TWILIO_VERIFY_SERVICE_SID);

const SERVICE_SID = env.TWILIO_VERIFY_SERVICE_SID; // should start with 'VA...'
const client = BYPASS_TWILIO ? null : Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

/** ---- Validation ---- */
const BodySchema = z.object({
  // E.164 format e.g. +9233xxxxxxx (1–15 digits)
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (+XXXXXXXXXXX)'),
  // Verify supports: sms | call | whatsapp
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
  // CORS preflight (optional)
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Invalid request body' });
  }

  const { phone } = parsed.data;
  const channel = parsed.data.channel ?? 'sms';

  try {
    // In dev/test or when dummy creds are present, bypass Twilio but keep the API contract.
    if (BYPASS_TWILIO || !client) {
      return res.status(200).json({ ok: true, sid: `bypass_${Date.now()}` });
    }

    const verification = await client.verify.v2
      .services(SERVICE_SID)
      .verifications.create({ to: phone, channel });

    return res.status(200).json({ ok: true, sid: verification.sid });
  } catch (err) {
    console.error('Verify start error', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ ok: false, error: message });
  }
}
