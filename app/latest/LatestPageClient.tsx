"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { NewsCard } from "@/components/newsCard";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import type { Article } from "@/lib/types";
import { AdSlot } from "@/components/adSlot";
import type { AdSlots } from "@/lib/publicQueries";

function TrendingSidebar({ trending }: { trending: Article[] }) {
  const { locale } = useLocale();

  if (trending.length === 0) return null;

  return (
    <Box>
      <SectionHeader title={locale === "ne" ? "ट्रेन्डिङ" : "Trending"} accent="var(--color-brand)" />
      {trending.map((a, i) => (
        <Flex
          key={a.id}
          gap="12px"
          py="12px"
          borderBottom={i < trending.length - 1 ? "1px solid var(--color-border)" : "none"}
          _hover={{ "& .t-title": { color: "var(--color-brand)" } }}
          cursor="pointer"
          align="flex-start"
        >
          <Text
            fontSize="24px"
            fontWeight="900"
            color="var(--color-border)"
            lineHeight="1"
            w="36px"
            textAlign="center"
            flexShrink={0}
            whiteSpace="nowrap"
            fontFamily="var(--font-poppins), sans-serif"
          >
            {String(i + 1).padStart(2, "0")}
          </Text>
          <Box flex="1" minW="0">
            <Text fontSize="11px" fontWeight="700" color={a.category.color || "var(--color-muted)"} textTransform="uppercase" letterSpacing="0.5px" mb="2px">
              {locale === "ne" ? a.category.name.ne : a.category.name.en}
            </Text>
            <Link href={`/article/${a.slug}`}>
              <Text className="t-title" fontWeight="700" fontSize="14px" lineHeight="1.45" lineClamp={2} color="var(--color-headline)" transition="color 0.15s">
                {locale === "ne" ? a.title.ne : a.title.en}
              </Text>
            </Link>
          </Box>
        </Flex>
      ))}
    </Box>
  );
}

export default function LatestPageClient({ articles, trending, ads }: { articles: Article[]; trending: Article[]; ads: AdSlots }) {
  const { locale, t } = useLocale();
  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <PageShell>
      <Flex gap="6px" align="center" mb="20px" fontSize="13px" color="var(--color-muted)">
        <Link href="/">
          <Text _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
            {locale === "ne" ? "गृहपृष्ठ" : "Home"}
          </Text>
        </Link>
        <Text>›</Text>
        <Text color="var(--color-headline)" fontWeight="600">{t("latest")}</Text>
      </Flex>

      <SectionHeader title={t("latest")} accent="var(--color-nav)" />

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="32px">
        <Box gridColumn={{ lg: "span 2" }}>
          {lead && (
            <Box mb="28px">
              <NewsCard article={lead} variant="hero" showExcerpt showAuthor imageHeight="380px" />
            </Box>
          )}
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="20px">
            {rest.map((a) => (
              <NewsCard key={a.id} article={a} variant="featured" imageHeight="170px" />
            ))}
          </SimpleGrid>
          {articles.length === 0 && (
            <Box py="40px" textAlign="center">
              <Text fontSize="16px" color="var(--color-muted)">
                {locale === "ne" ? "हाल कुनै समाचार छैन।" : "No articles yet."}
              </Text>
            </Box>
          )}
        </Box>

        <Box>
          <AdSlot placement="sidebar" ad={ads.sidebar} mb="28px" />
          <TrendingSidebar trending={trending} />
        </Box>
      </SimpleGrid>
    </PageShell>
  );
}
