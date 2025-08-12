import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';

const SKILLS = [
  { key: 'grammar', title: 'Grammar', blurb: 'Core rules, tenses, clauses, punctuation.' },
  { key: 'vocabulary', title: 'Vocabulary', blurb: 'High-frequency IELTS words & themes.' },
  { key: 'collocations', title: 'Collocations', blurb: 'Natural word pairs for higher bands.' },
] as const;

export default function SkillsHub() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl mb-3 text-gradient-primary">Skills Hub</h1>
        <p className="text-grayish max-w-2xl">
          Drill down into Grammar, Vocabulary, and Collocations. Each skill includes mini-lessons and practice.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map(s => (
            <Card key={s.key} className="card-surface p-6 rounded-ds-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-h3 font-semibold">{s.title}</h3>
                <Badge variant="info" size="sm">Skill</Badge>
              </div>
              <p className="mt-2 text-body opacity-90">{s.blurb}</p>
              <div className="mt-6">
                <Button as="a" href={`/learning/skills/${s.key}`} variant="primary" className="rounded-ds">
                  Explore {s.title}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-small text-grayish">
          Tip: These pages use DS primitives only (Container, Card, Badge, Button) to keep visuals consistent.
        </div>
      </Container>
    </section>
  );
}
