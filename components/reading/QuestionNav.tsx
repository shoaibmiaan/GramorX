import React from 'react';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';

type QuestionLite = { id: string; qNo: number; type: string };

type StatusFilter = 'all' | 'flagged' | 'unanswered';
type TypeFilter = 'all' | 'tfng' | 'ynng' | 'mcq' | 'gap' | 'match';

export const QuestionNav: React.FC<{
  questions: QuestionLite[];
  answers: Record<string, { type: string; value: any }>;
  flags: Record<string, boolean>;
  statusFilter: StatusFilter;
  onStatusFilter: (f: StatusFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilter: (f: TypeFilter) => void;
  onJump: (qid: string) => void;
  className?: string;
}> = ({
  questions, answers, flags,
  statusFilter, onStatusFilter,
  typeFilter, onTypeFilter,
  onJump, className = ''
}) => {
  const counts = {
    total: questions.length,
    flagged: questions.filter(q => !!flags[q.id]).length,
    unanswered: questions.filter(q => answers[q.id]?.value == null || answers[q.id]?.value === '').length,
    answered: questions.filter(q => answers[q.id]?.value != null && answers[q.id]?.value !== '').length,
  };

  const types: TypeFilter[] = ['tfng','ynng','mcq','gap','match'];
  const hasType = (t: TypeFilter) => questions.some(q => q.type === t);

  const visible = questions
    .filter(q => {
      // type filter
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      // status filter
      if (statusFilter === 'flagged' && !flags[q.id]) return false;
      if (statusFilter === 'unanswered' && !(answers[q.id]?.value == null || answers[q.id]?.value === '')) return false;
      return true;
    })
    .sort((a, b) => a.qNo - b.qNo);

  return (
    <aside className={`card-surface p-4 rounded-ds border border-gray-200 dark:border-white/10 sticky top-24 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-h3 font-semibold">Questions</h3>
        <Badge variant="info" size="sm">{counts.answered}/{counts.total} done</Badge>
      </div>

      {/* Status filters */}
      <div className="mt-3 flex gap-2 flex-wrap" aria-label="Status filters">
        <Button variant={statusFilter === 'all' ? 'primary' : 'secondary'} className="rounded-ds px-3 py-1" onClick={() => onStatusFilter('all')}>
          All
        </Button>
        <Button variant={statusFilter === 'flagged' ? 'primary' : 'secondary'} className="rounded-ds px-3 py-1" onClick={() => onStatusFilter('flagged')}>
          Flagged <span className="opacity-70 ml-1">({counts.flagged})</span>
        </Button>
        <Button variant={statusFilter === 'unanswered' ? 'primary' : 'secondary'} className="rounded-ds px-3 py-1" onClick={() => onStatusFilter('unanswered')}>
          Unanswered <span className="opacity-70 ml-1">({counts.unanswered})</span>
        </Button>
      </div>

      {/* Type filters */}
      <div className="mt-2 flex gap-2 flex-wrap" aria-label="Type filters">
        <Button variant={typeFilter === 'all' ? 'primary' : 'secondary'} className="rounded-ds px-3 py-1" onClick={() => onTypeFilter('all')}>
          All types
        </Button>
        {types.filter(hasType).map(t => (
          <Button
            key={t}
            variant={typeFilter === t ? 'primary' : 'secondary'}
            className="rounded-ds px-3 py-1 uppercase"
            onClick={() => onTypeFilter(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      {/* Chips */}
      <div className="mt-3 grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-4 gap-2">
        {visible.map(q => {
          const flagged = !!flags[q.id];
          const answered = !(answers[q.id]?.value == null || answers[q.id]?.value === '');
          const cls = answered
            ? 'bg-success/15 text-success border-success/30'
            : flagged
              ? 'bg-goldenYellow/15 text-goldenYellow border-goldenYellow/30'
              : 'bg-gray-200/40 dark:bg-white/10 text-lightText dark:text-white border-gray-200/60 dark:border-white/10';

          return (
            <button
              key={q.id}
              onClick={() => onJump(q.id)}
              className={`text-small px-2.5 py-1 rounded-ds border transition ${cls} hover:opacity-90`}
              aria-label={`Jump to question ${q.qNo}${flagged ? ' (flagged)' : ''}${answered ? ' (answered)' : ' (unanswered)'}`}
              title={`Q${q.qNo}`}
            >
              {q.qNo}{flagged ? ' ⚑' : ''}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="secondary"
          className="rounded-ds"
          onClick={() => {
            const first = questions.find(q => answers[q.id]?.value == null || answers[q.id]?.value === '');
            if (first) onJump(first.id);
          }}
        >
          Jump to first unanswered
        </Button>
        <Button
          variant="secondary"
          className="rounded-ds"
          onClick={() => {
            const first = questions.find(q => !!flags[q.id]);
            if (first) onJump(first.id);
          }}
        >
          Jump to first flagged
        </Button>
      </div>
    </aside>
  );
};
