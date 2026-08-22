import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const url = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=20&from=${today}&to=${today}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const fallback = await fetch(
        `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=20&from=${yesterday}&to=${yesterday}`,
        { next: { revalidate: 3600 } }
      );
      if (!fallback.ok) return NextResponse.json({ rates: [] });
      const data = await fallback.json();
      return NextResponse.json({ rates: extractRates(data), date: yesterday });
    }
    const data = await res.json();
    return NextResponse.json({ rates: extractRates(data), date: today });
  } catch {
    return NextResponse.json({ rates: [] });
  }
}

function extractRates(data: Record<string, unknown>) {
  const payload = (data as { data?: { payload?: Array<{ rates?: Array<{ currency: { name: string; iso3: string; unit: number }; buy: string; sell: string }> }> } }).data?.payload;
  if (!payload || payload.length === 0) return [];
  const dayRates = payload[0].rates;
  if (!dayRates) return [];
  return dayRates.map((r) => ({
    name: r.currency.name,
    iso3: r.currency.iso3,
    unit: r.currency.unit,
    buy: r.buy,
    sell: r.sell,
  }));
}
