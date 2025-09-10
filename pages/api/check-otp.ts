// pages/api/check-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { enqueueNotification } from '@/lib/notify';

// Optional Twilio Verify (auto-bypass if not configured)
function twilioConfigured() {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID
  );
}

type Resp =
  | { ok: true; status: 'approved'; phone?: string }
  | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const sb = createSupabaseServerClient({ req });
    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();

    if (authErr) return res.status(500).json({ ok: false, error: authErr.message });
    if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const { phone, code } = (req.body ?? {}) as { phone?: string; code?: string };
    if (!phone || !code) {
      return res.status(400).json({ ok: false, error: 'Missing phone or code' });
    }

    let approved = false;

    // Bypass mode for local/test: if Twilio not configured, accept any 4–8 digit code
    if (!twilioConfigured() || process.env.TWILIO_BYPASS === '1') {
      approved = /^\d{4,8}$/.test(code);
    } else {
      // Live Twilio Verify check
      try {
        // Lazy import to avoid bundling if not configured
        const twilio = (await import('twilio')).default;
        const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;
        const verification = await client.verify.v2
          .services(serviceSid)
          .verificationChecks.create({ to: phone, code });
        approved = verification.status === 'approved';
      } catch (twilioErr: any) {
        return res.status(500).json({ ok: false, error: twilioErr?.message ?? 'OTP check failed' });
      }
    }

    if (!approved) {
      return res.status(400).json({ ok: false, error: 'Invalid code' });
    }

    // (Optional) Mark phone as verified in your profile table if you track it.
    // Example — adjust to your actual schema/table/column names:
    // await sb.from('profiles').update({ phone_verified: true }).eq('user_id', user.id);

    // Enqueue a notification for phone verified
    try {
      await enqueueNotification({
        userId: user.id,
        template: 'phone_verified',
      });
    } catch {
      // non-fatal
    }

    return res.status(200).json({ ok: true, status: 'approved', phone });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message ?? 'Internal Server Error' });
  }
}
