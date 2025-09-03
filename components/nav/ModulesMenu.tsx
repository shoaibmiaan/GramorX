// components/nav/ModulesMenu.tsx
import * as React from 'react';
import { createPortal } from 'react-dom';
import { routes } from '@/lib/routes';

type Item = { label: string; href: string; desc?: string };

const ITEMS: Item[] = [
  { label: 'Listening', href: routes.listeningIndex(), desc: 'Audio comprehension & drills' },
  { label: 'Reading',   href: routes.readingIndex(),   desc: 'Passages • TF/NG • MCQ' },
  { label: 'Writing',   href: routes.writingIndex(),   desc: 'Task 1/2, GT letters' },
  { label: 'Speaking',  href: routes.speakingSimulator(), desc: 'Timed prompts & feedback' },
];

export function ModulesMenu() {
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => setMounted(true), []);

  function toggle() {
    if (!btnRef.current) return;
    setRect(btnRef.current.getBoundingClientRect());
    setOpen((v) => !v);
  }

  React.useEffect(() => {
    if (!open) return;
    function onScrollOrResize() {
      if (!btnRef.current) return setOpen(false);
      setRect(btnRef.current.getBoundingClientRect());
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (!btnRef.current) return;
      if (btnRef.current.contains(t)) return; // handled by toggle
      setOpen(false);
    }
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDocClick);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm hover:bg-foreground/5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Modules <span aria-hidden="true">▾</span>
      </button>

      {mounted && open && rect &&
        createPortal(
          <div
            className="fixed z-[1000]"
            style={{
              top: rect.bottom + 8, // 8px gap
              left: Math.max(12, Math.min(rect.left, window.innerWidth - 320 - 12)),
            }}
          >
            <div className="w-[320px] max-h-[70vh] overflow-auto rounded-2xl border border-border bg-card p-2 shadow-2xl">
              {ITEMS.map((it) => (
                <a
                  key={it.href}
                  href={it.href}
                  className="block rounded-lg px-3 py-2 hover:bg-foreground/5"
                >
                  <div className="text-sm font-medium">{it.label}</div>
                  {it.desc && <div className="text-xs text-foreground/60">{it.desc}</div>}
                </a>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
