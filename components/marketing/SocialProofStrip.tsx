import * as React from 'react';
import Link from 'next/link';

export type SocialProofStripProps = {
  students?: number;
  countries?: number;
  className?: string;
};

const Logo = ({ label }: { label: string }) => (
  <div
    aria-label={label}
    className="flex h-9 items-center justify-center rounded-md border border-border px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
    title={label}
  >
    {label}
  </div>
);

export default function SocialProofStrip({
  students = 120000,
  countries = 42,
  className = '',
}: SocialProofStripProps) {
  return (
    <section className={`rounded-2xl border border-border p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Trusted by</p>
            <p className="text-xl font-semibold">{students.toLocaleString()}+ students</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Across</p>
            <p className="text-xl font-semibold">{countries}+ countries</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Inline brand placeholders (SVG/boxed) — avoids <img> while keeping DS tokens */}
          <Logo label="IELTS Prep" />
          <Logo label="StudyVisa" />
          <Logo label="GlobalEd" />
          <Logo label="LangLab" />
          <Logo label="TestCoach" />
        </div>

        <div className="text-sm">
          <Link href="/testimonials" className="underline-offset-4 hover:underline">
            See success stories
          </Link>
          <span className="mx-2 opacity-50">•</span>
          <Link href="/pricing" className="underline-offset-4 hover:underline">
            Start learning
          </Link>
        </div>
      </div>
    </section>
  );
}
