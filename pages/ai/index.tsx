// pages/ai/index.tsx
// Beautiful, minimal chat page (mobile-first) using your DS tokens.
// Uses /api/ai/chat (SSE-style) and optional /api/ai/health.
// No external icon deps; pure Tailwind + your DS variables.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';

type Msg = { id: string; role: 'user' | 'assistant'; content: string };
type WireMsg = { role: 'system' | 'user' | 'assistant'; content: string };
type Provider = 'auto' | 'gemini' | 'groq' | 'openai';

const LS_THREAD = 'gx-ai:page-thread:v1';
const LS_BREVITY = 'gx-ai:page-brief:v1';
const isBrowser = typeof window !== 'undefined';

function safeGet<T>(k: string, def: T): T {
  if (!isBrowser) return def;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : def;
  } catch {
    return def;
  }
}

// Minimal markdown-ish renderer that respects code fences
function renderBlocks(raw: string) {
  const parts = raw.split(/```/g);
  return parts.map((chunk, i) => {
    const isCode = i % 2 === 1;
    if (isCode) {
      return (
        <pre
          key={`pre-${i}`}
          className="whitespace-pre-wrap rounded-xl bg-card text-muted-foreground border border-border p-3 text-[12px] overflow-x-auto"
        >
          {chunk}
        </pre>
      );
    }
    return (
      <p key={`p-${i}`} className="whitespace-pre-wrap leading-relaxed">
        {chunk}
      </p>
    );
  });
}

// SSE streaming reader for /api/ai/chat
async function* streamChat(messages: WireMsg[], provider: Provider = 'auto') {
  const qs = provider === 'auto' ? '' : `?p=${provider}`;
  const res = await fetch(`/api/ai/chat${qs}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.body) throw new Error(`No stream body (status ${res.status})`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      const l = line.trim();
      if (!l.startsWith('data:')) continue;
      const data = l.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data);
        if (json?.error) throw new Error(json.error);
        const delta = json?.choices?.[0]?.delta?.content ?? '';
        if (delta) yield delta as string;
      } catch (e: any) {
        yield `\n\n❌ ${e?.message || 'stream parse error'}`;
        return;
      }
    }
  }
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Msg[]>(() => safeGet<Msg[]>(LS_THREAD, []));
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [brief] = useState<boolean>(() => safeGet<boolean>(LS_BREVITY, true));
  const [statusNote, setStatusNote] = useState<string>('');
  const [provider] = useState<Provider>('auto'); // keep UI minimal; can expose later if needed
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastChunkAt = useRef<number>(0);
  const stallTimer = useRef<number | null>(null);

  // Persist thread
  useEffect(() => {
    if (!isBrowser) return;
    localStorage.setItem(LS_THREAD, JSON.stringify(messages));
  }, [messages]);

  // System prompt – concise by default
  const system = useMemo<WireMsg>(
    () => ({
      role: 'system',
      content:
        `You are GramorX's AI tutor. Be direct and ${brief ? 'very concise (bullets, max 6 lines)' : 'clear and structured'}. ` +
        `If the topic is IELTS, give 1–3 actionable next steps.`,
    }),
    [brief]
  );

  // Scroll to bottom on updates
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, streamingId]);

  // Stall & connectivity status
  const startWatchdog = useCallback(() => {
    if (!isBrowser) return;
    if (stallTimer.current) window.clearInterval(stallTimer.current);
    lastChunkAt.current = Date.now();
    setStatusNote('Connecting…');
    stallTimer.current = window.setInterval(() => {
      const diff = Date.now() - lastChunkAt.current;
      if (diff > 15000) setStatusNote('Slow stream — network/provider might be busy.');
      else if (diff > 8000) setStatusNote('Receiving…');
    }, 2000) as unknown as number;
  }, []);
  const stopWatchdog = useCallback(() => {
    if (stallTimer.current) {
      window.clearInterval(stallTimer.current);
      stallTimer.current = null;
      setStatusNote('');
    }
  }, []);

  const send = useCallback(
    async (override?: string) => {
      const content = (override ?? input).trim();
      if (!content || busy) return;
      if (!navigator.onLine) {
        setStatusNote('You are offline — check your internet.');
        return;
      }

      setBusy(true);
      setInput('');
      startWatchdog();

      const uId = crypto.randomUUID();
      setMessages((m) => [...m, { id: uId, role: 'user', content }]);

      const aId = crypto.randomUUID();
      setStreamingId(aId);
      setMessages((m) => [...m, { id: aId, role: 'assistant', content: '' }]);

      try {
        const history: WireMsg[] = [
          system,
          ...[...messages, { id: uId, role: 'user', content }].slice(-12).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ];

        let acc = '';
        for await (const chunk of streamChat(history, provider)) {
          lastChunkAt.current = Date.now();
          acc += chunk;
          setMessages((prev) => prev.map((msg) => (msg.id === aId ? { ...msg, content: acc } : msg)));
          if (!statusNote) setStatusNote('Receiving…');
        }
      } catch (e: any) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aId ? { ...msg, content: `❌ ${e?.message || 'failed'}` } : msg))
        );
        setStatusNote('System issue — try again.');
      } finally {
        setStreamingId(null);
        setBusy(false);
        stopWatchdog();
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    },
    [input, busy, messages, provider, system, startWatchdog, stopWatchdog, statusNote]
  );

  const newChat = () => {
    if (!messages.length) return;
    const ok = confirm('Start a new chat? This will clear the current conversation.');
    if (!ok) return;
    setMessages([]);
  };

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current; if (!el) return;
    el.style.height = 'auto';
    const max = 6;
    const next = Math.min(el.scrollHeight, max * 20 + 16);
    el.style.height = `${next}px`;
  }, [input]);

  return (
    <>
      <Head>
        <title>Chat with AI — GramorX</title>
      </Head>

      <div className="min-h-[100svh] bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20" />
              <h1 className="font-semibold tracking-tight">Chat with AI</h1>
            </div>
            <div className="flex items-center gap-2">
              {statusNote && (
                <span className="text-[11px] text-muted-foreground hidden sm:inline">{statusNote}</span>
              )}
              <button
                onClick={newChat}
                className="text-xs rounded-md border border-border bg-card hover:bg-accent px-3 py-1"
                title="New chat"
              >
                New
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4">
            {/* Empty state */}
            {messages.length === 0 && (
              <section className="py-10 text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-border mb-3">
                  <span className="text-lg">✨</span>
                </div>
                <h2 className="text-lg font-semibold">How can I help?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask anything IELTS or study-related. I’ll keep it concise and actionable.
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {[
                    '7-Day IELTS plan for Band 7.5',
                    'Explain True/False/Not Given traps',
                    'Band 8 outline for tech & privacy',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-xs rounded-full px-3 py-1 bg-card border border-border hover:bg-accent"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Messages */}
            <div
              ref={scrollRef}
              className="space-y-3 pb-36 pt-4"
            >
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed border ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-card-foreground border-border'
                    }`}
                    aria-live={m.id === streamingId ? 'polite' : undefined}
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      {m.role === 'user' ? 'You' : 'GramorX AI'}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {renderBlocks(m.content)}
                    </div>
                  </div>
                </div>
              ))}

              {busy && (
                <div className="text-xs text-muted-foreground animate-pulse">Thinking…</div>
              )}
            </div>
          </div>
        </main>

        {/* Composer */}
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ask anything… (Enter to send, Shift+Enter = new line)"
                className="w-full resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                style={{ maxHeight: 148 }}
              />
              <button
                onClick={() => send()}
                disabled={busy || !input.trim()}
                className="rounded-2xl h-10 min-w-[88px] px-4 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            {statusNote && (
              <div className="text-[11px] text-muted-foreground mt-1">{statusNote}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
