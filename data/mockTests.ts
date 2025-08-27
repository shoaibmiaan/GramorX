export type Question = {
  id: number;
  question: string;
  options: string[];
  answer: number;
};

export type SectionData = {
  duration: number;
  questions: Question[];
};

export const mockSections: Record<string, SectionData> = {
  listening: {
    duration: 60,
    questions: [
      {
        id: 1,
        question: 'What color is the sky on a clear day?',
        options: ['Blue', 'Green', 'Red'],
        answer: 0,
      },
      {
        id: 2,
        question: 'How many days are in a week?',
        options: ['5', '7', '9'],
        answer: 1,
      },
      {
        id: 3,
        question: 'Which animal barks?',
        options: ['Cat', 'Dog', 'Bird'],
        answer: 1,
      },
    ],
  },
  reading: {
    duration: 60,
    questions: [
      {
        id: 1,
        question: 'Which word is a noun?',
        options: ['Run', 'Happiness', 'Quickly'],
        answer: 1,
      },
      {
        id: 2,
        question: 'What is the past tense of "go"?',
        options: ['Goed', 'Went', 'Goes'],
        answer: 1,
      },
      {
        id: 3,
        question: 'Choose the synonym of "big".',
        options: ['Tiny', 'Large', 'Little'],
        answer: 1,
      },
    ],
  },
  writing: {
    duration: 60,
    questions: [
      {
        id: 1,
        question: 'Select the sentence with correct grammar.',
        options: [
          'She go to school.',
          'She goes to school.',
          'She going to school.',
        ],
        answer: 1,
      },
      {
        id: 2,
        question: 'Which punctuation ends a question?',
        options: ['!', '.', '?'],
        answer: 2,
      },
      {
        id: 3,
        question: 'Choose the correct word: Their/There/They\'re going to the park.',
        options: ['Their', 'There', "They're"],
        answer: 2,
      },
    ],
  },
  speaking: {
    duration: 60,
    questions: [
      {
        id: 1,
        question: 'Which sentence is a greeting?',
        options: ['Good morning!', 'Run fast.', 'See you yesterday.'],
        answer: 0,
      },
      {
        id: 2,
        question: 'Choose the polite request.',
        options: [
          'Give me the book.',
          'Could you give me the book, please?',
          'You should give me the book.',
        ],
        answer: 1,
      },
      {
        id: 3,
        question: 'Which phrase shows agreement?',
        options: ['I disagree.', "That's right.", 'No way.'],
        answer: 1,
      },
    ],
  },
};
