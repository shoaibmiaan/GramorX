import { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

interface QA {
  id: number;
  question: string;
  answer: string;
  votes: number;
}

export default function QuestionsPage() {
  const [qas, setQas] = useState<QA[]>([]);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    fetchQas();
  }, []);

  async function fetchQas() {
    const { data } = await supabase
      .from<QA>('community_questions')
      .select('*')
      .order('created_at', { ascending: false });
    setQas(data || []);
  }

  async function ask() {
    if (!question) return;
    const aiAnswer = 'This is an AI-generated reply.';
    const { error } = await supabase.from('community_questions').insert({ question, answer: aiAnswer, votes: 0 });
    if (!error) {
      setQuestion('');
      fetchQas();
    }
  }

  async function vote(id: number, delta: number) {
    const current = qas.find((q) => q.id === id);
    if (!current) return;
    await supabase.from('community_questions').update({ votes: current.votes + delta }).eq('id', id);
    fetchQas();
  }

  return (
    <section className="py-12">
      <Container>
        <Card className="p-6 mb-6 space-y-2">
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question" />
          <Button onClick={ask}>Ask</Button>
        </Card>
        {qas.map((q) => (
          <Card key={q.id} className="p-4 mb-4 space-y-2">
            <div className="font-medium">{q.question}</div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">{q.answer}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => vote(q.id, 1)}>▲</Button>
              <span>{q.votes}</span>
              <Button size="sm" variant="secondary" onClick={() => vote(q.id, -1)}>▼</Button>
            </div>
          </Card>
        ))}
      </Container>
    </section>
  );
}
