"use client";

import {
  Box,
  Container,
  Flex,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { categories } from "@/lib/config";

export function Footer() {
  const { t, localized, locale } = useLocale();

  return (
    <Box as="footer" bg="#1a1a2e" color="#ccc" pt="40px" pb="20px">
      <Container maxW="100%" px="30px">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="32px" mb="32px">
          <Box>
            <Flex align="center" gap="2.5" mb="14px">
              <Text fontWeight="900" fontSize="20px" color="white" fontFamily="var(--font-mukta), sans-serif">
                <Text as="span" color="#e74c3c">{locale === "ne" ? "दृष्टि" : "Dristi"}</Text>{" "}
                <Text as="span" color="#5b9bd5">{locale === "ne" ? "पोस्ट" : "Post"}</Text>
              </Text>
            </Flex>
            <Text fontSize="13px" color="#888" lineHeight="1.7">
              {t("siteTagline")}
            </Text>
          </Box>

          <Box>
            <Text fontSize="14px" fontWeight="700" color="white" mb="14px" textTransform="uppercase" letterSpacing="0.5px">
              {t("categories")}
            </Text>
            <Flex direction="column" gap="8px">
              {categories.slice(0, 5).map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <Text fontSize="13px" color="#999" _hover={{ color: "#2260bf" }} transition="color 0.15s">
                    {localized(cat.name)}
                  </Text>
                </Link>
              ))}
            </Flex>
          </Box>

          <Box>
            <Text fontSize="14px" fontWeight="700" color="white" mb="14px" textTransform="uppercase" letterSpacing="0.5px">
              {t("categories")}
            </Text>
            <Flex direction="column" gap="8px">
              {categories.slice(5).map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <Text fontSize="13px" color="#999" _hover={{ color: "#2260bf" }} transition="color 0.15s">
                    {localized(cat.name)}
                  </Text>
                </Link>
              ))}
            </Flex>
          </Box>

          <Box>
            <Text fontSize="14px" fontWeight="700" color="white" mb="14px" textTransform="uppercase" letterSpacing="0.5px">
              {locale === "ne" ? "लिंकहरू" : "Links"}
            </Text>
            <Flex direction="column" gap="8px">
              <Link href="/about"><Text fontSize="13px" color="#999" _hover={{ color: "#2260bf" }}>{t("aboutUs")}</Text></Link>
              <Link href="/contact"><Text fontSize="13px" color="#999" _hover={{ color: "#2260bf" }}>{t("contactUs")}</Text></Link>
              <Link href="/privacy"><Text fontSize="13px" color="#999" _hover={{ color: "#2260bf" }}>{t("privacyPolicy")}</Text></Link>
              <Link href="/terms"><Text fontSize="13px" color="#999" _hover={{ color: "#2260bf" }}>{t("termsOfService")}</Text></Link>
            </Flex>
          </Box>
        </SimpleGrid>

        <Box borderTop="1px solid #2a2a3e" pt="16px" textAlign="center">
          <Text fontSize="12px" color="#666">
            {t("copyright")}
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
