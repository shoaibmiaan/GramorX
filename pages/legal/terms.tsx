// pages/legal/terms.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

const SECTIONS = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'about-service', title: 'About the Service' },
  { id: 'eligibility', title: 'Eligibility & Accounts' },
  { id: 'security', title: 'Account Security' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'user-content', title: 'User Content & License' },
  { id: 'ai-features', title: 'AI Features & Limits' },
  { id: 'fees-billing', title: 'Fees, Credits & Billing' },
  { id: 'refunds', title: 'Cancellations & Refunds' },
  { id: 'privacy', title: 'Privacy' },
  { id: 'third-parties', title: 'Third-Party Services' },
  { id: 'disclaimers', title: 'Disclaimers' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'indemnity', title: 'Indemnification' },
  { id: 'termination', title: 'Termination' },
  { id: 'law-disputes', title: 'Governing Law & Disputes' },
  { id: 'changes', title: 'Changes to These Terms' },
  { id: 'contact', title: 'Contact' },
] as const;

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service • IELTS Prep with AI — GramorX</title>
        <meta
          name="description"
          content="GramorX Terms of Service. Clear, global, student-first terms for IELTS Prep with AI."
        />
      </Head>

      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          {/* Hero */}
          <div className="mb-12">
            <p className="uppercase tracking-wide text-xs text-grayish/80">Legal • Terms</p>
            <h1 className="font-slab text-display text-gradient-primary">
              Terms of Service — Learn Fast. Play Fair.
            </h1>
            <p className="text-body text-grayish max-w-2xl mt-3">
              Welcome to <strong>IELTS Prep with AI</strong> by GramorX. These Terms govern your use of our
              platform globally. By creating an account or using the service, you agree to them.
            </p>
            <div className="mt-3 text-small text-grayish">Effective date: 25 Aug 2025</div>

            {/* Deep links */}
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

          {/* TOC */}
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

          {/* Sections */}
          <div className="space-y-8">
            <Card id="acceptance" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">1) Acceptance of Terms</h2>
              <p className="text-body">
                By accessing or using GramorX, you agree to these Terms and to any policies referenced here (including our{' '}
                <Link href="/privacy-policy" className="underline">Privacy Policy</Link>). If you don’t agree, do not use the Service.
              </p>
            </Card>

            <Card id="about-service" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">2) About the Service</h2>
              <p className="text-body">
                GramorX provides IELTS preparation tools across Listening, Reading, Writing, and Speaking, including AI evaluation,
                analytics, and practice modules. We may improve, add, or remove features over time.
              </p>
            </Card>

            <Card id="eligibility" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">3) Eligibility & Accounts</h2>
              <p className="text-body">
                You must be at least 13 years old (or the minimum age in your region) to use the Service. Provide accurate
                information and keep it updated. You are responsible for activities under your account.
              </p>
            </Card>

            <Card id="security" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">4) Account Security</h2>
              <p className="text-body">
                Keep your credentials confidential. Notify us immediately of any unauthorized use. We may suspend accounts to
                protect you and the community.
              </p>
            </Card>

            <Card id="acceptable-use" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">5) Acceptable Use</h2>
              <p className="text-body">
                Don’t misuse the Service. Prohibited activities include cheating, automating unfair attempts, scraping, reverse
                engineering, unauthorized sharing of content, harassment, or violating any applicable laws.
              </p>
            </Card>

            <Card id="user-content" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">6) User Content & License</h2>
              <p className="text-body">
                You retain ownership of essays, recordings, and other materials you submit. You grant GramorX a worldwide,
                non-exclusive license to host, process, and display your content solely to operate and improve the Service,
                including generating feedback and analytics.
              </p>
            </Card>

            <Card id="ai-features" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">7) AI Features & Limits</h2>
              <p className="text-body">
                AI outputs (scores, explanations, suggestions) are generated predictions and may not be error-free. Use your
                judgment and treat AI feedback as guidance, not official scores. We may use de-identified aggregates to improve models.
              </p>
            </Card>

            <Card id="fees-billing" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">8) Fees, Credits & Billing</h2>
              <p className="text-body">
                Paid plans and credits enable premium features and AI evaluations. Prices, taxes, and limits may vary by region.
                If a payment fails, access to paid features may pause until resolved. We’ll show prices clearly before you buy.
              </p>
            </Card>

            <Card id="refunds" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">9) Cancellations & Refunds</h2>
              <p className="text-body">
                Cancel anytime to stop future charges. Unless required by law or stated otherwise in writing, fees and consumed credits
                are non-refundable. We may provide good-faith credits for service issues at our discretion.
              </p>
            </Card>

            <Card id="privacy" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">10) Privacy</h2>
              <p className="text-body">
                We respect your privacy. See our <Link href="/privacy-policy" className="underline">Privacy Policy</Link> for how
                we collect, use, and protect information.
              </p>
            </Card>

            <Card id="third-parties" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">11) Third-Party Services</h2>
              <p className="text-body">
                We rely on trusted providers (e.g., auth, storage, email/SMS, payments). Their terms may apply where relevant.
                We’re not responsible for third-party sites or services outside our control.
              </p>
            </Card>

            <Card id="disclaimers" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">12) Disclaimers</h2>
              <p className="text-body">
                The Service is provided “as is” without warranties of any kind. We don’t guarantee score outcomes or uninterrupted
                availability. Your study effort and exam conditions affect results.
              </p>
            </Card>

            <Card id="liability" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">13) Limitation of Liability</h2>
              <p className="text-body">
                To the fullest extent permitted by law, GramorX is not liable for indirect, incidental, or consequential damages,
                or loss of data, profits, or business. Our total liability for any claim is limited to the amounts you paid in
                the 3 months before the claim.
              </p>
            </Card>

            <Card id="indemnity" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">14) Indemnification</h2>
              <p className="text-body">
                You agree to defend and hold harmless GramorX from claims arising out of your misuse of the Service or violation
                of these Terms or applicable laws.
              </p>
            </Card>

            <Card id="termination" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">15) Termination</h2>
              <p className="text-body">
                You may stop using the Service at any time. We may suspend or terminate access for violations or risks to users,
                the platform, or law. Some provisions survive termination (e.g., IP, payments due, disclaimers, limitations).
              </p>
            </Card>

            <Card id="law-disputes" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">16) Governing Law & Disputes</h2>
              <p className="text-body">
                These Terms are governed by the laws of <strong>[Set Your Jurisdiction]</strong>, without regard to conflict-of-law
                principles. Disputes will be resolved in the courts of <strong>[Set Venue]</strong>. If you need us to insert your
                preferred jurisdiction/venue, let us know and we’ll update this page text.
              </p>
            </Card>

            <Card id="changes" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">17) Changes to These Terms</h2>
              <p className="text-body">
                We may update Terms as laws and features evolve. For material changes, we’ll notify you in-app or via email.
                Continued use means you accept the updated Terms.
              </p>
            </Card>

            <Card id="contact" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">18) Contact</h2>
              <p className="text-body">
                Questions? Compliance requests? We’re here to help.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="mailto:legal@gramorx.com" className="inline-block">
                  <Button variant="primary" size="md" className="rounded-ds">Email Legal</Button>
                </a>
                <Link href="/support">
                  <Button variant="secondary" size="md" className="rounded-ds">Open Support</Button>
                </Link>
                <Link href="/privacy-policy">
                  <Button variant="accent" size="md" className="rounded-ds">View Privacy Policy</Button>
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
