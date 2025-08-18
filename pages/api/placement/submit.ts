import type { NextApiRequest, NextApiResponse } from 'next';

type Skill = 'listening'|'reading'|'writing'|'speaking';

// server‑side correct keys (bankId → answer)
const mcqKey: Record<string,string> = {
  L1: 'Entrance B',
  L2: 'Luggage storage',
  R1: 'False',
  R2: 'false',
};

// lightweight keyword rubrics for short answers
const shortRubric: Record<string,string[]> = {
  W1: ['overview','increase','rise','upward','trend','overall','steadily'],
  W2: ['opinion','because','reason','advantage','benefit','drawback','classroom','remote'],
  S1: ['prefer','morning','evening','because','reason'],
  S2: ['app','use','because','help','useful','like','feature'],
};

function bandFrom(score:number, max:number) {
  const p = max ? score / max : 0;
  return +(3 + p * 5.5).toFixed(1); // 3.0–8.5
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { answers } = req.body as { attemptId:string; answers: Record<string,string> };

  let score: Record<Skill, number> = { listening:0, reading:0, writing:0, speaking:0 };
  const max:  Record<Skill, number> = { listening:2, reading:2, writing:4, speaking:4 };

  Object.entries(answers || {}).forEach(([runtimeId, val]) => {
    // runtimeId looks like "L1-abc12" → bankId = L1
    const bankId = runtimeId.split('-')[0];
    const v = (val || '').trim().toLowerCase();

    if (mcqKey[bankId] !== undefined) {
      // MCQ exact match
      if (v === mcqKey[bankId].toLowerCase()) {
        if (bankId.startsWith('L')) score.listening += 1;
        else if (bankId.startsWith('R')) score.reading += 1;
      }
    } else {
      // SHORT: keyword hit = 2 pts; non-empty = 1 pt
      const hits = (shortRubric[bankId] || []).some(k => v.includes(k));
      const pts = hits ? 2 : (v ? 1 : 0);
      if (bankId.startsWith('W')) score.writing += pts;
      else if (bankId.startsWith('S')) score.speaking += pts;
    }
  });

  const bands = {
    listening: bandFrom(score.listening, max.listening),
    reading:   bandFrom(score.reading,   max.reading),
    writing:   bandFrom(score.writing,   max.writing),
    speaking:  bandFrom(score.speaking,  max.speaking),
  };
  const bandOverall = +(((bands.listening + bands.reading + bands.writing + bands.speaking) / 4).toFixed(1));
  res.status(200).json({ bandOverall, bands });
}
