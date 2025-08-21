import { env } from "@/lib/env";
// pages/learning/[slug].tsx
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

type Course = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category: string;
  level: string;
  duration_minutes?: number | null;
  lessons_count?: number | null;
  thumbnail_url?: string | null;
  is_featured: boolean;
  band_target?: number | null;
  tags?: string[] | null;
};

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  duration_minutes?: number | null;
  order_index: number;
  video_url?: string | null;
  free_preview?: boolean | null;
  kind?: string | null; // Strategy | Drill | Mock | Feedback | Lecture | Guided Practice
};

type Progress = {
  id: string;
  course_id: string;
  user_id: string;
  last_lesson_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function CourseDetailPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string | string[] };

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    const s = Array.isArray(slug) ? slug[0] : slug;
    if (!s) return;

    (async () => {
      setLoading(true);
      setError(null);

      // 1) Fetch course by slug
      const { data: c, error: cErr } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', s)
        .single();

      if (cErr || !c) {
        setError(cErr?.message || 'Course not found');
        setCourse(null);
        setLessons([]);
        setLoading(false);
        return;
      }
      setCourse(c as Course);

      // 2) Fetch lessons for this course
      const { data: l, error: lErr } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', c.id)
        .order('order_index', { ascending: true });

      if (lErr) {
        setError(lErr.message);
        setLessons([]);
        setLoading(false);
        return;
      }
      setLessons((l || []) as Lesson[]);

      // 3) Fetch user progress (if logged in)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', c.id)
          .maybeSingle();

        if (p) setProgress(p as Progress);
      }

      setLoading(false);
    })();
  }, [slug]);

  const resumeLesson = useMemo(() => {
    if (!progress?.last_lesson_id || !lessons.length) return null;
    return lessons.find(l => l.id === progress.last_lesson_id) || null;
  }, [progress, lessons]);

  const firstLessonId = resumeLesson?.id ?? lessons[0]?.id;

  // Which lessons should be unlocked?
  const lastViewedIndex = useMemo(
    () => (resumeLesson ? lessons.findIndex(l => l.id === resumeLesson.id) : -1),
    [resumeLesson, lessons]
  );

  async function markStart(lessonId: string) {
    const s = (Array.isArray(slug) ? slug[0] : slug) || course?.slug;
    const { data: { user } } = await supabase.auth.getUser();

    if (user && course) {
      await supabase.from('user_course_progress').upsert(
        {
          user_id: user.id,
          course_id: course.id,
          last_lesson_id: lessonId,
        },
        { onConflict: 'user_id,course_id' }
      );

      setProgress(prev => ({
        ...(prev || ({} as Progress)),
        user_id: user.id,
        course_id: course.id,
        last_lesson_id: lessonId,
      } as Progress));
    }

    if (s) router.push(`/learning/${s}/lesson/${lessonId}`);
  }

  function startOrResume() {
    if (firstLessonId) markStart(firstLessonId);
  }

  // Loading
  if (loading) {
    return (
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
            <Card className="p-0 rounded-ds-2xl overflow-hidden">
              <div className="h-64 w-full bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-10 w-2/3 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-5 w-1/2 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
            </Card>
            <Card className="p-6 rounded-ds-2xl">
              <div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                    <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Container>
      </section>
    );
  }

  // Error
  if (error || !course) {
    return (
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <Alert variant="error" title="Couldn’t load course">
            {error || 'Course not found.'}
          </Alert>
        </Container>
      </section>
    );
  }

  // Success
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
          {/* Hero / Overview */}
          <Card className="p-0 rounded-ds-2xl overflow-hidden">
            {course.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.thumbnail_url} alt="" className="h-64 w-full object-cover" />
            ) : (
              <div className="h-64 w-full bg-purpleVibe/10" />
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="info" size="sm">{course.category}</Badge>
                <Badge size="sm">{course.level}</Badge>
                {course.is_featured && <Badge variant="success" size="sm">Featured</Badge>}
                {typeof course.band_target === 'number' && (
                  <Badge variant="success" size="sm">Band {course.band_target.toFixed(1)}</Badge>
                )}
              </div>

              {!!(course.tags && course.tags.length) && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {course.tags.slice(0, 5).map(t => (
                    <Badge key={t} variant="info" size="sm">{t}</Badge>
                  ))}
                </div>
              )}

              <h1 className="font-slab text-display text-gradient-primary">{course.title}</h1>
              {course.description && <p className="text-body opacity-90 mt-2">{course.description}</p>}

              {lessons.some(l => l.free_preview) && (
                <div className="mt-3">
                  <Badge variant="warning" size="sm">This course includes Free preview lessons</Badge>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {/* Start/Resume — link fallback + state update */}
                <Link href={firstLessonId ? `/learning/${course.slug}/lesson/${firstLessonId}` : '#'} passHref>
                  <Button
                    as="a"
                    variant="primary"
                    className="rounded-ds-xl"
                    onClick={(e) => { e.preventDefault(); startOrResume(); }}
                    aria-disabled={!firstLessonId}
                  >
                    {resumeLesson ? 'Resume Course' : 'Start Course'}
                  </Button>
                </Link>

                {/* Mock tests */}
                <Link href="/mock-tests" passHref>
                  <Button as="a" variant="secondary" className="rounded-ds-xl">
                    Try a Mock Test
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Lessons */}
          <Card className="p-6 rounded-ds-2xl">
            <h2 className="font-slab text-h2">Lessons</h2>
            {lessons.length === 0 ? (
              <Alert variant="info" className="mt-3">Lessons will appear here soon.</Alert>
            ) : (
              <ol className="mt-4 space-y-3">
                {lessons.map((lsn, idx) => {
                  const isResume = lsn.id === resumeLesson?.id;
                  const isUnlocked = idx <= lastViewedIndex + 1;

                  const kindVariant =
                    lsn.kind === 'Strategy' ? 'info' :
                    lsn.kind === 'Drill' ? 'warning' :
                    lsn.kind === 'Mock' ? 'accent' :
                    lsn.kind === 'Feedback' ? 'success' :
                    'neutral';

                  return (
                    <li
                      key={lsn.id}
                      className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-small opacity-70">Lesson {idx + 1}</div>
                        <div className="font-semibold flex items-center gap-2">
                          {lsn.title}
                          <Badge variant={kindVariant as any} size="sm">{lsn.kind || 'Lesson'}</Badge>
                          {lsn.free_preview && <Badge variant="warning" size="sm">Free preview</Badge>}
                        </div>
                        <div className="text-small opacity-80">
                          {lsn.duration_minutes ?? 10} min
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isResume && <Badge variant="success" size="sm">Last viewed</Badge>}
                        {isUnlocked ? (
                          <Link href={`/learning/${course.slug}/lesson/${lsn.id}`} passHref>
                            <Button
                              as="a"
                              variant={isResume ? 'secondary' : 'primary'}
                              className="rounded-ds-xl"
                              onClick={(e) => { e.preventDefault(); markStart(lsn.id); }}
                            >
                              {isResume ? 'Continue' : (idx === 0 ? 'Start' : 'Open')}
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="secondary" className="rounded-ds-xl" aria-disabled>
                            Locked
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>
      </Container>
    </section>
  );
}
