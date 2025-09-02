import { z } from 'zod';

const envSchema = z.object({
  // Public (client) vars
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES: z.coerce.number().default(30),
  NEXT_PUBLIC_DEBUG: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // ➕ Optional analytics/monitoring (added)
  NEXT_PUBLIC_GA4_ID: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Server-only vars
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_EMAILS: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  GX_AI_PROVIDER: z.string().optional(),
  PREMIUM_MASTER_PIN: z.string().optional(),
  PREMIUM_PIN_HASH: z.string().optional(),
  PREMIUM_PIN_SALT: z.string().optional(),
  PREMIUM_PIN_RATE: z.coerce.number().optional(),
  PREMIUM_PIN_WINDOW_SEC: z.coerce.number().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SPEAKING_DAILY_LIMIT: z.coerce.number().optional(),
  SPEAKING_BUCKET: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  TWILIO_BYPASS: z.string().optional(),
  LOCAL_ADMIN_TOKEN: z.string().optional(),
  ADMIN_API_TOKEN: z.string().optional(),
  SITE_URL: z.string().url().optional(),
  PORT: z.coerce.number().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const raw = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES: process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES,
  NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,

  // ➕ Added
  NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,

  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  GX_AI_PROVIDER: process.env.GX_AI_PROVIDER,
  PREMIUM_MASTER_PIN: process.env.PREMIUM_MASTER_PIN,
  PREMIUM_PIN_HASH: process.env.PREMIUM_PIN_HASH,
  PREMIUM_PIN_SALT: process.env.PREMIUM_PIN_SALT,
  PREMIUM_PIN_RATE: process.env.PREMIUM_PIN_RATE,
  PREMIUM_PIN_WINDOW_SEC: process.env.PREMIUM_PIN_WINDOW_SEC,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  SPEAKING_DAILY_LIMIT: process.env.SPEAKING_DAILY_LIMIT,
  SPEAKING_BUCKET: process.env.SPEAKING_BUCKET,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID,
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
  TWILIO_BYPASS: process.env.TWILIO_BYPASS,
  LOCAL_ADMIN_TOKEN: process.env.LOCAL_ADMIN_TOKEN,
  ADMIN_API_TOKEN: process.env.ADMIN_API_TOKEN,
  SITE_URL: process.env.SITE_URL,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV as any,
};

const skipValidation =
  process.env.SKIP_ENV_VALIDATION === 'true' || raw.NODE_ENV === 'test';

const parsed = envSchema.safeParse(raw);

if (!parsed.success && typeof window === 'undefined') {
  if (skipValidation) {
    const warnings = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n');
    console.warn(
      'Skipping environment variable validation. Falling back to safe defaults:\n' +
        warnings,
    );
  } else {
    const errors = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n');
    console.error('Invalid environment variables:\n' + errors);
    throw new Error('Invalid environment variables');
  }
}

const defaults = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon_key',
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_SERVICE_KEY: 'service_key',
  SUPABASE_SERVICE_ROLE_KEY: 'service_role_key',
  TWILIO_ACCOUNT_SID: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  TWILIO_AUTH_TOKEN: 'auth_token',
  TWILIO_VERIFY_SERVICE_SID: 'VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  TWILIO_WHATSAPP_FROM: 'whatsapp:+10000000000',
};

export const env = (parsed.success
  ? parsed.data
  : {
      ...defaults,
      ...raw,
      NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES: Number(
        raw.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES ?? 30,
      ),
    }) as z.infer<typeof envSchema>;

// ➕ tiny helpers used by analytics/monitoring
export const isBrowser = typeof window !== 'undefined';
export const isServer = !isBrowser;
export function bool(val?: string, fallback = false) {
  if (val == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(val).toLowerCase());
}
