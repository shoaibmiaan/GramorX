// components/ai/SidebarAI.tsx
// Mobile-first, DS-aligned, split-screen sidebar. Minimal UI; no external icon deps.
// Desktop: docks on the right and pushes the page left (without wrecking layout). Mobile: docks at the bottom and pushes content up.
// Requirements implemented:
// - No bullet spam: we nudge the model and strip leading '*'/'-'/digits from lines in rendering.
// - "Who are you?" → fixed answer: "I am your coach hired for you by your Partner GramorX".
// - Autofocus textarea when opening the sidebar.
// - Split-screen that doesn't distort the rest of the page: we pad #__next instead of body.
// - On refresh: sidebar closed and chat cleared (no persistence). Reopen → new chat.
// - Click outside the sidebar closes it, but the chat remains in memory until refresh.

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from 'react';
import { useRouter } from 'next/router';

// ---- Types
 type Msg = { id: string; role: 'user' | 'assistant'; content: string };
 type WireMsg = { role: 'system' | 'user' | 'assistant'; content: string };
 type Provider = 'auto' | 'gemini' | 'groq' | 'openai';
 type ConnState = 'idle' | 'connecting' | 'streaming' | 'stalled' | 'error' | 'offline';

// ---- Local flags
 const isBrowser = typeof window !== 'undefined';

