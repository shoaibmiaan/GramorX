// components/ai/SidebarAI.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';

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
        <pre key={`code-${i}`}>
          <code className={lang ? `language-${lang}` : undefined}>{code}</code>
        </pre>
      );
    } else {
      const lines = chunk.split(/\n+/);
      lines.forEach((line, j) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const text = trimmed.replace(/^(?:[*+-]|\d+\.)\s+/, '');
        nodes.push(<p key={`p-${i}-${j}`}>{text}</p>);
      });
    }
  });

  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

/** Minimal component — renders nothing for now. */
const SidebarAI: React.FC = () => null;
export default SidebarAI;
