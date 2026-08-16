"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { NewsCard } from "@/components/newsCard";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import { getLatestArticles, getTrendingArticles } from "@/lib/mockData";

function TrendingSidebar() {
  const { locale } = useLocale();
  const trending = getTrendingArticles();

  return (
    <Box>
      <SectionHeader title={locale === "ne" ? "ट्रेन्डिङ" : "Trending"} accent="#c0392b" />
      {trending.map((a, i) => (
        <Flex
          key={a.id}
          gap="12px"
          py="12px"
          borderBottom={i < trending.length - 1 ? "1px solid #eee" : "none"}
          _hover={{ "& .t-title": { color: "#c0392b" } }}
          cursor="pointer"
          align="flex-start"
        >
          <Text
            fontSize="24px"
            fontWeight="900"
            color="#e0e0e0"
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
            <Text fontSize="11px" fontWeight="700" color={a.category.color || "#888"} textTransform="uppercase" letterSpacing="0.5px" mb="2px">
              {locale === "ne" ? a.category.name.ne : a.category.name.en}
            </Text>
            <Link href={`/article/${a.slug}`}>
              <Text className="t-title" fontWeight="700" fontSize="14px" lineHeight="1.45" noOfLines={2} color="#1a1a1a" transition="color 0.15s">
                {locale === "ne" ? a.title.ne : a.title.en}
              </Text>
            </Link>
          </Box>
        </Flex>
      ))}
    </Box>
  );
}

export default function LatestPage() {
  const { locale, t } = useLocale();
  const articles = getLatestArticles();
  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <PageShell>
      <Flex gap="6px" align="center" mb="20px" fontSize="13px" color="#999">
        <Link href="/">
          <Text _hover={{ color: "#c0392b" }} transition="color 0.15s">
            {locale === "ne" ? "गृहपृष्ठ" : "Home"}
          </Text>
        </Link>
        <Text>›</Text>
        <Text color="#1a1a1a" fontWeight="600">{t("latest")}</Text>
      </Flex>

      <SectionHeader title={t("latest")} accent="#1a1a2e" />

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
        </Box>

        <Box>
          <Box
            bg="white"
            border="1px solid #eee"
            borderRadius="4px"
            h="200px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb="28px"
          >
            <Text fontSize="11px" color="#ccc" fontWeight="500" textTransform="uppercase" letterSpacing="2px">
              विज्ञापन
            </Text>
          </Box>
          <TrendingSidebar />
        </Box>
      </SimpleGrid>
    </PageShell>
  );
}
