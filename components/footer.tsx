"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { useLocale } from "@/lib/localeContext";
import { categories } from "@/lib/config";

const COMPANY_REG_NO = "XXXXX/०८२/०८३";
const MEDIA_REG_NO = "XXXX/०८२/०८३";

export function Footer() {
  const { t, localized, locale } = useLocale();

  const half = Math.ceil(categories.length / 2);
  const catsLeft = categories.slice(0, half);
  const catsRight = categories.slice(half);

  return (
    <Box as="footer" bg="#1a1a2e" color="#aaa">
      <Box maxW="var(--max-content)" mx="auto" px="var(--side-pad)" pt="40px" pb="20px">
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: "28px", md: "32px" }} mb="32px">
          {/* Brand + registration */}
          <Box>
            <Text fontWeight="900" fontSize="22px" mb="10px" fontFamily="var(--font-mukta), sans-serif">
              <Text as="span" color="var(--color-brand)">{locale === "ne" ? "दृष्टि" : "Dristi"}</Text>{" "}
              <Text as="span" color="white">{locale === "ne" ? "पोस्ट" : "Post"}</Text>
            </Text>
            <Text fontSize="13px" color="#777" lineHeight="1.7" mb="14px">
              {t("siteTagline")}
            </Text>
            <Flex direction="column" gap="4px" fontSize="12px" color="#666" lineHeight="1.6">
              <Text>
                <Text as="span" color="#888" fontWeight="600">{t("companyReg")}</Text>{" "}
                {COMPANY_REG_NO}
              </Text>
              <Text>
                <Text as="span" color="#888" fontWeight="600">{t("mediaReg")}</Text>{" "}
                {MEDIA_REG_NO}
              </Text>
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

          {/* Links */}
          <Box>
            <Text fontSize="13px" fontWeight="700" color="white" mb="14px" textTransform="uppercase" letterSpacing="1px">
              {locale === "ne" ? "लिंकहरू" : "Links"}
            </Text>
            <Flex direction="column" gap="7px">
              <Link href="/about"><Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }}>{t("aboutUs")}</Text></Link>
              <Link href="/contact"><Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }}>{t("contactUs")}</Text></Link>
              <Link href="/privacy"><Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }}>{t("privacyPolicy")}</Text></Link>
              <Link href="/terms"><Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }}>{t("termsOfService")}</Text></Link>
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
