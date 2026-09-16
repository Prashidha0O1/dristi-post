"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRightIcon, PauseIcon, PlayIcon, XIcon } from "lucide-react";
import Link from "next/link";
import type { Lang } from "../types/navigation";

interface BreakingTickerProps {
  lang: Lang;
  onDismiss: () => void;
}

/** One rotating headline, sourced live from the newsroom's latest articles. */
interface Headline {
  id: string;
  slug: string;
  ne?: string;
  en?: string;
  time: string;
}

export function BreakingTicker({ lang, onDismiss }: BreakingTickerProps) {
  const [items, setItems] = useState<Headline[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Pull the real latest published articles once on mount.
  useEffect(() => {
    let alive = true;
    fetch("/api/headlines")
      .then((r) => r.json())
      .then((data) => {
        if (alive && Array.isArray(data.items)) setItems(data.items);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (paused || items.length === 0) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [paused, items.length]);

  // Nothing to show yet (still loading, or no published articles): render
  // nothing rather than a placeholder headline.
  if (items.length === 0) return null;

  const item = items[index % items.length];

  return (
    <div
      className="border-b border-crimson/30 bg-crimson text-white"
      role="region"
      aria-label={lang === "np" ? "ताजा समाचार" : "Latest news"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto flex h-10 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <span className="flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          {lang === "np" ? "ताजा" : "Latest"}
        </span>

        <span className="hidden h-4 w-px bg-white/30 sm:block" />

        <div className="relative min-w-0 flex-1 overflow-hidden">
          {/* initial={false} makes the first headline mount already at its
              animate values instead of at opacity:0. Without it, anything that
              interrupts Framer's mount animation (a hydration mismatch
              elsewhere regenerating the tree) leaves the span stuck at
              opacity:0 and the headline silently invisible. Rotations after
              the first still cross-fade normally. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={item.id}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 truncate text-sm"
            >
              <span className="shrink-0 font-mono text-[11px] text-white/70">{item.time}</span>
              <Link href={`/article/${item.slug}`} className="truncate hover:underline">
                <span className={lang === "np" ? "font-np" : ""}>
                  {lang === "np" ? item.ne || item.en : item.en || item.ne}
                </span>
              </Link>
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div className="mr-1 hidden items-center gap-1.5 sm:flex" aria-hidden="true">
            {items.map((b, i) => (
              <button
                type="button"
                key={b.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to headline ${i + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume headlines" : "Pause headlines"}
            className="rounded p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            {paused ? <PlayIcon className="h-3.5 w-3.5" /> : <PauseIcon className="h-3.5 w-3.5" />}
          </button>
          <Link
            href={`/article/${item.slug}`}
            className="hidden items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 transition hover:bg-white/15 hover:text-white md:inline-flex"
          >
            {lang === "np" ? "पढ्नुहोस्" : "Read"}
            <ArrowUpRightIcon className="h-3 w-3" />
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={lang === "np" ? "बन्द गर्नुहोस्" : "Dismiss breaking bar"}
            className="rounded p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
