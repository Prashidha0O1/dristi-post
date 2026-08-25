"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/localeContext";
import { formatNepaliDate } from "@/lib/nepaliDate";

export function TopInfoBar() {
  const { locale } = useLocale();
  const [info, setInfo] = useState({
    nepaliDate: "",
    adDate: "",
    weather: "",
    usd: "",
    inr: "",
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const nepaliDate = formatNepaliDate(now, locale);
    const adDate = now.toLocaleDateString(locale === "ne" ? "ne-NP" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    setInfo({
      nepaliDate,
      adDate,
      weather: locale === "ne" ? "..." : "...",
      usd: "...",
      inr: "...",
    });

    async function fetchLiveRates() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!res.ok) return;
        const data = await res.json();
        const npr = data.rates?.NPR;
        const inrRate = data.rates?.INR;
        if (npr) {
          setInfo((prev) => ({
            ...prev,
            usd: `USD ${npr.toFixed(2)}`,
            inr: inrRate ? `INR ${(npr / inrRate).toFixed(2)}` : prev.inr,
          }));
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
          setInfo((prev) => ({ ...prev, weather: `${displayCity} ${temp}°C` }));
        }
      } catch (e) {}

      // 2. Ask for precise GPS location
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Reverse geocode to get exact city
              const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
              const geoReq = await fetch(geoUrl, {
                headers: { "Accept-Language": locale === "ne" ? "ne" : "en-US" }
              });
              let preciseCity = displayCity;
              if (geoReq.ok) {
                const geoData = await geoReq.json();
                const address = geoData.address || {};
                preciseCity = address.city || address.town || address.village || address.county || preciseCity;
              }

              // Fetch exact weather
              const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
              );
              if (weatherRes.ok) {
                const weatherData = await weatherRes.json();
                const preciseTemp = Math.round(weatherData.current_weather?.temperature ?? 26);
                setInfo((prev) => ({
                  ...prev,
                  weather: `${preciseCity} ${preciseTemp}°C`,
                }));
              }
            } catch (err) {}
          },
          (error) => {
            // User denied or error occurred; we keep the IP-based fallback
          }
        );
      }
    }

    fetchLiveRates();
    fetchWeather();
  }, [locale]);

  if (!mounted) {
    return <div className="bg-[#012861] h-[30px] border-b border-white/10 w-full" />;
  }

  return (
    <div className="bg-[#012861] text-white/85 text-[12px] font-sans border-b border-white/10 transition-opacity duration-300">
      <div className="mx-auto max-w-[var(--max-content)] h-[30px] px-[var(--side-pad)]">
        <style dangerouslySetInnerHTML={{ __html: `
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
        <div className="flex items-center h-full gap-3 overflow-x-auto whitespace-nowrap hide-scroll">
          <span className="font-semibold shrink-0 text-[12px]">{info.nepaliDate}</span>
          {info.adDate && <span className="text-white/30 shrink-0">·</span>}
          <span className="shrink-0 text-[12px]">{info.adDate}</span>
          {info.weather && <span className="text-white/30 shrink-0">·</span>}
          <span className="shrink-0 text-[12px]">{info.weather ? `☁ ${info.weather}` : ""}</span>
          
          <div className="flex-1 min-w-[16px]"></div>
          
          <span className="text-white/70 shrink-0 text-[12px]">{info.usd}</span>
          <span className="text-white/70 shrink-0 text-[12px]">{info.inr}</span>
        </div>
      </div>
    </div>
  );
}
