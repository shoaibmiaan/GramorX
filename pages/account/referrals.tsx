import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

interface Invite {
  referred_id: string | null;
  reward_credits: number;
  reward_issued: boolean;
  created_at: string;
}

export default function ReferralsPage() {
  const [code, setCode] = useState<string>('');
  const [invites, setInvites] = useState<Invite[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      try {
        const res = await fetch('/api/referrals', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setCode(data.code);
        setInvites(data.invites || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
  }, [router]);

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).catch(() => {});
  };

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="max-w-xl mx-auto space-y-6">
          <Card className="p-6 rounded-ds-2xl">
            <h1 className="font-slab text-display mb-4">Referrals</h1>
            {code ? (
              <div className="mb-6">
                <p className="mb-2">Your referral code:</p>
                <div className="flex items-center gap-3">
                  <code className="px-3 py-2 bg-gray-100 dark:bg-dark/40 rounded-ds">{code}</code>
                  <Button variant="secondary" onClick={copyCode} className="rounded-ds">Copy</Button>
                </div>
              </div>
            ) : (
              <p className="mb-6">Loading…</p>
            )}

            <h2 className="font-slab text-h4 mb-2">Invite history</h2>
            {invites.length === 0 && <p>No invites yet.</p>}
            <ul className="space-y-2">
              {invites.map((inv) => (
                <li key={inv.referred_id} className="text-small flex justify-between">
                  <span>{inv.referred_id ?? 'Unknown'}</span>
                  <span>
                    {inv.reward_issued ? `${inv.reward_credits} credits` : 'pending'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Container>
    </section>
  );
}
