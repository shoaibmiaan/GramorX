// components/ai/SidebarAI.tsx
// Mobile-first, DS-aligned, split-screen sidebar. Minimal UI; no external icon deps.
// Desktop: docks on the right and pushes the page left (pads #__next). Mobile: docks at the bottom and pushes content up.
// Requirements implemented:
// - No bullet spam: we nudge the model and strip leading '*'/'-'/digits from lines in rendering.
// - "Who are you?" → fixed answer: "I am your coach hired for you by your Partner GramorX" (exact string).
// - Autofocus textarea when opening the sidebar.
// - Split-screen that doesn't distort the rest of the page: we pad #__next instead of body.
// - On refresh: sidebar closed and chat cleared (no persistence) unless "Remember" is enabled.
// - Click outside the sidebar closes it, but the chat remains in memory until refresh (or clear).
// - Provider selector persisted (auto/gemini/groq/openai).
// - SSE streaming with basic stalled/offline/error states.

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
let rehypeHighlight: (typeof import('rehype-highlight'))['default'] | undefined;

import('rehype-highlight')
  .then((mod) => {
    rehypeHighlight = mod.default;
  })
  .catch(() => {});

import { useRouter } from 'next/router';
import { Button, Select, Textarea } from '@/components/design-system';

// ---- Types
type Msg = { id: string; role: 'user' | 'assistant'; content: string };
type WireMsg = { role: 'system' | 'user' | 'assistant'; content: string };
type Provider = 'auto' | 'gemini' | 'groq' | 'openai';
type ConnState = 'idle' | 'connecting' | 'streaming' | 'stalled' | 'error' | 'offline';

// ---- Local flags
const isBrowser = typeof window !== 'undefined';

// ---- Helpers
function uid() {
  // tiny uid for keys
  return Math.random().toString(36).slice(2, 10);
}

function useLocalHistory(persist: boolean) {
  const key = 'gx-ai:sidebar-thread';
  const [items, setItems] = useState<Msg[]>(() => {
    if (!persist || !isBrowser) return [];
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Msg[]) : [];
    } catch {
      return [];
    }
  });

  // Load stored history when enabling persistence later
  useEffect(() => {
    if (!persist || !isBrowser) return;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setItems(Array.isArray(parsed) ? (parsed as Msg[]) : []);
    } catch {
      setItems([]);
    }
  }, [persist]);

  // Persist to localStorage
  useEffect(() => {
    if (!persist || !isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {}
  }, [items, persist]);

  const clear = useCallback(() => {
    setItems([]);
    if (isBrowser) try { localStorage.removeItem(key); } catch {}
  }, []);

  return { items, setItems, clear };
}

function useProvider() {
  // Persist provider selection in localStorage
  const key = 'gx-ai:sidebar-provider';
  const [p, setP] = useState<Provider>(() => {
    if (!isBrowser) return 'auto';
    const saved = localStorage.getItem(key);
    return saved === 'gemini' || saved === 'groq' || saved === 'openai' ? (saved as Provider) : 'auto';
  });
  useEffect(() => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, p);
    } catch {}
  }, [p]);
  return { provider: p, setProvider: setP };
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
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
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

