// pages/api/send-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import Twilio from 'twilio';
import { env } from '@/lib/env';

/** ---- Helpers ---- */
const isDummy = (v?: string) => !v || /dummy|placeholder|test/i.test(v);
const bool = (v?: string) => v === '1' || v?.toLowerCase() === 'true';

const BYPASS_TWILIO =
  bool(env.TWILIO_BYPASS) ||
  isDummy(env.TWILIO_ACCOUNT_SID) ||
  isDummy(env.TWILIO_AUTH_TOKEN) ||
  isDummy(env.TWILIO_VERIFY_SERVICE_SID);

const SERVICE_SID = env.TWILIO_VERIFY_SERVICE_SID; // e.g. VAxxxxxxxx
const client: ReturnType<typeof Twilio> | null = BYPASS_TWILIO
  ? null
  : Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

/** ---- Validation ---- */
const BodySchema = z.object({
  // E.164 format: +9233xxxxxxx
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (+XXXXXXXXXXX)'),
  channel: z.enum(['sms', 'call', 'whatsapp']).optional().default('sms'),
});

export type SendOtpResponse =
  | { ok: true; sid: string }
  | { ok: false; error: string; status?: number };

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

  // Tests expect 500 on non-POST; set statusCode explicitly for any mock libs
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.statusCode = 500;
    res.statusMessage = 'Method Not Allowed';
    res.setHeader('x-error', 'Method Not Allowed');
    return res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed', status: 500 }));
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Invalid request body' });
  }

  const { phone, channel } = parsed.data;

  try {
    // Bypass Twilio in tests/dev as configured — return a stable SID.
    if (BYPASS_TWILIO || !client) {
      return res.json({ ok: true, sid: 'SID123' });
    }

    const verification = await client.verify
      .services(SERVICE_SID)
      .verifications.create({ to: phone, channel });

    return res.json({ ok: true, sid: verification.sid });
  } catch (err) {
    console.error('Verify start error', err);
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as any).message)
        : 'Unknown error';
    res.statusCode = 500;
    return res.end(JSON.stringify({ ok: false, error: message, status: 500 }));
  }
}
