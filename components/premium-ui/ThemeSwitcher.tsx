import { useEffect, useMemo, useState } from "react";

type PremiumTheme = "light" | "dark" | "aurora" | "gold";
const STORAGE_KEY = "premium-theme";

function findPremiumRoot(start: HTMLElement | null): HTMLElement | null {
  let el: HTMLElement | null = start;
  while (el) {
    if (el.classList.contains("premium-root")) return el;
    el = el.parentElement;
  }
  return null;
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<PremiumTheme>("light");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as PremiumTheme) || "light";
    setTheme(saved);
  }, []);

  useEffect(() => {
    const root = findPremiumRoot(document.getElementById("premium-root") || document.body);
    if (root) {
      root.setAttribute("data-pr-theme", theme);
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  const options: { id: PremiumTheme; label: string }[] = useMemo(
    () => [
      { id: "light", label: "Light" },
      { id: "dark", label: "Dark" },
      { id: "aurora", label: "Aurora" },
      { id: "gold", label: "Gold" },
    ],
    []
  );

  return (
    <div className="pr-inline-flex pr-items-center pr-gap-2 pr-bg-surface pr-text-text pr-rounded-2xl pr-p-2 pr-border pr-border-border pr-shadow-soft">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setTheme(opt.id)}
          className={`pr-px-3 pr-py-1.5 pr-rounded-xl pr-text-sm pr-font-medium pr-transition
            ${theme === opt.id ? "pr-bg-primary pr-text-primaryFg" : "pr-bg-transparent pr-text-muted hover:pr-bg-bg"}`}
          aria-pressed={theme === opt.id}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
