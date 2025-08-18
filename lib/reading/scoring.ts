type Item = { id:string; qNo:number; type:string; prompt:string; correct:any };
type Section = { orderNo:number; questions: Item[] };
type Paper = { title:string; passage?:string; sections: Section[] };

function norm(s:string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function scoreReading(paper: Paper, answers: Record<string, any>) {
  const items: any[] = [];
  let correctCount = 0;
  let total = 0;

  const typeMap: Record<string, { correct:number; total:number }> = {};

  paper.sections.forEach(sec => {
    sec.questions.forEach((q:any) => {
      total += 1;
      typeMap[q.type] ||= { correct: 0, total: 0 };
      typeMap[q.type].total += 1;

      const user = answers[q.id];
      let isCorrect = false;

      if (q.type === 'mcq' || q.type === 'tfng' || q.type === 'ynng') {
        isCorrect = user != null && String(user) === String(q.correct);
      } else if (q.type === 'gap') {
        if (user != null) {
          const u = norm(String(user));
          const acc = (q.acceptable || [q.correct]).map((x:string)=>norm(x));
          isCorrect = acc.includes(u);
        }
      } else if (q.type === 'match') {
        if (user && typeof user === 'object') {
          const keys = Object.keys(q.correct || {});
          isCorrect = keys.every(k => user[k] === q.correct[k]);
        }
      }

      if (isCorrect) {
        correctCount += 1;
        typeMap[q.type].correct += 1;
      }

      items.push({
        id: q.id,
        qNo: q.qNo,
        type: q.type,
        prompt: q.prompt,
        correct: q.correct ?? null,
        user: user ?? null,
        isCorrect
      });
    });
  });

  const pct = total ? correctCount / total : 0;
  const band = Math.round(((4.0 + pct * 5.0) + Number.EPSILON) * 10) / 10; // 4.0–9.0 approx

  const breakdown = Object.fromEntries(
    Object.entries(typeMap).map(([k, v]) => [k, {
      correct: v.correct,
      total: v.total,
      pct: v.total ? Math.round((v.correct / v.total) * 100) : 0
    }])
  );

  return { band, correctCount, total, items, breakdown };
}
