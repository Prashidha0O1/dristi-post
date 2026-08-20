"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { IframeEmbed } from "@/components/iframeEmbed";
import { useLocale } from "@/lib/localeContext";

export default function RashifalPage() {
  const { locale, t } = useLocale();

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

      <Box maxW="720px" mx="auto">
        <IframeEmbed
          src="https://nepalicalendar.rat32.com/rashifal/embed.php"
          height="3220px"
        />
      </Box>
    </PageShell>
  );
}
