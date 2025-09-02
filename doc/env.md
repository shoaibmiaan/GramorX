# Environment Variables

The application relies on the following environment variables. Provide these values in your `.env` files or in your Vercel project settings.

## Public Variables

| Key | Description | Required |
| --- | --- | :---: |
| `NEXT_PUBLIC_SUPABASE_URL` | URL of the Supabase instance. | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for Supabase. | Yes |

## Server-only Variables

| Key | Description | Required |
| --- | --- | :---: |
| `SUPABASE_URL` | Server-side URL of the Supabase instance. | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service key for server-side tasks. | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for server-side tasks. | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account SID for messaging (required if using Twilio). | No |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token (required if using Twilio). | No |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio Verify service SID (required if using Twilio). | No |
| `TWILIO_WHATSAPP_FROM` | Phone number used for WhatsApp messages. | No |

## Optional Variables

| Key | Description | Scope | Required |
| --- | --- | --- | :---: |
| `NEXT_PUBLIC_BASE_URL` | Base URL for building absolute links. | Public | No |
| `NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES` | Client idle timeout in minutes (default 30). | Public | No |
| `NEXT_PUBLIC_DEBUG` | Enables debug features when set. | Public | No |
| `NEXT_PUBLIC_SITE_URL` | Public site URL override. | Public | No |
| `ADMIN_EMAILS` | Comma separated list of admin emails. | Server | No |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Generative AI API key. | Server | No |
| `GROQ_API_KEY` | Groq API key. | Server | No |
| `GROQ_MODEL` | Groq model identifier. | Server | No |
| `OPENAI_API_KEY` | OpenAI API key. | Server | No |
| `OPENAI_MODEL` | OpenAI model identifier. | Server | No |
| `GEMINI_API_KEY` | Gemini API key. | Server | No |
| `GEMINI_MODEL` | Gemini model identifier. | Server | No |
| `GX_AI_PROVIDER` | Default AI provider selection. | Server | No |
| `PREMIUM_MASTER_PIN` | Master PIN for premium feature access. | Server | No |
| `PREMIUM_PIN_HASH` | Hashed value for premium PIN. | Server | No |
| `PREMIUM_PIN_SALT` | Salt used to hash the premium PIN. | Server | No |
| `PREMIUM_PIN_RATE` | Rate limit for PIN attempts. | Server | No |
| `PREMIUM_PIN_WINDOW_SEC` | Time window in seconds for PIN rate limiting. | Server | No |
| `STRIPE_SECRET_KEY` | Stripe secret key. | Server | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret. | Server | No |
| `SPEAKING_DAILY_LIMIT` | Daily limit for speaking attempts. | Server | No |
| `SPEAKING_BUCKET` | Storage bucket name for speaking uploads. | Server | No |
| `TWILIO_BYPASS` | Skip Twilio verification when set to `1` or `true`. | Server | No |
| `LOCAL_ADMIN_TOKEN` | Local development admin token. | Server | No |
| `ADMIN_API_TOKEN` | Token for admin API access. | Server | No |
| `SITE_URL` | Server-side site URL override. | Server | No |
| `NODE_ENV` | Node environment (`development`, `production`, or `test`). | Server | No |

These variables are validated at runtime in [`lib/env.ts`](../lib/env.ts).

### Twilio for Local Development

To bypass Twilio during local development, leave the Twilio credentials unset or set
`TWILIO_BYPASS=1`. The application will skip phone verification calls and health
checks will report Twilio as disabled.
