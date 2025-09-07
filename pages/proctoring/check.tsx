// ================================
// File: pages/proctoring/check.tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { precheck } from '@/lib/proctoring'

// DS helpers
function cls(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' ') }

export default function ProctoringCheckPage(){
  const router = useRouter()
  const [attemptId, setAttemptId] = React.useState<string>((router.query.attemptId as string) || '')
  const [busy, setBusy] = React.useState(false)
  const [result, setResult] = React.useState<null | { passed: boolean; reasons: string[] }>(null)
  const [err, setErr] = React.useState<string | null>(null)

  async function runChecks(){
    setBusy(true)
    setErr(null)
    try {
      // gather device info quick
      const device = { ua: navigator.userAgent, platform: navigator.platform }
      // try permissions; fallbacks if denied
      const camera = await navigator.permissions?.query({ name: 'camera' as PermissionName }).then(p => p.state === 'granted').catch(()=>false)
      const microphone = await navigator.permissions?.query({ name: 'microphone' as PermissionName }).then(p => p.state === 'granted').catch(()=>false)
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

  function goToExam(){
    if (!attemptId) return
    router.push(`/proctoring/exam/${encodeURIComponent(attemptId)}`)
  }

  return (
    <>
      <Head><title>Proctoring Check · IELTS Portal</title></Head>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-lightBorder bg-card p-6">
            <h1 className="text-2xl md:text-3xl font-slab">Pre-exam device check</h1>
            <p className="mt-1 text-sm text-mutedText">We quickly verify your camera, mic and environment before starting the exam.</p>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
              <Input value={attemptId} onChange={(e)=>setAttemptId(e.target.value)} placeholder="Exam Attempt ID" className="rounded-xl border border-border bg-background px-3 py-2" />
              <Button onClick={runChecks} disabled={!attemptId || busy} className="bg-accent text-accent-foreground">{busy ? 'Checking…' : 'Run checks'}</Button>
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
                <div className={cls('text-sm font-medium', result.passed ? 'text-success' : 'text-sunsetRed')}>
                  {result.passed ? 'All checks passed.' : 'Some checks failed:'}
                </div>
                {!result.passed && result.reasons?.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-mutedText">
                    {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                )}
                <div className="mt-4 flex gap-2">
                  <Button onClick={goToExam} disabled={!result.passed} className="bg-primary text-primary-foreground">Continue to exam</Button>
                  <Button variant="outline" className="border-border" onClick={runChecks}>Re-run</Button>
                </div>
              </div>
            )}

            {err && (
              <div className="mt-4 rounded-2xl border border-lightBorder bg-background p-4 text-sunsetRed">{err}</div>
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


// ================================
// File: pages/proctoring/exam/[id].tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { startSession, verifyFrame, sendFlag } from '@/lib/proctoring'

export type ExamPageProps = { attemptId: string }

export const getServerSideProps: GetServerSideProps<ExamPageProps> = async (ctx) => {
  const { params } = ctx
  const id = String(params?.id)
  return { props: { attemptId: id } }
}

export default function ProctoringExamPage({ attemptId }: ExamPageProps){
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [started, setStarted] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState<number>(60 * 60) // 60min demo timer
  const [videoReady, setVideoReady] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  // Start session on mount
  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await startSession({ attemptId })
        if ('ok' in res && res.ok) setSessionId(res.sessionId)
        setStarted(true)
      } catch (e: any) {
        setErr(e?.error || e?.message || 'Unable to start session')
      }
    })()
  }, [attemptId])

  // Access camera
  React.useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setVideoReady(true)
        }
      } catch (e) {
        setErr('Camera access denied. Please allow camera to proceed.')
      }
    })()
  }, [])

  // Simple countdown
  React.useEffect(() => {
    if (!started) return
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [started])

  // Periodic verification ping (every 10s)
  React.useEffect(() => {
    if (!sessionId || !videoReady) return
    const iv = setInterval(captureAndVerify, 10_000)
    return () => clearInterval(iv)
  }, [sessionId, videoReady])

  async function captureAndVerify(){
    try {
      if (!sessionId || !videoRef.current || !canvasRef.current) return
      const v = videoRef.current
      const c = canvasRef.current
      c.width = v.videoWidth || 640
      c.height = v.videoHeight || 480
      const ctx = c.getContext('2d')!
      ctx.drawImage(v, 0, 0, c.width, c.height)
      const dataUrl = c.toDataURL('image/jpeg', 0.8)
      const res = await verifyFrame({ sessionId, imageBase64: dataUrl })
      if (!('ok' in res) || !res.ok || (res.ok && res.verified === false && (res as any).confidence && (res as any).confidence < 0.4)){
        await sendFlag({ sessionId, type: 'verify_fail', confidence: (res as any).confidence || 0.0, notes: 'Low confidence verification' })
      }
    } catch (e) {
      // non-fatal
    }
  }

  function fmt(secs: number){
    const m = Math.floor(secs / 60); const s = secs % 60
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  return (
    <>
      <Head><title>Exam · Proctoring</title></Head>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-5xl px-4 py-6">
          <div className="rounded-2xl border border-lightBorder bg-card p-6">
            <header className="flex items-center justify-between">
              <h1 className="font-slab text-2xl">Exam in progress</h1>
              <div className="rounded-xl bg-primary/10 px-3 py-1 text-primary">Time left: {fmt(timeLeft)}</div>
            </header>

            {err && <div className="mt-4 rounded-2xl border border-lightBorder bg-background p-4 text-sunsetRed">{err}</div>}

            {/* Video + canvas */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-lightBorder bg-background p-3">
                <div className="text-sm text-mutedText">Webcam preview</div>
                <video ref={videoRef} className="mt-2 aspect-video w-full rounded-xl bg-dark/10" muted playsInline />
              </div>
              <div className="rounded-2xl border border-lightBorder bg-background p-3">
                <div className="text-sm text-mutedText">Analyzer buffer</div>
                <canvas ref={canvasRef} className="mt-2 aspect-video w-full rounded-xl bg-dark/5" />
                <div className="mt-2 text-xs text-mutedText">We periodically capture a frame to verify presence.</div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={captureAndVerify} disabled={!sessionId || !videoReady} className="bg-accent text-accent-foreground">Manual verify</Button>
              <Link href="/" className="inline-flex"><Button variant="outline" className="border-border">End exam</Button></Link>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background p-4 text-sm text-mutedText">
              Keep your face centered and avoid other people entering the frame. Suspicious events may be flagged.
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
