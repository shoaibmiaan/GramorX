import { z } from 'zod';

const envSchema = z.object({
  // Public (client) vars
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES: z.coerce.number().default(30),
  NEXT_PUBLIC_DEBUG: z.string().optional(),

  // Server-only (optional in many places)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  PREMIUM_MASTER_PIN: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SPEAKING_DAILY_LIMIT: z.coerce.number().optional(),
  SPEAKING_BUCKET: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Pick specific keys (safe for client bundle)
const raw = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES: process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES,
  NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG,

  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  PREMIUM_MASTER_PIN: process.env.PREMIUM_MASTER_PIN,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  SPEAKING_DAILY_LIMIT: process.env.SPEAKING_DAILY_LIMIT,
  SPEAKING_BUCKET: process.env.SPEAKING_BUCKET,
  NODE_ENV: process.env.NODE_ENV as any,
};

const parsed = envSchema.safeParse(raw);

// Crash only on server if required vars are missing
if (!parsed.success && typeof window === 'undefined') {
  throw parsed.error;
}

export const env = (parsed.success
  ? parsed.data
  : {
      ...raw,
      NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES: Number(
        raw.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES ?? 30,
      ),
    }) as z.infer<typeof envSchema>;
