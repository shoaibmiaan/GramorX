import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { env } from '@/lib/env';
import { isValidEmail } from '@/utils/validation';
import { evaluateRisk, riskThreshold } from '@/lib/risk';
import { incrementFlaggedSignup } from '@/lib/metrics';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL || env.SITE_URL || 'http://localhost:3000';
const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{8,}$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ session?: any } | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, referral } = req.body as {
    email?: string;
    password?: string;
    referral?: string;
  };

  const trimmedEmail = (email || '').trim();
  if (!trimmedEmail || !password) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }
  if (!isValidEmail(trimmedEmail)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (!pwRegex.test(password)) {
    return res.status(400).json({
      error: 'Use a stronger password (min 8 chars, include letters and numbers).',
    });
  }

  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ip = Array.isArray(ipRaw) ? ipRaw[0] : ipRaw.split(',')[0];
  const userAgent = req.headers['user-agent'] || '';

  const risk = await evaluateRisk({ ip, userAgent, email: trimmedEmail });
  if (risk.score >= riskThreshold) {
    console.warn('Signup attempt flagged', {
      ip,
      userAgent,
      email: trimmedEmail,
      score: risk.score,
    });
    incrementFlaggedSignup();
    return res
      .status(403)
      .json({ error: 'Signup blocked due to suspicious activity.' });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/verify`,
        data: referral ? { referral_code: referral.trim() } : undefined,
      },
    });

    if (error) {
      if (error.code === 'user_exists') {
        return res.status(400).json({ error: 'user_exists' });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ session: data.session });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: e?.message || 'Something went wrong. Please try again.' });
  }
}
