// components/nav/CommandCenter.tsx
import * as React from 'react';
import { createPortal } from 'react-dom';
import { routes } from '@/lib/routes';

export type Command = {
  id: string;
  title: string;
  hint?: string;
  href?: string;
  action?: () => void;
  group?: string;
  kbd?: string; // visual hint
};

export type CommandCenterProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  commands?: Command[];
  placeholder?: string;
};

function useHotkey(toggle: () => void) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
      // Double slash “/” to open
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const el = document.activeElement as HTMLElement | null;
        const editable = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
        if (!editable) {
          e.preventDefault();
          toggle();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);
}

function defaultCommands(): Command[] {
  return [
    { id: 'dashboard', title: 'Open Dashboard', href: routes.dashboard(), group: 'Navigate' },
    { id: 'pricing', title: 'View Pricing', href: routes.pricing(), group: 'Navigate' },
    { id: 'study-plan', title: 'Study Plan', href: routes.studyPlan(), group: 'Navigate' },
    { id: 'progress', title: 'Progress', href: routes.progress(), group: 'Navigate' },
    { id: 'listening', title: 'Listening Tests', href: routes.listeningIndex(), group: 'Modules' },
    { id: 'reading', title: 'Reading Tests', href: routes.readingIndex(), group: 'Modules' },
    { id: 'writing', title: 'Writing Tests', href: routes.writingIndex(), group: 'Modules' },
    { id: 'speaking', title: 'Speaking Simulator', href: routes.speakingSimulator(), group: 'Modules' },
    { id: 'checkout-booster', title: 'Upgrade to Booster', href: routes.checkout('booster'), group: 'Actions', kbd: 'Enter' },
  ];
}

export function CommandCenter({
  open: openProp,
  onOpenChange,
  commands,
  placeholder = 'Search commands…',
}: CommandCenterProps) {
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(!!openProp);
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState(0);

  const list = React.useMemo<Command[]>(
    () => (commands && commands.length ? commands : defaultCommands()),
    [commands],
  );

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list
      .map((c) => ({ c, score: score(c, s) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.c);
  }, [q, list]);

  function setOpenSafe(v: boolean) {
    setOpen(v);
    onOpenChange?.(v);
    if (!v) {
      setQ('');
      setSel(0);
    }
  }

  useHotkey(() => setOpenSafe(!open));
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => setOpen(!!openProp), [openProp]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpenSafe(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSel((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSel((s) => Math.max(s - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[sel];
        if (item) run(item, setOpenSafe);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, sel]);

  if (!mounted) return null;
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
      onClick={() => setOpenSafe(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="mx-auto mt-24 w-full max-w-xl rounded-2xl border border-border bg-card text-foreground shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="text-xs text-foreground/60">⌘/Ctrl K</span>
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            className="w-full bg-transparent px-2 py-2 text-sm outline-none placeholder:text-foreground/50"
            placeholder={placeholder}
            aria-label="Command search"
          />
        </div>

        <div className="max-h-80 overflow-auto py-2">
          {grouped(filtered).map(([group, items]) => (
            <div key={group} className="px-2 py-1">
              <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-foreground/50">
                {group}
              </div>
              {items.map((c, i) => {
                const index = indexInFiltered(filtered, c);
                const active = index === sel;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onMouseEnter={() => setSel(index)}
                    onClick={() => run(c, setOpenSafe)}
                    className={[
                      'flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm',
                      active ? 'bg-primary/10' : 'hover:bg-foreground/5',
                    ].join(' ')}
                  >
                    <div className="min-w-0">
                      <div className="truncate">{highlight(c.title, q)}</div>
                      {c.hint && (
                        <div className="truncate text-xs text-foreground/60">{highlight(c.hint, q)}</div>
                      )}
                    </div>
                    {c.kbd && (
                      <kbd className="ml-2 rounded border border-border px-1.5 py-0.5 text-[10px] text-foreground/70">
                        {c.kbd}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-foreground/60">No results</div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function run(cmd: Command, close: (v: boolean) => void) {
  try {
    if (cmd.action) cmd.action();
    if (cmd.href) {
      // Prefer SPA nav
      if (typeof window !== 'undefined') {
        window.location.href = cmd.href;
      }
    }
  } finally {
    close(false);
  }
}

function score(c: Command, s: string): number {
  // tiny “fuzzy-ish”: title contains => 3, hint contains => 1, startsWith bonus
  const t = c.title.toLowerCase();
  const h = (c.hint || '').toLowerCase();
  let sc = 0;
  if (t.includes(s)) sc += 3;
  if (h.includes(s)) sc += 1;
  if (t.startsWith(s)) sc += 1;
  return sc;
}

function grouped(items: Command[]): Array<[string, Command[]]> {
  const map = new Map<string, Command[]>();
  for (const it of items) {
    const g = it.group || 'Commands';
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(it);
  }
  return Array.from(map.entries());
}

function indexInFiltered(arr: Command[], item: Command) {
  return arr.findIndex((x) => x.id === item.id);
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-primary/30">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default CommandCenter;