// ---- Helpers
 function useLocalHistory() {
  // No persistence by request: fresh on reload
  const [items, setItems] = useState<Msg[]>([]);
  return { items, setItems };
 }

 function useProvider() {
  // Keep simple; default 'auto'. Can expose UI later if needed.
  const [p] = useState<Provider>('auto');
  return { provider: p };
 }

 function useIsMobile() {
  const [m, setM] = useState<boolean>(() => (isBrowser ? window.innerWidth < 768 : true));
  useEffect(() => {
    if (!isBrowser) return;
    const on = () => setM(window.innerWidth < 768);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return m;
 }

 function friendlyAdvice(err: string, isOffline: boolean) {
  if (isOffline) return 'You are offline — check your internet.';
  const s = (err || '').toLowerCase();
  if (s.includes('timeout')) return 'The link is slow or down — try again in a moment.';
  if (s.includes('fetch') || s.includes('network') || s.includes('failed'))
    return 'Link down or network blocked (Adblock/VPN) — disable blocker or check network.';
  if (s.includes('unauthorized') || s.includes('api key'))
    return 'Service API key missing/invalid — contact admin.';
  if (s.includes('404')) return 'API route not found — ensure /pages/api/ai/* exists and restart dev.';
  return 'System issue — try again or switch provider.';
 }

 // --- Streaming helper (SSE -> chunks)
 async function* streamChat(messages: WireMsg[], provider: Provider) {
  const qs = provider === 'auto' ? '' : `?p=${provider}`;
  const body = { messages: messages.map((m) => ({ role: m.role, content: m.content })) };
  const res = await fetch(`/api/ai/chat${qs}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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

 // --- Minimal md-ish renderer (and strip bullet prefixes)
 function renderBlocks(raw: string) {
  const parts = raw.split(/```/g);
  return parts.map((chunk, i) => {
    const isCode = i % 2 === 1;
    if (isCode) {
      return (
        <pre
          key={`pre-${i}`}
          className="whitespace-pre-wrap rounded-xl bg-card text-muted-foreground border border-border p-3 text-caption overflow-x-auto"
        >
          {chunk}
        </pre>
      );
    }
    // Strip leading list markers: *, -, or 1.
    const clean = chunk.replace(/^\s*([*\-]|\d+\.)\s+/gm, '');
    return (
      <p key={`p-${i}`} className="whitespace-pre-wrap leading-relaxed">
        {clean}
      </p>
    );
  });
 }

 export function SidebarAI() {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Open state — always closed on refresh
  const [open, setOpen] = useState<boolean>(false);

  // Width (desktop only)
  const [width, setWidth] = useState<number>(420);

  // Mobile dock height (split-screen). Defaults to ~46% of viewport height.
  const [mHeight, setMHeight] = useState<number>(() => (isBrowser ? Math.round(window.innerHeight * 0.46) : 420));
  useEffect(() => {
    if (!isBrowser) return;
    const on = () => setMHeight(Math.round(window.innerHeight * 0.46));
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  // Chat state
  const { items, setItems } = useLocalHistory();
  const { provider } = useProvider();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ConnState>('idle');
  const [statusNote, setStatusNote] = useState<string>('');
  const [streamingId, setStreamingId] = useState<string | null>(null);
  // Voice state
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const voiceSupported = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastChunkRef = useRef<number>(0);
  const stallTimerRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);

  // System prompt: NO bullets; prefer short sentences. Special rule for "who are you?".
  const system = useMemo<WireMsg>(
    () => ({
      role: 'system',
      content: [
        "You are GramorX's sidebar AI coach.",
        'Write in short, clear sentences. Avoid bullet lists unless the user explicitly asks for bullets.',
        'If asked "who are you" (or similar), answer exactly: I am your coach hired for you by your Partner GramorX.',
        'If IELTS context, offer 1–3 next steps, but as sentences, not bullets.',
      ].join(' '),
    }),
    []
  );

  // Toggle via keyboard
  const toggle = useCallback(() => setOpen((v) => !v), []);
  (toggle as any)._close = () => setOpen(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') (toggle as any)._close?.();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    if (isBrowser) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [toggle]);

  // Open if ?sidebar=1 is present (fresh chat)
  useEffect(() => {
    if (!router?.query) return;
    if ((router.query.sidebar as string) === '1') setOpen(true);
  }, [router.query]);

  // Apply split-screen offsets to #__next (not body) to avoid layout breaks
  useEffect(() => {
    if (!isBrowser) return;
    const root = document.documentElement;
    if (open) {
      if (isMobile) {
        root.classList.add('gx-ai-open-bottom');
        root.classList.remove('gx-ai-open');
        root.style.setProperty('--gx-ai-bottom', `${mHeight}px`);
        root.style.setProperty('--gx-ai-right', '0px');
      } else {
        root.classList.add('gx-ai-open');
        root.classList.remove('gx-ai-open-bottom');
        root.style.setProperty('--gx-ai-right', `${width}px`);
        root.style.setProperty('--gx-ai-bottom', '0px');
      }
    } else {
      root.classList.remove('gx-ai-open', 'gx-ai-open-bottom');
      root.style.setProperty('--gx-ai-right', '0px');
      root.style.setProperty('--gx-ai-bottom', '0px');
    }
  }, [open, width, mHeight, isMobile]);

  // Autofocus on open
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 50);
  }, [open]);

  // Online/offline
  useEffect(() => {
    if (!isBrowser) return;
    const goOff = () => { setStatus('offline'); setStatusNote('You are offline — check your internet.'); };
    const goOn = () => { setStatus('idle'); setStatusNote(''); };
    window.addEventListener('offline', goOff);
    window.addEventListener('online', goOn);
    return () => { window.removeEventListener('offline', goOff); window.removeEventListener('online', goOn); };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [items, loading, streamingId]);

  // Stall watchdog
  const startWatchdog = () => {
    if (!isBrowser) return;
    if (stallTimerRef.current) window.clearInterval(stallTimerRef.current);
    lastChunkRef.current = Date.now();
    setStatus('connecting');
    setStatusNote('Waiting for response…');
    stallTimerRef.current = window.setInterval(() => {
      const diff = Date.now() - lastChunkRef.current;
      if (status === 'streaming' && diff > 15000) { setStatus('stalled'); setStatusNote('No tokens for a while — network or provider is slow.'); }
      else if (status === 'connecting' && diff > 12000) { setStatus('stalled'); setStatusNote('Connection slow/blocked — try again or switch provider.'); }
    }, 3000) as unknown as number;
  };
  const stopWatchdog = () => {
    if (isBrowser && stallTimerRef.current) {
      window.clearInterval(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  };

  // Hard-coded response for "who are you" intents
  const whoRegex = /\b(who\s*are\s*you|who\s*r\s*u|introduce\s*yourself|your\s+name|who\s+is\s+this|what\s+are\s+you)\b/i;

  // Send
  const send = useCallback(
    async (prompt?: string) => {
      if (!isBrowser) return;
      if (!navigator.onLine) { setStatus('offline'); setStatusNote('You are offline — check your internet.'); return; }
      const content = (prompt ?? input).trim();
      if (!content) return;

      // fresh send prep
      setInput('');
      setLoading(true);

      // Add user msg
      const uId = (crypto as any).randomUUID ? crypto.randomUUID() : String(Date.now());
      setItems((prev) => [...prev, { id: uId, role: 'user', content }]);

      // Special-case: who are you?
      if (whoRegex.test(content)) {
        const aId = (crypto as any).randomUUID ? crypto.randomUUID() : String(Date.now() + 1);
        setItems((prev) => [...prev, { id: aId, role: 'assistant', content: 'I am your coach hired for you by your Partner GramorX.' }]);
        setLoading(false);
        setStatus('idle');
        setStatusNote('');
        setTimeout(() => textareaRef.current?.focus(), 0);
        return;
      }

      startWatchdog();

      // Create streaming assistant shell
      const aId = (crypto as any).randomUUID ? crypto.randomUUID() : String(Date.now() + 1);
      setStreamingId(aId);
      setItems((prev) => [...prev, { id: aId, role: 'assistant', content: '' }]);

      try {
        const history = [...items, { id: uId, role: 'user', content }].slice(-12);
        const wire: WireMsg[] = [system, ...history.map((m) => ({ role: m.role, content: m.content }))];
        let acc = '';
        for await (const chunk of streamChat(wire, provider)) {
          if (status !== 'streaming') { setStatus('streaming'); setStatusNote('Receiving…'); }
          lastChunkRef.current = Date.now();
          acc += chunk;
          setItems((prev) => prev.map((m) => (m.id === aId ? { ...m, content: acc } : m)));
        }
        setStatus('idle'); setStatusNote('');
      } catch (e: any) {
        setStatus('error');
        const advice = friendlyAdvice(e?.message || 'failed', !navigator.onLine);
        setStatusNote(advice);
        setItems((prev) => prev.map((m) => (m.id === aId ? { ...m, content: `❌ ${e?.message || 'failed'}` } : m)));
      } finally {
        stopWatchdog();
        setStreamingId(null);
        setLoading(false);
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    },
    [input, items, setItems, system, provider, status]
  );

  // New chat button handler
  const newChat = useCallback(() => {
    setItems([]);
    setInput('');
    setStatusNote('');
    setStreamingId(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [setItems]);

  // Voice recognition (browser only)
  const startVoice = useCallback(() => {
    if (!voiceSupported) { setStatusNote('Voice input is not supported.'); setTimeout(() => setStatusNote(''), 1500); return; }
    if (listening) return;
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onstart = () => { setListening(true); setStatusNote('Listening…'); };
    let finalText = '';
    rec.onresult = (e: any) => {
      let draft = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript; else draft += res[0].transcript;
      }
      const next = (finalText + ' ' + draft).trim();
      setInput(next);
    };
    rec.onerror = () => { setListening(false); setStatus('error'); setStatusNote('Mic error.'); };
    rec.onend = () => { setListening(false); setStatusNote(''); textareaRef.current?.focus(); };
    recRef.current = rec; rec.start();
  }, [voiceSupported, listening]);

  const stopVoice = useCallback(() => { try { recRef.current?.stop(); } catch {} setListening(false); }, []);
  const toggleVoice = useCallback(() => { listening ? stopVoice() : startVoice(); }, [listening, startVoice, stopVoice]);

  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  // Resizer (desktop only)
  useEffect(() => {
    if (!isBrowser) return;
    const onMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const vw = window.innerWidth;
      const newW = Math.min(Math.max(vw - e.clientX, 340), 720);
      setWidth(newW);
    };
    const onUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // Auto-grow textarea up to 6 lines
  useEffect(() => {
    const el = textareaRef.current; if (!el) return;
    el.style.height = 'auto';
    const max = 6; // lines
    const lineHeight = 20; // approx
    const next = Math.min(el.scrollHeight, max * lineHeight + 16);
    el.style.height = `${next}px`;
  }, [input]);

  // UI bits
  const statusDot =
    status === 'streaming' || status === 'connecting' ? 'bg-primary'
    : status === 'stalled' ? 'bg-accent'
    : status === 'offline' || status === 'error' ? 'bg-destructive'
    : 'bg-muted-foreground';

  // Transition per form factor
  const sheetTrans = isMobile ? (open ? 'translate-y-0' : 'translate-y-full') : (open ? 'translate-x-0' : 'translate-x-full');

  return (
    <Fragment>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[60] rounded-full shadow-lg px-4 py-3 text-small font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
          title="Open AI (Alt+A)"
        >
          ✨ AI
        </button>
      )}

      {/* Outside click catcher (does NOT darken UI) */}
      {open && (
        <div
          className="fixed z-[60]"
          style={isMobile ? { left: 0, right: 0, top: 0, bottom: mHeight } : { left: 0, top: 0, bottom: 0, right: width }}
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar (split-screen) */}
      <aside
        className={`fixed z-[61] bg-background border-border shadow-xl transition-transform duration-300 ${isMobile ? 'left-0 right-0 bottom-0 border-t' : 'top-0 right-0 border-l'} ${sheetTrans} ${isMobile ? '' : 'h-screen'}`}
        style={isMobile ? { height: mHeight } : { width }}
        aria-label="AI sidebar"
      >
        {/* Resizer (hidden on mobile) */}
        {!isMobile && (
          <div
            className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-border"
            onMouseDown={(e) => { e.preventDefault(); resizingRef.current = true; document.body.style.userSelect = 'none'; document.body.style.cursor = 'col-resize'; }}
            title="Drag to resize"
          />
        )}

        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-3 md:px-4 h-14">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold truncate">GramorX AI</span>
              <span className={`inline-block h-2 w-2 rounded-full ${statusDot}`} aria-label={`status: ${status}`} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={newChat} className="h-8 px-3 rounded-md bg-card border border-border hover:bg-accent text-caption" aria-label="New chat">New</button>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-md bg-card border border-border grid place-items-center" aria-label="Close">✕</button>
            </div>
          </div>
          {statusNote && (
            <div className="px-3 md:px-4 py-1 text-tiny text-muted-foreground bg-muted border-t border-border">
              {statusNote}
            </div>
          )}
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className={`${isMobile ? 'h-[calc(100svh-8.5rem)]' : 'h-[calc(100vh-8.5rem)]'} overflow-y-auto px-3 md:px-4 py-3 space-y-3`}
        >
          {items.length === 0 && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-border mb-3">
                <span className="text-h4">✨</span>
              </div>
              <div className="text-small">
                Hi, I’m your coach — hired for you by your Partner GramorX. Speak or type to begin.
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button onClick={newChat} className="text-caption rounded-full px-3 py-1 bg-card border border-border hover:bg-accent">New chat</button>
                <button onClick={toggleVoice} disabled={!voiceSupported} className="text-caption rounded-full px-3 py-1 border border-border bg-card hover:bg-accent disabled:opacity-50" title={voiceSupported ? (listening ? 'Stop voice' : 'Speak') : 'Voice not supported'}>
                  🎙 {listening ? 'Stop' : 'Speak'}
                </button>
              </div>
              <div className="mt-2 text-tiny text-muted-foreground/80">Tip: Alt+A toggles anywhere.</div>
            </div>
          )}

          {items.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl px-3 py-2 text-small leading-relaxed border ${
                m.role === 'user' ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-card-foreground border-border'
              }`}
              aria-live={m.id === streamingId ? 'polite' : undefined}
            >
              <div className="text-micro uppercase tracking-wider text-muted-foreground mb-1">
                {m.role === 'user' ? 'You' : 'GramorX AI'}
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {renderBlocks(m.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-caption text-muted-foreground animate-pulse">Thinking…</div>
          )}
        </div>

        {/* Composer */}
        <div className="sticky bottom-0 border-t border-border p-2 md:p-3 bg-background">
          <div className="flex items-end gap-2">
            <button
              onClick={toggleVoice}
              disabled={!voiceSupported}
              className={`h-10 w-10 rounded-full border border-border ${listening ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'} disabled:opacity-50`}
              title={voiceSupported ? (listening ? 'Stop voice' : 'Speak') : 'Voice not supported'}
              aria-label="Voice input"
            >
              🎙
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              rows={1}
              placeholder="Type or tap 🎙 to speak… (Enter to send, Shift+Enter = new line)"
              className="w-full resize-none rounded-2xl border border-border bg-background px-3 py-2 text-small outline-none focus:ring-2 focus:ring-primary/40"
              style={{ maxHeight: 148 }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim() || !!streamingId}
              className="rounded-2xl h-10 min-w-[88px] px-4 md:px-3 text-small font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </aside>
    </Fragment>
  );
 }

export default SidebarAI;
