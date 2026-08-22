"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: "light" | "dark";
}

const Ctx = createContext<ThemeCtx>({ theme: "system", setTheme: () => {}, resolved: "light" });

export function useTheme() {
  return useContext(Ctx);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("dp_theme") as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      setResolved(mq.matches ? "dark" : "light");
      const handler = (e: MediaQueryListEvent) => setResolved(e.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      root.setAttribute("data-theme", theme);
      setResolved(theme);
    }
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("dp_theme", t);
  }

  return <Ctx value={{ theme, setTheme, resolved }}>{children}</Ctx>;
}
