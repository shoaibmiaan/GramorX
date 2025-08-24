import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Role = 'student'|'teacher'|'admin';
type ModuleKind = 'speaking'|'writing';

type AttemptDetail = {
  id: string;
  user_name: string;
  user_email?: string;
  cohort?: string | null;
  module: ModuleKind;
  task: string;            // e.g., "Task 2" or "Part 2"
  ai_band: number;         // 0–9
  ai_rubric?: {
    task_response?: string;
    coherence?: string;
    lexical?: string;
    grammar?: string;
    pronunciation?: string;
  } | null;
  overridden?: boolean;
  final_band?: number | null;
  override_reason?: string | null;
  created_at: string;      // ISO
  last_activity: string;   // ISO
};

type ApiGet =
  | { ok: true; data: AttemptDetail }
  | { ok: false; error: string };

type ApiPost =
  | { ok: true; data: { final_band: number; reason: string } }
  | { ok: false; error: string };

export default function ReviewAttemptPage() {
  const router = useRouter();
  const { attemptId } = router.query as { attemptId?: string };

  const [roleOk, setRoleOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AttemptDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // form
  const [finalBand, setFinalBand] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Guard (teacher/admin only)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      const role: Role | undefined =
        (user?.user_metadata?.role as Role | undefined) ||
        (user?.app_metadata?.role as Role | undefined);
      const allowed = role === 'teacher' || role === 'admin';
      setRoleOk(allowed);
      if (!allowed) return;
    })();
  }, []);

  // Load attempt
  useEffect(() => {
    if (!attemptId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/reviews?attemptId=${encodeURIComponent(attemptId)}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json: ApiGet = await res.json();
        if (!json.ok) throw new Error(json.error);
        setData(json.data);
        setFinalBand(json.data.final_band?.toString() ?? '');
        setReason(json.data.override_reason ?? '');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load attempt.');
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  const updatedAt = useMemo(
    () => (data ? new Date(data.last_activity).toLocaleString() : ''),
    [data]
  );

  async function submitOverride(e: React.FormEvent) {
    e.preventDefault();
    if (!attemptId) return;
    const band = Number(finalBand);
    if (Number.isNaN(band) || band < 0 || band > 9) {
      setSavedMsg(null);
      setError('Final band must be a number between 0 and 9.');
      return;
    }
    if (!reason.trim()) {
      setSavedMsg(null);
      setError('Please provide a brief reason for the override.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSavedMsg(null);
    try {
      const res = await fetch(`/api/admin/reviews/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, final_band: band, reason }),
      });
      const json: ApiPost = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.ok ? 'Failed to save' : json.error);
      setSavedMsg('Override saved.');
      // reflect in UI
      setData(prev => prev ? { ...prev, overridden: true, final_band: band, override_reason: reason } : prev);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save override.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head><title>Admin • Review Attempt | GramorX</title></Head>

      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h1 className="font-slab text-display text-gradient-primary">Review & Override</h1>
              <p className="text-grayish max-w-2xl">Adjust AI score with a reason and keep the audit trail.</p>
            </div>
            <div className="shrink-0">
              <Link href="/admin/reviews" legacyBehavior>
                <Button as="a" variant="secondary" className="rounded-ds">Back to list</Button>
              </Link>
            </div>
          </div>

          {roleOk === false && (
            <Alert variant="error" title="Access denied" className="mb-6">
              You need a <b>teacher</b> or <b>admin</b> role to open this page.
            </Alert>
          )}

          {error && (
            <Alert variant="warning" title="Heads up" className="mb-6">{error}</Alert>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {/* Left: Attempt summary */}
            <Card className="p-6 md:col-span-2 rounded-ds-2xl">
              {loading ? (
                <div className="animate-pulse h-5 w-full bg-gray-200 dark:bg-white/10 rounded" />
              ) : !data ? (
                <div className="text-grayish">No data.</div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                      <div className="text-small opacity-80">Student</div>
                      <div className="font-semibold">{data.user_name}</div>
                      <div className="text-small opacity-80">{data.user_email ?? '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-small opacity-80">Updated</div>
                      <div className="font-medium">{updatedAt}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                      <div className="text-small opacity-80">Module</div>
                      <div className="capitalize font-medium">{data.module}</div>
                    </div>
                    <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                      <div className="text-small opacity-80">Task</div>
                      <div className="font-medium">{data.task}</div>
                    </div>
                    <div className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                      <div className="text-small opacity-80">AI band</div>
                      <div className="font-semibold">{data.ai_band.toFixed(1)}</div>
                    </div>
                  </div>

                  {data.overridden && (
                    <div className="mt-4">
                      <Badge variant="warning" size="sm">Overridden</Badge>
                    </div>
                  )}

                  {/* Simple rubric readout */}
                  {data.ai_rubric && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">AI Rubric Notes</h3>
                      <ul className="list-disc pl-5 space-y-1 text-body opacity-90">
                        {data.ai_rubric.task_response && <li><b>Task response:</b> {data.ai_rubric.task_response}</li>}
                        {data.ai_rubric.coherence && <li><b>Coherence:</b> {data.ai_rubric.coherence}</li>}
                        {data.ai_rubric.lexical && <li><b>Lexical:</b> {data.ai_rubric.lexical}</li>}
                        {data.ai_rubric.grammar && <li><b>Grammar:</b> {data.ai_rubric.grammar}</li>}
                        {data.ai_rubric.pronunciation && <li><b>Pronunciation:</b> {data.ai_rubric.pronunciation}</li>}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* Right: Override form */}
            <Card className="p-6 rounded-ds-2xl">
              <h3 className="font-semibold mb-3">Set final band</h3>
              <form onSubmit={submitOverride} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish">Final band (0–9)</span>
                  <input
                    inputMode="decimal"
                    value={finalBand}
                    onChange={e => setFinalBand(e.target.value)}
                    placeholder="e.g., 6.5"
                    className="w-full rounded-ds border bg-white text-lightText placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                               dark:bg-dark/50 dark:text-white dark:placeholder-white/40 dark:border-purpleVibe/30
                               dark:focus:ring-electricBlue dark:focus:border-electricBlue py-2.5 px-3.5"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish">Reason (required)</span>
                  <textarea
                    rows={5}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Explain why you adjusted the band (task achievement, coherence, pronunciation, etc.)"
                    className="w-full rounded-ds border bg-white text-lightText placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                               dark:bg-dark/50 dark:text-white dark:placeholder-white/40 dark:border-purpleVibe/30
                               dark:focus:ring-electricBlue dark:focus:border-electricBlue py-2.5 px-3.5"
                  />
                </label>

                <div className="flex gap-3">
                  <Button type="submit" variant="primary" disabled={submitting} className="rounded-ds">
                    {submitting ? 'Saving…' : 'Save override'}
                  </Button>
                  {!!data?.final_band && (
                    <span className="self-center text-small opacity-80">
                      Current final: <b>{data.final_band.toFixed(1)}</b>
                    </span>
                  )}
                </div>
              </form>

              {savedMsg && <Alert variant="success" title={savedMsg} className="mt-4" />}
              {!savedMsg && !error && (
                <Alert variant="info" className="mt-4">
                  The AI band is preserved for audit. Your override becomes the <b>final</b> band.
                </Alert>
              )}
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
