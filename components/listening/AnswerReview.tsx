import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { diffWords, isCorrect } from '@/lib/answers';

type MCQ = { type:'mcq'; prompt:string; userAnswer?:string; options:{label:string; correct?:boolean}[]; };
type Gap = { type:'gap'; prompt:string; userAnswer?:string; correct:string|string[]; };
type Match = { type:'match'; prompt:string; pairs:{ left:string; user?:string; correct:string; }[]; };
export type ReviewQ = MCQ | Gap | Match;

export function ReviewItem({ q }: { q: ReviewQ }) {
  if (q.type === 'mcq') {
    const correct = q.options.find(o=>o.correct)?.label ?? '';
    const ok = isCorrect(q.userAnswer || '', correct);
    return (
      <Card className="p-4 rounded-ds-2xl">
        <div className="flex items-center gap-2">
          <Badge variant={ok ? 'success' : 'danger'}>{ok ? 'Correct' : 'Incorrect'}</Badge>
          <span className="text-body">{q.prompt}</span>
        </div>
        <div className="mt-2 flex gap-2 flex-wrap">
          <Badge variant="neutral">Your: {q.userAnswer || '—'}</Badge>
          <Badge variant="info">Correct: {correct}</Badge>
        </div>
      </Card>
    );
  }

  if (q.type === 'gap') {
    const primary = Array.isArray(q.correct) ? q.correct[0] : q.correct;
    const ok = isCorrect(q.userAnswer || '', q.correct);
    const parts = diffWords(q.userAnswer || '', primary);
    return (
      <Card className="p-4 rounded-ds-2xl">
        <div className="flex items-center gap-2">
          <Badge variant={ok ? 'success' : 'danger'}>{ok ? 'Correct' : 'Incorrect'}</Badge>
          <span className="text-body">{q.prompt}</span>
        </div>
        <div className="mt-2">
          <div className="text-small opacity-80 mb-1">Your answer</div>
          <p className="text-body">
            {parts.map((p,i)=>(
              <span key={i} className={
                p.k==='ok' ? '' :
                p.k==='miss' ? 'bg-success/10 border border-success/30 rounded px-1' :
                               'bg-sunsetOrange/10 border border-sunsetOrange/30 rounded px-1'
              }>{p.t}{' '}</span>
            ))}
          </p>
          <div className="mt-2">
            <Badge variant="info">Correct: {primary}</Badge>
          </div>
        </div>
      </Card>
    );
  }

  // match
  return (
    <Card className="p-4 rounded-ds-2xl">
      {/* @ts-ignore */}
      <div className="text-body font-semibold mb-2">{q.prompt}</div>
      {/* @ts-ignore */}
      <ul className="space-y-1">{q.pairs.map((p:any, idx:number)=>{
        const ok = p.user === p.correct;
        return (
          <li key={idx} className="flex items-center gap-2">
            <Badge variant={ok ? 'success' : 'danger'}>{ok ? '✓' : '✗'}</Badge>
            <span>{p.left}</span>
            <span className="opacity-70">→</span>
            <span>{p.user || '—'}</span>
            {!ok && <Badge variant="info" className="ml-2">Correct: {p.correct}</Badge>}
          </li>
        );
      })}</ul>
    </Card>
  );
}

export function ReviewList({ items }: { items: ReviewQ[] }) {
  return (
    <div className="grid gap-4">
      {items.map((q, idx) => <ReviewItem key={idx} q={q} />)}
    </div>
  );
}
