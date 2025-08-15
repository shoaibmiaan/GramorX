import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Alert } from '@/components/design-system/Alert';
import { Button } from '@/components/design-system/Button';

// Helper for simple email validation
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function WaitlistSection() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    referrer_code: '', // captured from ?ref=XXXX
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Capture referral from query param (?ref=CODE) if present
  useEffect(() => {
    const qref = (router.query.ref as string) || '';
    if (qref && !form.referrer_code) {
      setForm((s) => ({ ...s, referrer_code: qref }));
    }
  }, [router.query.ref]);

  const emailError = useMemo(() => {
    if (!form.email) return undefined;
    return isEmail(form.email) ? undefined : 'Please enter a valid email';
  }, [form.email]);

  const canSubmit = form.name && isEmail(form.email) && !loading;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!canSubmit) return;

    try {
      setLoading(true);
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'site:waitlist' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Something went wrong');

      // success
      setSuccessMsg('You\'re on the list! We\'ll email you updates and early access.');
      setForm({ name: '', email: '', phone: '', country: '', referrer_code: '' });

      // optionally push a client-side event for analytics
      // window.gtag?.('event', 'waitlist_signup');
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to submit at the moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="max-w-2xl mb-8">
          <h2 className="font-slab text-h1 md:text-display text-gradient-primary">Join the Waitlist</h2>
          <p className="text-grayish mt-2">Get early access to AI‑powered IELTS prep. Limited beta invites each week.</p>
        </div>

        {successMsg && (
          <Alert variant="success" title="Success" className="mb-6">
            {successMsg}
          </Alert>
        )}
        {errorMsg && (
          <Alert variant="error" title="Hmm…" className="mb-6">
            {errorMsg}
          </Alert>
        )}

        <Card className="card-surface rounded-ds-2xl p-6 md:p-8">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={onChange}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              error={emailError}
              required
            />
            <Input
              label="Phone (optional)"
              name="phone"
              type="tel"
              placeholder="e.g., +92 300 1234567"
              value={form.phone}
              onChange={onChange}
            />
            <Input
              label="Country (optional)"
              name="country"
              placeholder="Pakistan"
              value={form.country}
              onChange={onChange}
            />

            {/* Hidden referral capture (query param) */}
            <input type="hidden" name="referrer_code" value={form.referrer_code} />

            <div className="md:col-span-2 flex items-center justify-between pt-2">
              <div className="text-small text-gray-600 dark:text-grayish">
                By joining, you agree to receive early‑access emails.
              </div>
              <Button type="submit" variant="primary" className="rounded-ds-xl px-6" disabled={!canSubmit}>
                {loading ? 'Joining…' : 'Join Waitlist'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Secondary note / referral CTA */}
        <p className="text-small text-gray-600 dark:text-grayish mt-4">
          Have a referral code? Add <code>?ref=YOURCODE</code> to the URL before signing up.
        </p>
      </Container>
    </section>
  );
}