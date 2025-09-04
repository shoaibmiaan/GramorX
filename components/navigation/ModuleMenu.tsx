// components/navigation/ModuleMenu.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { NavLink } from '@/components/design-system/NavLink';
import { MODULE_LINKS } from './constants';

interface ModuleMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  // Container li from parent; we use it for outside-click detection
  modulesRef: React.RefObject<HTMLLIElement>;
}

export function ModuleMenu({ open, setOpen, modulesRef }: ModuleMenuProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), [setOpen]);

  const TRIGGER_ID = 'desktop-modules-trigger';
  const MENU_ID = 'desktop-modules-menu';

  // Focus first item on open
  React.useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('a, button')?.focus();
  }, [open]);

  // Return focus to trigger when menu closes
  const wasOpen = React.useRef(open);
  React.useEffect(() => {
    if (wasOpen.current && !open) buttonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      const inModuleWrap = modulesRef.current?.contains(t);
      const inMenu = menuRef.current?.contains(t);
      const inTrigger = buttonRef.current?.contains(t);
      if (!inMenu && !inTrigger && !inModuleWrap) {
        close();
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, close, modulesRef]);

  // ESC + focus trap
  React.useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !menuRef.current) return;

      const focusable = menuRef.current.querySelectorAll<HTMLElement>('a, button,[tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
    }

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Overlay (prevents clicks on hero + adds separation). Desktop only.
  const overlay =
    typeof document !== 'undefined' && open
      ? createPortal(
          <div
            className="fixed inset-0 z-40 hidden md:block bg-transparent"
            aria-hidden="true"
            onClick={close}
          />,
          document.body
        )
      : null;

  return (
    <li className="relative" ref={modulesRef}>
      <button
        id={TRIGGER_ID}
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={MENU_ID}
        className="
          inline-flex items-center gap-2 rounded-lg px-3 py-2
          hover:bg-muted transition
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border
        "
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

      {open && (
        <div
          id={MENU_ID}
          role="menu"
          aria-labelledby={TRIGGER_ID}
          ref={menuRef}
          className="
            absolute left-1/2 top-full z-50 mt-3 w-[520px] max-w-[92vw] -translate-x-1/2
            overflow-hidden rounded-2xl border border-border bg-background shadow-lg
            ring-1 ring-black/5
          "
        >
          <div className="grid grid-cols-12">
            {/* Skill grid */}
            <div className="col-span-8 p-6 sm:p-7">
              <div className="mb-3">
                <h3 className="font-slab text-lg">Skill Modules</h3>
                <p className="text-sm text-muted-foreground">
                  Build the core exam skills with focused practice.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {MODULE_LINKS.map(({ href, label, desc, Icon }) => (
                  <NavLink
                    key={href}
                    href={href}
                    role="menuitem"
                    onClick={close}
                    className="
                      group flex items-start gap-3 rounded-xl border border-transparent p-4
                      transition hover:border-border hover:bg-muted
                    "
                  >
                    <span
                      className="
                        mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg
                        bg-primary/10 text-primary
                      "
                    >
                      {Icon ? (
                        <Icon className="h-4.5 w-4.5" />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4.5 w-4.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14M13 5l7 7-7 7" />
                        </svg>
                      )}
                    </span>
                    <span>
                      <span className="block font-medium">{label}</span>
                      {desc && (
                        <span className="text-sm text-muted-foreground">{desc}</span>
                      )}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* CTA rail */}
            <div className="col-span-4 bg-muted p-6 sm:p-7">
              <div>
                <div className="mb-1 font-slab text-lg">New here?</div>
                <p className="text-sm text-muted-foreground">
                  Take a quick placement to get a personalized start.
                </p>
              </div>

              <Link
                href="/placement"
                role="menuitem"
                onClick={close}
                className="
                  mt-4 inline-flex w-full items-center justify-center gap-2
                  rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground
                  transition hover:opacity-90
                "
              >
                Start placement
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Render overlay when open */}
      {overlay}
    </li>
  );
}

export default ModuleMenu;
