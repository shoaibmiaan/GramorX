import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Alert } from '@/components/design-system/Alert';

type SkillKey = 'grammar' | 'vocabulary' | 'collocations';
type MiniLesson = { id: string; title: string; tags: string[]; level: 'beginner'|'intermediate'|'advanced' };

const CATALOG: Record<SkillKey, MiniLesson[]> = {
  grammar: [
    { id: 'g1', title: 'Tenses Overview', tags: ['verb','time'], level: 'beginner' },
    { id: 'g2', title: 'Complex Clauses', tags: ['relative','subordinate'], level: 'intermediate' },
    { id: 'g3', title: 'Punctuation Precision', tags: ['comma','semicolon'], level: 'advanced' },
  ],
  vocabulary: [
    { id: 'v1', title: 'Environment Lexicon', tags: ['band 7+','topic'], level: 'intermediate' },
    { id: 'v2', title: 'Education Themes', tags: ['topic'], level: 'beginner' },
    { id: 'v3', title: 'Technology Register', tags: ['formal'], level: 'advanced' },
  ],
  collocations: [
    { id: 'c1', title: 'Make / Do / Take', tags: ['verbs'], level: 'beginner' },
    { id: 'c2', title: 'Economic + Nouns', tags: ['topic'], level: 'intermediate' },
    { id: 'c3', title: 'Academic Collocations', tags: ['formal'], level: 'advanced' },
  ],
};

export default function SkillDetail() {
  const { query } = useRouter();
  const skill = (query.skill as SkillKey) || 'grammar';

  const [level, setLevel] = useState<'beginner'|'intermediate'|'advanced'|'all'>('all');
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string|null>(null);
  const [drill, setDrill] = useState<{ id: string; prompt: string } | null>(null);

  const lessons = useMemo(() => {
    const list = CATALOG[skill] ?? [];
    return list.filter(l => (level === 'all' ? true : l.level === level));
  }, [skill, level]);

  useEffect(() => { setDrill(null); setErrorMsg(null); }, [skill]);

  async function generateDrill() {
    try {
      setLoading(true);
      setErrorMsg(null);
      setDrill(null);
      const res = await fetch('/api/drills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, level: level === 'all' ? 'beginner' : level, focus }),
      });
      if (!res.ok) throw new Error('Failed to generate drill');
      const data = await res.json(); // { id, prompt }
      setDrill({ id: data.id, prompt: data.prompt });
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const titleMap: Record<SkillKey, string> = { grammar: 'Grammar', vocabulary: 'Vocabulary', collocations: 'Collocations' };

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl mb-3 text-gradient-primary">{titleMap[skill]} — Mini Lessons</h1>
        <p className="text-grayish max-w-2xl">Browse lessons by level and generate a quick practice drill.</p>

        <Card className="card-surface p-6 rounded-ds-2xl mt-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={level === 'all' ? 'success' : 'neutral'} size="sm" className="cursor-pointer" onClick={() => setLevel('all')}>All</Badge>
              <Badge variant={level === 'beginner' ? 'success' : 'neutral'} size="sm" className="cursor-pointer" onClick={() => setLevel('beginner')}>Beginner</Badge>
              <Badge variant={level === 'intermediate' ? 'success' : 'neutral'} size="sm" className="cursor-pointer" onClick={() => setLevel('intermediate')}>Intermediate</Badge>
              <Badge variant={level === 'advanced' ? 'success' : 'neutral'} size="sm" className="cursor-pointer" onClick={() => setLevel('advanced')}>Advanced</Badge>
            </div>
            <div className="md:ml-auto w-full md:w-96">
              <Input label="Focus (optional)" placeholder="e.g., relative clauses, technology topic" value={focus} onChange={(e) => setFocus(e.target.value)} hint="Refine the drill theme" />
            </div>
            <Button variant="primary" className="rounded-ds" onClick={generateDrill} disabled={loading}>
              {loading ? 'Generating…' : 'Generate Drill'}
            </Button>
          </div>

          {loading && <Alert className="mt-4" title="Generating drill…" variant="info">Please wait a moment.</Alert>}
          {errorMsg && <Alert className="mt-4" title="Error" variant="error">{errorMsg}</Alert>}
          {drill && (
            <Card className="card-surface p-5 rounded-ds mt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-h3 font-semibold">Practice Drill</div>
                  <p className="mt-1 opacity-90">{drill.prompt}</p>
                </div>
                <Badge variant="info" size="sm">AI</Badge>
              </div>
              <div className="mt-4">
                <Input placeholder="Type your short answer here…" />
              </div>
              <div className="mt-3">
                <Button variant="secondary" className="rounded-ds">Save Attempt</Button>
              </div>
            </Card>
          )}
        </Card>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map(item => (
            <Card key={item.id} className="card-surface p-6 rounded-ds-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-h3 font-semibold">{item.title}</h3>
                <Badge variant="neutral" size="sm" className="capitalize">{item.level}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map(t => <Badge key={t} size="sm" variant="info">{t}</Badge>)}
              </div>
              <div className="mt-5">
                <Button variant="primary" className="rounded-ds">Practice</Button>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
