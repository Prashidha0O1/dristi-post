"use client";

import { Box, Flex, Text, Input } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { navItems } from "@/lib/config";
import { getBreakingArticles } from "@/lib/mock-data";

function BreakingTicker() {
  const { t, localized } = useLocale();
  const articles = getBreakingArticles();
  const tickerText = articles.map((a) => localized(a.title)).join("    ●    ");

  return (
    <Box bg="#c0392b" color="white" h="32px" overflow="hidden" display="flex" alignItems="center">
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
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const today = new Date();
    setDateStr(
      today.toLocaleDateString(locale === "ne" ? "ne-NP" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, [locale]);

  return (
    <Box bg="white" borderBottom="1px solid #eee">
      <Box maxW="var(--max-content)" mx="auto" px="var(--side-pad)" py="14px">
        <Flex justify="space-between" align="center">
          <Text fontSize="12px" color="#888" display={{ base: "none", md: "block" }}>
            {dateStr}
          </Text>

          <Link href="/">
            <Box textAlign="center">
              <Text
                fontWeight="900"
                fontSize={{ base: "28px", md: "38px" }}
                lineHeight="1"
                letterSpacing="-0.5px"
                fontFamily="var(--font-mukta), sans-serif"
              >
                <Text as="span" color="#c0392b">
                  {locale === "ne" ? "दृष्टि" : "Dristi"}
                </Text>
                <Text as="span" color="#1a1a2e" ml="6px">
                  {locale === "ne" ? "पोस्ट" : "Post"}
                </Text>
              </Text>
              <Text fontSize="10px" color="#999" letterSpacing="2px" textTransform="uppercase" mt="-2px" fontWeight="400">
                {locale === "ne" ? "नेपालको विश्वसनीय समाचार" : "Nepal's Trusted News"}
              </Text>
            </Box>
          </Link>

          <Flex align="center" gap="8px" display={{ base: "none", md: "flex" }}>
            <Box
              as="button"
              onClick={() => setLocale("ne")}
              fontSize="13px"
              fontWeight={locale === "ne" ? "700" : "400"}
              color={locale === "ne" ? "#c0392b" : "#888"}
              bg="transparent"
              border="none"
              cursor="pointer"
              px="4px"
              borderBottom={locale === "ne" ? "2px solid #c0392b" : "2px solid transparent"}
              pb="2px"
              transition="all 0.15s"
            >
              नेपाली
            </Box>
            <Text color="#ddd" fontSize="12px">|</Text>
            <Box
              as="button"
              onClick={() => setLocale("en")}
              fontSize="13px"
              fontWeight={locale === "en" ? "700" : "400"}
              color={locale === "en" ? "#c0392b" : "#888"}
              bg="transparent"
              border="none"
              cursor="pointer"
              px="4px"
              borderBottom={locale === "en" ? "2px solid #c0392b" : "2px solid transparent"}
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Box
        bg="#1a1a2e"
        position="sticky"
        top="0"
        zIndex="1000"
      >
        <Box maxW="var(--max-content)" mx="auto" px="var(--side-pad)">
          <Flex align="center" justify="space-between" h="44px">
            <Flex align="center" gap="0" h="full" display={{ base: "none", lg: "flex" }}>
              {navItems.map((item) => (
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
              ))}
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
            </Flex>
          </Flex>
        </Box>
      </Box>

      {mobileOpen && (
        <Box
          position="fixed"
          top="44px"
          left="0"
          right="0"
          bottom="0"
          bg="white"
          zIndex="999"
          overflowY="auto"
          display={{ lg: "none" }}
        >
          <Flex direction="column">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Box
                  px="20px"
                  py="13px"
                  fontSize="16px"
                  fontWeight="500"
                  color="#333"
                  borderBottom="1px solid #f0f0f0"
                  _hover={{ color: "#c0392b" }}
                  transition="color 0.15s"
                  onClick={() => setMobileOpen(false)}
                  cursor="pointer"
                >
                  {localized(item.label)}
                </Box>
              </Link>
            ))}
            <Flex px="20px" py="13px" gap="12px" borderBottom="1px solid #f0f0f0">
              <Box as="button" onClick={() => { setLocale("ne"); setMobileOpen(false); }}
                fontSize="15px" fontWeight={locale === "ne" ? "700" : "400"} color={locale === "ne" ? "#c0392b" : "#888"}
                bg="transparent" border="none" cursor="pointer">
                नेपाली
              </Box>
              <Box as="button" onClick={() => { setLocale("en"); setMobileOpen(false); }}
                fontSize="15px" fontWeight={locale === "en" ? "700" : "400"} color={locale === "en" ? "#c0392b" : "#888"}
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
      <BreakingTicker />
      <Masthead />
      <NavBar />
    </Box>
  );
}