// --- Markdown renderer with bullet stripping and code fencing
export function renderMarkdown(raw: string) {
  // Strip obvious bullet leaders from each line (defensive)
  const cleaned = raw
    .split('\n')
    .map((line) => line.replace(/^\s*([*\-]|\d+\.)\s+/g, ''))
    .join('\n');

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={rehypeHighlight ? [rehypeHighlight] : []}
      skipHtml
      components={{
        // Strip bullets by rendering lists as plain paragraphs
        ul: ({ children }) => <>{children}</>,
        ol: ({ children }) => <>{children}</>,
        li: ({ children }) => (
          <p className="whitespace-pre-wrap leading-relaxed">{children}</p>
        ),
        p: ({ children }) => (
          <p className="whitespace-pre-wrap leading-relaxed">{children}</p>
        ),
        code({ inline, className, children }) {
          if (inline) {
            return <code className={className}>{children}</code>;
          }
          return (
            <pre className="whitespace-pre-wrap rounded-xl bg-card text-muted-foreground border border-border p-3 text-caption overflow-x-auto">
              <code className={className}>{children}</code>
            </pre>
          );
        },
      }}
    >
      {cleaned}
    </ReactMarkdown>
  );
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

  // Padding the page root instead of body
  useEffect(() => {
    if (!isBrowser) return;
    const root = document.getElementById('__next');
    if (!root) return;
    if (!open) {
      root.style.paddingRight = '';
      root.style.paddingBottom = '';
      return;
    }
    if (isMobile) {
      root.style.paddingBottom = `${mHeight}px`;
      root.style.paddingRight = '';
    } else {
      root.style.paddingRight = `${width}px`;
      root.style.paddingBottom = '';
    }
    return () => {
      if (!root) return;
      root.style.paddingRight = '';
      root.style.paddingBottom = '';
    };
  }, [open, width, mHeight, isMobile]);

  // Persistence toggle (chat history)
  const [persist, setPersist] = useState<boolean>(() =>
    isBrowser ? localStorage.getItem('gx-ai:sidebar-persist') === '1' : false
  );
  useEffect(() => {
    if (!isBrowser) return;
    localStorage.setItem('gx-ai:sidebar-persist', persist ? '1' : '0');
  }, [persist]);

  // Chat state (with clear for history)
  const { items, setItems, clear } = useLocalHistory(persist);

  // Provider state (selectable, persisted)
  const { provider, setProvider } = useProvider();

  const [input, setInput] = useState('');
  const [conn, setConn] = useState<ConnState>('idle');
  const [err, setErr] = useState<string>('');

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const outerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<boolean>(false);
  const dragStartRef = useRef<number>(0);
  const origSizeRef = useRef<number>(0);
  const stalledTimerRef = useRef<any>(null);

  // Autofocus when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Close on route change (but keep chat state unless cleared)
  useEffect(() => {
    const onRoute = () => setOpen(false);
    router.events.on('routeChangeStart', onRoute);
    return () => {
      router.events.off('routeChangeStart', onRoute);
    };
  }, [router.events]);

  // Offline/online
  const [offline, setOffline] = useState<boolean>(isBrowser ? !navigator.onLine : false);
  useEffect(() => {
    if (!isBrowser) return;
    const on = () => setOffline(!navigator.onLine);
    window.addEventListener('online', on);
    window.addEventListener('offline', on);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', on);
    };
  }, []);

  // Outside click to close (overlay handles this as well)
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!outerRef.current) return;
      if (outerRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Drag to resize
  useEffect(() => {
    if (!isBrowser) return;
    function move(e: MouseEvent | TouchEvent) {
      if (!dragRef.current) return;
      if (isMobile) {
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        const viewportH = window.innerHeight;
        // Height is from bottom; if drag handle moves, we invert.
        const newH = Math.min(Math.max(viewportH - clientY, 240), Math.round(viewportH * 0.9));
        setMHeight(newH);
      } else {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const viewportW = window.innerWidth;
        const newW = Math.min(Math.max(viewportW - clientX, 320), Math.round(viewportW * 0.6));
        setWidth(newW);
      }
    }
    function up() {
      dragRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    window.addEventListener('mousemove', move as any);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move as any, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move as any);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move as any as any);
      window.removeEventListener('touchend', up);
    };
  }, [isMobile]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    dragRef.current = true;
    dragStartRef.current = 'touches' in e ? e.touches[0].clientX : (e as any).clientX;
    origSizeRef.current = isMobile ? mHeight : width;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = isMobile ? 'ns-resize' : 'ew-resize';
  };

  // Build system prompt (nudge: bullet-free, concise)
  const systemPrompt = useMemo(
    () =>
      [
        'You are a concise, helpful assistant.',
        'Write in tight paragraphs. Avoid lists unless explicitly requested.',
        'Do not start lines with bullets, hyphens, or numbers unless the user asked for a list.',
        'Keep tone supportive but direct.',
      ].join(' '),
    []
  );

  // Intercept "who are you?"
  const isWhoAreYou = (s: string) => s.trim().toLowerCase().replace(/[?.!]+$/, '') === 'who are you';

  // Send message (with SSE streaming)
  const send = useCallback(
    async (raw: string) => {
      const content = raw.trim();
      if (!content || conn === 'streaming' || offline) return;

      // Local optimistic add
      const newUser: Msg = { id: uid(), role: 'user', content };
      setItems((prev) => [...prev, newUser]);

      // Fixed answer path
      if (isWhoAreYou(content)) {
        const fixed: Msg = {
          id: uid(),
          role: 'assistant',
          content: 'I am your coach hired for you by your Partner GramorX',
        };
        setItems((prev) => [...prev, fixed]);
        setInput('');
        return;
      }

      setConn('connecting');
      setErr('');

      // Prepare wire messages
      const wire: WireMsg[] = [
        { role: 'system', content: systemPrompt },
        ...items.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content },
      ];

      // Stall watchdog
      if (stalledTimerRef.current) clearTimeout(stalledTimerRef.current);
      stalledTimerRef.current = setTimeout(() => {
        setConn((c) => (c === 'streaming' || c === 'connecting' ? 'stalled' : c));
      }, 12000);

      try {
        const assistantId = uid();
        let acc = '';
        setItems((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

        setConn('streaming');
        for await (const chunk of streamChat(wire, provider)) {
          acc += chunk;
          setItems((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
          );
          if (conn !== 'streaming') setConn('streaming');
        }
        setConn('idle');
      } catch (e: any) {
        setConn(offline ? 'offline' : 'error');
        setErr(String(e?.message || e));
      } finally {
        if (stalledTimerRef.current) {
          clearTimeout(stalledTimerRef.current);
          stalledTimerRef.current = null;
        }
      }

      setInput('');
    },
    [conn, offline, items, provider, setItems, systemPrompt]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  // UI bits
  const header = (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="font-medium">Coach</span>
        <span className="text-muted-foreground text-caption">Sidebar</span>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-caption text-muted-foreground select-none">
          <input
            type="checkbox"
            checked={persist}
            onChange={(e) => setPersist(e.target.checked)}
          />
          Remember
        </label>
        <Select
          value={provider}
          onChange={(v: Provider) => setProvider(v)}
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'gemini', label: 'Gemini' },
            { value: 'groq', label: 'Groq' },
            { value: 'openai', label: 'OpenAI' },
          ]}
          className="w-[120px]"
        />
        <Button
          variant="ghost"
          onClick={() => setOpen(false)}
          aria-label="Close"
          title="Close"
        >
          ✕
        </Button>
      </div>
    </div>
  );

  const footer = (
    <div className="border-t border-border p-3">
      <div className="flex gap-2 items-start">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e: any) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask anything…"
          className="min-h-[44px] max-h-[160px] flex-1"
          disabled={conn === 'streaming' || offline}
        />
        <Button
          onClick={() => send(input)}
          disabled={!input.trim() || conn === 'streaming' || offline}
        >
          Send
        </Button>
      </div>
      <div className="flex items-center justify-between mt-2 text-caption text-muted-foreground">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={clear} title="Clear chat (resets memory)">
            Clear
          </Button>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            title="Hide (chat stays until refresh/clear)"
          >
            Hide
          </Button>
        </div>
        <div>
          {conn === 'streaming' && <span>Generating…</span>}
          {conn === 'connecting' && <span>Connecting…</span>}
          {conn === 'stalled' && <span>Stalled — still trying…</span>}
          {conn === 'offline' && <span>Offline</span>}
          {conn === 'error' && (
            <span className="text-red-500">
              {friendlyAdvice(err, offline)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const chat = (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
      {items.length === 0 ? (
        <div className="text-muted-foreground text-caption">
          No messages yet. Ask a question to start.
        </div>
      ) : (
        items.map((m) => (
          <div
            key={m.id}
            className={
              m.role === 'user'
                ? 'ml-auto max-w-[85%] rounded-xl bg-primary text-primary-foreground px-3 py-2'
                : 'mr-auto max-w-[85%] rounded-xl bg-card border border-border text-foreground px-3 py-2'
            }
          >
            {m.role === 'assistant' ? renderMarkdown(m.content) : <p className="whitespace-pre-wrap">{m.content}</p>}
          </div>
        ))
      )}
    </div>
  );

  // Launcher button
  const launcher = (
    <Button
      onClick={() => setOpen(true)}
      className="fixed bottom-4 right-4 z-40 shadow-lg"
      aria-haspopup="dialog"
      aria-expanded={open}
      title="Open Coach"
    >
      Open Coach
    </Button>
  );

  // Panel (desktop right / mobile bottom)
  const panel = (
    <div
      ref={outerRef}
      className="fixed z-40 bg-background border-border border shadow-xl flex flex-col"
      style={
        isMobile
          ? {
              left: 0,
              right: 0,
              bottom: 0,
              height: mHeight,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
            }
          : {
              top: 0,
              right: 0,
              width,
              height: '100vh',
            }
      }
      role="dialog"
      aria-modal="true"
      aria-label="AI Coach Sidebar"
    >
      {header}
      {/* Drag handle */}
      <div
        onMouseDown={startDrag as any}
        onTouchStart={startDrag as any}
        className={
          isMobile
            ? 'h-3 w-full cursor-ns-resize flex items-center justify-center'
            : 'w-3 h-full cursor-ew-resize absolute left-[-3px] top-0'
        }
        title="Drag to resize"
      >
        {isMobile && (
          <div className="w-12 h-1 rounded-full bg-border" />
        )}
      </div>
      {chat}
      {footer}
    </div>
  );

  // Overlay to close on outside click
  const overlay = (
    <div
      className="fixed inset-0 bg-black/20 z-30"
      onClick={() => setOpen(false)}
      aria-hidden="true"
    />
  );

  return (
    <Fragment>
      {!open && launcher}
      {open && overlay}
      {open && panel}
    </Fragment>
  );
}

export default SidebarAI;
