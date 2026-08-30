"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { IframeEmbed } from "@/components/iframeEmbed";
import { useLocale } from "@/lib/localeContext";

export default function RashifalPage() {
  const { locale } = useLocale();

  return (
    <PageShell>
      <Flex gap="6px" align="center" mb="20px" fontSize="13px" color="#999">
        <Link href="/">
          <Text _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
            {locale === "ne" ? "गृहपृष्ठ" : "Home"}
          </Text>
        </Link>
        <Text>›</Text>
        <Text color="#1a1a1a" fontWeight="600">
          {locale === "ne" ? "राशिफल" : "Rashifal"}
        </Text>
      </Flex>

      <SectionHeader
        title={locale === "ne" ? "राशिफल" : "Rashifal"}
        accent="var(--color-brand)"
      />

      <Box maxW="820px" mx="auto">
        <Box
          bg="white"
          border="1px solid #eee"
          borderRadius="4px"
          p={{ base: "16px", md: "24px" }}
          mb="20px"
        >
          <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="800" color="#1a1a1a" mb="6px">
            {locale === "ne" ? "आजको राशिफल" : "Today's Rashifal"}
          </Text>
          <Text fontSize="14px" color="#666" lineHeight="1.7">
            {locale === "ne"
              ? "बाह्रै राशिको दैनिक, मासिक र बार्षिक भविष्यवाणी एकै ठाउँमा। तलको ट्याबबाट आफ्नो राशि हेर्नुहोस्।"
              : "Daily, monthly, and yearly horoscope for all twelve zodiac signs. Switch tabs below to view your sign."}
          </Text>
        </Box>

        <Box
          bg="white"
          border="1px solid #eee"
          borderRadius="4px"
          overflow="hidden"
        >
          <IframeEmbed
            src="https://nepalicalendar.rat32.com/rashifal/embed.php"
            height={{ base: "600px", md: "800px", lg: "1000px" }}
            scrolling="auto"
            borderRadius="0"
          />
        </Box>
      </Box>
    </PageShell>
  );
}
