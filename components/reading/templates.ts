import { AnswerValue } from './useReadingAnswers';

export type TFNGTemplate = {
  kind: 'tfng';
  id: string;
  prompt: string;
  correct: 'True' | 'False' | 'Not Given';
};

export type MCQTemplate = {
  kind: 'mcq';
  id: string;
  prompt: string;
  options: string[];
  correct: string;
};

export type MatchingTemplate = {
  kind: 'matching';
  id: string;
  prompt: string;
  pairs: { left: string; right: string[] }[];
  correct: string[];
};

export type ShortTemplate = {
  kind: 'short';
  id: string;
  prompt: string;
  acceptable: string[];
};

export type QuestionTemplate =
  | TFNGTemplate
  | MCQTemplate
  | MatchingTemplate
  | ShortTemplate;

function norm(val: any) {
  return String(val).trim().replace(/\s+/g, ' ').toLowerCase();
}

export function scoreQuestion(
  tmpl: QuestionTemplate,
  answer: AnswerValue,
): number {
  switch (tmpl.kind) {
    case 'tfng':
    case 'mcq':
      return answer != null && String(answer) === String(tmpl.correct) ? 1 : 0;
    case 'short': {
      const ans = String(answer ?? '');
      return tmpl.acceptable.some((a) => norm(a) === norm(ans)) ? 1 : 0;
    }
    case 'matching': {
      if (!Array.isArray(answer)) return 0;
      return answer.length === tmpl.correct.length &&
        answer.every((a, i) => norm(a) === norm(tmpl.correct[i]))
        ? 1
        : 0;
    }
    default:
      return 0;
  }
}

export const exampleTFNG: TFNGTemplate = {
  kind: 'tfng',
  id: 'tf1',
  prompt: 'The sky is blue.',
  correct: 'True',
};

export const exampleMatching: MatchingTemplate = {
  kind: 'matching',
  id: 'm1',
  prompt: 'Match animals to habitats',
  pairs: [
    { left: 'Camel', right: ['Desert', 'Forest'] },
    { left: 'Penguin', right: ['Antarctica', 'Jungle'] },
  ],
  correct: ['Desert', 'Antarctica'],
};
