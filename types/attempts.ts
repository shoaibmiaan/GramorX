// types/attempts.ts

export type ModuleKey = 'listening' | 'reading' | 'writing' | 'speaking';

export interface AttemptBase {
  id: string;
  user_id: string;
  exam_id: string;            // paper/test id
  started_at: string;         // ISO
  completed_at?: string;      // ISO
  duration_sec?: number;
  raw_score?: number;         // module-specific raw
  band?: number;              // 0-9 (where relevant)
  meta?: Record<string, any>; // misc (device, locale, etc.)
}

/** Listening */
export interface ListeningAnswer {
  qid: string;
  value: string | string[];
  correct?: boolean;          // filled in review
}
export interface AttemptListening extends AttemptBase {
  module: 'listening';
  section_scores?: number[];  // per-section raw
  answers: ListeningAnswer[];
}

/** Reading */
export type ReadingType = 'tfng' | 'ynng' | 'heading' | 'matching' | 'mcq' | 'short' | 'gap';
export interface ReadingAnswer {
  qid: string;
  type: ReadingType;
  value: any;
  correct?: boolean;
}
export interface AttemptReading extends AttemptBase {
  module: 'reading';
  passage_scores?: number[]; // per-passage raw
  answers: ReadingAnswer[];
}

/** Writing */
export type WritingTask = 'task1' | 'task2';
export interface WritingSubmission {
  task: WritingTask;
  text: string;
  words: number;
  rubric?: string; // rubric id
}
export interface WritingFeedback {
  task: WritingTask;
  overall?: number; // band
  criteria?: Record<'task' | 'coherence' | 'lexical' | 'grammar', number>;
  notes?: string;
}
export interface AttemptWriting extends AttemptBase {
  module: 'writing';
  submissions: WritingSubmission[];
  feedback?: WritingFeedback[];
}

/** Speaking */
export interface SpeakingTurn {
  prompt_id: string;
  audio_url?: string;     // storage URL
  transcript?: string;
  duration_sec?: number;
}
export interface SpeakingFeedback {
  overall?: number; // band
  criteria?: Record<'fluency' | 'lexical' | 'grammar' | 'pronunciation', number>;
  notes?: string;
}
export interface AttemptSpeaking extends AttemptBase {
  module: 'speaking';
  turns: SpeakingTurn[];
  feedback?: SpeakingFeedback;
}

export type AnyAttempt =
  | AttemptListening
  | AttemptReading
  | AttemptWriting
  | AttemptSpeaking;
