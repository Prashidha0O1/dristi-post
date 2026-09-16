"use server";

import { requireCapability } from "@/lib/auth/guard";

type Lang = "ne" | "en";
type Result = { ok: true; text: string } | { ok: false; error: string };

/**
 * Machine-translates a snippet between Nepali and English so an editor who
 * filled in only one language can pre-fill the other, then proofread it.
 * Uses Google's public translate endpoint (no key); it's best-effort — the
 * editor is expected to review the result before saving.
 */
export async function translateTextAction(
  text: string,
  from: Lang,
  to: Lang,
): Promise<Result> {
  await requireCapability("content.write");

  const source = (text ?? "").trim();
  if (!source) return { ok: false, error: "Nothing to translate — the source field is empty." };
  if (source.length > 5000) {
    return { ok: false, error: "Too long to translate at once (5000 character limit)." };
  }

  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx" +
      `&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(source)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: "Translation service is unavailable right now." };

    // Shape: [[[ "translated chunk", "source chunk", ... ], ...], ...]
    const data = (await res.json()) as unknown;
    const segments = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : [];
    const translated = segments
      .map((seg) => (Array.isArray(seg) ? seg[0] : ""))
      .join("");

    if (!translated.trim()) return { ok: false, error: "Couldn't translate that text." };
    return { ok: true, text: translated };
  } catch {
    return { ok: false, error: "Could not reach the translation service. Try again." };
  }
}
