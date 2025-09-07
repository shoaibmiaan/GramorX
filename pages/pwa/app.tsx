
// ================================
// File: pages/pwa/app.tsx
// ================================
import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Button } from '@/components/design-system/Button'

export default function PwaAppPage(){
  const [isOnline, setIsOnline] = React.useState(true)
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [installed, setInstalled] = React.useState(false)

  React.useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline) }
  }, [])

  React.useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler as any)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => { window.removeEventListener('beforeinstallprompt', handler as any) }
  }, [])

  async function install(){
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
  }

  return (
    <>
      <Head><title>PWA · IELTS Portal</title></Head>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-lightBorder bg-card p-6">
            <h1 className="font-slab text-2xl md:text-3xl">IELTS Portal — App</h1>
            <p className="mt-1 text-sm text-mutedText">Install for a faster, offline-friendly experience. Track your plan and practice on the go.</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={`rounded-lg px-2 py-1 text-xs ${isOnline ? 'bg-success/15 text-success' : 'bg-sunsetRed/15 text-sunsetRed'}`}>{isOnline ? 'Online' : 'Offline'}</span>
              {!installed && deferredPrompt && <Button onClick={install} className="bg-primary text-primary-foreground">Install App</Button>}
              {installed && <span className="rounded-lg bg-primary/15 px-2 py-1 text-xs text-primary">Installed</span>}
              <Link href="/practice" className="inline-flex"><Button variant="outline" className="border-border">Open Practice</Button></Link>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-sm text-mutedText">Quick Links</div>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  <li><Link href="/labs/ai-tutor" className="text-electricBlue underline">AI Tutor</Link></li>
                  <li><Link href="/reports/band-analytics" className="text-electricBlue underline">Band Analytics</Link></li>
                  <li><Link href="/marketplace" className="text-electricBlue underline">Find a Coach</Link></li>
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-sm text-mutedText">Offline cache</div>
                <p className="mt-1 text-sm">Static assets will be cached if you enable a service worker (next-pwa or custom). This page detects install prompts and network state.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-sm text-mutedText">Plan</div>
                <p className="mt-1 text-sm">Your weekly targets sync to local storage so you can track even when offline. (Hook up to your store.)</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
