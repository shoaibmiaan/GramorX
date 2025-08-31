# GramorX

## Overview
GramorX is a Next.js-powered IELTS learning platform that offers user management, mock tests, AI-assisted evaluations, and payment integrations. It leverages Supabase for authentication and data storage while integrating third-party services like Twilio and local payment gateways.

## Environment Variables
| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anonymous key |
| `SUPABASE_URL` | Supabase service URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `TWILIO_ACCOUNT_SID` | Twilio account SID for SMS and WhatsApp |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio Verify service SID |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp sender number |
| `JAZZCASH_MERCHANT_ID` | JazzCash merchant identifier |
| `JAZZCASH_PASSWORD` | JazzCash API password |
| `JAZZCASH_SECRET` | JazzCash secret key |
| `EASYPAISA_STORE_ID` | Easypaisa store ID |
| `EASYPAISA_SECRET` | Easypaisa secret key |
| `CARD_GATEWAY_API_KEY` | Card payment gateway API key |
| `CARD_GATEWAY_SECRET` | Card payment gateway secret |

## Installation
1. Ensure Node.js 20.x and npm 10.x are installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the environment variables listed above.

## Development Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode with premium CSS watcher |
| `npm run build` | Compile the application for production |
| `npm start` | Run the compiled production build |
| `npm run lint` | Run ESLint checks |

## Test Execution
Run the test suite:
```bash
npm test
```

## Deployment Notes
1. Build the app with `npm run build`.
2. Set the required environment variables on your hosting platform.
3. Serve the production build with `npm start` or deploy using a Next.js-compatible provider such as Vercel.
