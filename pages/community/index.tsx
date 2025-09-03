import { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Textarea } from '@/components/design-system/Textarea';
import { Button } from '@/components/design-system/Button';
import { useToast } from '@/components/design-system/Toaster';
import { Section } from '@/components/design-system/Section';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

interface Thread {
  id: number;
  title: string;
  content: string;
  flagged: boolean;
  created_at: string;
}

export default function CommunityThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { error: toastError, success: toastSuccess } = useToast();

  useEffect(() => {
    fetchThreads();
  }, []);

  async function fetchThreads() {
    const { data } = await supabase
      .from<Thread>('community_threads')
      .select('*')
      .order('created_at', { ascending: false });
    setThreads(data || []);
  }

  async function createThread() {
    if (!title) return;
    const { error } = await supabase.from('community_threads').insert({ title, content });
    if (error) return toastError('Could not create thread');
    setTitle('');
    setContent('');
    toastSuccess('Thread created');
    fetchThreads();
  }

  async function moderateThread(id: number, flagged: boolean) {
    await supabase.from('community_threads').update({ flagged: !flagged }).eq('id', id);
    fetchThreads();
  }

  return (
    <Section>
      <Container>
        <Card className="p-6 mb-6 space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Thread title" />
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" />
          <Button onClick={createThread}>Post</Button>
        </Card>
        {threads.map((t) => (
          <Card key={t.id} className="p-4 mb-4">
            <div className="flex justify-between">
              <h2 className="font-semibold">{t.title}</h2>
              {t.flagged && <span className="text-red-500 text-xs">Flagged</span>}
            </div>
            <p className="mt-2 whitespace-pre-wrap">{t.content}</p>
            <Button variant="secondary" size="sm" className="mt-2" onClick={() => moderateThread(t.id, t.flagged)}>
              {t.flagged ? 'Unflag' : 'Flag'}
            </Button>
          </Card>
        ))}
      </Container>
    </Section>
  );
}
