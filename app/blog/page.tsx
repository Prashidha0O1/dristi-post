"use client";

import { Box, Text, SimpleGrid } from "@chakra-ui/react";
import { PageShell } from "@/components/pageShell";
import { NewsCard } from "@/components/newsCard";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import { getArticlesByCategory } from "@/lib/mockData";

export default function BlogPage() {
  const { locale } = useLocale();
  const articles = [
    ...getArticlesByCategory("opinion"),
    ...getArticlesByCategory("lifestyle"),
  ];

  return (
    <PageShell>
      <SectionHeader
        title={locale === "ne" ? "ब्लग" : "Blog"}
        accent="var(--color-brand)"
      />

      <Text fontSize="15px" color="var(--color-subtle)" mb="24px" lineHeight="1.7">
        {locale === "ne"
          ? "विचार, विश्लेषण र जीवनशैलीका लेखहरू"
          : "Opinion, analysis, and lifestyle articles"}
      </Text>

      {articles.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="20px">
          {articles.map((a) => (
            <NewsCard key={a.id} article={a} variant="featured" showCategory showAuthor imageHeight="180px" />
          ))}
        </SimpleGrid>
      ) : (
        <Box py="40px" textAlign="center">
          <Text fontSize="16px" color="var(--color-muted)">
            {locale === "ne" ? "लेखहरू भेटिएनन्।" : "No articles found."}
          </Text>
        </Box>
      )}
    </PageShell>
  );
}
