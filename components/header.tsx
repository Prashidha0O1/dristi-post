"use client";

import {
  Box,
  Button,
  Drawer,
  Flex,
  Grid,
  IconButton,
  Input,
  Menu,
  Portal,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import {
  ArrowUpRight,
  ChevronDown,
  Cloud,
  MapPin,
  Menu as MenuIcon,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { useLocale } from "@/lib/localeContext";
import { useTheme } from "@/lib/themeContext";
import {
  navItems,
  categoryNavItems,
  toolNavItems,
} from "@/lib/config";
import { provinces } from "@/lib/domain/province";
import { getBreakingArticles } from "@/lib/mockData";
import { formatNepaliDate } from "@/lib/nepaliDate";
import type { NavItem } from "@/lib/types";

const BRAND = "var(--color-brand)";
const DEFAULT_LOCATION = {
  lat: 27.7172,
  lon: 85.324,
  city: "Kathmandu",
  cityNe: "काठमाडौं",
};

function isPathActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function navLabel(item: NavItem, locale: "ne" | "en") {
  if (item.href === "/category/business") {
    return locale === "ne" ? "व्यापार" : "Business";
  }
  return item.label[locale];
}

function IconHint({ label, children }: { label: string; children: ReactElement }) {
  return (
    <Tooltip.Root openDelay={450} closeDelay={100}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content bg="var(--color-nav)" color="white" px="8px" py="5px" fontSize="11px">
          {label}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
}

function TopInfoBar() {
  const { locale } = useLocale();
  const dateInfo = useMemo(() => {
    const now = new Date();
    return {
      nepaliDate: formatNepaliDate(now, locale),
      adDate: now.toLocaleDateString(locale === "ne" ? "ne-NP" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      updated: now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  }, [locale]);
  const [info, setInfo] = useState({ weather: "", usd: "", inr: "" });

  useEffect(() => {
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
      } catch {
        // The utility strip remains useful when an external rate service is unavailable.
      }
    }

    async function fetchWeatherAt(lat: number, lon: number, cityName: string) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
        );
        if (!res.ok) return;
        const data = await res.json();
        const temp = Math.round(data.current_weather?.temperature ?? 0);
        setInfo((prev) => ({ ...prev, weather: `${cityName} ${temp}°C` }));
      } catch {
        // Weather is supplemental and should never block the shell.
      }
    }

    async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=${locale}`,
          { headers: { Accept: "application/json" } },
        );
        if (!res.ok) return null;
        const data = await res.json();
        return (
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          null
        );
      } catch {
        return null;
      }
    }

    function fetchFallbackWeather() {
      const cityName = locale === "ne" ? DEFAULT_LOCATION.cityNe : DEFAULT_LOCATION.city;
      void fetchWeatherAt(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, cityName);
    }

    function locateAndFetchWeather() {
      const cached = typeof window !== "undefined" ? localStorage.getItem("dp_geo") : null;
      if (cached) {
        try {
          const { lat, lon, city, cityNe } = JSON.parse(cached);
          if (typeof lat === "number" && typeof lon === "number") {
            const cityName = locale === "ne" ? cityNe || city : city;
            if (cityName) {
              void fetchWeatherAt(lat, lon, cityName);
              return;
            }
          }
        } catch {
          // Fall back to the default location below.
        }
      }

      if (typeof navigator === "undefined" || !navigator.geolocation) {
        fetchFallbackWeather();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const cityName =
            (await reverseGeocode(latitude, longitude)) ??
            (locale === "ne" ? DEFAULT_LOCATION.cityNe : DEFAULT_LOCATION.city);
          try {
            localStorage.setItem(
              "dp_geo",
              JSON.stringify({ lat: latitude, lon: longitude, city: cityName, cityNe: cityName }),
            );
          } catch {
            // Local storage can be unavailable in private browsing contexts.
          }
          void fetchWeatherAt(latitude, longitude, cityName);
        },
        fetchFallbackWeather,
        { timeout: 5000, maximumAge: 3600000 },
      );
    }

    void fetchLiveRates();
    locateAndFetchWeather();
  }, [locale]);

  return (
    <Box bg="var(--color-nav)" color="rgba(255,255,255,0.85)" fontSize="12px">
      <Box maxW="var(--max-content)" mx="auto" px="var(--side-pad)">
        <Flex
          className="dp-shell-pad"
          align="center"
          justify="space-between"
          minH="30px"
          py={{ base: "6px", sm: "0" }}
          gap={{ base: "8px", sm: "16px" }}
          flexWrap={{ base: "wrap", sm: "nowrap" }}
        >
          <Flex align="center" gap={{ base: "8px", sm: "12px" }} flex="1" minW="0" flexWrap="wrap" fontSize={{ base: "11px", sm: "12px" }}>
            <Text fontWeight="600" whiteSpace="nowrap">{dateInfo.nepaliDate}</Text>
            <Text color="rgba(255,255,255,0.3)" aria-hidden="true">·</Text>
            <Text className="dp-english" whiteSpace="nowrap">{dateInfo.adDate}</Text>
            {info.weather && (
              <Flex align="center" gap="4px" whiteSpace="nowrap">
                <Cloud size={13} strokeWidth={1.8} color="currentColor" aria-hidden="true" />
                <Text>{info.weather}</Text>
              </Flex>
            )}
          </Flex>
          <Flex className="dp-utility-right dp-english" align="center" gap="16px" flexShrink={0} fontSize="10px" letterSpacing="0.02em" color="rgba(255,255,255,0.6)">
            <Text whiteSpace="nowrap">Updated {dateInfo.updated}</Text>
            <Text color="rgba(255,255,255,0.25)" aria-hidden="true">|</Text>
            <Text whiteSpace="nowrap">Nepal&apos;s trusted newsroom</Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}

function BreakingTicker() {
  const { t, localized } = useLocale();
  const breaking = getBreakingArticles()[0];
  if (!breaking) return null;

  return (
    <Box bg={BRAND} color="white" minH="30px">
      <Flex maxW="var(--max-content)" mx="auto" px="var(--side-pad)" align="center" gap="12px" minH="30px">
        <Text flexShrink={0} bg="rgba(0,0,0,0.15)" px="8px" py="2px" fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="0.12em" lineHeight="1.2">
          {t("breaking")}
        </Text>
        <Link href={`/article/${breaking.slug}`} className="dp-breaking-copy dp-story-link" style={{ minWidth: 0, fontSize: "13px", fontWeight: 500 }}>
          {localized(breaking.title)}
        </Link>
        <Flex className="dp-english" ml="auto" align="center" gap="4px" flexShrink={0} fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.08em" color="rgba(255,255,255,0.7)" display={{ base: "none", sm: "flex" }}>
          <Text>Read story</Text>
          <ArrowUpRight size={13} strokeWidth={1.8} color="currentColor" aria-hidden="true" />
        </Flex>
      </Flex>
    </Box>
  );
}

function Masthead() {
  const { locale, setLocale } = useLocale();

  return (
    <Box className="dp-masthead" bg="var(--color-surface)" borderBottom="1px solid var(--color-border)" minH="76px">
      <Flex className="dp-shell-pad" position="relative" maxW="var(--max-content)" mx="auto" px="var(--side-pad)" py="12px" align="center" justify="center">
        <Link href="/" aria-label="Dristi Post home" style={{ textAlign: "center" }}>
          <Text className="dp-brand-word" fontSize="38px" fontWeight="800" lineHeight="1" letterSpacing="-0.04em" fontFamily="var(--font-mukta), sans-serif">
            <Text as="span" color={BRAND}>दृष्टि</Text>
            <Text as="span" color="var(--color-nav)" ml="6px">पोस्ट</Text>
          </Text>
          <Text className="dp-tagline dp-english" mt="2px" fontSize="9px" fontWeight="500" textTransform="uppercase" letterSpacing="0.25em" color="var(--color-muted)">
            Nepal&apos;s trusted news
          </Text>
        </Link>
        <Flex className="dp-masthead-locale" position="absolute" right="var(--side-pad)" top="50%" transform="translateY(-50%)" align="center" gap="8px" fontSize="13px">
          <Button type="button" variant="ghost" size="sm" px="4px" pb="4px" borderRadius="0" borderBottomWidth="2px" borderBottomColor={locale === "ne" ? BRAND : "transparent"} color={locale === "ne" ? BRAND : "var(--color-muted)"} fontWeight={locale === "ne" ? "700" : "400"} onClick={() => setLocale("ne")}>
            नेपाली
          </Button>
          <Text color="var(--color-border)" aria-hidden="true">|</Text>
          <Button type="button" variant="ghost" size="sm" px="4px" pb="4px" borderRadius="0" borderBottomWidth="2px" borderBottomColor={locale === "en" ? BRAND : "transparent"} color={locale === "en" ? BRAND : "var(--color-muted)"} fontWeight={locale === "en" ? "700" : "400"} onClick={() => setLocale("en")}>
            English
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

function NavDropdown({ item, active }: { item: NavItem; active: boolean }) {
  const { locale } = useLocale();
  const isCategories = item.label.en === "Categories";

  return (
    <Menu.Root positioning={{ placement: "bottom-start" }}>
      <Menu.Trigger asChild>
        <Button type="button" variant="ghost" size="sm" className={`dp-nav-link ${active ? "is-active" : ""}`} borderRadius="0" px="12px" color="rgba(255,255,255,0.75)" fontWeight="500" gap="4px">
          {navLabel(item, locale)}
          <ChevronDown size={12} strokeWidth={2} color="currentColor" aria-hidden="true" />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            minW={isCategories ? "280px" : "200px"}
            maxH="min(70vh, 520px)"
            overflowY="auto"
            p="8px"
            bg="var(--color-surface)"
            border="1px solid var(--color-border)"
            color="var(--color-body)"
            boxShadow="0 8px 20px rgba(26,26,46,0.12)"
          >
            {isCategories && (
              <Grid templateColumns="repeat(2, minmax(0, 1fr))" gapX="4px">
                {item.children!.map((child) => (
                  <Menu.Item key={child.href} value={child.href} asChild>
                    <Link href={child.href} className="dp-menu-link">{navLabel(child, locale)}</Link>
                  </Menu.Item>
                ))}
              </Grid>
            )}
            {!isCategories && item.children!.map((child) => (
              <Menu.Item key={child.href} value={child.href} asChild>
                <Link href={child.href} className="dp-menu-link">{navLabel(child, locale)}</Link>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

function ProvinceMenu() {
  const { localized, locale } = useLocale();

  return (
    <Menu.Root positioning={{ placement: "bottom-end" }}>
      <Menu.Trigger asChild>
        <Button type="button" variant="ghost" size="sm" color="rgba(255,255,255,0.75)" borderRadius="0" px="8px" gap="6px" _hover={{ bg: "rgba(255,255,255,0.06)", color: "white" }} aria-label={locale === "ne" ? "प्रदेश अनुसार समाचार" : "Browse by province"}>
          <MapPin size={17} strokeWidth={1.8} color="currentColor" aria-hidden="true" />
          <Text className="dp-nav-label" fontSize="12px">{locale === "ne" ? "प्रदेश" : "Province"}</Text>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="230px" maxH="min(70vh, 520px)" overflowY="auto" p="8px" bg="var(--color-surface)" border="1px solid var(--color-border)" color="var(--color-body)" boxShadow="0 8px 20px rgba(26,26,46,0.12)">
            <Text px="8px" py="6px" fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="0.14em" color="var(--color-muted)">
              {locale === "ne" ? "प्रदेश" : "Province"}
            </Text>
            {provinces.map((province) => (
              <Menu.Item key={province.slug} value={province.slug} asChild>
                <Link href={`/province/${province.slug}`} className="dp-menu-link" style={{ padding: "8px" }}>
                  <Flex align="center" justify="space-between" gap="12px">
                    <Text>{localized(province.name)}</Text>
                    <Text className="dp-english" fontSize="10px" color="var(--color-faint)">{province.capital.en}</Text>
                  </Flex>
                </Link>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

function MobileNavGroup({
  label,
  items,
  pathname,
  onClose,
}: {
  label: string;
  items: NavItem[];
  pathname: string | null;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  return (
    <Box>
      <Text className="dp-english" px="20px" pt="20px" pb="8px" fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="0.14em" color="var(--color-muted)">
        {label}
      </Text>
      {items.map((item) => {
        const active = isPathActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onClose} aria-current={active ? "page" : undefined}>
            <Flex minH="44px" px="20px" align="center" borderBottom="1px solid var(--color-border)" color={active ? BRAND : "var(--color-body)"} fontSize="16px" fontWeight={active ? "700" : "500"} _hover={{ color: BRAND }}>
              {navLabel(item, locale)}
            </Flex>
          </Link>
        );
      })}
    </Box>
  );
}

function MobileNavigation({ pathname, onClose }: { pathname: string | null; onClose: () => void }) {
  const { locale, setLocale, localized } = useLocale();
  const mobileProvinces = provinces.map((province) => ({ label: province.name, href: `/province/${province.slug}` }));
  const plainItems = navItems.filter((item) => !item.children);

  return (
    <Portal>
      <Drawer.Backdrop bg="rgba(15,19,32,0.62)" />
      <Drawer.Positioner>
        <Drawer.Content bg="var(--color-surface)" color="var(--color-body)" h="100dvh">
          <Drawer.Header bg="var(--color-nav)" color="white" minH="52px" px="16px" py="0">
            <Flex align="center" justify="space-between" minH="52px">
              <Text fontWeight="800" fontSize="17px">{locale === "ne" ? "दृष्टि पोस्ट" : "Dristi Post"}</Text>
              <Drawer.CloseTrigger asChild>
                <IconButton aria-label={locale === "ne" ? "मेनु बन्द गर्नुहोस्" : "Close menu"} size="sm" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.08)" }}>
                  <X size={22} strokeWidth={1.8} color="currentColor" aria-hidden="true" />
                </IconButton>
              </Drawer.CloseTrigger>
            </Flex>
          </Drawer.Header>
          <Drawer.Body p="0" overflowY="auto">
            <MobileNavGroup label={locale === "ne" ? "मुख्य" : "Main"} items={plainItems} pathname={pathname} onClose={onClose} />
            <MobileNavGroup label={locale === "ne" ? "विषयवस्तु" : "Categories"} items={categoryNavItems} pathname={pathname} onClose={onClose} />
            <MobileNavGroup label={locale === "ne" ? "उपकरण" : "Tools"} items={toolNavItems} pathname={pathname} onClose={onClose} />
            <Box>
              <Text className="dp-english" px="20px" pt="20px" pb="8px" fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="0.14em" color="var(--color-muted)">
                {locale === "ne" ? "प्रदेश अनुसार" : "Browse by province"}
              </Text>
              {mobileProvinces.map((province) => {
                const active = isPathActive(pathname, province.href);
                return (
                  <Link key={province.href} href={province.href} onClick={onClose} aria-current={active ? "page" : undefined}>
                    <Flex minH="44px" px="20px" align="center" borderBottom="1px solid var(--color-border)" color={active ? BRAND : "var(--color-body)"} fontSize="16px" fontWeight={active ? "700" : "500"} _hover={{ color: BRAND }}>
                      {localized(province.label)}
                    </Flex>
                  </Link>
                );
              })}
            </Box>
            <Flex px="20px" py="20px" gap="14px" align="center">
              <Button type="button" variant="ghost" size="sm" px="0" color={locale === "ne" ? BRAND : "var(--color-muted)"} fontWeight={locale === "ne" ? "700" : "400"} onClick={() => { setLocale("ne"); onClose(); }}>
                नेपाली
              </Button>
              <Text color="var(--color-border)" aria-hidden="true">|</Text>
              <Button type="button" variant="ghost" size="sm" px="0" color={locale === "en" ? BRAND : "var(--color-muted)"} fontWeight={locale === "en" ? "700" : "400"} onClick={() => { setLocale("en"); onClose(); }}>
                English
              </Button>
            </Flex>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Portal>
  );
}

function NavBar() {
  const { t, locale } = useLocale();
  const { resolved, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const categoryActive = categoryNavItems.some((item) => isPathActive(pathname, item.href));
  const toolActive = toolNavItems.some((item) => isPathActive(pathname, item.href));

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setSearchOpen(false);
    router.push(`/latest?search=${encodeURIComponent(value)}`);
  }

  return (
    <Drawer.Root open={mobileOpen} onOpenChange={(details) => setMobileOpen(details.open)} placement="start" size="full">
      <Box as="nav" position="sticky" top="0" zIndex="1000" bg="var(--color-nav)" color="white" boxShadow="0 2px 8px rgba(26,26,46,0.12)">
        <Flex className="dp-shell-pad dp-nav-inner" maxW="var(--max-content)" mx="auto" px="var(--side-pad)" align="center" justify="space-between" minH="44px">
          <Flex className="dp-primary-nav dp-nav-scroll" display={{ base: "none", md: "flex" }} align="center" h="44px" gap="6px" overflow="hidden">
            {navItems.map((item) => {
              if (item.children) {
                const childActive = item.label.en === "Categories" ? categoryActive : toolActive;
                return <NavDropdown key={item.href} item={item} active={childActive} />;
              }
              const active = isPathActive(pathname, item.href);
              return (
                <Link key={item.href} href={item.href} className={`dp-nav-link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined}>
                  {navLabel(item, locale)}
                </Link>
              );
            })}
          </Flex>

          <Flex className="dp-mobile-nav" display={{ base: "flex", md: "none" }} align="center" gap="8px">
            <Drawer.Trigger asChild>
              <IconButton aria-label={locale === "ne" ? "मेनु खोल्नुहोस्" : "Open menu"} w="44px" h="44px" size="sm" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.08)" }}>
                <MenuIcon size={22} strokeWidth={1.8} color="currentColor" aria-hidden="true" />
              </IconButton>
            </Drawer.Trigger>
            <Link href="/" style={{ color: "white", fontSize: "15px", fontWeight: 700 }}>
              {locale === "ne" ? "दृष्टि पोस्ट" : "Dristi Post"}
            </Link>
          </Flex>

          <Flex ml="auto" align="center" gap="4px">
            {searchOpen && (
              <form onSubmit={submitSearch} style={{ display: "block" }}>
                <Input
                  aria-label={t("search")}
                  placeholder={t("search")}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); }}
                  autoFocus
                  size="sm"
                  w={{ base: "122px", sm: "190px" }}
                  h="34px"
                  px="10px"
                  bg="rgba(255,255,255,0.1)"
                  border="1px solid rgba(255,255,255,0.2)"
                  borderRadius="2px"
                  color="white"
                  _placeholder={{ color: "rgba(255,255,255,0.55)" }}
                />
              </form>
            )}
            <IconHint label={searchOpen ? "Close search" : "Search stories"}>
              <IconButton aria-label={searchOpen ? "Close search" : "Search stories"} size="sm" variant="ghost" color="rgba(255,255,255,0.78)" _hover={{ bg: "rgba(255,255,255,0.06)", color: "white" }} onClick={() => setSearchOpen((open) => !open)}>
                {searchOpen ? <X size={18} strokeWidth={1.8} color="currentColor" aria-hidden="true" /> : <Search size={18} strokeWidth={1.8} color="currentColor" aria-hidden="true" />}
                {!searchOpen && <Text className="dp-nav-label dp-english" ml="2px" fontSize="12px">Search</Text>}
              </IconButton>
            </IconHint>
            <IconHint label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={resolved === "dark"} size="sm" variant="ghost" color="rgba(255,255,255,0.78)" _hover={{ bg: "rgba(255,255,255,0.06)", color: "white" }} onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}>
                {resolved === "dark" ? <Sun size={18} strokeWidth={1.8} color="currentColor" aria-hidden="true" /> : <Moon size={18} strokeWidth={1.8} color="currentColor" aria-hidden="true" />}
              </IconButton>
            </IconHint>
            <ProvinceMenu />
          </Flex>
        </Flex>
      </Box>
      <MobileNavigation pathname={pathname} onClose={() => setMobileOpen(false)} />
    </Drawer.Root>
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
