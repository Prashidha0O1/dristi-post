import { NextResponse } from "next/server";
import { getRecentArticles } from "@/lib/publicQueries";

// Fresh on every request: powers the header's "latest" ticker with real
// published articles instead of hardcoded placeholders.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const articles = await getRecentArticles(5);
    const items = articles.map((a) => ({
      id: a.id,
      slug: a.slug,
      ne: a.title.ne,
      en: a.title.en,
      time: new Date(a.publishedAt).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    return NextResponse.json({ items });
  } catch {
    // The header must never hard-fail just because the ticker can't load.
    return NextResponse.json({ items: [] });
  }
}
