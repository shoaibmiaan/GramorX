import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Variant = 'success' | 'info' | 'warning' | 'error';
type ToastItem = {
  id: string;
  message: string;
  title?: string;
  variant: Variant;
  duration?: number; // ms
};

const ToastCtx = createContext<{ push: (t: Omit<ToastItem, 'id'>) => void } | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, duration: 2500, ...t };
    setItems((prev) => [...prev, item]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), item.duration);
  }, []);

  const ctx = useMemo(() => ({ push }), [push]);

  const variants: Record<Variant, string> = {
    success: 'bg-success/10 border-success/30 text-success',
    info: 'bg-electricBlue/10 border-electricBlue/30 text-electricBlue',
    warning: 'bg-goldenYellow/10 border-goldenYellow/30 text-goldenYellow',
    error: 'bg-sunsetOrange/10 border-sunsetOrange/30 text-sunsetOrange',
  };

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      {/* container uses tokens; no hex; light/dark via classes baked into card-surface. */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={`card-surface border p-4 rounded-ds shadow ${variants[t.variant]}`}
          >
            {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
            <div className="text-body opacity-90">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  const success = (message: string, opts?: { title?: string; duration?: number }) =>
    ctx.push({ message, variant: 'success', title: opts?.title, duration: opts?.duration });
  const info = (message: string, opts?: { title?: string; duration?: number }) =>
    ctx.push({ message, variant: 'info', title: opts?.title, duration: opts?.duration });
  const warning = (message: string, opts?: { title?: string; duration?: number }) =>
    ctx.push({ message, variant: 'warning', title: opts?.title, duration: opts?.duration });
  const error = (message: string, opts?: { title?: string; duration?: number }) =>
    ctx.push({ message, variant: 'error', title: opts?.title, duration: opts?.duration });
  return { success, info, warning, error };
}
