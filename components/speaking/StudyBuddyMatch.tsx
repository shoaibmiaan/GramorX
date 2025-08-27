import React, { useState } from 'react';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export const buddyPrompts = {
  warmups: [
    'Introduce yourself to your partner.',
    'Share why you are preparing for IELTS.',
  ],
  topics: [
    'Describe your hometown to your buddy.',
    'Talk about a hobby you enjoy.',
    'Explain a recent challenge you overcame.',
  ],
};

export default function StudyBuddyMatch() {
  const [timezone, setTimezone] = useState('');
  const [goalBand, setGoalBand] = useState('');
  const [status, setStatus] = useState('');
  const [buddyId, setBuddyId] = useState<string | null>(null);

  async function handleMatch() {
    setStatus('Matching...');
    const { data: { session } } = await supabaseBrowser.auth.getSession();
    const res = await fetch('/api/buddy/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ timezone, goalBand: Number(goalBand) }),
    });
    const body = await res.json();
    if (res.ok) {
      if (body.matched) {
        setBuddyId(body.buddyId);
        setStatus('Matched! Start your practice.');
      } else {
        setStatus('Waiting for a buddy...');
      }
    } else {
      setStatus(body.error || 'Error matching');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-h2">Study Buddy</h2>
      <p className="mt-2 text-grayish">Find a partner with similar goals and timezone.</p>
      <div className="mt-4 flex flex-col gap-3">
        <Input placeholder="Timezone" value={timezone} onChange={e => setTimezone(e.target.value)} />
        <Input placeholder="Goal Band" value={goalBand} onChange={e => setGoalBand(e.target.value)} />
        <Button onClick={handleMatch} className="rounded-ds-xl">Match</Button>
      </div>
      {status && <p className="mt-4">{status}</p>}
      {buddyId && (
        <div className="mt-6">
          <h3 className="text-h3 mb-2">Prompt ideas</h3>
          <ul className="list-disc ml-5 space-y-1">
            {buddyPrompts.warmups.concat(buddyPrompts.topics).map(p => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
