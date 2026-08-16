"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { useLocale } from "@/lib/localeContext";
import { categories } from "@/lib/config";

export function Footer() {
  const { t, localized, locale } = useLocale();

  return (
    <Box as="footer" bg="#1a1a2e" color="#aaa">
      <Box maxW="var(--max-content)" mx="auto" px="var(--side-pad)" pt="40px" pb="20px">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="32px" mb="32px">
          <Box>
            <Text fontWeight="900" fontSize="22px" mb="8px" fontFamily="var(--font-mukta), sans-serif">
              <Text as="span" color="var(--color-brand)">{locale === "ne" ? "दृष्टि" : "Dristi"}</Text>{" "}
              <Text as="span" color="white">{locale === "ne" ? "पोस्ट" : "Post"}</Text>
            </Text>
            <Text fontSize="13px" color="#777" lineHeight="1.7">
              {t("siteTagline")}
            </Text>
          </Box>

          <Box>
            <Text fontSize="13px" fontWeight="700" color="white" mb="14px" textTransform="uppercase" letterSpacing="1px">
              {t("categories")}
            </Text>
            <Flex direction="column" gap="7px">
              {categories.slice(0, 5).map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
                    {localized(cat.name)}
                  </Text>
                </Link>
              ))}
            </Flex>
          </Box>

          <Box>
            <Text fontSize="13px" fontWeight="700" color="white" mb="14px" textTransform="uppercase" letterSpacing="1px">
              {t("categories")}
            </Text>
            <Flex direction="column" gap="7px">
              {categories.slice(5).map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <Text fontSize="13px" color="#888" _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
                    {localized(cat.name)}
                  </Text>
                </Link>
              ))}
            </Flex>
          </Box>

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
