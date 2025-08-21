import { useEffect } from "react";

const LS_KEY = "premium:theme";

export function usePremiumTheme(defaultTheme: "light" | "dark" | "aurora" | "gold" = "light") {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = (document.getElementById("premium-root") ||
      document.querySelector(".premium-root")) as HTMLElement | null;

    const stored =
      (typeof window !== "undefined" &&
        (localStorage.getItem(LS_KEY) as "light" | "dark" | "aurora" | "gold" | null)) ||
      null;

    const initial = stored || defaultTheme;
    if (root) root.setAttribute("data-pr-theme", initial);
  }, [defaultTheme]);

  const setTheme = (t: "light" | "dark" | "aurora" | "gold") => {
    if (typeof document === "undefined") return;
    const root = (document.getElementById("premium-root") ||
      document.querySelector(".premium-root")) as HTMLElement | null;
    if (root) {
      root.setAttribute("data-pr-theme", t);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LS_KEY, t);
        } catch {}
      }
    }
  };

  return { setTheme };
}
