"use client";

import { Box, Flex, Text, Input } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/localeContext";
import { useTheme } from "@/lib/themeContext";
import { navItems } from "@/lib/config";
import { provinces } from "@/lib/domain/province";
import { getBreakingArticles } from "@/lib/mockData";
import { formatNepaliDate } from "@/lib/nepaliDate";
import Image from "next/image";

const BRAND = "var(--color-brand)";

const DEFAULT_LOCATION = { lat: 27.7172, lon: 85.324, city: "Kathmandu", cityNe: "काठमाडौं" };

function TopInfoBar() {
  const { locale } = useLocale();
  const [info, setInfo] = useState({
    nepaliDate: "",
    adDate: "",
    weather: "",
    usd: "",
    inr: "",
  });

  useEffect(() => {
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
      weather: "",
      usd: "",
      inr: "",
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

    async function fetchWeatherAt(lat: number, lon: number, cityName: string) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        if (!res.ok) return;
        const data = await res.json();
        const temp = Math.round(data.current_weather?.temperature ?? 0);
        setInfo((prev) => ({ ...prev, weather: `${cityName} ${temp}°C` }));
      } catch {}
    }

    async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=${locale}`,
          { headers: { "Accept": "application/json" } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;
      } catch {
        return null;
      }
    }

    async function locateAndFetchWeather() {
      const fallback = () => {
        const cityName = locale === "ne" ? DEFAULT_LOCATION.cityNe : DEFAULT_LOCATION.city;
        fetchWeatherAt(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, cityName);
      };

      const cached = typeof window !== "undefined" ? localStorage.getItem("dp_geo") : null;
      if (cached) {
        try {
          const { lat, lon, city } = JSON.parse(cached);
          if (typeof lat === "number" && typeof lon === "number" && city) {
            fetchWeatherAt(lat, lon, city);
            return;
          }
        } catch {}
      }

      if (typeof navigator === "undefined" || !navigator.geolocation) {
        fallback();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const cityName = (await reverseGeocode(latitude, longitude)) ?? (locale === "ne" ? DEFAULT_LOCATION.cityNe : DEFAULT_LOCATION.city);
          try {
            localStorage.setItem("dp_geo", JSON.stringify({ lat: latitude, lon: longitude, city: cityName }));
          } catch {}
          fetchWeatherAt(latitude, longitude, cityName);
        },
        () => fallback(),
        { timeout: 5000, maximumAge: 3600000 }
      );
    }

    fetchLiveRates();
    locateAndFetchWeather();
  }, [locale]);

  return (
    <Box bg="var(--color-nav)" color="rgba(255,255,255,0.85)" fontSize="12px" fontFamily="var(--font-poppins), sans-serif">
      <Box maxW="var(--max-content)" mx="auto" px="var(--side-pad)">
        <Flex align="center" justify="space-between" h={{ base: "auto", sm: "30px" }} py={{ base: "6px", sm: "0" }} gap={{ base: "8px", sm: "16px" }} flexWrap={{ base: "wrap", sm: "nowrap" }}>
          <Flex align="center" gap={{ base: "8px", sm: "12px" }} overflow="hidden" flex="1" flexWrap="wrap" fontSize={{ base: "11px", sm: "12px" }}>
            <Text fontWeight="600" whiteSpace="nowrap">
              {info.nepaliDate}
            </Text>
            <Text color="rgba(255,255,255,0.3)">·</Text>
            <Text whiteSpace="nowrap">
              {info.adDate}
            </Text>
            {info.weather && (
              <>
                <Text color="rgba(255,255,255,0.3)">·</Text>
                <Text whiteSpace="nowrap">☁ {info.weather}</Text>
              </>
            )}
          </Flex>
          <Flex align="center" gap={{ base: "10px", md: "14px" }} flexShrink={0} display={{ base: "none", sm: "flex" }} fontSize={{ base: "11px", sm: "12px" }}>
            {info.usd && (
              <Text whiteSpace="nowrap" color="rgba(255,255,255,0.7)">
                {info.usd}
              </Text>
            )}
            {info.inr && (
              <Text whiteSpace="nowrap" color="rgba(255,255,255,0.7)">
                {info.inr}
              </Text>
            )}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}

function BreakingTicker() {
  const { t, localized } = useLocale();
  const articles = getBreakingArticles();
  const tickerText = articles.map((a) => localized(a.title)).join("    ●    ");

  return (
    <Box bg={BRAND} color="white" h="32px" overflow="hidden" display="flex" alignItems="center">
      <Box maxW="var(--max-content)" mx="auto" w="full" px="var(--side-pad)" display="flex" alignItems="center" gap="10px">
        <Text
          fontWeight="800"
          fontSize="11px"
          textTransform="uppercase"
          letterSpacing="0.8px"
          bg="rgba(255,255,255,0.2)"
          px="10px"
          py="2px"
          borderRadius="2px"
          flexShrink={0}
          lineHeight="1.5"
        >
          {t("breaking")}
        </Text>
        <Box overflow="hidden" whiteSpace="nowrap" flex="1">
          <Text
            fontSize="13px"
            fontWeight="500"
            css={{
              display: "inline-block",
              animation: "ticker 35s linear infinite",
              "@keyframes ticker": {
                "0%": { transform: "translateX(100%)" },
                "100%": { transform: "translateX(-100%)" },
              },
            }}
          >
            {tickerText}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

function Masthead() {
  const { locale, setLocale } = useLocale();

  return (
    <Box bg="var(--color-surface)" borderBottom="1px solid var(--color-border)">
      <Box maxW="var(--max-content)" mx="auto" px="var(--side-pad)" py="14px">
        <Flex justify="center" align="center">
          <Link href="/">
            <Box textAlign="center">
              <Text
                fontWeight="900"
                fontSize={{ base: "28px", md: "38px" }}
                lineHeight="1"
                letterSpacing="-0.5px"
                fontFamily="var(--font-mukta), sans-serif"
              >
                <Text as="span" color={BRAND}>
                  {locale === "ne" ? "दृष्टि" : "Dristi"}
                </Text>
                <Text as="span" color="var(--color-nav)" ml="6px">
                  {locale === "ne" ? "पोस्ट" : "Post"}
                </Text>
              </Text>
              <Text fontSize="10px" color="var(--color-muted)" letterSpacing="2px" textTransform="uppercase" mt="-2px" fontWeight="400">
                {locale === "ne" ? "नेपालको विश्वसनीय समाचार" : "Nepal's Trusted News"}
              </Text>
            </Box>
          </Link>

          <Flex align="center" gap="8px" position="absolute" right="var(--side-pad)" display={{ base: "none", md: "flex" }}>
            <Box
              as="button"
              onClick={() => setLocale("ne")}
              fontSize="13px"
              fontWeight={locale === "ne" ? "700" : "400"}
              color={locale === "ne" ? BRAND : "#888"}
              bg="transparent"
              border="none"
              cursor="pointer"
              px="4px"
              borderBottom={locale === "ne" ? `2px solid ${BRAND}` : "2px solid transparent"}
              pb="2px"
              transition="all 0.15s"
            >
              नेपाली
            </Box>
            <Text color="var(--color-border)" fontSize="12px">|</Text>
            <Box
              as="button"
              onClick={() => setLocale("en")}
              fontSize="13px"
              fontWeight={locale === "en" ? "700" : "400"}
              color={locale === "en" ? BRAND : "#888"}
              bg="transparent"
              border="none"
              cursor="pointer"
              px="4px"
              borderBottom={locale === "en" ? `2px solid ${BRAND}` : "2px solid transparent"}
              pb="2px"
              transition="all 0.15s"
            >
              English
            </Box>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}

function NavBar() {
  const { localized, t, locale, setLocale } = useLocale();
  const { resolved, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filterOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  return (
    <>
      <Box
        bg="var(--color-nav)"
        position="sticky"
        top="0"
        zIndex="1000"
      >
        <Box maxW="var(--max-content)" mx="auto" px="var(--side-pad)">
          <Flex align="center" justify="space-between" h="44px">
            <Flex align="center" gap="0" h="full" display={{ base: "none", lg: "flex" }}>
              {navItems.map((item) =>
                item.children ? (
                  <Box key={item.href} position="relative" role="group" h="full">
                    <Link href={item.href}>
                      <Flex
                        align="center"
                        h="44px"
                        px="14px"
                        color="rgba(255,255,255,0.8)"
                        fontSize="15px"
                        fontWeight="500"
                        transition="all 0.15s"
                        _hover={{ color: "white", bg: "rgba(255,255,255,0.08)" }}
                        cursor="pointer"
                        gap="4px"
                      >
                        {localized(item.label)}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                      </Flex>
                    </Link>
                    <Box
                      position="absolute"
                      top="44px"
                      left="0"
                      bg="var(--color-nav)"
                      border="1px solid rgba(255,255,255,0.1)"
                      borderRadius="0 0 4px 4px"
                      minW="180px"
                      py="6px"
                      zIndex="1001"
                      opacity="0"
                      visibility="hidden"
                      transition="all 0.15s"
                      _groupHover={{ opacity: 1, visibility: "visible" }}
                    >
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}>
                          <Box
                            px="16px"
                            py="8px"
                            fontSize="14px"
                            color="rgba(255,255,255,0.75)"
                            _hover={{ color: "white", bg: "rgba(255,255,255,0.08)" }}
                            transition="all 0.15s"
                            cursor="pointer"
                          >
                            {localized(child.label)}
                          </Box>
                        </Link>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Link key={item.href} href={item.href}>
                    <Flex
                      align="center"
                      h="44px"
                      px="14px"
                      color="rgba(255,255,255,0.8)"
                      fontSize="15px"
                      fontWeight="500"
                      transition="all 0.15s"
                      _hover={{ color: "white", bg: "rgba(255,255,255,0.08)" }}
                      cursor="pointer"
                    >
                      {localized(item.label)}
                    </Flex>
                  </Link>
                )
              )}
            </Flex>

            <Flex align="center" gap="2" display={{ base: "flex", lg: "none" }}>
              <Box
                as="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                color="white"
                p="6px"
                cursor="pointer"
                bg="transparent"
                border="none"
              >
                {mobileOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                )}
              </Box>
              <Link href="/">
                <Text color="white" fontWeight="700" fontSize="15px">
                  {locale === "ne" ? "दृष्टि पोस्ट" : "Dristi Post"}
                </Text>
              </Link>
            </Flex>

            <Flex align="center" gap="6px">
              <Box
                as="button"
                onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
                color="rgba(255,255,255,0.7)"
                p="6px"
                cursor="pointer"
                bg="transparent"
                border="none"
                transition="color 0.15s"
                _hover={{ color: "white" }}
                aria-label="Toggle dark mode"
              >
                {resolved === "dark" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </Box>
              {searchOpen && (
                <Input
                  placeholder={t("search")}
                  size="sm"
                  maxW="180px"
                  bg="rgba(255,255,255,0.1)"
                  border="1px solid rgba(255,255,255,0.2)"
                  borderRadius="2px"
                  color="white"
                  _placeholder={{ color: "rgba(255,255,255,0.5)" }}
                  autoFocus
                  px="12px"
                  h="32px"
                  fontSize="13px"
                />
              )}
              <Box
                as="button"
                onClick={() => setSearchOpen(!searchOpen)}
                color="rgba(255,255,255,0.7)"
                p="6px"
                cursor="pointer"
                bg="transparent"
                border="none"
                transition="color 0.15s"
                _hover={{ color: "white" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </Box>
              <Box position="relative" ref={filterRef}>
                <Box
                  as="button"
                  onClick={() => setFilterOpen(!filterOpen)}
                  p="4px"
                  cursor="pointer"
                  bg="transparent"
                  border="none"
                  transition="opacity 0.15s"
                  opacity={filterOpen ? 1 : 0.7}
                  _hover={{ opacity: 1 }}
                  aria-label="Province filter"
                >
                  <Image src="/filter.png" alt="Filter" width={20} height={20} style={{ filter: "invert(1)" }} />
                </Box>
                {filterOpen && (
                  <Box
                    position="absolute"
                    right="0"
                    top="100%"
                    mt="8px"
                    bg="var(--color-surface)"
                    border="1px solid var(--color-border)"
                    borderRadius="6px"
                    boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                    zIndex="1200"
                    minW="180px"
                    py="6px"
                  >
                    <Text px="12px" py="6px" fontSize="11px" fontWeight="700" color="var(--color-muted)" textTransform="uppercase" letterSpacing="0.5px">
                      {locale === "ne" ? "प्रदेश" : "Province"}
                    </Text>
                    {provinces.map((p) => (
                      <Link key={p.slug} href={`/province/${p.slug}`} onClick={() => setFilterOpen(false)}>
                        <Text
                          px="12px"
                          py="8px"
                          fontSize="14px"
                          color="var(--color-body)"
                          _hover={{ bg: "var(--color-tag-bg)", color: BRAND }}
                          transition="all 0.1s"
                          cursor="pointer"
                        >
                          {locale === "ne" ? p.name.ne : p.name.en}
                        </Text>
                      </Link>
                    ))}
                  </Box>
                )}
              </Box>
            </Flex>
          </Flex>
        </Box>
      </Box>

      {mobileOpen && (
        <Box
          position="fixed"
          inset="0"
          bg="var(--color-surface)"
          zIndex="1100"
          overflowY="auto"
          display={{ lg: "none" }}
        >
          <Flex
            align="center"
            justify="space-between"
            h="52px"
            px="16px"
            bg="var(--color-nav)"
            position="sticky"
            top="0"
            zIndex="1"
          >
            <Text color="white" fontWeight="800" fontSize="17px">
              {locale === "ne" ? "दृष्टि पोस्ट" : "Dristi Post"}
            </Text>
            <Box
              as="button"
              onClick={() => setMobileOpen(false)}
              color="white"
              p="6px"
              cursor="pointer"
              bg="transparent"
              border="none"
              aria-label="Close menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </Box>
          </Flex>
          <Flex direction="column">
            {navItems.map((item) => (
              <Box key={item.href}>
                <Link href={item.href}>
                  <Box
                    px="20px"
                    py="14px"
                    fontSize="16px"
                    fontWeight="500"
                    color="var(--color-body)"
                    borderBottom="1px solid var(--color-border)"
                    _hover={{ color: BRAND }}
                    transition="color 0.15s"
                    onClick={() => setMobileOpen(false)}
                    cursor="pointer"
                  >
                    {localized(item.label)}
                  </Box>
                </Link>
                {item.children?.map((child) => (
                  <Link key={child.href} href={child.href}>
                    <Box
                      px="20px"
                      pl="40px"
                      py="10px"
                      fontSize="14px"
                      fontWeight="400"
                      color="var(--color-subtle)"
                      borderBottom="1px solid var(--color-border)"
                      _hover={{ color: BRAND }}
                      transition="color 0.15s"
                      onClick={() => setMobileOpen(false)}
                      cursor="pointer"
                    >
                      {localized(child.label)}
                    </Box>
                  </Link>
                ))}
              </Box>
            ))}
            <Flex px="20px" py="16px" gap="14px">
              <Box as="button" onClick={() => { setLocale("ne"); setMobileOpen(false); }}
                fontSize="15px" fontWeight={locale === "ne" ? "700" : "400"} color={locale === "ne" ? BRAND : "#888"}
                bg="transparent" border="none" cursor="pointer">
                नेपाली
              </Box>
              <Text color="var(--color-border)">|</Text>
              <Box as="button" onClick={() => { setLocale("en"); setMobileOpen(false); }}
                fontSize="15px" fontWeight={locale === "en" ? "700" : "400"} color={locale === "en" ? BRAND : "#888"}
                bg="transparent" border="none" cursor="pointer">
                English
              </Box>
            </Flex>
          </Flex>
        </Box>
      )}
    </>
  );
}

export function Header() {
  return (
    <Box as="header">
      <TopInfoBar />
      <BreakingTicker />
      <Masthead />
      <NavBar />
    </Box>
  );
}
