import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

type Row = { slug: string; title: string };

export default function ListeningIndex() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    supabase.from('lm_listening_tests').select('slug,title').order('created_at', { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, []);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl text-gradient-primary">Listening Tests</h1>
        <p className="text-grayish">Pick a test to begin.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(rows ?? []).map(r => (
            <Card key={r.slug} className="p-6">
              <div className="font-semibold mb-2">{r.title}</div>
              <Button as="a" href={`/listening/${r.slug}`}>Start</Button>
            </Card>
          ))}
          {rows && rows.length === 0 && (
            <Card className="p-6">
              <div className="opacity-80">No tests yet. Seed the DB and refresh.</div>
            </Card>
          )}
        </div>
      </Container>
    </section>
  );
}
