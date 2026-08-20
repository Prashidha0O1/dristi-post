"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { NewsCard } from "@/components/newsCard";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import { getArticlesByCategory, getTrendingArticles } from "@/lib/mockData";
import { categories } from "@/lib/config";

function TrendingSidebar() {
  const { locale } = useLocale();
  const trending = getTrendingArticles();

  return (
    <Box>
      <SectionHeader title={locale === "ne" ? "ट्रेन्डिङ" : "Trending"} accent="var(--color-brand)" />
      {trending.map((a, i) => (
        <Flex
          key={a.id}
          gap="12px"
          py="12px"
          borderBottom={i < trending.length - 1 ? "1px solid #eee" : "none"}
          _hover={{ "& .t-title": { color: "var(--color-brand)" } }}
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
              <Text className="t-title" fontWeight="700" fontSize="14px" lineHeight="1.45" lineClamp={2} color="#1a1a1a" transition="color 0.15s">
                {locale === "ne" ? a.title.ne : a.title.en}
              </Text>
            </Link>
          </Box>
        </Flex>
      ))}
    </Box>
  );
}

export default function CategoryPageClient({ slug }: { slug: string }) {
  const { localized, locale } = useLocale();

  const category = categories.find((c) => c.slug === slug);
  const articles = getArticlesByCategory(slug);

  if (!category) {
    return (
      <PageShell>
        <Box py="60px" textAlign="center">
          <Text fontSize="24px" fontWeight="700" color="#1a1a1a" mb="8px">
            {locale === "ne" ? "विषय भेटिएन" : "Category Not Found"}
          </Text>
          <Link href="/">
            <Text color="var(--color-brand)" fontWeight="600" fontSize="15px" _hover={{ textDecoration: "underline" }}>
              {locale === "ne" ? "गृहपृष्ठमा फर्कनुहोस्" : "Back to Home"}
            </Text>
          </Link>
        </Box>
      </PageShell>
    );
  }

  const categoryName = localized(category.name);
  const catColor = category.color || "var(--color-brand)";
  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <PageShell>
      {/* Breadcrumb */}
      <Flex gap="6px" align="center" mb="20px" fontSize="13px" color="#999">
        <Link href="/">
          <Text _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
            {locale === "ne" ? "गृहपृष्ठ" : "Home"}
          </Text>
        </Link>
        <Text>›</Text>
        <Text color={catColor} fontWeight="600">{categoryName}</Text>
      </Flex>

      <SectionHeader title={categoryName} accent={catColor} />

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="32px">
        <Box gridColumn={{ lg: "span 2" }}>
          {/* Lead article */}
          {lead && (
            <Box mb="28px">
              <NewsCard article={lead} variant="hero" showExcerpt showAuthor imageHeight="380px" />
            </Box>
          )}

          {/* Rest of articles */}
          {rest.length > 0 && (
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="20px">
              {rest.map((a) => (
                <NewsCard key={a.id} article={a} variant="featured" showCategory={false} imageHeight="170px" />
              ))}
            </SimpleGrid>
          )}

          {articles.length === 0 && (
            <Box py="40px" textAlign="center">
              <Text fontSize="16px" color="#999">
                {locale === "ne" ? "यस विषयमा समाचार भेटिएन।" : "No articles found in this category."}
              </Text>
            </Box>
          )}
        </Box>

        {/* Sidebar */}
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
