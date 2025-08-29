// components/design-system/Toaster.tsx
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Intent = 'success' | 'error' | 'warning' | 'info';
type Toast = { id: string; title: string; desc?: string; intent?: Intent; timeout?: number };

type Ctx = {
  push: (t: Omit<Toast, 'id'>) => void;
  success: (title: string, desc?: string) => void;
  error:   (title: string, desc?: string) => void;
  warn:    (title: string, desc?: string) => void;
  info:    (title: string, desc?: string) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const timeout = t.timeout ?? 3500;
    setItems((list) => [...list, { ...t, id }]);
    if (timeout > 0) setTimeout(() => remove(id), timeout);
  }, [remove]);

  const api: Ctx = useMemo(() => ({
    push,
    success: (title, desc) => push({ title, desc, intent: 'success' }),
    error:   (title, desc) => push({ title, desc, intent: 'error' }),
    warn:    (title, desc) => push({ title, desc, intent: 'warning' }),
    info:    (title, desc) => push({ title, desc, intent: 'info' }),
  }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed z-[1000] bottom-5 right-5 flex flex-col gap-2 w-[min(92vw,360px)]">
        {items.map((t) => (
          <div
            key={t.id}
            className={`rounded-ds-2xl p-4 shadow-lg border
              ${t.intent === 'success' ? 'bg-success/15 border-success/30 text-success dark:bg-success/20 dark:border-success/40 dark:text-success'
              : t.intent === 'error' ? 'bg-error/15 border-error/30 text-error dark:bg-error/20 dark:border-error/40 dark:text-error'
              : t.intent === 'warning' ? 'bg-goldenYellow/15 border-goldenYellow/30 text-goldenYellow dark:bg-goldenYellow/20 dark:border-goldenYellow/40 dark:text-goldenYellow'
              : 'bg-dark/80 border-border text-body dark:border-border/50 dark:text-white'}`}
          >
            <div className="font-semibold">{t.title}</div>
            {t.desc && <div className="text-sm opacity-90 mt-1">{t.desc}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
