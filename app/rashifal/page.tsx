"use client";

import { Box, Flex, Text, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { IframeEmbed } from "@/components/iframeEmbed";
import { useLocale } from "@/lib/localeContext";

export default function RashifalPage() {
  const { locale } = useLocale();

  return (
    <PageShell>
      <Box maxW="800px" mx="auto" pt="20px">
      <Box borderBottom="2px solid var(--color-nav)" pb="12px" mb="32px">
        <Heading as="h1" fontSize={{ base: "28px", md: "32px" }} fontWeight="800" color="var(--color-headline)">
          {locale === "ne" ? "राशिफल (Horoscope)" : "Rashifal"}
        </Heading>
        <Text color="var(--color-muted)" fontSize="15px" mt="8px">
          {locale === "ne" 
            ? "तपाईंको दैनिक, साप्ताहिक र मासिक राशिफल पढ्नुहोस्।"
            : "Read your daily, weekly, and monthly horoscope predictions."}
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
