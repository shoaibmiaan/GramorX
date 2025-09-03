// lib/predictor.ts
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

export type PredictorResult = Readonly<{
  overall: number;
  breakdown: Breakdown;
  confidence: number; // 0..1
  advice: string[];
}>;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const roundHalf = (x: number) => Math.round(x * 2) / 2;
const scale100ToBand = (x: number, minBand = 4, maxBand = 9) =>
  clamp(minBand + (clamp(x, 0, 100) / 100) * (maxBand - minBand), minBand, maxBand);

/** Same heuristic used by the API route so UI/tests can reuse the logic. */
export function scorePredictor(input: PredictorInput): PredictorResult {
  const study = clamp(Number(input.studyHoursPerWeek ?? 0), 0, 60);
  const pastBand = input.pastBand != null ? clamp(Number(input.pastBand), 0, 9) : undefined;

  const wpm = clamp(Number(input.readingWpm ?? 0), 0, 400);
  const rAcc = clamp(Number(input.readingAccuracy ?? 0), 0, 100);
  const reading = roundHalf(scale100ToBand(0.6 * (wpm / 4) + 0.4 * rAcc));

  const lAcc = clamp(Number(input.listeningAccuracy ?? 0), 0, 100);
  const listening = roundHalf(scale100ToBand(lAcc));

  const sFlu = clamp(Number(input.speakingFluency ?? 0), 0, 100);
  const sPro = clamp(Number(input.speakingPronunciation ?? 0), 0, 100);
  const speaking = roundHalf(scale100ToBand(0.5 * sFlu + 0.5 * sPro));

  const wTR = clamp(Number(input.writingTaskResponse ?? 0), 0, 100);
  const wCC = clamp(Number(input.writingCoherence ?? 0), 0, 100);
  const wGRA = clamp(Number(input.writingGrammar ?? 0), 0, 100);
  const wLEX = clamp(Number(input.writingLexical ?? 0), 0, 100);
  const writing = roundHalf(scale100ToBand((wTR + wCC + wGRA + wLEX) / 4));

  let overall = roundHalf((reading + listening + speaking + writing) / 4);

  const studyBoost =
    study >= 20 ? 1 : study >= 12 ? 0.5 + (study - 12) * (0.5 / 8) : study >= 8 ? (study - 8) * (0.5 / 4) : 0;
  overall = roundHalf(clamp(overall + studyBoost, 0, 9));

  if (typeof pastBand === 'number') {
    overall = roundHalf(0.8 * overall + 0.2 * pastBand);
  }

  const filled =
    (input.readingWpm != null ? 1 : 0) +
    (input.readingAccuracy != null ? 1 : 0) +
    (input.listeningAccuracy != null ? 1 : 0) +
    (input.speakingFluency != null ? 1 : 0) +
    (input.speakingPronunciation != null ? 1 : 0) +
    (input.writingTaskResponse != null ? 1 : 0) +
    (input.writingCoherence != null ? 1 : 0) +
    (input.writingGrammar != null ? 1 : 0) +
    (input.writingLexical != null ? 1 : 0) +
    (input.studyHoursPerWeek != null ? 1 : 0) +
    (input.pastBand != null ? 1 : 0);
  const confidence = clamp(0.3 + (filled / 11) * 0.7, 0.3, 1);

  const advice: string[] = [];
  if (reading < overall) advice.push('Increase reading speed with timed passages (target +20 WPM).');
  if (listening < overall) advice.push('Do daily listening dictations to lift accuracy by 5–10%.');
  if (speaking < overall) advice.push('Record 2-minute answers and shadow native audio for pronunciation.');
  if (writing < overall) advice.push('Practice Task-2 essays; focus on Coherence and Grammar.');
  if (study < 8) advice.push('Study at least 8–12 hours/week for faster gains.');

  return { overall, breakdown: { reading, listening, speaking, writing }, confidence: Number(confidence.toFixed(2)), advice };
}
