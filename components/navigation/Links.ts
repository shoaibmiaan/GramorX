// components/navigation/links.ts
import type { LucideIcon } from 'lucide-react';
import { Headphones, BookOpen, PenSquare, MicVocal } from 'lucide-react';

export type ModuleLink = {
  label: string;
  href: string;
  desc?: string;
  Icon?: LucideIcon;

  // 🆕 optional niceties (safe to ignore):
  badge?: string;                // e.g. "New", "AI"
  tone?: 'purple' | 'blue' | 'orange' | 'green'; // maps to DS accent ring/bg
  kbd?: string;                  // keyboard hint, e.g. "L"
};

export const MODULE_LINKS: ModuleLink[] = [
  { label: 'Listening', href: '/listening', desc: 'Audio comprehension drills', Icon: Headphones, badge: 'AI', tone: 'blue', kbd: 'L' },
  { label: 'Reading',   href: '/reading',   desc: 'Short passages & skimming', Icon: BookOpen,    tone: 'purple', kbd: 'R' },
  { label: 'Writing',   href: '/writing',   desc: 'Prompts, structure & style', Icon: PenSquare,  tone: 'orange', kbd: 'W' },
  { label: 'Speaking',  href: '/speaking',  desc: 'Pronunciation & fluency',   Icon: MicVocal,    tone: 'green',  kbd: 'S' },
];

export const NAV: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/predictor', label: 'Band Predictor' },
  { href: '/pricing',   label: 'Pricing' },
];
