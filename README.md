# GramorX

GramorX is a Next.js–based IELTS preparation platform featuring mock tests, AI‑powered writing and speaking evaluation, and a premium study interface.

## Features
- User management with Supabase authentication, role-based access, and streak tracking  
- Mock Test module with full-length and section-wise exams, timers, and band-score simulation  
- AI Evaluation module for writing and speaking feedback using OpenAI/Groq models  
- Design system built with Tailwind CSS for a consistent UI

## Getting Started

### Prerequisites
- Node.js 20  
- npm 10

### Installation
```bash
npm install
cp .env.example .env   # populate variables – see doc/env.md for details
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Tests

```bash
npm test
```

### Storybook (optional UI docs)

```bash
npm run storybook
```

## Environment Variables

A full list and descriptions live in [`doc/env.md`](doc/env.md). At minimum you must set:

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_URL`
* `SUPABASE_SERVICE_KEY`
* `SUPABASE_SERVICE_ROLE_KEY`
* `TWILIO_ACCOUNT_SID`
* `TWILIO_AUTH_TOKEN`
* `TWILIO_VERIFY_SERVICE_SID`
* `TWILIO_WHATSAPP_FROM`

## Project Structure

* `components/` – reusable UI components
* `pages/` – Next.js routes
* `lib/` – shared utilities and environment validation
* `styles/` – Tailwind configuration and global styles
* `doc/` – supplementary documentation (env, UI guidelines, etc.)

## Contributing

1. Fork the repo and create a feature branch.
2. Run `npm run lint` and `npm test` before submitting pull requests.
3. Follow the design and UI conventions outlined in `doc/ui-guidelines.md`.

## License

Proprietary – all rights reserved.

