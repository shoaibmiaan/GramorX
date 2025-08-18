import React from 'react';
import { Badge } from '@/components/design-system/Badge';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';

type BaseQ = { id: string; qNo: number; type: string; prompt: string };
type MCQ = BaseQ & { type: 'mcq'; options: string[] };
type TFNG = BaseQ & { type: 'tfng' };
type YNNG = BaseQ & { type: 'ynng' };
type GAP  = BaseQ & { type: 'gap' };
type MATCH = BaseQ & { type: 'match'; options: string[]; pairs: { left: string; right: string }[] };
type Question = MCQ | TFNG | YNNG | GAP | MATCH;

export const QuestionBlock: React.FC<{
  q: Question;
  value: any;
  flagged?: boolean;
  onFlag?: () => void;
  onChange: (val:any) => void;
}> = ({ q, value, flagged = false, onFlag, onChange }) => {
  const answered = !(value == null || value === '');

  return (
    <div data-qid={q.id} className={`p-4 rounded-ds border ${flagged ? 'border-goldenYellow/60' : 'border-gray-200 dark:border-white/10'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-small text-grayish">Q{q.qNo} — {q.type.toUpperCase()}</div>
        <div className="flex items-center gap-2">
          {flagged && <Badge variant="warning" size="sm">Flagged</Badge>}
          <Badge variant={answered ? 'success' : 'neutral'} size="sm">
            {answered ? 'Answered' : 'Unanswered'}
          </Badge>
          <Button variant="secondary" className="rounded-ds px-3 py-1" onClick={onFlag} aria-pressed={flagged} aria-label="Flag question (F)">
            {flagged ? 'Unflag' : 'Flag'} (F)
          </Button>
        </div>
      </div>

      <p className="mt-2 font-medium">{q.prompt}</p>

      {/* Render by type */}
      <div className="mt-3">
        {q.type === 'mcq' && (
          <div className="grid gap-2" role="radiogroup" aria-label={`Question ${q.qNo} options`}>
            {(q as MCQ).options.map((opt, i) => {
              const id = `${q.id}:${opt}`;
              return (
                <label key={id} className="flex items-center gap-2 p-3 rounded-ds border border-gray-200 dark:border-white/10 cursor-pointer">
                  <input
                    type="radio"
                    name={q.id}
                    checked={value === opt}
                    onChange={() => onChange(opt)}
                    aria-label={`Option ${i+1}: ${opt}`}
                  />
                  <span><kbd className="px-1.5 py-0.5 rounded-ds bg-gray-200/60 dark:bg-white/10 mr-2">{i+1}</kbd>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {q.type === 'tfng' && (
          <div className="flex flex-wrap gap-2" aria-label={`Question ${q.qNo} TFNG`}>
            {(['True','False','Not Given'] as const).map(opt => (
              <Button key={opt} variant={value===opt ? 'primary' : 'secondary'} className="rounded-ds" onClick={() => onChange(opt)}>
                {opt} {opt==='True' && <span className="opacity-70 ml-1">(T)</span>}
                {opt==='False' && <span className="opacity-70 ml-1">(F)</span>}
                {opt==='Not Given' && <span className="opacity-70 ml-1">(N)</span>}
              </Button>
            ))}
          </div>
        )}

        {q.type === 'ynng' && (
          <div className="flex flex-wrap gap-2" aria-label={`Question ${q.qNo} Y/NNG`}>
            {(['Yes','No','Not Given'] as const).map(opt => (
              <Button key={opt} variant={value===opt ? 'primary' : 'secondary'} className="rounded-ds" onClick={() => onChange(opt)}>
                {opt} {opt==='Yes' && <span className="opacity-70 ml-1">(Y)</span>}
                {opt==='No' && <span className="opacity-70 ml-1">(N)</span>}
                {opt==='Not Given' && <span className="opacity-70 ml-1">(G)</span>}
              </Button>
            ))}
          </div>
        )}

        {q.type === 'gap' && (
          <div className="max-w-md">
            <Input
              aria-label={`Answer for question ${q.qNo}`}
              placeholder="Type your answer"
              value={value ?? ''}
              onChange={e => onChange(e.currentTarget.value)}
            />
            <p className="text-small text-grayish mt-1">Press <kbd className="px-1 rounded-ds bg-gray-200/60 dark:bg-white/10">Enter</kbd> to jump to next unanswered.</p>
          </div>
        )}

        {q.type === 'match' && (
          <div className="grid sm:grid-cols-2 gap-3" aria-label={`Matching for question ${q.qNo}`}>
            {(q as MATCH).pairs.map((p, idx) => (
              <div key={`${q.id}:${idx}`} className="p-3 rounded-ds border border-gray-200 dark:border-white/10">
                <div className="text-small text-grayish mb-1">{p.left}</div>
                <select
                  className="w-full bg-white dark:bg-dark/50 border border-gray-200 dark:border-white/10 rounded-ds p-2"
                  value={(value && value[p.left]) || ''}
                  onChange={(e) => onChange({ ...(value || {}), [p.left]: e.currentTarget.value })}
                  aria-label={`Select match for ${p.left}`}
                >
                  <option value="">— Select —</option>
                  {(q as MATCH).options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
