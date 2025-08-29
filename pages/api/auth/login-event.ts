import type { NextApiRequest, NextApiResponse } from 'next';
import Twilio from 'twilio';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type Success = { success: true; newDevice: boolean };
type Failure = { error: string };
type LoginEventResponse = Success | Failure;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginEventResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Authenticated server client (from cookies)
  const supabase = createSupabaseServerClient({ req });

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) {
    return res.status(500).json({ error: userErr.message });
  }
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const ipHeader = req.headers['x-forwarded-for'];
  const ip =
    (Array.isArray(ipHeader) ? ipHeader[0] : ipHeader) ??
    req.socket.remoteAddress ??
    null;

  const userAgent = (req.headers['user-agent'] as string | undefined) ?? null;

  // Has this signature been seen before?
  const { data: existing, error: existingErr } = await supabaseAdmin
    .from('login_events')
    .select('id')
    .eq('user_id', user.id)
    .eq('ip_address', ip)
    .eq('user_agent', userAgent)
    .maybeSingle();

  if (existingErr) {
    return res.status(500).json({ error: existingErr.message });
  }

  // Insert current login event
  const { error: insertErr } = await supabaseAdmin.from('login_events').insert({
    user_id: user.id,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (insertErr) {
    return res.status(500).json({ error: insertErr.message });
  }

  const isNew = !existing;

  // If this looks like a new device/location, try to notify user
  if (isNew) {
    try {
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('user_profiles')
        .select('phone, email')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profileErr && profile) {
        if (profile.phone && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_VERIFY_SERVICE_SID) {
          const client = Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
          await client.verify
            .services(env.TWILIO_VERIFY_SERVICE_SID)
            .verifications.create({ to: profile.phone, channel: 'sms' });
        } else if (profile.email && process.env.RESEND_API_KEY) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'no-reply@gramorx.com',
              to: profile.email,
              subject: 'Confirm new login',
              text:
                'A new login to your GramorX account was detected. If this was you, you can ignore this message. If not, please reset your password immediately.',
            }),
          });
        }
      }
    } catch (e) {
      // Don’t block the response on notification failures
      console.error('Verification/notification dispatch failed', e);
    }
  }

  return res.status(200).json({ success: true, newDevice: isNew });
}
