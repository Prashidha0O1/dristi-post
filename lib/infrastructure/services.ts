import type { Clock, IdGenerator, Slugger } from "../domain/ports";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class RandomIdGenerator implements IdGenerator {
  generate(): string {
    // crypto.randomUUID is available in Node 18+ and all modern browsers.
    return globalThis.crypto.randomUUID();
  }
}

/**
 * Devanagari has no standard ASCII transliteration that is both lossless and
 * readable, so Nepali-only titles fall back to a transliteration table for the
 * common consonants/vowels and drop anything unmapped. Editors who care about
 * the URL can supply an English title, which is used in preference.
 */
const DEVANAGARI_MAP: Record<string, string> = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ii", "उ": "u", "ऊ": "uu",
  "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "अं": "an",
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "n",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v", "श": "sh",
  "ष": "sh", "स": "s", "ह": "h", "क्ष": "ksh", "त्र": "tr", "ज्ञ": "gy",
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
};

export class SlugGenerator implements Slugger {
  async slugify(
    source: string,
    isTaken: (candidate: string) => Promise<boolean>,
  ): Promise<string> {
    const base = this.toSlug(source) || "article";

    if (!(await isTaken(base))) return base;

    // Append a counter until free. Bounded so a pathological data set cannot
    // spin forever; falls back to a random suffix.
    for (let n = 2; n <= 50; n++) {
      const candidate = `${base}-${n}`;
      if (!(await isTaken(candidate))) return candidate;
    }
    return `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private toSlug(source: string): string {
    let out = "";
    for (const char of source.trim()) {
      out += DEVANAGARI_MAP[char] ?? char;
    }
    return out
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // strip combining accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/g, "");
  }
}
