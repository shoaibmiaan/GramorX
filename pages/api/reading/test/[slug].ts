import type { NextApiRequest, NextApiResponse } from 'next';

// Rich 14-question sample (no DB). Later swap to Supabase.
// Types: 5 x TFNG, 4 x MCQ, 3 x GAP, 2 x MATCH
const SAMPLE = {
  slug: 'sample-reading-1',
  title: 'The Honey Bee Ecosystem',
  durationMinutes: 20,
  passage: `Honey bees play a critical role in pollination, supporting global food supply and biodiversity.
However, stressors including habitat loss, pesticide exposure, and disease have contributed to declines.
While urban beekeeping can raise awareness, it can also create competition with native pollinators if mismanaged.
Conservation strategies focus on diverse planting, reducing harmful chemicals, and improving habitats through corridors.
(Shortened for demo)`,
  sections: [
    {
      orderNo: 1,
      title: 'True / False / Not Given',
      instructions: 'Do the statements agree with the information in the passage?',
      questions: [
        { id: 'q1', qNo: 1, type: 'tfng', prompt: 'Honey bees contribute significantly to pollination.', correct: 'True' },
        { id: 'q2', qNo: 2, type: 'tfng', prompt: 'All pollinators in cities are honey bees.', correct: 'False' },
        { id: 'q3', qNo: 3, type: 'tfng', prompt: 'Urban beekeeping always benefits native pollinators.', correct: 'False' },
        { id: 'q4', qNo: 4, type: 'tfng', prompt: 'Every decline in bee numbers is solely due to pesticides.', correct: 'Not Given' },
        { id: 'q5', qNo: 5, type: 'tfng', prompt: 'Habitat corridors can support pollination.', correct: 'True' },
      ]
    },
    {
      orderNo: 2,
      title: 'Multiple Choice Questions',
      instructions: 'Choose the best answer A–D.',
      questions: [
        { id: 'q6',  qNo: 6,  type: 'mcq', prompt: 'The passage suggests a key threat is…', options: ['Climate cycles','Habitat loss','Overproduction of honey','Winter migration'], correct: 'Habitat loss' },
        { id: 'q7',  qNo: 7,  type: 'mcq', prompt: 'A benefit of urban beekeeping is…', options: ['Guaranteed higher yields','Raising awareness','Eliminating disease','Replacing wild bees'], correct: 'Raising awareness' },
        { id: 'q8',  qNo: 8,  type: 'mcq', prompt: 'An effective conservation action is…', options: ['Monoculture planting','Increasing hive density','Diverse planting','Routine pesticide use'], correct: 'Diverse planting' },
        { id: 'q9',  qNo: 9,  type: 'mcq', prompt: 'The passage portrays pesticide exposure as…', options: ['Irrelevant','One of multiple stressors','The only cause','Always banned'], correct: 'One of multiple stressors' },
      ]
    },
    {
      orderNo: 3,
      title: 'Gap-fill',
      instructions: 'Write NO MORE THAN TWO WORDS.',
      questions: [
        { id: 'q10', qNo: 10, type: 'gap', prompt: 'Bees are essential for ______ security.', correct: 'food', acceptable: ['food'] },
        { id: 'q11', qNo: 11, type: 'gap', prompt: 'Conservation uses ______ to connect habitats.', correct: 'corridors', acceptable: ['corridor','corridors'] },
        { id: 'q12', qNo: 12, type: 'gap', prompt: 'Urban hives should avoid excessive ______ with native insects.', correct: 'competition', acceptable: ['competition'] },
      ]
    },
    {
      orderNo: 4,
      title: 'Matching (Factors → Effects)',
      instructions: 'Match each factor (A–C) with its effect (i–iii).',
      questions: [
        {
          id: 'q13', qNo: 13, type: 'match',
          options: ['i) habitat loss', 'ii) pesticide exposure', 'iii) disease spread'],
          pairs: [
            { left: 'A. Monoculture', right: '' },
            { left: 'B. Neonicotinoids', right: '' },
            { left: 'C. Varroa mite', right: '' },
          ],
          correct: {
            'A. Monoculture': 'i) habitat loss',
            'B. Neonicotinoids': 'ii) pesticide exposure',
            'C. Varroa mite': 'iii) disease spread'
          }
        },
        {
          id: 'q14', qNo: 14, type: 'match',
          options: ['i) awareness', 'ii) competition risk', 'iii) floral diversity'],
          pairs: [
            { left: 'A. Urban beekeeping', right: '' },
            { left: 'B. Dense apiaries', right: '' },
            { left: 'C. Mixed planting', right: '' },
          ],
          correct: {
            'A. Urban beekeeping': 'i) awareness',
            'B. Dense apiaries': 'ii) competition risk',
            'C. Mixed planting': 'iii) floral diversity'
          }
        }
      ]
    }
  ]
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query as { slug?: string };
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (slug !== SAMPLE.slug) return res.status(404).json({ error: 'Test not found' });

  // Attach passage so explain API can use it later (kept lightweight)
  return res.json(SAMPLE);
}
