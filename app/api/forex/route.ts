import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString().slice(0, 10);
  
  const url = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=20&from=${sevenDaysAgo}&to=${today}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    
    const payload = data?.data?.payload;
    if (!payload || !Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json({ rates: [] });
    }
    
    const latestData = payload[payload.length - 1];
    const dayRates = latestData.rates || [];
    
    const extracted = dayRates.map((r: any) => ({
      name: r.currency.name,
      iso3: r.currency.iso3,
      unit: r.currency.unit,
      buy: r.buy,
      sell: r.sell,
    }));

    return NextResponse.json({ rates: extracted, date: latestData.date });
  } catch (error) {
    return NextResponse.json({ rates: [] });
  }
}
