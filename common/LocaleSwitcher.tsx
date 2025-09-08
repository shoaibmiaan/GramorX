// components/common/LocaleSwitcher.tsx
import * as React from "react";
import { loadTranslations, getLocale } from "@/lib/i18n";
import { setLocale } from "@/lib/locale";
import type { SupportedLocale } from "@/lib/i18n/config";

/**
 * Compact locale toggle (EN / UR). Uses DS token classes.
 * Drop this in header or /settings/language.
 */
export function LocaleSwitcher({
  label = "Language",
  onChanged,
}: {
  label?: string;
  onChanged?: (locale: SupportedLocale) => void;
}) {
  const [locale, setLocal] = React.useState<SupportedLocale>("en");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setLocal(getLocale());
    }
  }, []);

  const change = async (next: SupportedLocale) => {
    try {
      setBusy(true);
      await loadTranslations(next);
      setLocale(next);
      setLocal(next);
      onChanged?.(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        aria-label="Select language"
        disabled={busy}
        value={locale}
        onChange={(e) => change(e.target.value as SupportedLocale)}
        className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground hover:bg-border/30 disabled:opacity-50"
      >
        <option value="en">English</option>
        <option value="ur">اردو</option>
      </select>
    </div>
  );
}
