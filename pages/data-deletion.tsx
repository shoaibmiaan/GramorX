// pages/data-deletion.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

const SECTIONS = [
  { id: 'overview',          title: 'Overview' },
  { id: 'quick-actions',     title: 'Quick Actions' },
  { id: 'self-service',      title: 'Delete Your Account (Self-Service)' },
  { id: 'export',            title: 'Export Your Data (Before Deletion)' },
  { id: 'verification',      title: 'Identity Verification' },
  { id: 'what-deletes',      title: 'What Gets Deleted' },
  { id: 'what-retained',     title: 'What May Be Retained (Limited)' },
  { id: 'timelines',         title: 'Timelines' },
  { id: 'third-parties',     title: 'Third-Party Processors' },
  { id: 'restore',           title: 'Restore / Account Recovery' },
  { id: 'special-cases',     title: 'Special Cases' },
  { id: 'contact',           title: 'Contact & Appeals' },
] as const;

export default function DataDeletionPage() {
  return (
    <>
      <Head>
        <title>User Data Deletion • IELTS Prep with AI — GramorX</title>
        <meta
          name="description"
          content="How to delete your GramorX account and personal data. Self-service steps, timelines, and what’s deleted vs retained."
        />
      </Head>

      <section className="pb-safe py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          {/* Hero */}
          <div className="mb-12">
            <p className="uppercase tracking-wide text-xs text-grayish/80">Legal • Data Deletion</p>
            <h1 className="font-slab text-display text-gradient-primary">
              User Data Deletion — Simple, Transparent, Fast.
            </h1>
            <p className="text-body text-grayish max-w-2xl mt-3">
              This page explains how to delete your <strong>GramorX</strong> account and personal data, what gets removed,
              what may be retained briefly for legal or security reasons, and typical timelines.
            </p>
            <div className="mt-3 text-small text-grayish">Effective date: 25 Aug 2025</div>

            {/* Deep links */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/"><Button variant="primary" size="sm" className="rounded-ds">Home</Button></Link>
              <Link href="/privacy-policy"><Button variant="secondary" size="sm" className="rounded-ds">Privacy Policy</Button></Link>
              <Link href="/terms"><Button variant="secondary" size="sm" className="rounded-ds">Terms of Service</Button></Link>
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
            <Card id="overview" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">1) Overview</h2>
              <p className="text-body">
                You can permanently delete your account and associated personal data. We’ll guide you through self-service steps,
                mention what’s deleted vs retained, and outline typical timelines and exceptions (e.g., fraud prevention, chargebacks).
              </p>
            </Card>

            <Card id="quick-actions" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">2) Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/support?topic=data-deletion">
                  <Button variant="primary" size="md" className="rounded-ds">Request Deletion via Support</Button>
                </Link>
                <a href="mailto:privacy@gramorx.com" className="inline-block">
                  <Button variant="secondary" size="md" className="rounded-ds">Email privacy@gramorx.com</Button>
                </a>
                <Link href="/privacy-policy#your-rights">
                  <Button variant="accent" size="md" className="rounded-ds">Review Your Rights</Button>
                </Link>
              </div>
            </Card>

            <Card id="self-service" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">3) Delete Your Account (Self-Service)</h2>
              <p className="text-body">
                If available in your region, you can delete your account from within the app:
              </p>
              <ul className="list-disc pl-6 text-body mt-2 space-y-1">
                <li>Go to <strong>Profile &gt; Settings</strong>.</li>
                <li>Open <strong>Privacy &amp; Account</strong>.</li>
                <li>Click <strong>Delete Account</strong> and follow the verification prompts.</li>
              </ul>
              <p className="text-body mt-3">
                If you don’t see these options, use the <Link href="/support" className="underline">Support</Link> link above or email us.
              </p>
            </Card>

            <Card id="export" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">4) Export Your Data (Before Deletion)</h2>
              <p className="text-body">
                You may export key items (e.g., practice history, scores, essays, speaking recordings) before deletion where available.
                Look for <strong>Profile &gt; Data &amp; Export</strong> or ask Support for an export.
              </p>
            </Card>

            <Card id="verification" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">5) Identity Verification</h2>
              <p className="text-body">
                For your security, we verify deletion requests using your login method (email/phone/social SSO). In rare cases we may
                request additional proof (e.g., recent activity confirmation) to prevent unauthorized deletion.
              </p>
            </Card>

            <Card id="what-deletes" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">6) What Gets Deleted</h2>
              <p className="text-body">
                Upon confirmed deletion, we aim to remove:
              </p>
              <ul className="list-disc pl-6 text-body mt-2 space-y-1">
                <li>Account profile data (name, email/phone, preferences, goal band).</li>
                <li>Learning records (attempts, scores, feedback) linked to your identity.</li>
                <li>User-generated content (essays, speaking recordings) stored by us.</li>
                <li>Stored tokens or identifiers tied to your account.</li>
              </ul>
            </Card>

            <Card id="what-retained" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">7) What May Be Retained (Limited)</h2>
              <p className="text-body">We may retain for a limited time where necessary to:</p>
              <ul className="list-disc pl-6 text-body mt-2 space-y-1">
                <li>Comply with law (tax, fraud/abuse prevention, chargebacks, accounting).</li>
                <li>Maintain system logs and security audit trails (with minimal data).</li>
                <li>Honor financial recordkeeping periods for completed transactions.</li>
                <li>Preserve de-identified aggregates that no longer identify you.</li>
              </ul>
            </Card>

            <Card id="timelines" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">8) Timelines</h2>
              <p className="text-body">
                Most deletions complete within <strong>30 days</strong> of verification. Certain backups or logs may take up to
                <strong> 90 days</strong> to fully cycle out, subject to legal requirements and technical constraints.
              </p>
            </Card>

            <Card id="third-parties" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">9) Third-Party Processors</h2>
              <p className="text-body">
                We work with trusted processors (authentication, storage, email/SMS, payments, analytics). When your deletion is
                processed, we pass the request along or take steps so processors remove or de-identify your data in line with their
                retention obligations.
              </p>
            </Card>

            <Card id="restore" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">10) Restore / Account Recovery</h2>
              <p className="text-body">
                Deletion is permanent. If you change your mind <em>before</em> it’s finalized, contact Support immediately.
                Once completed, recovery isn’t possible and you’ll need to create a new account.
              </p>
            </Card>

            <Card id="special-cases" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">11) Special Cases</h2>
              <ul className="list-disc pl-6 text-body mt-2 space-y-1">
                <li><strong>Minors:</strong> Parents/guardians can request deletion for eligible accounts.</li>
                <li><strong>Fraud/Security Holds:</strong> We may delay deletion to investigate abuse or unlawful activity.</li>
                <li><strong>Institutional Access:</strong> If your access is sponsored (e.g., school), deletion may involve the sponsor.</li>
              </ul>
            </Card>

            <Card id="contact" className="p-6 rounded-ds-2xl scroll-mt-24">
              <h2 className="font-slab text-h2 mb-3">12) Contact & Appeals</h2>
              <p className="text-body">
                Need help, or want to appeal a decision? Reach us and we’ll respond quickly.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/support?topic=data-deletion">
                  <Button variant="primary" size="md" className="rounded-ds">Open a Deletion Ticket</Button>
                </Link>
                <a href="mailto:privacy@gramorx.com" className="inline-block">
                  <Button variant="secondary" size="md" className="rounded-ds">Email privacy@gramorx.com</Button>
                </a>
                <Link href="/privacy-policy#your-rights">
                  <Button variant="accent" size="md" className="rounded-ds">Know Your Rights</Button>
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
