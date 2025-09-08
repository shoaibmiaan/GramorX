// components/ai/SidebarAI.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import SidebarHeader from './SidebarHeader';
import MessageList, { Msg } from './MessageList';
import Composer from './Composer';

/** Minimal public types so other files can import without errors. */
export type Provider = 'grok' | 'gemini' | 'openai' | 'none';
export type ConnState = 'idle' | 'connecting' | 'online' | 'streaming' | 'stalled' | 'error';

type SidebarState = {
  open: boolean;
  setOpen: (v: boolean) => void;
  provider: Provider;
  setProvider: (p: Provider) => void;
  conn: ConnState;
  setConn: (c: ConnState) => void;
};

/** Lightweight context so hooks don’t crash if mounted. */
const Ctx = createContext<SidebarState | null>(null);

export const SidebarAIProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<Provider>('none');
  const [conn, setConn] = useState<ConnState>('idle');

  const value = useMemo(
    () => ({ open, setOpen, provider, setProvider, conn, setConn }),
    [open, provider, conn]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

/** Safe no-op hook (returns defaults if provider not mounted). */
export function useSidebarAI() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      open: false,
      setOpen: (_: boolean) => {},
      provider: 'none' as Provider,
      setProvider: (_: Provider) => {},
      conn: 'idle' as ConnState,
      setConn: (_: ConnState) => {},
    };
  }
  return ctx;
}

/**
 * Minimal markdown renderer used by AI components.
 * - Strips markdown list markers to plain paragraphs.
 * - Supports fenced code blocks with optional language tag.
 */
export function renderMarkdown(raw: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  const parts = raw.split(/```/g);

  parts.forEach((chunk, i) => {
    if (i % 2 === 1) {
      const langMatch = chunk.match(/^(\w+)\n/);
      const lang = langMatch ? langMatch[1] : '';
      const code = langMatch ? chunk.slice(lang.length + 1) : chunk;
      nodes.push(
        <pre key={`code-${i}`} className="mt-2 overflow-auto rounded-ds bg-card p-3 text-card-foreground">
          <code className={lang ? `language-${lang}` : undefined}>{code}</code>
        </pre>
      );
    } else {
      const lines = chunk.split(/\n+/);
      lines.forEach((line, j) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const text = trimmed.replace(/^(?:[*+-]|\d+\.)\s+/, '');
        nodes.push(<p key={`p-${i}-${j}`} className="leading-relaxed">{text}</p>);
      });
    }
  });

  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

/* ---------------- Draggable Sidebar ---------------- */

const BOX_WIDTH = 320;
const BOX_HEIGHT = 480;

export function applyDrag(
  init: { x: number; y: number },
  start: { x: number; y: number },
  client: { x: number; y: number },
  viewport: { w: number; h: number }
) {
  let x = init.x + client.x - start.x;
  let y = init.y + client.y - start.y;
  const maxX = Math.max(0, viewport.w - BOX_WIDTH);
  const maxY = Math.max(0, viewport.h - BOX_HEIGHT);
  x = Math.min(Math.max(0, x), maxX);
  y = Math.min(Math.max(0, y), maxY);
  return { x, y };
}

/** Sidebar chat widget with draggable position. */
const SidebarAI: React.FC = () => {
  const { open, setOpen } = useSidebarAI();

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const posRef = useRef(pos);
  const boxRef = useRef<HTMLDivElement>(null);

  // Simple chat state for demo purposes
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  // Restore position on mount (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('sidebar-ai-pos');
      if (raw) {
        const saved = JSON.parse(raw);
        setPos(saved);
        posRef.current = saved;
        return;
      }
    } catch {
      // ignore
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    const init = {
      x: Math.max(0, w - BOX_WIDTH - 16),
      y: Math.max(0, h - BOX_HEIGHT - 16),
    };
    setPos(init);
    posRef.current = init;
  }, []);

  // Drag logic
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY };
    const init = posRef.current;

    function handleMove(ev: PointerEvent) {
      const next = applyDrag(
        init,
        start,
        { x: ev.clientX, y: ev.clientY },
        { w: window.innerWidth, h: window.innerHeight }
      );
      posRef.current = next;
      setPos(next);
    }

    function handleUp() {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      try {
        localStorage.setItem('sidebar-ai-pos', JSON.stringify(posRef.current));
      } catch {
        // ignore
      }
    }

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }

  function send(prompt?: string) {
    const text = (prompt ?? input).trim();
    if (!text) return;
    setMsgs((m) => [...m, { id: Date.now(), role: 'user', content: text }]);
    setInput('');
  }

  if (!open) {
    return (
      <button
        type="button"
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-glow hover:shadow-glowLg transition"
        onClick={() => setOpen(true)}
      >
        Need help?
      </button>
    );
  }

  return (
    <div
      ref={boxRef}
      data-testid="sidebar-ai"
      className="fixed z-50 flex h-[480px] w-[320px] flex-col rounded-ds border border-border bg-background shadow-lg"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      <div data-testid="sidebar-ai-header" onPointerDown={onPointerDown} className="cursor-move">
        <SidebarHeader onClose={() => setOpen(false)} />
      </div>

      <MessageList
        items={msgs}
        loading={false}
        streamingId={null}
        renderMarkdown={renderMarkdown}
        scrollRef={scrollRef}
        isMobile={false}
        newChat={() => setMsgs([])}
        toggleVoice={() => {}}
        voiceSupported={false}
        voiceDenied={false}
        listening={false}
      />

      <Composer
        toggleVoice={() => {}}
        voiceSupported={false}
        voiceDenied={false}
        listening={false}
        textareaRef={textareaRef}
        input={input}
        setInput={setInput}
        send={send}
        loading={false}
        streamingId={null}
      />
    </div>
  );
};

export default SidebarAI;
