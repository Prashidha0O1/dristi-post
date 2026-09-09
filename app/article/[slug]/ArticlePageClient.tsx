"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { NewsCard } from "@/components/newsCard";
import { SectionHeader } from "@/components/sectionHeader";
import { TimeAgo } from "@/components/timeAgo";
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
            transition="color 0.15s"
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

export default function ArticlePageClient({
  article,
  related,
  trending,
  ads,
}: {
  article: Article;
  related: Article[];
  trending: Article[];
  ads: AdSlots;
}) {
  const { localized, locale } = useLocale();

  const title = localized(article.title);
  const excerpt = localized(article.excerpt);
  const categoryName = localized(article.category.name);
  const authorName = localized(article.author.name);
  const catColor = article.category.color || "var(--color-brand)";

  return (
    <PageShell>
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="36px">
        <Box gridColumn={{ lg: "span 2" }}>
          <Flex gap="6px" align="center" mb="16px" fontSize="13px" color="var(--color-muted)">
            <Link href="/">
              <Text _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
                {locale === "ne" ? "गृहपृष्ठ" : "Home"}
              </Text>
            </Link>
            <Text>›</Text>
            <Link href={`/category/${article.category.slug}`}>
              <Text _hover={{ color: "var(--color-brand)" }} transition="color 0.15s" color={catColor} fontWeight="600">
                {categoryName}
              </Text>
            </Link>
          </Flex>

          <Text fontSize="11px" fontWeight="700" color={catColor} textTransform="uppercase" letterSpacing="0.5px" mb="8px">
            {categoryName}
          </Text>

          <Text
            as="h1"
            fontSize={{ base: "26px", md: "34px" }}
            fontWeight="800"
            lineHeight="1.3"
            color="var(--color-headline)"
            mb="12px"
          >
            {title}
          </Text>

          <Text fontSize="17px" color="var(--color-subtle)" lineHeight="1.7" mb="16px">
            {excerpt}
          </Text>

          <Flex align="center" gap="16px" mb="24px" pb="16px" borderBottom="1px solid var(--color-border)">
            <Text fontSize="14px" fontWeight="600" color="var(--color-body)">
              {authorName}
            </Text>
            <TimeAgo date={article.publishedAt} fontSize="13px" color="var(--color-muted)" />
          </Flex>

          <Box position="relative" w="full" h={{ base: "240px", md: "420px" }} borderRadius="4px" overflow="hidden" mb="28px">
            <Image src={article.image} alt={title} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 66vw" priority />
          </Box>

          <Box mb="40px" fontSize="17px" lineHeight="1.9" color="var(--color-body)">
            {localized(article.content)
              .split(/\n{2,}/)
              .map((s) => s.trim())
              .filter(Boolean)
              .map((paragraph, i) => (
                <Text key={i} mb="16px">{paragraph}</Text>
              ))}
          </Box>

          {article.tags.length > 0 && (
            <Flex gap="8px" mb="32px" flexWrap="wrap">
              {article.tags.map((tag) => (
                <Text
                  key={tag.id}
                  fontSize="12px"
                  color="var(--color-tag-text)"
                  bg="var(--color-tag-bg)"
                  px="10px"
                  py="4px"
                  borderRadius="2px"
                  fontWeight="500"
                >
                  #{localized(tag.name)}
                </Text>
              ))}
            </Flex>
          )}

          {related.length > 0 && (
            <Box>
              <SectionHeader title={locale === "ne" ? "सम्बन्धित समाचार" : "Related News"} accent={catColor} />
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap="18px">
                {related.map((a) => (
                  <NewsCard key={a.id} article={a} variant="compact" imageHeight="140px" />
                ))}
              </SimpleGrid>
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
