// components/sections/Learning/Syllabus.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/design-system/Button';
import { Section } from '@/components/design-system/Section';

type SyllabusItem = {
  title: string;
  href: string;
  unlocked: boolean;
};

const syllabus: SyllabusItem[] = [
  { title: 'Listening Module', href: '/listening', unlocked: true },
  { title: 'Reading Module', href: '/reading', unlocked: true },
  { title: 'Writing Module', href: '/writing', unlocked: false },
  { title: 'Speaking Module', href: '/speaking', unlocked: false },
];

export const Syllabus: React.FC = () => {
  return (
    <Section>
      <h2 className="text-2xl font-bold mb-6">Your IELTS Syllabus</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {syllabus.map(({ title, href, unlocked }) => (
          <Link key={title} href={href} passHref legacyBehavior>
            <Button
              as="a"
              href={href}
              aria-disabled={!unlocked}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!unlocked) e.preventDefault();
              }}
              variant={unlocked ? 'primary' : 'secondary'}
              className="rounded-ds-xl"
            >
              {title}
            </Button>
          </Link>
        ))}
      </div>
    </Section>
  );
};
