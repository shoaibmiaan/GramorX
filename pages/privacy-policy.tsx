// pages/privacy-policy.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

const SECTIONS = [
  { id: 'information-we-collect', title: 'Information We Collect' },
  { id: 'how-we-use-it',          title: 'How We Use Your Information' },
  { id: 'cookies-analytics',      title: 'Cookies & Analytics' },
  { id: 'sharing-disclosure',     title: 'Sharing & Disclosure' },
  { id: 'data-security',          title: 'Data Security' },
  { id: 'data-retention',         title: 'Data Retention' },
  { id: 'international',          title: 'International Transfers' },
  { id: 'childrens-privacy',      title: "Children's Privacy" },
  { id: 'your-rights',            title: 'Your Rights & Choices' },
  { id: 'changes',                title: 'Changes to this Policy' },
  { id: 'contact',                title: 'Contact Us' },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Global Privacy • IELTS Prep with AI — GramorX</title>
        <meta
          name="description"
          content="GramorX — IELTS Prep with AI. Global privacy & data protection that’s transparent, secure, and student-first."
        />
      </Head>

      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          {/* Hero / Brand Statement */}
          <div className="mb-12">
            <p className="uppercase tracking-wide text-xs text-grayish/80">Legal • Privacy</p>
            <h1 className="font-slab text-display text-gradient-primary">
              Your Data. Your Edge. Globally Protected.
            </h1>
            <p className="text-body text-grayish max-w-2xl mt-3">
              We’re <strong>IELTS Prep with AI</strong> — launching globally to help learners outpace the competition.
              Our privacy promise is simple: <strong>collect less, protect more, explain clearly</strong>. This policy
              shows how we handle data with the same precision we bring to your score.
            </p>
            <div className="mt-3 text-small text-grayish">Last updated: 25 Aug 2025</div>

            {/* Deep Links / Move Anywhere */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/"><Button variant="primary" size="sm" className="rounded-ds">Home</Button></Link>
              <Link href="/pricing"><Button variant="secondary" size="sm" className="rounded-ds">Pricing</Button></Link>
              <Link href="/reading"><Button variant="secondary" size="sm" className="rounded-ds">Reading</Button></Link>
              <Link href="/listening"><Button variant="secondary" size="sm" className="rounded-ds">Listening</Button></Link>
              <Link href="/writing"><Button variant="secondary" size="sm" className="rounded-ds">Writing</Button></Link>
              <Link href="/speaking"><Button variant="secondary" size="sm" className="rounded-ds">Speaking</Button></Link>
              <Link href="/ai?sidebar=1"><Button variant="accent" size="sm" className="rounded-ds">Open AI Sidebar</Button></Link>
              <Link href="/support"><Button variant="secondary" size="sm" className="rounded-ds">Support</Button></Link>
            </div>
          </div>

          {/* Quick Navigation */}
          <Card className="p-6 rounded-ds-2xl mb-10">
            <h2 className="font-slab text-h3 mb-4">Jump to a section</h2>
            <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block p-3.5 rounded-ds border border-gray-200 dark:border-white/10 hover:bg-purpleVibe/10 dark:hover:bg-white/5 transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </Card>

          <div className="space-y-8">
            <Card id="information-we-collect" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">1) Information We Collect</h2>
              <p className="text-body">
                <strong>Account & profile:</strong> name, email, phone, goal band, preferences.
                <br />
                <strong>Learning activity:</strong> practice attempts, scores, timers, streaks, feedback.
                <br />
                <strong>Content you provide:</strong> essays, recordings for Speaking, messages to support.
                <br />
                <strong>Technical:</strong> device/browser metadata for reliability, fraud prevention, and diagnostics.
              </p>
            </Card>

            <Card id="how-we-use-it" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">2) How We Use Your Information</h2>
              <p className="text-body">
                Deliver core features, personalize learning paths, power AI evaluation, enhance performance, and communicate
                critical updates. We also generate <strong>de-identified aggregates</strong> to improve models and product quality.
              </p>
            </Card>

            <Card id="cookies-analytics" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">3) Cookies & Analytics</h2>
              <p className="text-body">
                Cookies keep you signed in and remember your preferences. Analytics reveal usage patterns so we can reduce friction
                and speed up your path to a higher band. You can manage cookies in your browser settings.
              </p>
            </Card>

            <Card id="sharing-disclosure" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">4) Sharing & Disclosure</h2>
              <p className="text-body">
                We <strong>don’t sell</strong> your personal data. We share only with trusted processors (auth, storage, email/SMS,
                payments, analytics) under strict contracts and only to operate the platform or meet legal obligations.
              </p>
            </Card>

            <Card id="data-security" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">5) Data Security</h2>
              <p className="text-body">
                Security is a feature, not a checkbox. We use industry-standard safeguards, encryption at rest/in transit where
                appropriate, access controls, and continuous monitoring. No method is perfect, so we iterate relentlessly.
              </p>
            </Card>

            <Card id="data-retention" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">6) Data Retention</h2>
              <p className="text-body">
                We keep data only as long as necessary for your account, learning history, and legitimate business needs, or as
                required by law. When you leave, you can request deletion.
              </p>
            </Card>

            <Card id="international" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">7) International Transfers</h2>
              <p className="text-body">
                As a global platform, processing may occur outside your country with appropriate safeguards. By using GramorX,
                you consent to such transfers necessary to provide the service.
              </p>
            </Card>

            <Card id="childrens-privacy" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">8) Children’s Privacy</h2>
              <p className="text-body">
                Our services are intended for users aged 13+ (or the minimum age in your region). If you believe a child has
                provided data, contact us and we will act promptly.
              </p>
            </Card>

            <Card id="your-rights" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">9) Your Rights & Choices</h2>
              <p className="text-body">
                Access, update, export, or delete your information from your profile (where available) or request assistance.
                You can opt out of non-essential communications. If you want data deletion, use Support or email us.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/support">
                  <Button variant="accent" size="md" className="rounded-ds">Request Data Deletion</Button>
                </Link>
                <a href="mailto:privacy@gramorx.com" className="inline-block">
                  <Button variant="secondary" size="md" className="rounded-ds">Email privacy@gramorx.com</Button>
                </a>
              </div>
            </Card>

            <Card id="changes" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">10) Changes to this Policy</h2>
              <p className="text-body">
                We’ll update this page as laws and features evolve. Major updates will be announced in-app or by email so you’re
                never surprised.
              </p>
            </Card>

            <Card id="contact" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">11) Contact Us</h2>
              <p className="text-body">
                Questions? Concerns? Compliance requests? We respond fast because your trust is non-negotiable.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="mailto:privacy@gramorx.com" className="inline-block">
                  <Button variant="primary" size="md" className="rounded-ds">Contact Privacy</Button>
                </a>
                <Link href="/support">
                  <Button variant="secondary" size="md" className="rounded-ds">Open Support</Button>
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
