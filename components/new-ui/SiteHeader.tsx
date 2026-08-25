"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { CalendarDaysIcon, MenuIcon, MoonIcon, SearchIcon, SunIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/localeContext";
import { useTheme } from "@/lib/themeContext";
import { BreakingTicker } from "./BreakingTicker";
import { CategoryNav } from "./CategoryNav";
import { SearchPanel } from "./SearchPanel";
import { MobileNav } from "./MobileNav";
import { primarySections, secondarySections } from "../data/navigation";
import type { Lang } from "../types/navigation";

interface SiteHeaderProps {
  variant?: "editorial" | "compact";
  showBreakingTicker?: boolean;
}

function Wordmark({ small, lang }: { small: boolean; lang: Lang }) {
  return (
    <Link href="/" className="flex items-baseline gap-2" aria-label="दृष्टि पोस्ट — home">
      <span
        className={`font-np font-extrabold leading-none tracking-tight text-crimson transition-all duration-300 ${
          small ? "text-2xl" : "text-[32px]"
        }`}
      >
        दृष्टि<span className="text-ink dark:text-white">पोस्ट</span>
      </span>
      {!small && (
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-400 sm:inline">
          {lang === "np" ? "भरपर्दो समाचार" : "Nepal's trusted news"}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader({ variant = "editorial", showBreakingTicker = true }: SiteHeaderProps) {
  const { locale, setLocale } = useLocale();
  const { resolved, setTheme } = useTheme();
  const pathname = usePathname();
  const lang: Lang = locale === "ne" ? "np" : "en";
  const dark = resolved === "dark";

  const [activeId, setActiveId] = useState("home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tickerVisible, setTickerVisible] = useState(true);
  const [condensed, setCondensed] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });

  useEffect(() => {
    // Resolved by matching real hrefs rather than reading a path segment by
    // index: single-segment routes like /calendar or /blog have no segment[1],
    // so the old index lookup fell through to "home" and wrongly underlined
    // गृहपृष्ठ. Primary is searched first so a section that also appears under
    // "थप" (e.g. /category/world) highlights its top-level tab.
    const matches = (href: string) =>
      href === "/" ? pathname === "/" : pathname === href || Boolean(pathname?.startsWith(`${href}/`));
    const hit =
      primarySections.find((s) => matches(s.href)) ?? secondarySections.find((s) => matches(s.href));
    setActiveId(hit ? hit.id : "");
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 150) {
        setCondensed(true);
      } else if (window.scrollY < 50) {
        setCondensed(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !searchOpen) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const stacked = variant === "editorial" && !condensed;

  return (
    <header className="sticky top-0 z-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {lang === "np" ? "मुख्य सामग्रीमा जानुहोस्" : "Skip to main content"}
      </a>

      {showBreakingTicker && tickerVisible && !condensed && (
        <BreakingTicker lang={lang} onDismiss={() => setTickerVisible(false)} />
      )}

      <div className="border-b border-paper-200 bg-white/90 backdrop-blur-md dark:border-ink-700 dark:bg-ink/90">
        {/* transition-[height] rather than transition-all: condensing remounts
            the nav inline and adds the live badge, and transition-all kept
            restarting on that churn so the height never settled — the row
            stayed visually at 72px even though h-14 had already applied. */}
        <div
          className={`mx-auto flex max-w-[var(--max-content)] items-center gap-4 px-[var(--side-pad)] transition-[height] duration-300 ${
            condensed ? "h-14" : stacked ? "h-[72px]" : "h-[68px]"
          }`}
        >
          <Wordmark small={condensed} lang={lang} />

          {!stacked && (
            <div className="ml-4 hidden lg:block">
              <CategoryNav lang={lang} activeId={activeId} onSelect={setActiveId} compact={condensed} layoutScope="inline" />
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {condensed && (
              <span className="mr-2 hidden items-center gap-2 text-xs text-ink-500 xl:flex dark:text-ink-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-crimson" />
                <span className={lang === "np" ? "font-np" : ""}>
                  {lang === "np" ? "लाइभ अपडेट" : "Live updates"}
                </span>
              </span>
            )}

            <div
              className="hidden items-center rounded-full bg-paper-100 p-0.5 sm:flex dark:bg-ink-700"
              role="group"
              aria-label={lang === "np" ? "भाषा" : "Language"}
            >
              {(["np", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l === "np" ? "ne" : "en")}
                  aria-pressed={lang === l}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    lang === l
                      ? "bg-white text-ink shadow-sm dark:bg-ink-800 dark:text-white"
                      : "text-ink-500 hover:text-ink dark:text-ink-400 dark:hover:text-white"
                  }`}
                >
                  {l === "np" ? "नेपाली" : "EN"}
                </button>
              ))}
            </div>

            <Link
              href="/calendar"
              className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-500 transition hover:bg-paper-100 hover:text-ink sm:inline-flex dark:text-ink-400 dark:hover:bg-ink-700 dark:hover:text-white ${
                lang === "np" ? "font-np" : ""
              }`}
            >
              <CalendarDaysIcon className="h-4 w-4" />
              {lang === "np" ? "पात्रो" : "Calendar"}
            </Link>

            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              aria-expanded={searchOpen}
              aria-label={lang === "np" ? "खोज्नुहोस्" : "Search"}
              className="flex items-center gap-2 rounded-full border border-paper-200 px-3 py-1.5 text-sm text-ink-500 transition hover:border-ink hover:text-ink dark:border-ink-600 dark:text-ink-400 dark:hover:border-white dark:hover:text-white"
            >
              <SearchIcon className="h-4 w-4" />
              <span className="hidden xl:inline">{lang === "np" ? "खोज" : "Search"}</span>
              <kbd className="hidden rounded border border-paper-200 px-1 text-[10px] xl:inline dark:border-ink-600">
                /
              </kbd>
            </button>

            {/* Which icon shows is decided in CSS, not JS. `resolved` differs
                between the server snapshot ("light") and the client's first
                snapshot (the real media query), so branching on it here would
                hydration-mismatch. The dark: variant keys off the same signal
                and settles before paint, so there is no icon flash either. */}
            <button
              type="button"
              onClick={() => setTheme(dark ? "light" : "dark")}
              aria-label={lang === "np" ? "रङ थिम परिवर्तन" : "Toggle color theme"}
              className="rounded-full p-2 text-ink-500 transition hover:bg-paper-100 hover:text-ink dark:text-ink-400 dark:hover:bg-ink-700 dark:hover:text-white"
            >
              <MoonIcon className="h-[18px] w-[18px] dark:hidden" />
              <SunIcon className="hidden h-[18px] w-[18px] dark:block" />
            </button>

            <Link
              href="/login"
              className={`hidden items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-crimson sm:inline-flex dark:bg-white dark:text-ink dark:hover:bg-crimson dark:hover:text-white ${
                lang === "np" ? "font-np" : ""
              }`}
            >
              <UserIcon className="h-4 w-4" />
              {lang === "np" ? "सदस्यता" : "Subscribe"}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={lang === "np" ? "मेनु खोल्नुहोस्" : "Open menu"}
              className="rounded-full p-2 text-ink transition hover:bg-paper-100 lg:hidden dark:text-white dark:hover:bg-ink-700"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {stacked && (
          <div className="hidden border-t border-paper-100 lg:block dark:border-ink-700">
            <div className="mx-auto max-w-[var(--max-content)] px-[var(--side-pad)]">
              <CategoryNav lang={lang} activeId={activeId} onSelect={setActiveId} layoutScope="stacked" />
            </div>
          </div>
        )}
      </div>

      <SearchPanel open={searchOpen} lang={lang} onClose={() => setSearchOpen(false)} />

      <motion.div
        style={{ scaleX: progress }}
        className="h-[3px] origin-left bg-crimson"
        aria-hidden="true"
      />

      <MobileNav
        open={menuOpen}
        lang={lang}
        activeId={activeId}
        onSelect={setActiveId}
        onClose={() => setMenuOpen(false)}
        onLangChange={(l) => setLocale(l === "np" ? "ne" : "en")}
      />
    </header>
  );
}
