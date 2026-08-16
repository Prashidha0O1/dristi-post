"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Locale } from "./types";
import { defaultLocale, t, type TranslationKey, getLocalizedField } from "./i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  localized: <T>(field: Record<Locale, T>) => T;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const translate = useCallback(
    (key: TranslationKey) => t(locale, key),
    [locale],
  );

  const localized = useCallback(
    <T,>(field: Record<Locale, T>) => getLocalizedField(field, locale),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t: translate, localized }),
    [locale, translate, localized],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
