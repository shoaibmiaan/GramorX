// ================================
// File: pages/proctoring/check.tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Button } from '@/components/design-system/Button'
import { Input } from '@/components/design-system/Input'
import { Skeleton } from '@/components/design-system/Skeleton'
import { precheck } from '@/lib/proctoring'

// DS helpers
function cls(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

export default function ProctoringCheckPage() {
  const router = useRouter()
  const [attemptId, setAttemptId] = React.useState<string>(
    (router.query.attemptId as string) || ''
  )
  const [busy, setBusy] = React.useState(false)
  const [result, setResult] = React.useState<null | { passed: boolean; reasons: string[] }>(null)
  const [err, setErr] = React.useState<string | null>(null)

  async function runChecks() {
    setBusy(true)
    setErr(null)
    try {
      // gather device info quick
      const device = { ua: navigator.userAgent, platform: navigator.platform }
      // try permissions; fallbacks if denied
      const camera = await (navigator.permissions as any)
        ?.query({ name: 'camera' as any })
        .then((p: any) => p.state === 'granted')
        .catch(() => false)
      const microphone = await (navigator.permissions as any)
        ?.query({ name: 'microphone' as any })
        .then((p: any) => p.state === 'granted')
        .catch(() => false)
      const screen = false
      const permissions = { camera, microphone, screen }

      const payload = { examAttemptId: attemptId, device, permissions }
      const res = await precheck(payload)
      if ('ok' in res && res.ok) {
        setResult({ passed: res.passed, reasons: res.reasons || [] })
      } else {
        setErr((res as any).error || 'Unable to run checks')
      }
    } catch (e: any) {
      setErr(e?.error || e?.message || 'Unexpected error')
    } finally {
      setBusy(false)
    }
  }

  function goToExam() {
    if (!attemptId) return
    router.push(`/proctoring/exam/${encodeURIComponent(attemptId)}`)
  }

  return (
    <>
      <Head>
        <title>Proctoring Check · IELTS Portal</title>
      </Head>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-lightBorder bg-card p-6">
            <h1 className="text-2xl md:text-3xl font-slab">Pre-exam device check</h1>
            <p className="mt-1 text-sm text-mutedText">
              We quickly verify your camera, mic and environment before starting the exam.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
              <Input
                value={attemptId}
                onChange={(e) => setAttemptId(e.target.value)}
                placeholder="Exam Attempt ID"
                className="rounded-xl border border-border bg-background px-3 py-2"
              />
              <Button
                onClick={runChecks}
                disabled={!attemptId || busy}
                className="bg-accent text-accent-foreground"
              >
                {busy ? 'Checking…' : 'Run checks'}
              </Button>
            </div>

            {/* Results */}
            {busy && (
              <div className="mt-4 rounded-2xl border border-lightBorder bg-background p-4">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="mt-2 h-4 w-40" />
              </div>
            )}

            {result && (
              <div className="mt-4 rounded-2xl border border-lightBorder bg-background p-4">
                <div
                  className={cls(
                    'text-sm font-medium',
                    result.passed ? 'text-success' : 'text-sunsetRed'
                  )}
                >
                  {result.passed ? 'All checks passed.' : 'Some checks failed:'}
                </div>
                {!result.passed && result.reasons?.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-mutedText">
                    {result.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={goToExam}
                    disabled={!result.passed}
                    className="bg-primary text-primary-foreground"
                  >
                    Continue to exam
                  </Button>
                  <Button variant="outline" className="border-border" onClick={runChecks}>
                    Re-run
                  </Button>
                </div>
              </div>
            )}

            {err && (
              <div className="mt-4 rounded-2xl border border-lightBorder bg-background p-4 text-sunsetRed">
                {err}
              </div>
            )}

            <div className="mt-4 text-sm text-mutedText">
              Tip: ensure you are in a well-lit room, alone, and your face is clearly visible.
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
