// ================================
// File: pages/proctoring/exam/[id].tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { Button } from '@/components/design-system/Button'
import { Skeleton } from '@/components/ui/skeleton'
import { startSession, verifyFrame, sendFlag } from '@/lib/proctoring'

// ---------- Types ----------
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
  const [verifying, setVerifying] = React.useState(false)
  const [lastConfidence, setLastConfidence] = React.useState<number | null>(null)

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
    const iv = setInterval(() => captureAndVerify('auto'), 10_000)
    return () => clearInterval(iv)
  }, [sessionId, videoReady])

  async function captureAndVerify(mode: 'manual'|'auto' = 'manual'){
    try {
      if (!sessionId || !videoRef.current || !canvasRef.current) return
      setVerifying(mode === 'manual')
      const v = videoRef.current
      const c = canvasRef.current
      c.width = v.videoWidth || 640
      c.height = v.videoHeight || 480
      const ctx = c.getContext('2d')!
      ctx.drawImage(v, 0, 0, c.width, c.height)
      const dataUrl = c.toDataURL('image/jpeg', 0.8)
      const res = await verifyFrame({ sessionId, imageBase64: dataUrl })
      const ok = 'ok' in res && res.ok
      const verified = ok ? (res as any).verified : false
      const conf = ok ? (res as any).confidence ?? null : null
      setLastConfidence(conf)
      if (!ok || (ok && verified === false && conf != null && conf < 0.4)){
        await sendFlag({ sessionId, type: 'verify_fail', confidence: conf || 0.0, notes: 'Low confidence verification' })
      }
    } catch (e) {
      // non-fatal: swallow
    } finally {
      setVerifying(false)
    }
  }

  function endExam(){
    // In a real flow, we would call an /end endpoint and clean up
    try {
      const media = videoRef.current?.srcObject as MediaStream | undefined
      media?.getTracks().forEach(t => t.stop())
    } catch {}
    location.href = '/'
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
                <div className="mt-2 text-xs text-mutedText">A frame is captured every 10s to verify presence.</div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button onClick={() => captureAndVerify('manual')} disabled={!sessionId || !videoReady || verifying} className="bg-accent text-accent-foreground">{verifying ? 'Verifying…' : 'Manual verify'}</Button>
              <Button variant="outline" className="border-border" onClick={endExam}>End exam</Button>
              {lastConfidence != null && (
                <span className="ml-auto text-sm text-mutedText">Last confidence: {lastConfidence.toFixed(2)}</span>
              )}
            </div>

            {/* Exam content placeholder */}
            <div className="mt-6 rounded-2xl border border-border bg-background p-4">
              <div className="text-sm text-mutedText">Exam content area</div>
              <div className="mt-2 rounded-xl border border-border bg-card p-4">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </div>
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
