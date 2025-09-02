import type { NextApiHandler } from 'next';
import { env, bool } from '@/lib/env';
import { flags } from '@/lib/flags';

type HealthResponse = {
  ok: boolean;
  env: {
    supabase: boolean;
    ga4: boolean;
    meta: boolean;
    sentry: boolean;
    twilio: boolean;
  };
  flags: Record<string, boolean>;
  ts: string;
};

const handler: NextApiHandler<HealthResponse> = (_req, res) => {
  const body: HealthResponse = {
    ok: true,
    env: {
      supabase: Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      ga4: Boolean(env.NEXT_PUBLIC_GA4_ID),
      meta: Boolean(env.NEXT_PUBLIC_META_PIXEL_ID),
      sentry:
        Boolean(env.NEXT_PUBLIC_SENTRY_DSN) &&
        !bool(env.NEXT_PUBLIC_SENTRY_DISABLED),
      twilio: Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_VERIFY_SERVICE_SID),
    },
    flags: flags.snapshot(),
    ts: new Date().toISOString(),
  };
  res.status(200).json(body);
};

export default handler;
