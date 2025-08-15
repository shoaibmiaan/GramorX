import React from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/design-system/Button';

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'tfng', label: 'True/False/Not Given' },
  { key: 'mcq', label: 'MCQ' },
  { key: 'matching', label: 'Matching' },
  { key: 'short', label: 'Short Answer' },
];

export const ReadingFilterBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const router = useRouter();
  const active = (router.query.type as string) || 'all';

  const setType = (t: string) => {
    router.push({ pathname: router.pathname, query: { ...router.query, type: t } }, undefined, { shallow: true });
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {TYPES.map((t) => (
        <Button
          key={t.key}
          onClick={() => setType(t.key)}
          variant={active === t.key ? 'primary' : 'secondary'}
          className="rounded-ds"
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
};
