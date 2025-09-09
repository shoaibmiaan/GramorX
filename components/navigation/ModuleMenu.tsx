'use client';

import React from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { MODULE_LINKS } from './constants';

interface ModuleMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  modulesRef: React.RefObject<HTMLLIElement>;
}

export function ModuleMenu({ open, setOpen, modulesRef }: ModuleMenuProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), [setOpen]);

  const TRIGGER_ID = 'desktop-modules-trigger';
  const MENU_ID = 'desktop-modules-menu';

  // Focus mgmt
  React.useEffect(() => {
    if (open) menuRef.current?.querySelector<HTMLElement>('a,button')?.focus();
  }, [open]);
  const wasOpen = React.useRef(open);
  React.useEffect(() => {
    if (wasOpen.current && !open) buttonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Outside click + ESC + simple focus trap
  React.useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t) && !modulesRef.current?.contains(t)) {
        close();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab' || !menuRef.current) return;

      const focusables = menuRef.current.querySelectorAll<HTMLElement>(
        'a,button,[tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!menuRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, modulesRef]);

  // Desktop overlay (prevents clicks through)
  const desktopOverlay =
    typeof document !== 'undefined' && open
      ? createPortal(
          <div className="fixed inset-0 z-40 hidden md:block bg-transparent" aria-hidden="true" onClick={close} />,
          document.body
        )
      : null;

  return (
    <li className="relative" ref={modulesRef}>
      {/* Trigger */}
      <button
        id={TRIGGER_ID}
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={MENU_ID}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span>Modules</span>
        <svg
          className="h-3.5 w-3.5 opacity-80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d={open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
        </svg>
      </button>

      {/* ===================== Desktop dropdown ===================== */}
      {open && (
        <div
          id={MENU_ID}
          role="menu"
          aria-labelledby={TRIGGER_ID}
          ref={menuRef}
          className="
            absolute left-1/2 top-full z-50 mt-4 hidden md:block
            -translate-x-1/2 overflow-hidden rounded-2xl border border-border shadow-2xl ring-1 ring-black/5
            bg-card dark:bg-dark
            w-[720px] lg:w-[860px] xl:w-[960px] max-w-[98vw]
          "
        >
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-12">
              {/* Left: modules */}
              <div className="col-span-8 p-6 lg:p-7 bg-card dark:bg-darker">
                <h3 className="font-slab text-lg mb-2">Skill Modules</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build the core exam skills with focused practice.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {MODULE_LINKS.map(({ href, label, desc, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      onClick={close}
                      className="
                        group relative flex items-start gap-3 rounded-xl border border-transparent p-4
                        transition hover:bg-primary/10 dark:hover:bg-purpleVibe/20 hover:shadow-glow
                      "
                    >
                      <span
                        className="
                          mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg
                          bg-primary/10 text-primary ring-2 ring-primary/15
                          transition group-hover:-translate-y-0.5 group-hover:scale-[1.03]
                          group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary/40
                        "
                        aria-hidden="true"
                      >
                        {Icon ? <Icon className="h-5 w-5" /> : null}
                      </span>

                      <span className="min-w-0">
                        <span className="block font-medium">{label}</span>
                        {desc && <span className="text-sm text-muted-foreground">{desc}</span>}
                      </span>

                      <span
                        aria-hidden="true"
                        className="
                          absolute left-4 right-4 bottom-2 h-[3px] rounded-full
                          bg-electricBlue/70 dark:bg-neonGreen/70
                          opacity-0 translate-y-1 transition
                          group-hover:opacity-100 group-hover:translate-y-0
                        "
                      />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right: CTA rail */}
              <div className="col-span-4 p-6 lg:p-7 bg-muted/60 dark:bg-purpleVibe/20">
                <div>
                  <h4 className="font-slab text-lg mb-1">New here?</h4>
                  <p className="text-sm text-muted-foreground">Take a quick placement to get a personalized start.</p>
                </div>

                <Link
                  href="/placement"
                  role="menuitem"
                  onClick={close}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl btn btn-primary btn--fx px-4 py-2"
                >
                  Start placement
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Mobile sheet ===================== */}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="
              fixed inset-x-0 top-0 z-50 md:hidden
              border-b border-border bg-card dark:bg-dark shadow-xl
              animate-in slide-in-from-top-2 duration-150
            "
            role="dialog"
            aria-modal="true"
            aria-label="Modules"
            ref={menuRef}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="font-slab text-lg">Modules</h3>
              <button
                onClick={close}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-4 pb-4">
              <div className="rounded-xl border border-border bg-card dark:bg-darker p-3">
                <div className="mb-2">
                  <div className="font-medium">Skill Modules</div>
                  <div className="text-sm text-muted-foreground">Build the core exam skills with focused practice.</div>
                </div>

                <ul className="space-y-1">
                  {MODULE_LINKS.map(({ href, label, desc, Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={close}
                        className="
                          group relative flex items-start gap-3 rounded-lg px-3 py-3
                          transition hover:bg-primary/10 dark:hover:bg-purpleVibe/20 hover:shadow-glow
                        "
                      >
                        <span
                          className="
                            mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg
                            bg-primary/10 text-primary ring-2 ring-primary/15
                            transition group-hover:-translate-y-0.5 group-hover:scale-[1.03]
                            group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary/40
                          "
                          aria-hidden="true"
                        >
                          {Icon ? <Icon className="h-5 w-5" /> : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium">{label}</span>
                          {desc && <span className="text-sm text-muted-foreground">{desc}</span>}
                        </span>
                        <span
                          aria-hidden="true"
                          className="
                            absolute left-4 right-4 bottom-1.5 h-[3px] rounded-full
                            bg-electricBlue/70 dark:bg-neonGreen/70
                            opacity-0 translate-y-1 transition
                            group-hover:opacity-100 group-hover:translate-y-0
                          "
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 rounded-xl border border-border bg-muted/60 dark:bg-purpleVibe/20 p-3">
                <div className="mb-2">
                  <div className="font-slab text-lg">New here?</div>
                  <div className="text-sm text-muted-foreground">Take a quick placement to get a personalized start.</div>
                </div>
                <Link href="/placement" onClick={close} className="w-full btn btn-primary btn--fx rounded-xl px-4 py-3 inline-flex items-center justify-center gap-2">
                  Start placement
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}

      {desktopOverlay}
    </li>
  );
}

export default ModuleMenu;
