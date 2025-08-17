// lib/speaking/promptBank.ts

export const speakingP1: string[] = [
  // warm-up; mix from your sample
  'Are you a student or do you work now?',
  'Why did you choose this course or job?',
  'Talk about your daily routine.',
  'Is there anything about your course/job you would like to change?',
  'Who does most of the shopping in your household?',
  'What type of shopping do you like? Why?',
  'Is shopping a popular activity in your country? Why/why not?',
  'What type of shops do teenagers like best in your country?',
  'How often do you go to the cinema?',
  'What type of films do you like best? Why?',
  'What type of films don’t you like? Why not?',
];

export type CueCard = {
  topic: string;        // title shown to candidate
  task: string;         // the “Describe …” line
  bullets: string[];    // “You should say” bullets
  followUps?: string[]; // 1–2 follow-ups after they finish
};

// Your provided Part 2 sample (cue card)
export const speakingP2: CueCard[] = [
  {
    topic: 'An Important Event',
    task: 'Describe an important event in your life.',
    bullets: [
      'When it happened',
      'Who you were with',
      'What happened',
      'Why it was important to you',
    ],
    followUps: [
      'Do you still think about this event often?',
      'Can the other people involved remember this event?',
    ],
  },
];

// Part 3 — discussion based on the same theme
export const speakingP3: string[] = [
  'What days are important in your country?',
  'Why is it important to have national celebrations?',
  'How are national celebrations different now compared to the past?',
  'Do you think new national celebrations will appear in the future?',
  'Are there any celebrations from other countries that you celebrate?',
  'What are the benefits of global events celebrated on the same day?',
];
