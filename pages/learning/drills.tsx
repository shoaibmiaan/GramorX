import { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

type Drill = { question: string; options: string[]; answer: number; explanation: string };

async function generateDrill(): Promise<Drill | null> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content:
              'Return a JSON object with keys question, options (array), answer (index), explanation. Create a short English grammar multiple-choice drill.',
          },
          { role: 'user', content: 'Create a drill.' },
        ],
      }),
    });
    if (!res.body) return null;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n\n')) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta?.content;
            if (delta) text += delta;
          } catch {
            /* ignore */
          }
        }
      }
    }
    return JSON.parse(text) as Drill;
  } catch {
    return null;
  }
}

export default function DrillsPage() {
  const [drill, setDrill] = useState<Drill | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setSelected(null);
    const d = await generateDrill();
    setDrill(d);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="py-8">
      <Container>
        <h1 className="text-2xl font-semibold mb-4">Daily Drill</h1>
        <Card className="card-surface p-6 rounded-ds-2xl">
          {drill ? (
            <>
              <p className="mb-4">{drill.question}</p>
              <ul className="space-y-2">
                {drill.options.map((o, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setSelected(i)}
                      className="w-full text-left border rounded-ds px-3 py-2 hover:bg-accent"
                    >
                      {o}
                    </button>
                  </li>
                ))}
              </ul>
              {selected !== null && (
                <div className="mt-4">
                  {selected === drill.answer ? (
                    <p className="text-success">Correct!</p>
                  ) : (
                    <p className="text-danger">Incorrect.</p>
                  )}
                  <p className="mt-2 text-sm">{drill.explanation}</p>
                  <Button onClick={load} variant="secondary" className="mt-4 rounded-ds">
                    New drill
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Button onClick={load} variant="primary" className="rounded-ds" disabled={loading}>
              {loading ? 'Generating…' : 'Generate drill'}
            </Button>
          )}
        </Card>
      </Container>
    </main>
  );
}
