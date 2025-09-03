import * as React from 'react';
import { useRouter } from 'next/router';

type PredictorInput = Readonly<{
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

type PredictorSuccess = Readonly<{
  ok: true;
  overall: number;
  breakdown: { reading: number; listening: number; speaking: number; writing: number };
  confidence: number;
  advice: string[];
}>;

type PredictorFailure = Readonly<{ ok: false; error: string }>;
type PredictorResponse = PredictorSuccess | PredictorFailure;

export type BandPredictorFormProps = {
  initial?: PredictorInput;
  navigateToResult?: boolean; // if true, saves to sessionStorage and router.push('/predictor/result')
  className?: string;
  onPredicted?: (result: PredictorSuccess) => void;
  onError?: (msg: string) => void;
};

const Field = ({
  label,
  type = 'range',
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  type?: 'number' | 'range';
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (n: number) => void;
}) => (
  <label className="block rounded-lg border border-border p-3">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{value}</span>
    </div>
    <input
      aria-label={label}
      type={type}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={type === 'range'
        ? 'mt-2 w-full'
        : 'mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary'}
    />
  </label>
);

export default function BandPredictorForm({
  initial,
  navigateToResult = true,
  className = '',
  onPredicted,
  onError,
}: BandPredictorFormProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<PredictorInput>({
    readingWpm: 180,
    readingAccuracy: 70,
    listeningAccuracy: 72,
    speakingFluency: 65,
    speakingPronunciation: 68,
    writingTaskResponse: 66,
    writingCoherence: 64,
    writingGrammar: 62,
    writingLexical: 63,
    studyHoursPerWeek: 6,
    pastBand: 6,
    ...initial,
  });
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const update = <K extends keyof PredictorInput>(key: K, val: number) =>
    setForm((f) => ({ ...f, [key]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/predictor/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as PredictorResponse;
      if (!('ok' in json) || !json.ok) throw new Error((json as any)?.error || 'Prediction failed');

      if (navigateToResult) {
        sessionStorage.setItem('predictor:last', JSON.stringify({ input: form, result: json }));
        await router.push('/predictor/result');
      }
      onPredicted?.(json);
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg);
      onError?.(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`grid gap-4 md:grid-cols-2 ${className}`}>
      <Field label="Reading WPM" type="range" min={0} max={400} step={5}
        value={form.readingWpm ?? 0} onChange={(v) => update('readingWpm', v)} />
      <Field label="Reading Accuracy (%)" type="range" min={0} max={100} step={1}
        value={form.readingAccuracy ?? 0} onChange={(v) => update('readingAccuracy', v)} />
      <Field label="Listening Accuracy (%)" type="range" min={0} max={100} step={1}
        value={form.listeningAccuracy ?? 0} onChange={(v) => update('listeningAccuracy', v)} />
      <Field label="Speaking Fluency (%)" type="range" min={0} max={100} step={1}
        value={form.speakingFluency ?? 0} onChange={(v) => update('speakingFluency', v)} />
      <Field label="Pronunciation (%)" type="range" min={0} max={100} step={1}
        value={form.speakingPronunciation ?? 0} onChange={(v) => update('speakingPronunciation', v)} />
      <Field label="Writing — Task Response (%)" type="range" min={0} max={100} step={1}
        value={form.writingTaskResponse ?? 0} onChange={(v) => update('writingTaskResponse', v)} />
      <Field label="Writing — Coherence (%)" type="range" min={0} max={100} step={1}
        value={form.writingCoherence ?? 0} onChange={(v) => update('writingCoherence', v)} />
      <Field label="Writing — Grammar (%)" type="range" min={0} max={100} step={1}
        value={form.writingGrammar ?? 0} onChange={(v) => update('writingGrammar', v)} />
      <Field label="Writing — Lexical Resource (%)" type="range" min={0} max={100} step={1}
        value={form.writingLexical ?? 0} onChange={(v) => update('writingLexical', v)} />
      <Field label="Study hours / week" type="range" min={0} max={40} step={1}
        value={form.studyHoursPerWeek ?? 0} onChange={(v) => update('studyHoursPerWeek', v)} />
      <Field label="Past IELTS Band (optional)" type="range" min={0} max={9} step={0.5}
        value={form.pastBand ?? 0} onChange={(v) => update('pastBand', v)} />

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-primary px-4 py-3 text-primary-foreground disabled:opacity-60"
        >
          {busy ? 'Predicting…' : 'Predict my Band'}
        </button>
        {err ? (
          <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
            <p className="font-medium">Error</p>
            <p className="opacity-90">{err}</p>
          </div>
        ) : null}
      </div>
    </form>
  );
}
