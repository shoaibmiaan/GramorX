// components/reading/QuestionRenderer.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { useReadingAnswers } from '@/components/reading/useReadingAnswers';

export type TFNGQuestion = {
  kind: 'tfng';
  id: string;
  prompt: string;
};

export type MCQQuestion = {
  kind: 'mcq';
  id: string;
  prompt: string;
  options: string[];
};

export type MatchingQuestion = {
  kind: 'matching';
  id: string;
  prompt: string;
  pairs: { left: string; right: string[] }[];
};

export type ShortQuestion = {
  kind: 'short';
  id: string;
  prompt: string;
};

export type Question = TFNGQuestion | MCQQuestion | MatchingQuestion | ShortQuestion;

type Props = {
  index?: number;
  question: Question;
  /** passage slug for namespacing the draft store */
  slug: string;
  /** optional: external change handler if you ever need it */
  onChange?: (id: string, value: any) => void;
};

/**
 * DS-compliant question renderer:
 * - TF/NG & MCQ use button groups (toggle, aria-pressed)
 * - Matching uses one <select> per left-item
 * - Short uses a text input
 * - Persists answer via useReadingAnswers(slug)
 * - Keyboard accessible (Enter/Space toggles; Tab order natural)
 */
export const QuestionRenderer: React.FC<Props> = ({ index, question, slug, onChange }) => {
  const store: any = useReadingAnswers(slug); // tolerate different hook shapes
  const initialFromStore =
    (store?.answer && store.answer(question.id)) ??
    (store?.get && store.get(question.id)) ??
    (store?.answers && store.answers[question.id]) ??
    undefined;

  const [value, setValue] = useState<any>(initialFromStore);

  useEffect(() => {
    // hydrate if store changes (e.g., restoring a draft)
    if (initialFromStore !== undefined) setValue(initialFromStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const commit = (v: any) => {
    setValue(v);
    // best-effort to call whatever API the hook exposes
    if (store?.setAnswer) store.setAnswer(question.id, v);
    else if (store?.set) store.set(question.id, v);
    else if (store?.update) store.update(question.id, v);
    else if (store?.setAnswers) store.setAnswers((prev: any) => ({ ...(prev ?? {}), [question.id]: v }));
    onChange?.(question.id, v);
    // lightweight local fallback so user never loses a selection
    try {
      const all = (store?.allAnswers?.() as any) || {};
      const merged = { ...all, [question.id]: v };
      localStorage.setItem(`readingAnswers:${slug}`, JSON.stringify(merged));
    } catch {}
  };

  // ---------- Renderers ----------
  function renderTFNG(q: TFNGQuestion) {
    const choices = ['True', 'False', 'Not Given'] as const;
    const active = value ?? null;

    return (
      <div className="flex flex-wrap gap-2" role="group" aria-label="True False Not Given">
        {choices.map((c) => {
          const pressed = active === c;
          return (
            <Button
              key={c}
              type="button"
              variant={pressed ? 'primary' : 'secondary'}
              className="rounded-ds-xl"
              aria-pressed={pressed}
              onClick={() => commit(c)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  commit(c);
                }
              }}
            >
              {c}
            </Button>
          );
        })}
      </div>
    );
  }

  function renderMCQ(q: MCQQuestion) {
    const active = value ?? null;
    const opts = Array.isArray(q.options) ? q.options : [];

    return (
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Multiple choice options">
        {opts.map((opt, i) => {
          const pressed = active === opt;
          return (
            <Button
              key={`${q.id}:${i}`}
              type="button"
              variant={pressed ? 'primary' : 'secondary'}
              className="rounded-ds-xl"
              aria-pressed={pressed}
              onClick={() => commit(opt)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  commit(opt);
                }
              }}
            >
              {opt}
            </Button>
          );
        })}
      </div>
    );
  }

  function renderMatching(q: MatchingQuestion) {
    // value shape = string[] aligned by index of q.pairs
    const current: string[] = useMemo(() => {
      if (Array.isArray(value)) return value as string[];
      if (value == null) return Array(q.pairs.length).fill('');
      return value;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, q.pairs.length]);

    const setAt = (idx: number, v: string) => {
      const arr = [...current];
      arr[idx] = v;
      commit(arr);
    };

    return (
      <div className="grid gap-3">
        {q.pairs.map((p, idx) => {
          const options = Array.isArray(p.right) ? p.right : [];
          const selected = current[idx] ?? '';
          const selectId = `${q.id}-match-${idx}`;

          return (
            <div key={idx} className="grid items-center gap-2 sm:grid-cols-[1fr_minmax(180px,_240px)]">
              <label htmlFor={selectId} className="text-small opacity-80">{p.left}</label>
              <select
                id={selectId}
                className="rounded-ds border border-gray-200 dark:border-white/10 p-2 bg-white dark:bg-dark"
                value={selected}
                onChange={(e) => setAt(idx, e.target.value)}
                aria-label={`Select match for ${p.left}`}
              >
                <option value="" disabled>
                  Select…
                </option>
                {options.map((opt, i) => (
                  <option key={`${q.id}:${idx}:${i}`} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    );
  }

  function renderShort(q: ShortQuestion) {
    return (
      <div className="max-w-md">
        <Input
          aria-label="Answer"
          placeholder="Type your answer…"
          value={value ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => commit(e.target.value)}
        />
        <p className="text-small opacity-70 mt-2">Tip: one word only unless specified.</p>
      </div>
    );
  }

  return (
    <div>
      {index != null && (
        <div className="text-small text-grayish mb-1">Question {index}</div>
      )}
      <div className="tight-block mb-4">{question.prompt}</div>

      {question.kind === 'tfng' && renderTFNG(question)}
      {question.kind === 'mcq' && renderMCQ(question)}
      {question.kind === 'matching' && renderMatching(question)}
      {question.kind === 'short' && renderShort(question)}
    </div>
  );
};

export default QuestionRenderer;
