// types/predictor.ts
export type PredictorInput = Readonly<{
  readingWpm?: number;
  readingAccuracy?: number;
  listeningAccuracy?: number;
  speakingFluency?: number;
  speakingPronunciation?: number;
  writingTaskResponse?: number;
  writingCoherence?: number;
  writingGrammar?: number;
  writingLexical?: number;
  studyHoursPerWeek?: number;
  pastBand?: number;
}>;

export type Breakdown = Readonly<{
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
}>;

export type PredictorSuccess = Readonly<{
  ok: true;
  overall: number;
  breakdown: Breakdown;
  confidence: number; // 0..1
  advice: string[];
}>;

export type PredictorFailure = Readonly<{ ok: false; error: string }>;
export type PredictorResponse = PredictorSuccess | PredictorFailure;
