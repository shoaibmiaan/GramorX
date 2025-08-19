import React, { useEffect } from "react";
import { Button } from "../atoms/Button";

const THEMES = ["light", "dark", "aurora", "gold"] as const;
type Theme = typeof THEMES[number];

function getRoot(): HTMLElement | null {
  if (typeof window === "undefined") return null;
  return (document.getElementById("premium-root") ||
          document.querySelector(".premium-root")) as HTMLElement | null;
}

const LS_KEY = "premium:theme";

export function ThemeToggle() {
  const [t, setT] = React.useState<Theme>("light");

  // Sync state with current DOM attribute or localStorage on mount
  useEffect(() => {
    const root = getRoot();
    const fromAttr = (root?.getAttribute("data-pr-theme") as Theme) || null;
    const fromLS = (typeof window !== "undefined" && (localStorage.getItem(LS_KEY) as Theme)) || null;
    const initial = (fromAttr || fromLS || "light") as Theme;
    if (root) root.setAttribute("data-pr-theme", initial);
    setT(initial);
  }, []);

  const apply = (theme: Theme) => {
    const root = getRoot();
    if (!root) return;
    root.setAttribute("data-pr-theme", theme);
    try { localStorage.setItem(LS_KEY, theme); } catch {}
    setT(theme);
  };

  return (
    <div className="pr-flex pr-gap-2 pr-items-center">
      {THEMES.map((th) => (
        <Button
          key={th}
          variant={t === th ? "primary" : "secondary"}
          size="sm"
          onClick={() => apply(th)}
        >
          {th[0].toUpperCase() + th.slice(1)}
        </Button>
      ))}
    </div>
  );
}
