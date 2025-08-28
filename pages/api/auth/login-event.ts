import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Twilio from 'twilio';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Cookie: req.headers.cookie || '' } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const ip = Array.isArray(req.headers['x-forwarded-for'])
    ? req.headers['x-forwarded-for'][0]
    : req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || null;

  // Check if this signature exists already
  const { data: existing } = await supabaseAdmin
    .from('login_events')
    .select('id')
    .eq('user_id', user.id)
    .eq('ip_address', ip)
    .eq('user_agent', userAgent)
    .maybeSingle();

  const { error } = await supabaseAdmin.from('login_events').insert({
    user_id: user.id,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const isNew = !existing;

  if (isNew) {
    // Attempt to send OTP via SMS or fall back to email
    try {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('phone, email')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.phone) {
        const client = Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
        await client.verify
          .services(env.TWILIO_VERIFY_SERVICE_SID)
          .verifications.create({ to: profile.phone, channel: 'sms' });
      } else if (profile?.email && process.env.RESEND_API_KEY) {
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
            text: 'A new login to your GramorX account was detected. If this was you, please confirm.',
          }),
        });
      }
    } catch (err) {
      console.error('Verification dispatch failed', err);
    }
  }

  return res.status(200).json({ success: true, newDevice: isNew });
}
