// components/ai/SidebarAI.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';

/** Minimal public types so other files can import without errors. */
export type Provider = 'grok' | 'gemini' | 'openai' | 'none';
export type ConnState = 'idle' | 'connecting' | 'online' | 'error';

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

/** Minimal component — renders nothing for now. */
const SidebarAI: React.FC = () => null;
export default SidebarAI;
