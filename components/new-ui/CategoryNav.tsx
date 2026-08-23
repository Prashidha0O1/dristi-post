"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { primarySections, secondarySections, provinces } from "../data/navigation";
import type { Lang } from "../types/navigation";

interface CategoryNavProps {
  lang: Lang;
  activeId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
  /**
   * Scopes the sliding underline's shared-layout id to one placement. The
   * header renders this component twice (a stacked row and an inline row) and
   * swaps them on scroll; with a single shared id, Framer treats the unmount
   * and mount as one element and animates the underline across the page,
   * leaving a stray bar over the content.
   */
  layoutScope?: string;
}

export function CategoryNav({ lang, activeId, onSelect, compact = false, layoutScope = "default" }: CategoryNavProps) {
  const [openMenu, setOpenMenu] = useState<"more" | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <nav aria-label={lang === "np" ? "मुख्य नेभिगेसन" : "Main navigation"}>
        <ul className="flex items-center gap-1">
          {primarySections.map((s) => {
            const active = s.id === activeId;
            return (
              <li key={s.id}>
                <Link
                  href={s.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onSelect(s.id)}
                  className={`relative block rounded-md px-3 transition-colors ${
                    compact ? "py-2 text-sm" : "py-2.5 text-[15px]"
                  } ${lang === "np" ? "font-np font-semibold" : "font-medium"} ${
                    active
                      ? "text-ink dark:text-white"
                      : "text-ink-500 hover:text-ink dark:text-ink-400 dark:hover:text-white"
                  }`}
                >
                  {lang === "np" ? s.np : s.en}
                  {active && (
                    <motion.span
                      layoutId={`nav-underline-${layoutScope}`}
                      className="absolute inset-x-3 -bottom-[7px] h-[3px] rounded-full bg-crimson"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "more" ? null : "more"))}
              aria-expanded={openMenu === "more"}
              aria-haspopup="true"
              className={`flex items-center gap-1 rounded-md px-3 text-ink-500 transition-colors hover:text-ink dark:text-ink-400 dark:hover:text-white ${
                compact ? "py-2 text-sm" : "py-2.5 text-[15px]"
              } ${lang === "np" ? "font-np font-semibold" : "font-medium"}`}
            >
              {lang === "np" ? "थप" : "More"}
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${openMenu === "more" ? "rotate-180" : ""}`}
              />
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {openMenu === "more" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 top-full z-40 mt-3 w-[min(760px,calc(100vw-3rem))] rounded-xl border border-paper-200 bg-white p-5 shadow-xl shadow-ink/10 dark:border-ink-700 dark:bg-ink-800"
          >
            <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                  {lang === "np" ? "अन्य विषयहरू" : "More sections"}
                </p>
                <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                  {secondarySections.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={s.href}
                        onClick={() => {
                          onSelect(s.id);
                          setOpenMenu(null);
                        }}
                        className="group block rounded-lg px-3 py-2 transition hover:bg-paper-50 dark:hover:bg-ink-700"
                      >
                        <span
                          className={`block text-sm font-semibold text-ink group-hover:text-crimson dark:text-paper-100 ${
                            lang === "np" ? "font-np" : ""
                          }`}
                        >
                          {lang === "np" ? s.np : s.en}
                        </span>
                        {s.blurb && (
                          <span className="font-np mt-0.5 block text-xs text-ink-400">{s.blurb}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-paper-200 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0 dark:border-ink-700">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                  {lang === "np" ? "प्रदेश" : "Provinces"}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {provinces.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={p.href}
                        onClick={() => setOpenMenu(null)}
                        className={`inline-block rounded-full border border-paper-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-ink hover:text-ink dark:border-ink-600 dark:text-ink-400 dark:hover:border-white dark:hover:text-white ${
                          lang === "np" ? "font-np" : ""
                        }`}
                      >
                        {lang === "np" ? p.np : p.en}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
