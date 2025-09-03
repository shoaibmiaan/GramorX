'use client';

import Link from 'next/link';
import { NavLink } from '@/components/design-system/NavLink';
import { MODULE_LINKS } from './constants';
import React from 'react';

interface ModuleMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  modulesRef: React.RefObject<HTMLLIElement>;
}

export function ModuleMenu({ open, setOpen, modulesRef }: ModuleMenuProps) {
  return (
    <li className="relative" ref={modulesRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="desktop-modules-menu"
        className="px-3 py-2 rounded hover:bg-muted flex items-center gap-2"
      >
        <span>Modules</span>
        <svg className="w-3.5 h-3.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d={open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
        </svg>
      </button>

      {open && (
        <div
          id="desktop-modules-menu"
          role="menu"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-96 max-w-[90vw] bg-background border border-border rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="grid grid-cols-12">
            <div className="col-span-8 p-6 sm:p-7">
              <div className="mb-3">
                <h3 className="font-slab text-lg">Skill Modules</h3>
                <p className="text-muted-foreground text-sm">Build the core exam skills with focused practice.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {MODULE_LINKS.map((m) => (
                  <NavLink
                    key={m.href}
                    href={m.href}
                    className="group rounded-lg border border-transparent hover:border-border p-4 flex items-start gap-3 hover:bg-muted"
                    onClick={() => setOpen(false)}
                    role="menuitem"
                  >
                    <div className="mt-1">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{m.label}</div>
                      {m.desc && <div className="text-sm text-muted-foreground">{m.desc}</div>}
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="col-span-4 bg-muted p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="mb-2 font-slab text-lg">New here?</div>
                <p className="text-sm text-muted-foreground">Take a quick placement to get a personalized start.</p>
              </div>
              <Link
                href="/placement"
                className="mt-4 inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold text-primary-foreground bg-primary hover:opacity-90"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                Start placement
                <span className="ml-2 inline-flex">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
