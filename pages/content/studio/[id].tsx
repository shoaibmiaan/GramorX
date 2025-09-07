
// ================================
// File: pages/content/studio/[id].tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { Button } from '@/components/design-system/Button'
import { Input } from '@/components/design-system/Input'
import { supabaseServer } from '@/lib/supabaseServer'

export type StudioDetailProps = {
  ok: boolean
  error?: string
  item?: { id: string; title: string; module: 'listening'|'reading'|'writing'|'speaking'|null; status: 'draft'|'published'|'archived'; body: any }
}

export const getServerSideProps: GetServerSideProps<StudioDetailProps> = async (ctx) => {
  const { req, res, params } = ctx
  const id = String(params?.id)
  const supabase = supabaseServer(req as any, res as any)
  const { data, error } = await supabase
    .from('content_items')
    .select('id, title, module, status, body')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return { props: { ok: false, error: 'Content not found' } }
  return { props: { ok: true, item: data as any } }
}

export default function StudioDetailPage({ ok, error, item }: StudioDetailProps){
  const [title, setTitle] = React.useState(item?.title || '')
  const [module, setModule] = React.useState(item?.module || null)
  const [status, setStatus] = React.useState(item?.status || 'draft')
  const [body, setBody] = React.useState<string>(JSON.stringify(item?.body || {}, null, 2))
  const [busy, setBusy] = React.useState(false)
  const [toast, setToast] = React.useState<string | null>(null)

  if (!ok || !item){
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-slab text-2xl">Content Studio</h1>
          <p className="mt-2 text-sunsetRed">{error || 'Not found'}</p>
          <Link href="/content/studio" className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-primary-foreground">Back</Link>
        </div>
      </main>
    )
  }

  async function save(){
    setBusy(true)
    try {
      const res = await fetch('/api/content/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, title, module, status, body: JSON.parse(body || '{}') }) })
      const j = await res.json()
      if (j.ok) setToast('Saved!')
      else setToast(j.error || 'Save failed')
    } catch (e: any) {
      setToast(e?.message || 'Save failed')
    } finally { setBusy(false); setTimeout(()=>setToast(null), 1500) }
  }

  return (
    <>
      <Head><title>{item.title} · Studio</title></Head>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-5xl px-4 py-6">
          <div className="rounded-2xl border border-lightBorder bg-card p-6">
            <header className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl">Edit Content</h1>
              <div className="flex gap-2">
                <Button onClick={save} disabled={busy} className="bg-primary text-primary-foreground">{busy ? 'Saving…' : 'Save'}</Button>
                <Link href="/content/studio" className="inline-flex"><Button variant="outline" className="border-border">Back</Button></Link>
              </div>
            </header>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm text-mutedText">Title
                <Input value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-1 rounded-xl border border-border bg-background px-3 py-2" />
              </label>
              <label className="text-sm text-mutedText">Module
                <select value={module ?? ''} onChange={(e)=>setModule((e.target.value || null) as any)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2">
                  <option value="">—</option>
                  <option value="listening">Listening</option>
                  <option value="reading">Reading</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                </select>
              </label>
              <label className="text-sm text-mutedText">Status
                <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block text-sm text-mutedText">Body (JSON)
              <textarea value={body} onChange={(e)=>setBody(e.target.value)} rows={16} className="mt-1 w-full rounded-xl border border-border bg-background p-3 font-mono text-sm" />
            </label>

            {toast && <div className="mt-3 rounded-xl bg-success/15 px-3 py-2 text-sm text-success">{toast}</div>}
          </div>
        </section>
      </main>
    </>
  )
}

