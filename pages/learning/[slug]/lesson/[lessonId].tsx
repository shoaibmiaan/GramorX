import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LessonPlayer() {
  const router = useRouter();
  const { lessonId } = router.query as { lessonId?: string };

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle();

      if (error || !data) {
        setError(error?.message || 'Lesson not found');
        setLesson(null);
        setLoading(false);
        return;
      }
      setLesson(data);

      // update progress using lesson.course_id (no need for id/slug here)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && data.course_id) {
        await supabase.from('user_course_progress').upsert({
          user_id: session.user.id,
          course_id: data.course_id,
          last_lesson_id: lessonId,
        });
      }

      setLoading(false);
    })();
  }, [lessonId]);

  if (loading) {
    return (
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <Card className="p-6 rounded-ds-2xl">
            <div className="animate-pulse h-64 bg-gray-200 dark:bg-white/10 rounded" />
          </Card>
        </Container>
      </section>
    );
  }

  if (error || !lesson) {
    return (
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <Alert variant="error" title="Error">{error || 'Lesson not found'}</Alert>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <Card className="p-6 rounded-ds-2xl">
          <h1 className="font-slab text-display text-gradient-primary">{lesson.title}</h1>
          <p className="text-body opacity-90 mt-2">{lesson.description || ''}</p>

          {/* Replace with your real player */}
          <div className="mt-6 aspect-video w-full bg-dark/10 dark:bg-white/10 rounded-ds flex items-center justify-center">
            {lesson.video_url ? (
              <video src={lesson.video_url} controls className="h-full w-full rounded-ds" />
            ) : (
              <span className="opacity-70">No video attached</span>
            )}
          </div>

          <div className="mt-6">
            <Button variant="secondary" className="rounded-ds-xl" onClick={() => history.back()}>
              Back
            </Button>
          </div>
        </Card>
      </Container>
    </section>
  );
}
