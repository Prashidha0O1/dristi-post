"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/localeContext";
import { formatNepaliDate, formatNepaliDateShort } from "@/lib/nepaliDate";

export function TopInfoBar() {
  const { locale } = useLocale();
  const [info, setInfo] = useState({
    nepaliDate: "",
    nepaliDateShort: "",
    adDate: "",
    adDateShort: "",
    weather: "",
    usd: "",
    inr: "",
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const nepaliDate = formatNepaliDate(now, locale);
    const nepaliDateShort = formatNepaliDateShort(now, locale);
    const adDateShort = now.toLocaleDateString(locale === "ne" ? "ne-NP" : "en-US", { weekday: "short", month: "short", day: "numeric" });
    const adDate = now.toLocaleDateString(locale === "ne" ? "ne-NP" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    setInfo({
      nepaliDate,
      nepaliDateShort,
      adDate,
      adDateShort,
      weather: locale === "ne" ? "..." : "...",
      usd: "...",
      inr: "...",
    });

    // Rates + weather are cached for the browser session so navigating between
    // pages doesn't refire 3 external requests every time the header mounts.
    const CACHE_KEY = `dp-topbar-${locale}`;
    const CACHE_TTL = 30 * 60 * 1000;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { at: number; weather: string; usd: string; inr: string };
        if (Date.now() - cached.at < CACHE_TTL) {
          setInfo((prev) => ({ ...prev, weather: cached.weather, usd: cached.usd, inr: cached.inr }));
          return;
        }
      }
    } catch {}

    const saved: { weather: string; usd: string; inr: string } = { weather: "", usd: "", inr: "" };
    function persist() {
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), ...saved }));
      } catch {}
    }

    async function fetchLiveRates() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!res.ok) return;
        const data = await res.json();
        const npr = data.rates?.NPR;
        const inrRate = data.rates?.INR;
        if (npr) {
          saved.usd = `USD ${npr.toFixed(2)}`;
          saved.inr = inrRate ? `INR ${(npr / inrRate).toFixed(2)}` : "";
          setInfo((prev) => ({ ...prev, usd: saved.usd, inr: saved.inr || prev.inr }));
          persist();
        }
      } catch {}
    }

    async function fetchWeather() {
      // 1. Initial IP-based quick fetch (no permission required)
      let lat = 27.7172;
      let lon = 85.324;
      let city = "Kathmandu";
      
      const nepaliCities: Record<string, string> = {
        Kathmandu: "काठमाडौं",
        Pokhara: "पोखरा",
        Lalitpur: "ललितपुर",
        Bharatpur: "भरतपुर",
        Biratnagar: "विराटनगर",
        Birgunj: "वीरगन्ज",
        Janakpur: "जनकपुर",
        Dharan: "धरान",
        Butwal: "बुटवल",
        Hetauda: "हेटौंडा",
        Nepalgunj: "नेपालगन्ज",
        Itahari: "इटहरी",
        Bhaktapur: "भक्तपुर",
      };

      try {
        const geoRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.latitude && geoData.longitude && geoData.city) {
            lat = parseFloat(geoData.latitude);
            lon = parseFloat(geoData.longitude);
            city = geoData.city;
          }
        }
      } catch (e) {}

      const displayCity = locale === "ne" ? (nepaliCities[city] || city) : city;

      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        if (res.ok) {
          const data = await res.json();
          const temp = Math.round(data.current_weather?.temperature ?? 26);
          saved.weather = `${displayCity} ${temp}°C`;
          setInfo((prev) => ({ ...prev, weather: saved.weather }));
          persist();
        }
      } catch (e) {}
      // No GPS prompt: asking for location on page load hurts UX and the
      // Lighthouse Best Practices score. The IP-based city is accurate enough.
    }

    // Defer the network work until the browser is idle, so these third-party
    // requests don't compete with the page's own content on a slow phone.
    const run = () => {
      fetchLiveRates();
      fetchWeather();
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(run, 2500);
    return () => window.clearTimeout(t);
  }, [locale]);

  if (!mounted) {
    return <div className="bg-[#012861] h-[30px] border-b border-white/10 w-full" />;
  }

  return (
    <div className="bg-[#012861] text-white/85 text-[11px] sm:text-[12px] font-sans border-b border-white/10 transition-opacity duration-300">
      <div className="mx-auto max-w-[var(--max-content)] h-[30px] px-[var(--side-pad)]">
        <div className="flex items-center justify-between h-full gap-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="font-semibold text-[11px] sm:text-[12px]">
              <span className="hidden sm:inline">{locale === "ne" ? info.nepaliDate : info.adDate}</span>
              <span className="inline sm:hidden">{locale === "ne" ? info.nepaliDateShort : info.adDateShort}</span>
            </span>
            {info.weather && <span className="text-white/30">·</span>}
            <span className="text-[11px] sm:text-[12px]">{info.weather ? `☁ ${info.weather}` : ""}</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-white/70 text-[11px] sm:text-[12px]">{info.usd}</span>
            <span className="text-white/70 text-[11px] sm:text-[12px]">{info.inr}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
