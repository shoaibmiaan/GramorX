import React from 'react';
import { loadTranslations, setLocale, getLocale, type Locale } from '@/lib/locale/index';

type Props = {
  value?: Locale;
  onChanged?: (next: Locale) => void;
  options?: { value: Locale; label: string }[];
};

function LocaleSwitcher({ value, onChanged, options }: Props) {
  const [busy, setBusy] = React.useState(false);
  const [local, setLocal] = React.useState<Locale>(value ?? getLocale('en'));

  const langs = options ?? [
    { value: 'en', label: 'English' },
    { value: 'ur', label: 'اردو' },
    { value: 'ar', label: 'العربية' },
    { value: 'fr', label: 'Français' },
  ];

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    try {
      setBusy(true);
      await loadTranslations(next);
      setLocale(next);
      setLocal(next);
      onChanged?.(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-mutedText">Language</span>
      <select
        aria-label="Select language"
        className="rounded-ds border border-border bg-card px-3 py-2 text-foreground shadow-sm
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 focus-visible:ring-offset-background
                   hover:bg-border/30 disabled:opacity-50"
        value={local}
        onChange={handleChange}
        disabled={busy}
      >
        {langs.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
      {busy && <span className="text-mutedText text-xs">…updating</span>}
    </label>
  );
}

export default LocaleSwitcher;
export { LocaleSwitcher };
