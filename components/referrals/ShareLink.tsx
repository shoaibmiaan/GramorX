// components/referrals/ShareLink.tsx
import * as React from 'react';

export type ShareLinkProps = {
  code: string;
  className?: string;
};

export default function ShareLink({ code, className = '' }: ShareLinkProps) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const link = `${origin}/pricing?code=${encodeURIComponent(code)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    alert('Referral link copied!');
  };

  const share = async () => {
    const text = `Join me on GramorX — get 14-day Booster free:\n${link}`;
    if (navigator.share) {
      try {
        await navigator.share({ text, title: 'GramorX Referral' });
      } catch {
        /* no-op */
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <code className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-sm">{code}</code>
      <button onClick={copy} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
        Copy link
      </button>
      <button onClick={share} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
        Share
      </button>
    </div>
  );
}
