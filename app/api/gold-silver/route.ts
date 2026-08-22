import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch("https://www.fenegosida.org/", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "DristiPost/1.0" },
    });
    if (!res.ok) return NextResponse.json({ rates: null });

    const html = await res.text();

    const fineGold = extractRate(html, /Fine Gold[^<]*<[^>]*>([^<]*)/i) || extractRate(html, /छापावाल सुन[^<]*<[^>]*>([^<]*)/i);
    const tejabi = extractRate(html, /Tejabi[^<]*<[^>]*>([^<]*)/i) || extractRate(html, /तेजाबी सुन[^<]*<[^>]*>([^<]*)/i);
    const silver = extractRate(html, /Silver[^<]*<[^>]*>([^<]*)/i) || extractRate(html, /चाँदी[^<]*<[^>]*>([^<]*)/i);

    return NextResponse.json({
      rates: {
        fineGold: fineGold || "—",
        tejabi: tejabi || "—",
        silver: silver || "—",
      },
    });
  } catch {
    return NextResponse.json({ rates: null });
  }
}

function extractRate(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  if (!match?.[1]) return null;
  const cleaned = match[1].replace(/[,\s]/g, "").trim();
  return cleaned || null;
}
