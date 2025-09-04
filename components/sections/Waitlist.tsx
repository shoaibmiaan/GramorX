// components/sections/Waitlist.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Alert } from '@/components/design-system/Alert';
import { Button } from '@/components/design-system/Button';

// Helper for simple email validation
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

type FormState = {
  name: string;
  email: string;
  phone: string;
  country: string;
  target_band: string;
  planned_test: string; // YYYY-MM (but we also accept "Dec 2025" UX-wise)
  experience: string;
  referrer_code: string; // captured from ?ref=XXXX
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

  // focus/scroll + auto-dismiss for alerts (no visual changes)
  const alertWrapRef = useRef<HTMLDivElement | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Capture referral from query param (?ref=CODE) if present
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

  // Normalize month strings like "December 2025" → "2025-12"
  function normalizeMonth(s: string) {
    if (!s) return s;
    const m1 = s.match(/^(\d{4})-(\d{2})$/);
    if (m1) return s;
    const short = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const m2 = s.match(/^([A-Za-z]{3,})\s+(\d{4})$/);
    if (m2) {
      const i = short.findIndex(x => x === m2[1].slice(0,3).toLowerCase());
      if (i >= 0) return `${m2[2]}-${String(i + 1).padStart(2, '0')}`;
    }
    return s; // API will still validate and respond with tips if invalid
  }

  // Show alert, scroll to it, focus it, optional auto-dismiss
  function showAlert(kind: 'success' | 'error', msg: string, autoDismiss = true) {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
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
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!canSubmit) return;

    // 12s network timeout
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
        // Friendly issue list from API: { issues: [{field,message}, …] }
        const list: { field: string; message: string }[] = json?.issues || [];
        const msg =
          list.length > 0
            ? list.map(i => `• ${i.message}`).join('  ')
            : (json?.error || 'Something went wrong. Please try again.');
        showAlert('error', msg, false);
        return;
      }

      if (json.duplicate) {
        showAlert('success', 'You are already on the waitlist. 🎉');
        return;
      }

      showAlert('success', "You're on the list! We’ll email you updates and early access.");
      setForm({
        name: '',
        email: '',
        phone: '',
        country: '',
        target_band: '',
        planned_test: '',
        experience: '',
        referrer_code: '',
      });
    } catch (err: any) {
      clearTimeout(timeout);
      const msg =
        err?.name === 'AbortError'
          ? 'Network timeout. Please check your connection and try again.'
          : err?.message || 'Unable to submit at the moment.';
      showAlert('error', msg, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="waitlist"
      className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90"
    >
      <Container>
        {/* Heading — Roboto Slab, gradient, uppercase (matches desired design) */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="font-slab text-h2 md:text-display tracking-tight uppercase text-gradient-primary">
            Join our exclusive pre-launch
          </h2>
          <p className="text-grayish mt-3">
            Be among the first to access our platform with special early-bird benefits.
          </p>
        </div>

        {/* Alert region (focusable + announced, visuals unchanged) */}
        <div
          ref={alertWrapRef}
          tabIndex={-1}
          aria-live="polite"
          aria-atomic="true"
          className="outline-none"
        >
          {successMsg && (
            <Alert variant="success" title="Success" className="mb-6 max-w-3xl mx-auto">
              {successMsg}
            </Alert>
          )}
          {errorMsg && (
            <Alert variant="error" title="Hmm…" className="mb-6 max-w-3xl mx-auto">
              {errorMsg}
            </Alert>
          )}
        </div>

        {/* Glassy violet card with soft border + token-based radius */}
        <Card className="card-glass rounded-ds-xl p-6 md:p-8 max-w-4xl mx-auto">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Row 1 */}
            <div>
              <span className="mb-2 block label-neon">Full Name</span>
              <Input
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={onChange}
                required
              />
            </div>

            <div>
              <span className="mb-2 block label-neon">Email Address</span>
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={onChange}
                required
              />
              {emailError && (
                <span className="mt-1 block text-small text-sunsetOrange">{emailError}</span>
              )}
            </div>

            {/* Row 2 */}
            <div>
              <span className="mb-2 block label-neon">Target IELTS Band</span>
              <Input
                name="target_band"
                type="number"
                min="0"
                max="9"
                step="0.5"
                placeholder="e.g., 7.5"
                value={form.target_band}
                onChange={onChange}
              />
            </div>

            <div>
              <span className="mb-2 block label-neon">Planned Test Date</span>
              <Input
                name="planned_test"
                type="month"
                placeholder="Month/Year"
                value={form.planned_test}
                onChange={onChange}
              />
            </div>

            {/* Row 3 */}
            <div className="md:col-span-2">
              <span className="mb-2 block label-neon">Current IELTS Experience</span>
              <Input
                name="experience"
                placeholder="First-time taker, Retaker, etc."
                value={form.experience}
                onChange={onChange}
              />
            </div>

            {/* Optional extras (kept identical visually) */}
            <div>
              <span className="mb-2 block label-neon">Phone (optional)</span>
              <Input
                name="phone"
                type="tel"
                placeholder="e.g., +92 300 1234567"
                value={form.phone}
                onChange={onChange}
              />
            </div>

            <div>
              <span className="mb-2 block label-neon">Country (optional)</span>
              <Input
                name="country"
                placeholder="Pakistan"
                value={form.country}
                onChange={onChange}
                list="country-list"
              />
              {/* Datalist keeps the same Input look */}
              <datalist id="country-list">
                <option value="United States" />
                <option value="Canada" />
                <option value="United Kingdom" />
                <option value="Australia" />
                <option value="New Zealand" />
                <option value="Ireland" />
                <option value="India" />
                <option value="Pakistan" />
                <option value="Bangladesh" />
                <option value="United Arab Emirates" />
                <option value="Saudi Arabia" />
                <option value="Germany" />
                <option value="France" />
                <option value="Spain" />
                <option value="Italy" />
                <option value="Netherlands" />
                <option value="Sweden" />
                <option value="Norway" />
                <option value="Denmark" />
                <option value="Finland" />
                <option value="Türkiye" />
                <option value="Malaysia" />
                <option value="Singapore" />
                <option value="China" />
                <option value="Japan" />
                <option value="South Korea" />
                <option value="Hong Kong" />
                <option value="Indonesia" />
                <option value="Philippines" />
                <option value="Vietnam" />
                <option value="Thailand" />
                <option value="Nigeria" />
                <option value="Kenya" />
                <option value="South Africa" />
                <option value="Brazil" />
                <option value="Argentina" />
                <option value="Mexico" />
                <option value="Chile" />
              </datalist>
            </div>

            {/* Hidden referral capture (query param) */}
            <input type="hidden" name="referrer_code" value={form.referrer_code} />

            {/* CTA row — full-width pill in sunset gradient */}
            <div className="md:col-span-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                disabled={!canSubmit}
                className="
                  w-full rounded-full py-5 text-h3 font-semibold text-white shadow-lg
                  bg-gradient-to-br from-sunsetOrange to-sunsetRed hover:opacity-95
                "
              >
                <i className="fas fa-lock mr-2" aria-hidden />
                {loading ? 'Securing…' : 'Secure Your Early Access'}
              </Button>

              {/* Perk strip */}
              <div className="text-center text-small mt-3 text-electricBlue">
                <i className="fas fa-gift mr-2" aria-hidden />
                First 500 signups get 30% discount for first 3 months
              </div>
            </div>
          </form>
        </Card>

        {/* Referral + consent notes */}
        <p className="text-small text-grayish mt-5 text-center">
          Have a referral code? Add <code>?ref=YOURCODE</code> to the URL before signing up.
        </p>
        <p className="text-small text-grayish mt-1 text-center">
          By joining, you agree to receive early-access emails.
        </p>
      </Container>
    </section>
  );
}