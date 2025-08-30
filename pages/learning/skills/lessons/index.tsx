import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { lessonsBySkill, Lesson } from '@/data/courses';
import { getCompleted, isUnlocked } from '@/lib/learning-paths';

export default function LessonsIndex() {
  const router = useRouter();
  const skill = (router.query.skill as Lesson['skill']) || 'grammar';
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(getCompleted());
  }, []);

  const lessons = lessonsBySkill(skill);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl mb-3 text-gradient-primary capitalize">{skill} Lessons</h1>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((l) => {
            const unlocked = isUnlocked(completed, l);
            const done = completed.includes(l.slug);
            return (
              <Card key={l.slug} className="card-surface p-6 rounded-ds-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-semibold">{l.title}</h3>
                  {done && <Badge variant="success" size="sm">Done</Badge>}
                </div>
                <p className="mt-2 text-body opacity-90">{l.content}</p>
                <div className="mt-6">
                  {unlocked ? (
                    <Button as="a" href={`/learning/skills/lessons/${l.slug}`} variant="primary" className="rounded-ds">
                      Start lesson
                    </Button>
                  ) : (
                    <Button disabled variant="secondary" className="rounded-ds opacity-50">
                      Locked
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
