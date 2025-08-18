// pages/premium/demo.tsx
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

const ThemeSwitcher = dynamic(() => import('@/components/premium-ui/ThemeSwitcher'), { ssr: false });
const PinGate = dynamic(() => import('@/components/premium-ui/PinGate'), { ssr: false });

export default function PremiumDemo() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabaseBrowser.auth.getUser();
      setEmail(data?.user?.email ?? null);
    })();
  }, []);

  return (
    <main className="pr-min-h-screen pr-bg-gradient-to-b pr-from-black pr-to-neutral-900 pr-text-white pr-px-4 pr-py-10">
      <div className="pr-max-w-5xl pr-mx-auto pr-space-y-8">
        {/* Header */}
        <header className="pr-flex pr-items-center pr-justify-between">
          <div>
            <h1 className="pr-text-2xl pr-font-bold">Premium Exam Room · Demo</h1>
            <p className="pr-text-white/70 pr-text-sm">Days 1–2 visual checkpoint</p>
          </div>
          <div className="pr-flex pr-items-center pr-gap-3">
            <ThemeSwitcher />
            <span className="pr-text-xs pr-text-white/60">{email ? `Signed in: ${email}` : 'Not signed in'}</span>
          </div>
        </header>

        {/* Progress strip */}
        <section className="pr-grid md:pr-grid-cols-6 pr-gap-3">
          {[
            { day: 'Day 1', label: 'Design System', done: true },
            { day: 'Day 2', label: 'PIN Gate', done: true },
            { day: 'Day 3', label: 'Eligibility/Device', done: false },
            { day: 'Day 4', label: 'Exam Shell', done: false },
            { day: 'Day 5', label: 'Anti-Cheat', done: false },
            { day: 'Day 6–7', label: 'Scoring & QA', done: false },
          ].map((s, i) => (
            <div key={i} className="pr-rounded-xl pr-border pr-border-white/10 pr-bg-white/5 pr-p-3">
              <div className="pr-text-xs pr-text-white/60">{s.day}</div>
              <div className="pr-font-medium">{s.label}</div>
              <div className={`pr-mt-2 pr-text-xs pr-inline-flex pr-items-center pr-gap-1 ${
                s.done ? 'pr-text-emerald-300' : 'pr-text-white/50'
              }`}>
                <span className={`pr-inline-block pr-w-2 pr-h-2 pr-rounded-full ${s.done ? 'pr-bg-emerald-400' : 'pr-bg-white/30'}`} />
                {s.done ? 'Done' : 'Pending'}
              </div>
            </div>
          ))}
        </section>

        {/* Live PIN Gate card */}
        <section className="pr-grid md:pr-grid-cols-2 pr-gap-6">
          <div className="pr-rounded-2xl pr-border pr-border-white/10 pr-bg-white/5 pr-p-6 pr-space-y-3">
            <h2 className="pr-text-lg pr-font-semibold">Try the PIN Gate</h2>
            <p className="pr-text-sm pr-text-white/70">
              Enter your 4–6 digit PIN. On success, you’ll be routed toward the exam flow.
            </p>
            <PinGate onUnlock={() => (window.location.href = '/premium/exam')} />
            <p className="pr-text-xs pr-text-white/50">
              Tip: Set/change your PIN first if you haven’t: <Link href="/premium/pin" className="pr-underline">/premium/pin</Link>
            </p>
          </div>

          {/* Quick links & status */}
          <div className="pr-rounded-2xl pr-border pr-border-white/10 pr-bg-white/5 pr-p-6 pr-space-y-4">
            <h2 className="pr-text-lg pr-font-semibold">What’s included (so far)</h2>
            <ul className="pr-text-sm pr-space-y-2 pr-text-white/80 pr-list-disc pr-pl-5">
              <li>Isolated Premium theme (Light/Dark/Aurora/Gold)</li>
              <li>PIN Gate UI + API + RLS-secured storage (hashed)</li>
              <li>User self-service PIN manager: <code className="pr-bg-black/40 pr-px-1 pr-rounded">/premium/pin</code></li>
              <li>Admin PIN reset (guarded): <code className="pr-bg-black/40 pr-px-1 pr-rounded">/admin/pin</code></li>
              <li>Forbidden page for non-admins: <code className="pr-bg-black/40 pr-px-1 pr-rounded">/403</code></li>
            </ul>

            <div className="pr-grid pr-gap-2">
              <Link href="/premium/pin" className="pr-inline-flex pr-justify-center pr-items-center pr-rounded-lg pr-bg-emerald-500 hover:pr-bg-emerald-600 pr-py-2 pr-font-medium">
                Set/Change my PIN
              </Link>
              <Link href="/admin/pin" className="pr-inline-flex pr-justify-center pr-items-center pr-rounded-lg pr-bg-sky-500 hover:pr-bg-sky-600 pr-py-2 pr-font-medium">
                Admin · PIN Manager
              </Link>
              <Link href="/403" className="pr-inline-flex pr-justify-center pr-items-center pr-rounded-lg pr-bg-rose-500 hover:pr-bg-rose-600 pr-py-2 pr-font-medium">
                View 403 Page
              </Link>
            </div>

            <div className="pr-text-xs pr-text-white/60">
              Coming next (Day 3): eligibility check, mic/cam permissions, fullscreen request.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
