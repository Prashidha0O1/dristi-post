"use client";

import {
  Box,
  Flex,
  Text,
  Input,
  Container,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { navItems } from "@/lib/config";
import { getBreakingArticles } from "@/lib/mock-data";

function BreakingTicker() {
  const { t, localized } = useLocale();
  const articles = getBreakingArticles();
  const tickerText = articles.map((a) => localized(a.title)).join("  •  ");

  return (
    <Box bg="#c0392b" color="white" py="6px" overflow="hidden">
      <Container maxW="100%" px="30px">
        <Flex align="center" gap="10px">
          <Box
            bg="white"
            color="#c0392b"
            fontWeight="800"
            fontSize="13px"
            px="14px"
            py="4px"
            borderRadius="14px"
            flexShrink={0}
            lineHeight="1.4"
          >
            {t("breaking")}
          </Box>
          <Box overflow="hidden" whiteSpace="nowrap" flex="1">
            <Text
              fontSize="15px"
              fontWeight="600"
              css={{
                display: "inline-block",
                animation: "marquee 30s linear infinite",
                "@keyframes marquee": {
                  "0%": { transform: "translateX(100%)" },
                  "100%": { transform: "translateX(-100%)" },
                },
              }}
            >
              {tickerText}
            </Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}

function DateBar() {
  const { locale } = useLocale();
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
    <Box bg="#f8f9fa" borderBottom="1px solid #e8e8e8" py="4px">
      <Container maxW="100%" px="30px">
        <Text fontSize="13px" color="#666" textAlign="center">
          {dateStr}
        </Text>
      </Container>
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
        bg="#2260bf"
        position="sticky"
        top="0"
        zIndex="1000"
        shadow="0 2px 8px rgba(0,0,0,0.12)"
      >
        <Container maxW="100%" px="30px">
          <Flex align="center" justify="space-between" h="52px">
            <Flex align="center" gap="0" h="full">
              <Link href="/">
                <Flex align="center" h="52px" pr="20px" mr="4px">
                  <Text
                    fontWeight="900"
                    fontSize="24px"
                    color="white"
                    fontFamily="var(--font-mukta), sans-serif"
                    letterSpacing="-0.3px"
                    lineHeight="1"
                  >
                    {locale === "ne" ? "दृष्टि" : "Dristi"}{" "}
                    <Text as="span" color="rgba(255,255,255,0.85)">
                      {locale === "ne" ? "पोस्ट" : "Post"}
                    </Text>
                  </Text>
                </Flex>
              </Link>

              <HStack
                gap="0"
                display={{ base: "none", lg: "flex" }}
                h="full"
              >
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Flex
                      align="center"
                      h="52px"
                      px="14px"
                      color="white"
                      fontSize="16px"
                      fontWeight="600"
                      transition="background 0.15s"
                      _hover={{ bg: "rgba(255,255,255,0.15)" }}
                      cursor="pointer"
                    >
                      {localized(item.label)}
                    </Flex>
                  </Link>
                ))}
              </HStack>
            </Flex>

            <Flex align="center" gap="6px">
              <Box
                as="button"
                onClick={() => setLocale(locale === "ne" ? "en" : "ne")}
                display={{ base: "none", md: "flex" }}
                alignItems="center"
                gap="6px"
                bg="rgba(255,255,255,0.15)"
                border="1px solid rgba(255,255,255,0.3)"
                px="12px"
                py="5px"
                borderRadius="4px"
                cursor="pointer"
                transition="all 0.15s"
                _hover={{ bg: "rgba(255,255,255,0.25)" }}
                color="white"
                fontSize="13px"
                fontWeight="600"
              >
                {locale === "ne" ? "English" : "नेपाली"}
              </Box>

              {searchOpen && (
                <Input
                  placeholder={t("search")}
                  size="sm"
                  maxW="200px"
                  bg="rgba(255,255,255,0.15)"
                  border="1px solid rgba(255,255,255,0.3)"
                  borderRadius="20px"
                  color="white"
                  _placeholder={{ color: "rgba(255,255,255,0.7)" }}
                  autoFocus
                  px="14px"
                  h="34px"
                  fontSize="13px"
                />
              )}
              <Box
                as="button"
                onClick={() => setSearchOpen(!searchOpen)}
                color="white"
                p="8px"
                cursor="pointer"
                bg="transparent"
                border="none"
                borderRadius="50%"
                transition="background 0.15s"
                _hover={{ bg: "rgba(255,255,255,0.15)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </Box>

              <Box
                as="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                color="white"
                p="8px"
                cursor="pointer"
                bg="transparent"
                border="none"
                display={{ base: "flex", lg: "none" }}
                alignItems="center"
              >
                {mobileOpen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                )}
              </Box>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {mobileOpen && (
        <Box
          position="fixed"
          top="52px"
          left="0"
          right="0"
          bottom="0"
          bg="white"
          zIndex="999"
          overflowY="auto"
          display={{ lg: "none" }}
          shadow="0 4px 20px rgba(0,0,0,0.1)"
        >
          <Flex direction="column" py="2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Box
                  px="20px"
                  py="14px"
                  fontSize="17px"
                  fontWeight="500"
                  color="#333"
                  borderBottom="1px solid #f0f0f0"
                  _hover={{ bg: "#f8f9fa", color: "#2260bf" }}
                  transition="all 0.15s"
                  onClick={() => setMobileOpen(false)}
                  cursor="pointer"
                >
                  {localized(item.label)}
                </Box>
              </Link>
            ))}
            <Box
              px="20px"
              py="14px"
              fontSize="17px"
              fontWeight="500"
              color="#2260bf"
              borderBottom="1px solid #f0f0f0"
              cursor="pointer"
              onClick={() => { setLocale(locale === "ne" ? "en" : "ne"); setMobileOpen(false); }}
            >
              {locale === "ne" ? "English" : "नेपाली"}
            </Box>
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
      <DateBar />
      <NavBar />
    </Box>
  );
}
