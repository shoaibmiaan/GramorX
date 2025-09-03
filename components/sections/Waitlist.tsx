// components/sections/Waitlist.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Alert } from '@/components/design-system/Alert';
import { Button } from '@/components/design-system/Button';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

type FormState = {
  name: string;
  email: string;
  phone: string;
  country: string;
  target_band: string;
  planned_test: string; // YYYY-MM or e.g., "Dec 2025"
  experience: string;
  referrer_code: string; // from ?ref=
};

const normalizeMonth = (s: string) => {
  if (!s) return s;
  if (/^\d{4}-\d{2}$/.test(s)) return s;
  const short = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const m = s.match(/^([A-Za-z]{3,})\s+(\d{4})$/);
  if (m) {
    const i = short.findIndex(x => x === m[1].slice(0,3).toLowerCase());
    if (i >= 0) return `${m[2]}-${String(i + 1).padStart(2, '0')}`;
  }
  return s;
};

export default function WaitlistSection() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    country: '',
    target_band: '',
    planned_test: '',
    experience: '',
    referrer_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const alertWrapRef = useRef<HTMLDivElement | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Capture referral (?ref=CODE)
  useEffect(() => {
    const qref = (router.query.ref as string) || '';
    if (qref) setForm((s) => ({ ...s, referrer_code: qref }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.ref]);

  const emailError = useMemo(() => {
    if (!form.email) return undefined;
    return isEmail(form.email) ? undefined : 'Please enter a valid email';
  }, [form.email]);

  const canSubmit = !!form.name && isEmail(form.email) && !loading;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const showAlert = (kind: 'success' | 'error', msg: string, autoDismiss = true) => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setSuccessMsg(null);
    setErrorMsg(null);
    if (kind === 'success') setSuccessMsg(msg);
    else setErrorMsg(msg);

    requestAnimationFrame(() => {
      alertWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => alertWrapRef.current?.focus({ preventScroll: true }), 250);
    });

    if (autoDismiss) {
      dismissTimer.current = setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 7000);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!canSubmit) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      setLoading(true);
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, planned_test: normalizeMonth(form.planned_test), source: 'site:waitlist' }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const json = await res.json().catch(() => ({} as any));

      if (!res.ok || json?.ok !== true) {
        const issues: { field: string; message: string }[] = json?.issues || [];
        const msg = issues.length ? issues.map(i => `• ${i.message}`).join('  ') : (json?.error || 'Something went wrong. Please try again.');
        showAlert('error', msg, false);
        return;
      }

      if (json.duplicate) {
        showAlert('success', 'You are already on the waitlist. 🎉');
        return;
      }

      showAlert('success', "You're on the list! We’ll email you updates and early access.");
      setForm({ name: '', email: '', phone: '', country: '', target_band: '', planned_test: '', experience: '', referrer_code: '' });
    } catch (err: any) {
      clearTimeout(timeout);
      showAlert('error', err?.name === 'AbortError' ? 'Network timeout. Please try again.' : (err?.message || 'Unable to submit.'), false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="font-slab text-h2 md:text-display tracking-tight uppercase text-gradient-primary">
            Join our exclusive pre-launch
          </h2>
          <p className="text-grayish mt-3">Be among the first with early-bird benefits.</p>
        </div>

        <div ref={alertWrapRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className="outline-none">
          {successMsg && <Alert variant="success" title="Success" className="mb-6 max-w-3xl mx-auto">{successMsg}</Alert>}
          {errorMsg && <Alert variant="error" title="Hmm…" className="mb-6 max-w-3xl mx-auto">{errorMsg}</Alert>}
        </div>

        <Card className="card-glass rounded-ds-xl p-6 md:p-8 max-w-4xl mx-auto">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <span className="mb-2 block label-neon">Full Name</span>
              <Input name="name" placeholder="Enter your full name" value={form.name} onChange={onChange} required />
            </div>

            <div>
              <span className="mb-2 block label-neon">Email Address</span>
              <Input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={onChange} required />
              {emailError && <span className="mt-1 block text-small text-sunsetOrange">{emailError}</span>}
            </div>

            <div>
              <span className="mb-2 block label-neon">Target IELTS Band</span>
              <Input name="target_band" type="number" min="0" max="9" step="0.5" placeholder="e.g., 7.5" value={form.target_band} onChange={onChange} />
            </div>

            <div>
              <span className="mb-2 block label-neon">Planned Test Date</span>
              <Input name="planned_test" type="month" placeholder="Month/Year" value={form.planned_test} onChange={onChange} />
            </div>

            <div className="md:col-span-2">
              <span className="mb-2 block label-neon">Current IELTS Experience</span>
              <Input name="experience" placeholder="First-time taker, Retaker, etc." value={form.experience} onChange={onChange} />
            </div>

            <div>
              <span className="mb-2 block label-neon">Phone (optional)</span>
              <Input name="phone" type="tel" placeholder="e.g., +92 300 1234567" value={form.phone} onChange={onChange} />
            </div>

            <div>
              <span className="mb-2 block label-neon">Country (optional)</span>
              <Input name="country" placeholder="Pakistan" value={form.country} onChange={onChange} list="country-list" />
              <datalist id="country-list">
                <option value="Pakistan" />
                <option value="United Kingdom" />
                <option value="United States" />
                <option value="Canada" />
                <option value="Australia" />
                <option value="United Arab Emirates" />
              </datalist>
            </div>

            <input type="hidden" name="referrer_code" value={form.referrer_code} />

            <div className="md:col-span-2 pt-1">
              <Button type="submit" variant="primary" disabled={!canSubmit} className="w-full rounded-full py-5 text-h3 font-semibold">
                <i className="fas fa-lock mr-2" aria-hidden /> {loading ? 'Securing…' : 'Secure Your Early Access'}
              </Button>
              <div className="text-center text-small mt-3 text-electricBlue">
                <i className="fas fa-gift mr-2" aria-hidden /> First 500 get 30% off for 3 months
              </div>
            </div>
          </form>
        </Card>

        <p className="text-small text-grayish mt-5 text-center">Have a referral code? Add <code>?ref=YOURCODE</code> to the URL.</p>
        <p className="text-small text-grayish mt-1 text-center">By joining, you agree to receive early-access emails.</p>
      </Container>
    </section>
  );
}
