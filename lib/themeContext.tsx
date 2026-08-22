"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeCtx {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
}

const Ctx = createContext<ThemeCtx>({
  theme: "system",
  setTheme: () => {},
  resolved: "light",
});

function subscribeToSystemTheme(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => onChange();
  mediaQuery.addEventListener("change", handleChange);

  return () => mediaQuery.removeEventListener("change", handleChange);
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerTheme(): "light" {
  return "light";
}

export function useTheme() {
  return useContext(Ctx);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, getServerTheme);
  const resolved = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const stored = localStorage.getItem("dp_theme") as Theme | null;
    if ((stored === "light" || stored === "dark") && stored !== theme) {
      window.setTimeout(() => setThemeState(stored), 0);
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);
    localStorage.setItem("dp_theme", nextTheme);
  }

  return <Ctx value={{ theme, setTheme, resolved }}>{children}</Ctx>;
}
