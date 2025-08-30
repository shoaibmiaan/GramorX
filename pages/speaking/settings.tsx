import React, { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { AccentPicker, type Accent } from '@/components/speaking/AccentPicker';
import { Button } from '@/components/design-system/Button';

export default function SpeakingSettingsPage() {
  const [accent, setAccent] = useState<Accent>('US');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const a = (localStorage.getItem('speakingAccent') as Accent) || 'US';
      setAccent(a);
    }
  }, []);

  const save = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('speakingAccent', accent);
      setMsg('Accent saved');
      setTimeout(() => setMsg(''), 2000);
    }
  };

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <Card className="card-surface p-6 rounded-ds-2xl max-w-xl mx-auto">
          <h1 className="font-slab text-h1">Speaking Settings</h1>
          <p className="text-grayish mt-2">Choose your preferred accent for speaking practice.</p>

          <div className="mt-4">
            <AccentPicker value={accent} onChange={setAccent} />
          </div>

          <Button onClick={save} variant="primary" className="mt-4 rounded-ds-xl">
            Save
          </Button>
          {msg && <p className="mt-2 text-sm text-emerald-600">{msg}</p>}
        </Card>
      </Container>
    </section>
  );
}

