// ================================
// File: pages/labs/ai-tutor.tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Button } from '@/components/design-system/Button'
import { Input } from '@/components/design-system/Input'
import { Skeleton } from '@/components/design-system/Skeleton'
import { scoreSpeaking } from '@/lib/ai/speaking_v2'
import { scoreWriting } from '@/lib/ai/writing_v2'

// ---- Types ----
type Role = 'user' | 'assistant' | 'system'

type Msg = {
  id: string
  role: Role
  text?: string
  module?: 'listening' | 'reading' | 'writing' | 'speaking'
  ts: string
  meta?: Record<string, unknown>
}

// ---- Helpers ----
function uid() { return Math.random().toString(36).slice(2) }
function nowIso() { return new Date().toISOString() }
function cls(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' ') }

export default function AiTutorPage(){
  const [module, setModule] = React.useState<'listening'|'reading'|'writing'|'speaking'>('writing')
  const [input, setInput] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [msgs, setMsgs] = React.useState<Msg[]>([{
    id: uid(), role: 'assistant', ts: nowIso(), module,
    text: 'Hi! I\'m your IELTS AI Tutor. Pick a module and send your answer or question. I\'ll analyze and coach you to the next band.'
  }])

  // speaking: record
  const mediaRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<Blob[]>([])
  const [recState, setRecState] = React.useState<'idle'|'recording'|'processing'>('idle')

  async function onSend(){
    if (!input.trim()) return
    const userMsg: Msg = { id: uid(), role: 'user', text: input, ts: nowIso(), module }
    setMsgs((m) => [...m, userMsg])
    setInput('')
    setBusy(true)

    try {
      if (module === 'writing') {
        // Score & feedback for writing
        const res = await scoreWriting({ attemptId: uid(), text: userMsg.text!, rubric: 'band_ielts_v2' })
        if (res.ok) {
          const fb = JSON.stringify(res.feedback, null, 2)
          const score = JSON.stringify(res.score, null, 2)
          setMsgs((m) => [...m, { id: uid(), role: 'assistant', ts: nowIso(), module, text: `**Writing feedback**\n\nScore: ${score}\n\nFeedback: ${fb}` }])
        } else {
          setMsgs((m) => [...m, { id: uid(), role: 'assistant', ts: nowIso(), module, text: `Couldn\'t score this attempt: ${res.error}` }])
        }
      } else {
        // Generic tutor endpoint (assumes /api/ai/tutor/ask exists)
        const r = await fetch('/api/ai/tutor/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module, prompt: userMsg.text }) })
        const j = await r.json()
        if (j.ok) setMsgs((m) => [...m, { id: uid(), role: 'assistant', ts: nowIso(), module, text: j.reply }])
        else setMsgs((m) => [...m, { id: uid(), role: 'assistant', ts: nowIso(), module, text: j.error || 'Tutor failed to respond.' }])
      }
    } catch (e: any) {
      setMsgs((m) => [...m, { id: uid(), role: 'assistant', ts: nowIso(), module, text: e?.message || 'Unexpected error' }])
    } finally { setBusy(false) }
  }

  async function startRecording(){
    setRecState('recording')
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    chunksRef.current = []
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    mr.onstop = async () => {
      setRecState('processing')
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      // Upload to a temp URL (assume api/content/upload returns {ok,url})
      const form = new FormData()
      form.append('file', blob, `speaking-${Date.now()}.webm`)
      const up = await fetch('/api/content/upload', { method: 'POST', body: form as any })
      const upj = await up.json()
      if (!upj.ok) { setMsgs((m) => [...m, { id: uid(), role: 'assistant', ts: nowIso(), module: 'speaking', text: 'Upload failed.' }]); setRecState('idle'); return }

      const res = await scoreSpeaking({ attemptId: uid(), audioUrl: upj.url, rubric: 'band_ielts_v2' })
      if (res.ok) {
        setMsgs((m) => [...m, { id: uid(), role: 'assistant', ts: nowIso(), module: 'speaking', text: `**Speaking feedback**\n\n${JSON.stringify(res.feedback, null, 2)}` }])
      } else {
        setMsgs((m) => [...m, { id: uid(), role: 'assistant', ts: nowIso(), module: 'speaking', text: `Couldn\'t score speaking attempt: ${res.error}` }])
      }
      setRecState('idle')
    }
    mr.start()
    mediaRef.current = mr
  }

  function stopRecording(){ mediaRef.current?.stop() }

  const suggestions = module === 'writing'
    ? ['Task 2: Some people think children should begin their formal education at a very early age. Discuss both views and give your opinion.', 'Task 1: Summarize the bar chart trends.']
    : module === 'speaking'
    ? ['Describe a person who inspired you.', 'Talk about a challenge you overcame.']
    : module === 'reading'
    ? ['Help me skim this passage and identify keywords.', 'Explain this True/False/Not Given reasoning.']
    : ['Practice listening gap-fill strategies.', 'Shadow this sentence with me.']

  return (
    <>
      <Head><title>AI Tutor · Labs</title></Head>
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="font-slab text-2xl md:text-3xl">AI Tutor (IELTS)</h1>
              <Link href="/reports/band-analytics" className="inline-flex"><Button variant="outline" className="border-border">Band Analytics</Button></Link>
            </div>
            <p className="mt-1 text-sm text-mutedText">Practice and get instant AI feedback across modules.</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[1fr_320px]">
          {/* Chat */}
          <div className="rounded-2xl border border-lightBorder bg-card p-4">
            {/* Module chips */}
            <div className="mb-3 inline-flex rounded-xl border border-border p-1">
              {(['listening','reading','writing','speaking'] as const).map((m) => (
                <button key={m} onClick={()=>setModule(m)} className={cls('px-3 py-1 rounded-lg capitalize', module===m ? 'bg-primary text-primary-foreground' : 'hover:bg-lightBg')}>{m}</button>
              ))}
            </div>

            {/* Messages */}
            <div className="h-[56vh] overflow-y-auto rounded-xl border border-border bg-background p-3">
              {msgs.map((msg) => (
                <div key={msg.id} className={cls('mb-3 max-w-[80%] rounded-2xl p-3 text-sm',
                  msg.role==='user' ? 'ml-auto bg-electricBlue/10 text-foreground' : 'mr-auto bg-lightBg text-foreground')
                }>
                  {msg.text}
                </div>
              ))}
              {busy && (
                <div className="mr-auto max-w-[80%] rounded-2xl bg-lightBg p-3"><Skeleton className="h-4 w-40" /></div>
              )}
            </div>

            {/* Composer */}
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
              <Input value={input} onChange={(e)=>setInput(e.target.value)} placeholder={module==='writing' ? 'Paste your Task 1/2 answer…' : 'Type your question or prompt…'} className="rounded-xl border border-border bg-background px-3 py-2" />
              <Button onClick={onSend} disabled={busy || !input.trim()} className="bg-accent text-accent-foreground">Send</Button>
            </div>

            {/* Speaking controls */}
            {module==='speaking' && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {recState==='idle' && <Button onClick={startRecording} className="bg-primary text-primary-foreground">Start recording</Button>}
                {recState==='recording' && <Button onClick={stopRecording} className="bg-sunsetRed text-lightText">Stop</Button>}
                {recState==='processing' && <div className="text-sm text-mutedText">Processing…</div>}
              </div>
            )}

            {/* Quick suggestions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button key={i} onClick={()=>{ setInput(s) }} className="rounded-xl border border-border bg-background px-3 py-2 text-xs hover:bg-lightBg">{s}</button>
              ))}
            </div>
          </div>

          {/* Plan sidebar */}
          <aside className="rounded-2xl border border-lightBorder bg-card p-4">
            <h3 className="font-slab text-lg">My Plan</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="rounded-xl border border-border bg-background p-3">Writing: 3 tasks / week</li>
              <li className="rounded-xl border border-border bg-background p-3">Speaking: 2 recordings / week</li>
              <li className="rounded-xl border border-border bg-background p-3">Reading: 4 passages / week</li>
              <li className="rounded-xl border border-border bg-background p-3">Listening: 4 sections / week</li>
            </ul>
            <div className="mt-3 text-sm text-mutedText">Progress updates appear as you practice.</div>
          </aside>
        </section>
      </main>
    </>
  )
}
