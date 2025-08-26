import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Skill = 'listening'|'reading'|'writing'|'speaking';
type Item = {
  id: string;              // unique runtime id
  bankId: string;          // stable id (L1, R2…)
  skill: Skill;
  type: 'mcq'|'short';
  prompt: string;          // includes mini audio context / passage text where relevant
  options?: string[];      // MCQ choices
  max: number;             // points
};

// --- IELTS‑pattern item bank (miniaturized for placement) ---
const bank: Record<Skill, Array<Item & { answer?: string }>> = {
  listening: [
    {
      id: '', bankId:'L1', skill:'listening', type:'mcq', max:1,
      prompt:
`Audio context: University announcements.
You hear: “Due to maintenance, **the library tour** will now begin at **11:30 a.m.** from **Entrance B**.”

Q1. According to the announcement, where should students assemble?`,
      options: ['Entrance A', 'Entrance B', 'Main Hall', 'Seminar Room 2'],
      answer: 'Entrance B'
    },
    {
      id: '', bankId:'L2', skill:'listening', type:'mcq', max:1,
      prompt:
`Audio context: Hostel check‑in call.
You hear: “Check‑in is from 2 p.m.; early arrivals can leave luggage at reception.”

Q2. What service is available for early arrivals?`,
      options: ['Room service', 'Airport pickup', 'Luggage storage', 'Free breakfast'],
      answer: 'Luggage storage'
    },
  ],
  reading: [
    {
      id: '', bankId:'R1', skill:'reading', type:'mcq', max:1,
      prompt:
`Passage (93 words):
Researchers trialled blue lighting in an office and recorded higher alertness among staff, yet **overall productivity did not rise**. The team suggested that while individuals felt more awake, this did not necessarily translate into measurable output. They also noted that **task variety** and break scheduling were uncontrolled, which may have influenced the findings.

Statement:
"The study proved that blue lighting increases productivity."

Q3. Decide:`,
      options: ['True','False','Not Given'],
      answer: 'False'
    },
    {
      id: '', bankId:'R2', skill:'reading', type:'mcq', max:1,
      prompt:
`Sentence from text:
"Without careful calibration, the device can produce **spurious** readings."

Q4. The word **spurious** is closest in meaning to:`,
      options: ['accurate','excessive','false','delayed'],
      answer: 'false'
    },
  ],
  writing: [
    {
      id: '', bankId:'W1', skill:'writing', type:'short', max:2,
      prompt:
`Task 1 (short): The chart shows a **steady rise** in bike usage in City X from 2010 to 2020.
Write a 1–2 sentence **overview** describing the **main trend** (do not include numbers).`
    },
    {
      id: '', bankId:'W2', skill:'writing', type:'short', max:2,
      prompt:
`Task 2 (short): Some people think **remote learning** should replace classroom lessons at university.
Write a concise 1–2 sentence **opinion** including one reason.`
    },
  ],
  speaking: [
    {
      id: '', bankId:'S1', skill:'speaking', type:'short', max:2,
      prompt:
`Speaking Part 1 (familiar topic):
Do you prefer to study in the **morning** or in the **evening**? Why? (1–2 sentences)`
    },
    {
      id: '', bankId:'S2', skill:'speaking', type:'short', max:2,
      prompt:
`Speaking Part 2 (mini cue card):
Describe a **useful app** you often use. Say what it does and **why you like it**. (1–2 sentences)`
    },
  ],
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // flatten and re‑id (avoid exposing answers to client; we keep bankId for server scoring)
  const items = ([] as Item[]).concat(
    ...(['listening','reading','writing','speaking'] as Skill[]).map(skill =>
      bank[skill].map(({ answer, ...it }) => ({
        ...it,
        id: `${it.bankId}-${Math.random().toString(36).slice(2,7)}`
      }))
    )
  );

  const attemptId = randomUUID();

  const { error } = await supabaseAdmin
    .from('placement_attempts')
    .insert({ id: attemptId, items });

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ attemptId, items });
}
