# Environment Variables

The application relies on the following environment variables. Provide these values in your `.env` files or in your Vercel project settings.

| Key | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL of the Supabase instance. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for server-side tasks. |
| `NEXT_PUBLIC_BASE_URL` | Base URL for building absolute links. |
| `ADMIN_EMAILS` | Comma separated list of admin emails. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Generative AI API key. |
| `GROQ_API_KEY` | Groq API key. |
| `GROQ_MODEL` | Groq model identifier. |
| `OPENAI_API_KEY` | OpenAI API key. |
| `GEMINI_API_KEY` | Gemini API key. |
| `PREMIUM_MASTER_PIN` | Master PIN for premium feature access. |
| `SPEAKING_DAILY_LIMIT` | Daily limit for speaking attempts. |
| `SPEAKING_BUCKET` | Storage bucket name for speaking uploads. |
| `NEXT_PUBLIC_DEBUG` | Enables debug features when set. |

These variables are validated at runtime in [`lib/env.ts`](../lib/env.ts).

