import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Alert } from '@/components/design-system/Alert';

type Cat = 'account' | 'modules' | 'ai' | 'billing' | 'technical' | 'other';
type Faq = { q: string; a: string; cat: Cat; tags?: string[] };

const DATA: Faq[] = [
  { q: 'How do I reset my password?', a: 'Go to Login → “Forgot password”. Follow the email link to set a new password.', cat: 'account', tags: ['login','email'] },
  { q: 'Where can I practice all 4 IELTS modules?', a: 'Use /listening, /reading, /writing, and /speaking. Each has practice + mocks + AI feedback.', cat: 'modules', tags: ['practice','mock'] },
  { q: 'How does AI scoring work?', a: 'We align feedback with IELTS descriptors to estimate a band range and give targeted suggestions.', cat: 'ai', tags: ['writing','speaking'] },
  { q: 'What’s included in Premium?', a: 'Unlimited mocks, advanced AI evaluation, priority support, and human moderation on writing/speaking.', cat: 'billing', tags: ['pricing'] },
  { q: 'My mic does not record in Speaking.', a: 'Allow microphone permission for your browser/tab, then retry. Keep the tab active during recording.', cat: 'technical', tags: ['speaking','record'] },
  { q: 'Can I track my progress?', a: 'Yes. Visit Reports to view module-wise scores, trends, and weak areas.', cat: 'modules', tags: ['reports'] },
];

const CATS: { key: Cat | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'modules', label: 'Modules' },
  { key: 'ai', label: 'AI' },
  { key: 'billing', label: 'Billing' },
  { key: 'account', label: 'Account' },
  { key: 'technical', label: 'Technical' },
  { key: 'other', label: 'Other' },
];

export default function FAQPage() {
  const router = useRouter();
  const qCat = (router.query.c as string | undefined)?.toLowerCase() as Cat | undefined;

  const [term, setTerm] = useState('');
  const [cat, setCat] = useState<Cat | 'all'>(qCat || 'all');

  const items = useMemo(() => {
    const t = term.trim().toLowerCase();
    return DATA.filter(d => (cat === 'all' ? true : d.cat === cat))
      .filter(d => !t || d.q.toLowerCase().includes(t) || d.a.toLowerCase().includes(t) || d.tags?.some(x => x.includes(t)));
  }, [term, cat]);

  return (
    <>
      <Head>
        <title>FAQ — GramorX</title>
        <meta name="description" content="Frequently asked questions about IELTS modules, AI evaluation, billing, and account." />
      </Head>

      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-slab text-display text-gradient-primary">Frequently Asked Questions</h1>
            <p className="text-grayish mt-3">
              Quick answers. If you’re stuck, open <Link href="/support" className="underline">Support</Link> or ask the AI assistant.
            </p>
          </div>

          <Card className="mt-8 p-6 rounded-ds-2xl">
            {/* Controls */}
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <Input
                label="Search FAQ"
                placeholder="Try “reset password”, “AI scoring”, “mic recording”…"
                value={term}
                onChange={e => setTerm(e.currentTarget.value)}
                iconLeft={<i className="fas fa-search" aria-hidden="true" />}
              />
              <label className="block">
                <span className="mb-1.5 inline-block text-small text-grayish">Category</span>
                <select
                  className="w-full rounded-ds border bg-lightCard text-lightText dark:bg-dark/50 dark:text-white
                             dark:border-purpleVibe/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background py-3 px-3"
                  value={cat}
                  onChange={e => setCat(e.target.value as Cat | 'all')}
                >
                  {CATS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </label>
            </div>

            {/* List */}
            <div className="mt-8 grid gap-4">
              {items.map((f, i) => (
                <details key={i} className="group">
                  <summary
                    className="cursor-pointer select-none font-medium py-3 px-4 rounded-ds card-surface
                               hover:bg-purpleVibe/10 dark:hover:bg-lightCard/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {f.q}
                  </summary>
                  <div className="px-4 pb-4 pt-2 text-body text-grayish">
                    {f.a}{' '}
                    {f.cat === 'modules' && (
                      <span className="block mt-2">
                        <Link className="underline" href="/listening">Listening</Link> •{' '}
                        <Link className="underline" href="/reading">Reading</Link> •{' '}
                        <Link className="underline" href="/writing">Writing</Link> •{' '}
                        <Link className="underline" href="/speaking">Speaking</Link>
                      </span>
                    )}
                  </div>
                </details>
              ))}
              {items.length === 0 && (
                <Alert title="No results" variant="info">
                  Try another keyword or <Link className="underline" href="/support">contact support</Link>.
                </Alert>
              )}
            </div>
          </Card>

          {/* Deep links */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-5 rounded-ds-2xl">
              <div className="font-semibold mb-1">Jump to Modules</div>
              <div className="flex flex-wrap gap-2">
                <Link className="underline" href="/listening">Listening</Link>
                <Link className="underline" href="/reading">Reading</Link>
                <Link className="underline" href="/writing">Writing</Link>
                <Link className="underline" href="/speaking">Speaking</Link>
              </div>
            </Card>
            <Card className="p-5 rounded-ds-2xl">
              <div className="font-semibold mb-1">Reports</div>
              <div className="flex flex-wrap gap-2">
                <Link className="underline" href="/reading/history">Reading History</Link>
                <Link className="underline" href="/speaking/attempts">Speaking Attempts</Link>
                <Link className="underline" href="/admin/reports">Admin Reports</Link>
              </div>
            </Card>
            <Card className="p-5 rounded-ds-2xl">
              <div className="font-semibold mb-1">Account</div>
              <div className="flex flex-wrap gap-2">
                <Link className="underline" href="/pricing">Pricing</Link>
                <Link className="underline" href="/profile/setup">Profile</Link>
                <Link className="underline" href="/support">Support</Link>
              </div>
            </Card>
          </div>

          {/* Extra CTA */}
          <div className="mt-8">
            <Button as="a" href="/ai?sidebar=1" variant="accent" className="rounded-ds-xl">Ask AI About This Page</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
