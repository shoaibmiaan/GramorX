import { env } from "@/lib/env";
import React, { useEffect, useState } from 'react';
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
  category: string | null;
  level: string | null;
  thumbnail_url: string | null;
  is_featured: boolean | null;
  band_target: number | null;
  lessons_count: number | null;
};

export const CourseCatalog: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('courses')
        .select('id, slug, title, category, level, thumbnail_url, is_featured, band_target, lessons_count')
        .order('title', { ascending: true });

      if (error) setError(error.message);
      setCourses((data || []) as Course[]);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90" id="catalog">
      <Container>
        <h2 className="font-slab text-h2 mb-2">Structured Course Library</h2>
        <p className="text-grayish">Academic & General tracks, organized by level.</p>

        {loading && (
          <Card className="p-6 rounded-ds-2xl mt-6">
            <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded" />
          </Card>
        )}

        {error && (
          <Alert className="mt-6" variant="error" title="Couldn’t load courses">
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Card key={c.id} className="card-surface p-6 rounded-ds-2xl">
                <div className="flex items-center gap-2 mb-2">
                  {c.category && <Badge variant="info" size="sm">{c.category}</Badge>}
                  {c.level && <Badge size="sm">{c.level}</Badge>}
                  {c.is_featured && <Badge variant="success" size="sm">Featured</Badge>}
                  {typeof c.band_target === 'number' && <Badge variant="success" size="sm">Band {c.band_target.toFixed(1)}</Badge>}
                </div>

                <h3 className="text-h3 font-semibold">{c.title}</h3>
                <div className="text-small opacity-80 mt-1">{c.lessons_count ?? 0} lessons</div>

                <div className="mt-5">
                  <Button as="a" href={`/learning/${c.slug}`} variant="primary" className="rounded-ds-xl">
                    Start Course
                  </Button>
                </div>
              </Card>
            ))}
            {courses.length === 0 && (
              <Card className="p-6 rounded-ds-2xl">
                <div className="text-grayish">No courses available yet.</div>
              </Card>
            )}
          </div>
        )}
      </Container>
    </section>
  );
};
