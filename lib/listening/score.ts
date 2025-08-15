import { normLetter, normText, sortPairs } from './normalize';

export type Q =
  | { qno:number; type:'mcq'; answer_key:{ value:string } }
  | { qno:number; type:'gap'; answer_key:{ text:string } }
  | { qno:number; type:'match'; answer_key:{ pairs:[number,number][] } };

export type A = { qno:number; answer:any };

export function scoreOne(q: Q, user: any): boolean {
  if (user == null) return false;
  if (q.type === 'mcq') return normLetter(user) === normLetter(q.answer_key.value);
  if (q.type === 'gap') return normText(user) === normText(q.answer_key.text);
  if (q.type === 'match') {
    const want = JSON.stringify(sortPairs(q.answer_key.pairs));
    const got  = JSON.stringify(sortPairs(user ?? []));
    return want === got && q.answer_key.pairs.length > 0;
  }
  return false;
}

export function scoreAll(questions: Q[], answers: A[]) {
  const aMap = new Map<number, any>(answers.map(a => [a.qno, a.answer]));
  let total = 0;
  const perSection: Record<string, number> = { '1':0,'2':0,'3':0,'4':0 };

  for (const q of questions) {
    const ok = scoreOne(q as any, aMap.get(q.qno));
    if (ok) {
      total += 1;
      // derive section by qno bands: 1‑10, 11‑20, 21‑30, 31‑40
      const sec = q.qno <= 10 ? '1' : q.qno <= 20 ? '2' : q.qno <= 30 ? '3' : '4';
      perSection[sec] += 1;
    }
  }
  return { total, perSection };
}
