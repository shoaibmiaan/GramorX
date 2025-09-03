export type ModuleLink = { label: string; href: string; desc?: string };

export const MODULE_LINKS: ModuleLink[] = [
  { label: 'Listening', href: '/listening', desc: 'Audio comprehension drills' },
  { label: 'Reading', href: '/reading', desc: 'Short passages & skimming' },
  { label: 'Writing', href: '/writing', desc: 'Prompts, structure & style' },
  { label: 'Speaking', href: '/speaking', desc: 'Pronunciation & fluency' },
];

export const NAV: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/predictor', label: 'Band Predictor' },
  { href: '/pricing', label: 'Pricing' },
];
