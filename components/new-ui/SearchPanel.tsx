"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeftIcon, SearchIcon, TrendingUpIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { primarySections } from "../data/navigation";
import type { Lang } from "../types/navigation";

// Real, browsable sections — no fabricated counts or fake search history.
const browseTopics = primarySections.filter((s) => !["/", "/latest", "/trending", "/blog", "/jobs", "/tools", "/forex", "/gold-silver", "/date-converter", "/unicode-preeti", "/rashifal", "/calendar", "/login"].includes(s.href));

interface SearchPanelProps {
  open: boolean;
  lang: Lang;
  onClose: () => void;
}

export function SearchPanel({ open, lang, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;
    onClose();
    router.push(`/latest?search=${encodeURIComponent(value)}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-b border-paper-200 bg-white dark:border-ink-700 dark:bg-ink-800"
        >
          <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-10">
            <form
              onSubmit={handleSubmit}
              role="search"
              className="flex items-center gap-3 border-b-2 border-ink pb-3 dark:border-white"
            >
              <SearchIcon className="h-5 w-5 shrink-0 text-ink-500 dark:text-ink-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder={
                  lang === "np" ? "समाचार, विषय वा लेखक खोज्नुहोस्…" : "Search news, topics or authors…"
                }
                aria-label={lang === "np" ? "खोज्नुहोस्" : "Search"}
                className="w-full bg-transparent text-xl font-medium text-ink outline-none placeholder:text-ink-400 dark:text-white"
              />
              <kbd className="hidden shrink-0 items-center gap-1 rounded border border-paper-200 px-2 py-1 text-[11px] text-ink-500 sm:flex dark:border-ink-600 dark:text-ink-400">
                <CornerDownLeftIcon className="h-3 w-3" /> Enter
              </kbd>
              <button
                type="button"
                onClick={onClose}
                aria-label={lang === "np" ? "खोज बन्द गर्नुहोस्" : "Close search"}
                className="rounded p-1.5 text-ink-500 transition hover:bg-paper-100 hover:text-ink dark:text-ink-400 dark:hover:bg-ink-700 dark:hover:text-white"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500 dark:text-ink-400">
                <TrendingUpIcon className="h-3.5 w-3.5" />
                {lang === "np" ? "विषयहरू ब्राउज गर्नुहोस्" : "Browse topics"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {browseTopics.map((t) => (
                  <Link
                    key={t.id}
                    href={t.href}
                    onClick={onClose}
                    className={`rounded-full border border-paper-200 px-3 py-1.5 text-sm font-medium text-ink-600 transition hover:border-crimson hover:text-crimson dark:border-ink-600 dark:text-ink-400 dark:hover:border-white dark:hover:text-white ${
                      lang === "np" ? "font-np" : ""
                    }`}
                  >
                    {lang === "np" ? t.np : t.en}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
