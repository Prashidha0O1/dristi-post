"use client";

import { AnimatePresence, motion } from "framer-motion";
import { XIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { primarySections, provinces, secondarySections } from "../data/navigation";
import type { Lang } from "../types/navigation";

interface MobileNavProps {
  open: boolean;
  lang: Lang;
  activeId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onLangChange: (lang: Lang) => void;
}

export function MobileNav({ open, lang, activeId, onSelect, onClose, onLangChange }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={lang === "np" ? "मेनु" : "Menu"}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-y-0 right-0 z-50 flex w-[min(360px,88vw)] flex-col bg-white lg:hidden dark:bg-ink-800"
          >
            <div className="flex items-center justify-between border-b border-paper-200 px-5 py-4 dark:border-ink-700">
              <img src="/dristi_times_logo.svg" alt="Dristi Times Logo" className="h-12 w-auto dark:bg-white dark:p-1 dark:rounded-md" />
              <button
                type="button"
                onClick={onClose}
                aria-label={lang === "np" ? "बन्द गर्नुहोस्" : "Close menu"}
                className="rounded-md p-2 text-ink-500 transition hover:bg-paper-100 hover:text-ink dark:text-ink-400 dark:hover:bg-ink-700 dark:hover:text-white"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-paper-100 p-1 dark:bg-ink-700">
                {(["np", "en"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onLangChange(l)}
                    aria-pressed={lang === l}
                    className={`rounded-md py-2 text-sm font-semibold transition ${
                      lang === l
                        ? "bg-white text-ink shadow-sm dark:bg-ink-800 dark:text-white"
                        : "text-ink-500 dark:text-ink-400"
                    }`}
                  >
                    {l === "np" ? "नेपाली" : "English"}
                  </button>
                ))}
              </div>

              
              <Link
                href="/login"
                onClick={onClose}
                className={`mb-6 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-[16px] font-semibold text-white transition hover:bg-crimson dark:bg-white dark:text-ink dark:hover:bg-crimson dark:hover:text-white ${lang === "np" ? "font-np" : ""}`}
              >
                <UserIcon className="h-5 w-5" />
                {lang === "np" ? "लगइन" : "Login"}
              </Link>

              <ul className="space-y-0.5">
                {[...primarySections, ...secondarySections].map((s) => (
                  <li key={s.id}>
                    <Link
                      href={s.href}
                      onClick={() => {
                        onSelect(s.id);
                        onClose();
                      }}
                      aria-current={s.id === activeId ? "page" : undefined}
                      className={`flex items-center justify-between rounded-lg px-3 py-3 text-[18px] transition ${
                        lang === "np" ? "font-np font-semibold" : "font-medium"
                      } ${
                        s.id === activeId
                          ? "bg-crimson-50 text-crimson dark:bg-crimson/15"
                          : "text-ink hover:bg-paper-50 dark:text-paper-100 dark:hover:bg-ink-700"
                      }`}
                    >
                      {lang === "np" ? s.np : s.en}
                      {s.id === activeId && <span className="h-1.5 w-1.5 rounded-full bg-crimson" />}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                {lang === "np" ? "प्रदेश" : "Provinces"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {provinces.map((p) => (
                  <Link
                    key={p.id}
                    href={p.href}
                    onClick={onClose}
                    className={`rounded-full border border-paper-200 px-3 py-1.5 text-[14px] text-ink-600 dark:border-ink-600 dark:text-ink-400 ${
                      lang === "np" ? "font-np" : ""
                    }`}
                  >
                    {lang === "np" ? p.np : p.en}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
