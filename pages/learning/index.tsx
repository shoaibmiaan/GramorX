import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { courses } from '@/data/courses';

export default function LearningIndex() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl mb-3 text-gradient-primary">Learning Courses</h1>
        <p className="text-grayish max-w-2xl">
          Browse structured courses. Lessons unlock as you progress.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.slug} className="card-surface p-6 rounded-ds-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-h3 font-semibold">{c.title}</h3>
                <Badge variant="info" size="sm">{c.skill}</Badge>
              </div>
              <p className="mt-2 text-body opacity-90">{c.description}</p>
              <div className="mt-6">
                <Button
                  as="a"
                  href={`/learning/skills/lessons?skill=${c.skill}`}
                  variant="primary"
                  className="rounded-ds"
                >
                  View lessons
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
