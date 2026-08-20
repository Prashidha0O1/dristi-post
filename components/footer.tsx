"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { useLocale } from "@/lib/localeContext";
import { categories } from "@/lib/config";

const COMPANY_REG_NO = "XXXXX/०८२/०८३";
const MEDIA_REG_NO = "XXXX/०८२/०८३";

const AD_CONTACT_PHONE = "+९७७-९८XXXXXXXX";
const AD_CONTACT_EMAIL = "ads@dristipost.com";

const SOCIALS = [
  { name: "Facebook", href: "https://facebook.com/", path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" },
  { name: "X", href: "https://x.com/", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { name: "Instagram", href: "https://instagram.com/", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { name: "YouTube", href: "https://youtube.com/", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { name: "TikTok", href: "https://tiktok.com/", path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
];

export function Footer() {
  const { t, localized, locale } = useLocale();

  const half = Math.ceil(categories.length / 2);
  const catsLeft = categories.slice(0, half);
  const catsRight = categories.slice(half);

  return (
    <Box as="footer" bg="#1a1a2e" color="#aaa">
      <Box maxW="var(--max-content)" mx="auto" px="var(--side-pad)" pt="40px" pb="20px">
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: "28px", md: "32px" }} mb="32px">
          {/* Brand + registration + socials */}
          <Box>
            <Text fontWeight="900" fontSize="22px" mb="10px" fontFamily="var(--font-mukta), sans-serif">
              <Text as="span" color="var(--color-brand)">{locale === "ne" ? "दृष्टि" : "Dristi"}</Text>{" "}
              <Text as="span" color="white">{locale === "ne" ? "पोस्ट" : "Post"}</Text>
            </Text>
            <Text fontSize="13px" color="#777" lineHeight="1.7" mb="14px">
              {t("siteTagline")}
            </Text>
            <Flex direction="column" gap="4px" fontSize="12px" color="#666" lineHeight="1.6" mb="16px">
              <Text>
                <Text as="span" color="#888" fontWeight="600">{t("companyReg")}</Text>{" "}
                {COMPANY_REG_NO}
              </Text>
              <Text>
                <Text as="span" color="#888" fontWeight="600">{t("mediaReg")}</Text>{" "}
                {MEDIA_REG_NO}
              </Text>
            </Flex>

            <Text fontSize="12px" fontWeight="700" color="white" mb="10px" textTransform="uppercase" letterSpacing="1px">
              {t("followUs")}
            </Text>
            <Flex gap="10px">
              {SOCIALS.map((s) => (
                <Box
                  as="a"
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(255,255,255,0.06)"
                  color="#bbb"
                  borderRadius="4px"
                  transition="all 0.15s"
                  _hover={{ bg: "var(--color-brand)", color: "white" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d={s.path} />
                  </svg>
                </Box>
              ))}
            </Flex>
          </Box>

          {/* Categories (left half) */}
          <Box>
            <Text fontSize="13px" fontWeight="700" color="white" mb="14px" textTransform="uppercase" letterSpacing="1px">
              {t("categories")}
            </Text>
            <Flex direction="column" gap="7px">
              {catsLeft.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
                    {localized(cat.name)}
                  </Text>
                </Link>
              ))}
            </Flex>
          </Box>

          {/* Categories (right half) */}
          <Box>
            <Text fontSize="13px" fontWeight="700" color="white" mb="14px" textTransform="uppercase" letterSpacing="1px">
              &nbsp;
            </Text>
            <Flex direction="column" gap="7px">
              {catsRight.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
                    {localized(cat.name)}
                  </Text>
                </Link>
              ))}
            </Flex>
          </Box>

          {/* Links + ad inquiry */}
          <Box>
            <Text fontSize="13px" fontWeight="700" color="white" mb="14px" textTransform="uppercase" letterSpacing="1px">
              {locale === "ne" ? "लिंकहरू" : "Links"}
            </Text>
            <Flex direction="column" gap="7px" mb="20px">
              <Link href="/about"><Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }}>{t("aboutUs")}</Text></Link>
              <Link href="/contact"><Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }}>{t("contactUs")}</Text></Link>
              <Link href="/privacy"><Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }}>{t("privacyPolicy")}</Text></Link>
              <Link href="/terms"><Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }}>{t("termsOfService")}</Text></Link>
            </Flex>

            <Text fontSize="12px" fontWeight="700" color="white" mb="8px" textTransform="uppercase" letterSpacing="1px">
              {t("adInquiry")}
            </Text>
            <Text fontSize="12px" color="#777" lineHeight="1.6" mb="6px">
              {t("adInquiryDesc")}
            </Text>
            <Flex direction="column" gap="3px" fontSize="12px">
              <Box as="a" href={`tel:${AD_CONTACT_PHONE.replace(/[^+\d]/g, "")}`} color="#bbb" _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
                📞 {AD_CONTACT_PHONE}
              </Box>
              <Box as="a" href={`mailto:${AD_CONTACT_EMAIL}`} color="#bbb" _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
                ✉ {AD_CONTACT_EMAIL}
              </Box>
            </Flex>
          </Box>
        </SimpleGrid>

        <Box borderTop="1px solid #2a2a3e" pt="16px" textAlign="center">
          <Text fontSize="12px" color="#555">
            {t("copyright")}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
