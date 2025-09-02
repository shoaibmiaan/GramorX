// types/questions.ts

export type QuestionType =
  | 'mcq'
  | 'tfng'      // True/False/Not Given
  | 'ynng'      // Yes/No/Not Given
  | 'heading'   // match paragraph -> heading
  | 'matching'  // A<->B mapping
  | 'short'     // short answer
  | 'gap'       // fill-in-the-blank
  | 'essay';    // writing task (T1/T2 handled via prompt metadata)

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;     // text or markdown
  points?: number;    // default 1
  passageId?: string; // for reading linkage
}

/** Multiple choice */
export interface MCQItem extends BaseQuestion {
  type: 'mcq';
  options: string[];
  multi?: boolean;          // allow multiple answers
  correctIndex?: number;    // optional (hidden in exam, used in review)
  correctIndexes?: number[];// for multi
  explanation?: string;
}

/** True/False/Not Given */
export interface TFNGItem extends BaseQuestion {
  type: 'tfng';
  correct?: 'T' | 'F' | 'NG';
  explanation?: string;
}

/** Yes/No/Not Given */
export interface YNNGItem extends BaseQuestion {
  type: 'ynng';
  correct?: 'Y' | 'N' | 'NG';
  explanation?: string;
}

/** Match paragraph -> heading */
export interface HeadingItem extends BaseQuestion {
  type: 'heading';
  paragraphs: string[]; // e.g., ["A","B","C","D"]
  headings: string[];   // list of candidate headings
  correctMap?: Record<string, number>; // paragraph letter -> index in headings
}

/** Generic matching A<->B */
export interface MatchingItem extends BaseQuestion {
  type: 'matching';
  left: string[];
  right: string[];
  correctMap?: Record<number, number>; // leftIndex -> rightIndex
}

/** Short answer / gap fill (single token/string) */
export interface ShortItem extends BaseQuestion {
  type: 'short' | 'gap';
  answerPattern?: string; // regex string for lenient check (optional)
  correct?: string;       // canonical expected answer (optional)
}

/** Essay (Writing Task 1/2) */
export interface EssayItem extends BaseQuestion {
  type: 'essay';
  minWords?: number;
  maxWords?: number;
  rubricId?: string; // maps to grading rubric
}

export type AnyQuestion =
  | MCQItem
  | TFNGItem
  | YNNGItem
  | HeadingItem
  | MatchingItem
  | ShortItem
  | EssayItem;

/** Group questions into sections with timing (used by mocks) */
export interface ExamSection {
  id: string;
  title: string;
  minutes?: number;
  questionIds: string[];
}

export interface ExamDescriptor {
  id: string;
  title: string;
  module: 'listening' | 'reading' | 'writing' | 'speaking';
  sections: ExamSection[];
  totalMinutes?: number;
}
