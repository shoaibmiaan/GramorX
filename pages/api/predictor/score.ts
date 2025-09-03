// pages/api/predictor/score.ts
import type { NextApiHandler } from 'next';

type PredictorInput = Readonly<{
  readingWpm?: number;             // words per minute (0-400)
  readingAccuracy?: number;        // 0-100
  listeningAccuracy?: number;      // 0-100
  speakingFluency?: number;        // 0-100
  speakingPronunciation?: number;  // 0-100
  writingTaskResponse?: number;    // 0-100
  writingCoherence?: number;       // 0-100
  writingGrammar?: number;         // 0-100
  writingLexical?: number;         // 0-100
  studyHoursPerWeek?: number;      // 0-40+
  pastBand?: number;               // 0-9
}>;

type Breakdown = Readonly<{
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
}>;

type Success = Readonly<{
  ok: true;
  overall: number;
  breakdown: Breakdown;
  confidence: number; // 0..1
  advice: string[];
}>;
type Failure = Readonly<{ ok: false; error: string }>;
type ResBody = Success | Failure;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function roundHalf(x: number) {
  return Math.round(x * 2) / 2;
}
function scale100ToBand(x: number, minBand = 4, maxBand = 9) {
  const b = minBand + (clamp(x, 0, 100) / 100) * (maxBand - minBand);
  return clamp(b, minBand, maxBand);
}

const handler: NextApiHandler<ResBody> = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  const body: PredictorInput = req.body ?? {};
  // Basic validation (keep permissive; model is heuristic)
  const study = clamp(Number(body.studyHoursPerWeek ?? 0), 0, 60);
  const pastBand = body.pastBand != null ? clamp(Number(body.pastBand), 0, 9) : undefined;

  // Reading: blend WPM + accuracy
  const wpm = clamp(Number(body.readingWpm ?? 0), 0, 400);
  const rAcc = clamp(Number(body.readingAccuracy ?? 0), 0, 100);
  const reading = roundHalf(scale100ToBand(0.6 * (wpm / 4) + 0.4 * rAcc));

  // Listening: accuracy heavy
  const lAcc = clamp(Number(body.listeningAccuracy ?? 0), 0, 100);
  const listening = roundHalf(scale100ToBand(lAcc));

  // Speaking: average fluency + pronunciation
  const sFlu = clamp(Number(body.speakingFluency ?? 0), 0, 100);
  const sPro = clamp(Number(body.speakingPronunciation ?? 0), 0, 100);
  const speaking = roundHalf(scale100ToBand(0.5 * sFlu + 0.5 * sPro));

  // Writing: average four criteria
  const wTR = clamp(Number(body.writingTaskResponse ?? 0), 0, 100);
  const wCC = clamp(Number(body.writingCoherence ?? 0), 0, 100);
  const wGRA = clamp(Number(body.writingGrammar ?? 0), 0, 100);
  const wLEX = clamp(Number(body.writingLexical ?? 0), 0, 100);
  const writing = roundHalf(scale100ToBand((wTR + wCC + wGRA + wLEX) / 4));

  // Base overall: IELTS average rule (round to nearest 0.5)
  let overall = roundHalf((reading + listening + speaking + writing) / 4);

  // Study boost: up to +0.5 for 8–12h/wk, +1.0 for 13–20h/wk (capped)
  const studyBoost = study >= 20 ? 1 : study >= 12 ? 0.5 + (study - 12) * (0.5 / 8) : study >= 8 ? (study - 8) * (0.5 / 4) : 0;
  overall = roundHalf(clamp(overall + studyBoost, 0, 9));

  // Anchor toward past performance slightly
  if (typeof pastBand === 'number') {
    overall = roundHalf(0.8 * overall + 0.2 * pastBand);
  }

  // Confidence: higher when inputs are rich
  const filled =
    (body.readingWpm != null ? 1 : 0) +
    (body.readingAccuracy != null ? 1 : 0) +
    (body.listeningAccuracy != null ? 1 : 0) +
    (body.speakingFluency != null ? 1 : 0) +
    (body.speakingPronunciation != null ? 1 : 0) +
    (body.writingTaskResponse != null ? 1 : 0) +
    (body.writingCoherence != null ? 1 : 0) +
    (body.writingGrammar != null ? 1 : 0) +
    (body.writingLexical != null ? 1 : 0) +
    (body.studyHoursPerWeek != null ? 1 : 0) +
    (body.pastBand != null ? 1 : 0);
  const confidence = clamp(0.3 + (filled / 11) * 0.7, 0.3, 1);

  const advice: string[] = [];
  if (reading < overall) advice.push('Increase reading speed with timed passages (target +20 WPM).');
  if (listening < overall) advice.push('Do daily listening dictations to lift accuracy by 5–10%.');
  if (speaking < overall) advice.push('Record 2-minute answers and shadow native audio for pronunciation.');
  if (writing < overall) advice.push('Practice Task-2 essays; focus on Coherence and Grammar.');
  if (study < 8) advice.push('Study at least 8–12 hours/week for faster gains.');

  return res.status(200).json({
    ok: true,
    overall,
    breakdown: { reading, listening, speaking, writing },
    confidence: Number(confidence.toFixed(2)),
    advice,
  });
};

export default handler;
