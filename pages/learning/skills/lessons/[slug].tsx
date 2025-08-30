import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { getLesson, Lesson } from '@/data/courses';
import { getCompleted, markCompleted, isUnlocked } from '@/lib/learning-paths';

export default function LessonPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };
  const lesson: Lesson | undefined = slug ? getLesson(slug) : undefined;
  const [completed, setCompleted] = useState<string[]>([]);
  const done = lesson ? completed.includes(lesson.slug) : false;
  const unlocked = lesson ? isUnlocked(completed, lesson) : false;

  useEffect(() => {
    setCompleted(getCompleted());
  }, []);

  if (!lesson) {
    return (
      <Container>
        <p className="mt-10">Lesson not found.</p>
      </Container>
    );
  }

  if (!unlocked) {
    return (
      <Container>
        <Card className="card-surface p-6 rounded-ds-2xl mt-10">
          <h1 className="text-h3 mb-2">{lesson.title}</h1>
          <p>This lesson is locked. Complete prerequisites first.</p>
        </Card>
      </Container>
    );
  }

  const handleComplete = () => {
    const next = markCompleted(lesson.slug);
    setCompleted(next);
  };

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <Card className="card-surface p-6 rounded-ds-2xl">
          <h1 className="text-h3 mb-2">{lesson.title}</h1>
          <p className="mb-6 text-body">{lesson.content}</p>
          {done ? (
            <p className="text-success">Completed!</p>
          ) : (
            <Button onClick={handleComplete} variant="primary" className="rounded-ds">
              Mark complete
            </Button>
          )}
        </Card>
      </Container>
    </section>
  );
}
