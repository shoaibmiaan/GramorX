import { env } from "@/lib/env";
// pages/api/premium/verify-pin.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { scryptSync, timingSafeEqual } from 'crypto';

// ----------- env -----------
const HASH_HEX = (process.env.PREMIUM_PIN_HASH || '').trim();
const SALT_HEX = (process.env.PREMIUM_PIN_SALT || '').trim();
const MASTER   = (process.env.PREMIUM_MASTER_PIN || '').trim();
const RATE     = Number(process.env.PREMIUM_PIN_RATE || 10);          // attempts
const WINDOW_S = Number(process.env.PREMIUM_PIN_WINDOW_SEC || 60);    // seconds
const ONE_DAY  = 60 * 60 * 24;

// ----------- naive in‑memory rate limiter (per dev instance) -----------
type Bucket = { resetAt: number; count: number };
const buckets = new Map<string, Bucket>();

function rateLimit(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + WINDOW_S * 1000;
    buckets.set(key, { resetAt, count: 1 });
    return { ok: true, remaining: RATE - 1, resetAt };
  }
<<<<<<< HEAD
  if (bucket.count >= RATE) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
=======
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
>>>>>>> 4e94e6322611b22f93ab3e6364502036ed9a3d29
  }
  bucket.count += 1;
  return { ok: true, remaining: RATE - bucket.count, resetAt: bucket.resetAt };
}

function getClientKey(req: NextApiRequest) {
  const xf = (req.headers['x-forwarded-for'] as string) || '';
  const ip = xf.split(',')[0].trim() || (req.socket as any)?.remoteAddress || 'local';
  return `pin:${ip}`;
}

// ----------- helpers -----------
function verifyWithHash(pin: string) {
  if (!HASH_HEX || !SALT_HEX) return false;
  const derived = scryptSync(pin, Buffer.from(SALT_HEX, 'hex'), 64);
  const want = Buffer.from(HASH_HEX, 'hex');
  if (derived.length !== want.length) return false;
  return timingSafeEqual(derived, want);
}

function okCookie() {
  const isProd = process.env.NODE_ENV === 'production';
  return [
    'pr_pin_ok=1',
    'Path=/',
    `Max-Age=${ONE_DAY}`,
    'HttpOnly',
    'SameSite=Lax',
    ...(isProd ? ['Secure'] : []), // Secure only when on HTTPS
  ].join('; ');
}

// ----------- handler -----------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pin } = (req.body ?? {}) as { pin?: string };
  if (!pin) return res.status(400).json({ error: 'PIN is required' });

  // Rate limit first
  const rl = rateLimit(getClientKey(req));
  if (!rl.ok) {
    const secs = Math.max(0, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return res.status(429).json({ error: `Too many attempts. Try again in ${secs}s.` });
  }

  // Allow master PIN if configured
  let valid = false;
  if (MASTER && pin === MASTER) {
    valid = true;
  } else if (HASH_HEX && SALT_HEX) {
    valid = verifyWithHash(pin);
  } else {
    // Misconfiguration guard: no hash/salt and no master pin
    return res.status(500).json({ error: 'Server not configured (hashed PIN or master pin missing)' });
  }

  if (!valid) return res.status(401).json({ error: 'Invalid PIN' });

  // Success → set cookie for middleware
  res.setHeader('Set-Cookie', okCookie());
  return res.status(200).json({ ok: true });
}
