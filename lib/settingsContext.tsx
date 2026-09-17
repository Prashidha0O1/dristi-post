"use client";
import { createContext, useContext, ReactNode } from "react";
import type { FooterSettings, SeoSettings } from "./domain/settings";

interface SettingsContextValue {
  footer: FooterSettings;
  seo: SeoSettings;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  footer,
  seo,
  children,
}: {
  footer: FooterSettings;
  seo: SeoSettings;
  children: ReactNode;
}) {
  return (
    <SettingsContext.Provider value={{ footer, seo }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
