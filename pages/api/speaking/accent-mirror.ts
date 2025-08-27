import type { NextApiRequest, NextApiResponse } from 'next';

// Simple static dataset of prompts and minimal pair gap words for accent alignment
const DATA: Record<string, { prompts: string[]; gaps: [string, string][] }> = {
  US: {
    prompts: [
      'Repeat after me: The car is parked far from the bar.',
      'Practice the rhotic R sound: Brother, father, and farmer.',
    ],
    gaps: [
      ['cot', 'caught'],
      ['bitter', 'bidder'],
      ['ship', 'sheep'],
    ],
  },
  UK: {
    prompts: [
      'Mind the R: The car is parked far from the bar.',
      'Focus on non-rhotic endings: The teacher saw her.',
    ],
    gaps: [
      ['spa', 'spar'],
      ['caught', 'cot'],
      ['full', 'fool'],
    ],
  },
  AUS: {
    prompts: [
      'Flatten vowels: The cat sat on the mat.',
      'Practice rising intonation: Are you coming today?',
    ],
    gaps: [
      ['dawn', 'don'],
      ['cart', 'cut'],
      ['ferry', 'fairy'],
    ],
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const accent = String((req.method === 'GET' ? req.query.accent : req.body.accent) || 'US').toUpperCase();
  const data = DATA[accent] || DATA.US;
  res.status(200).json({ accent, prompts: data.prompts, gaps: data.gaps });
}

