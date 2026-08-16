"use client";

import { Box, Container, SimpleGrid, Flex, Text } from "@chakra-ui/react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { NewsCard } from "@/components/news-card";
import { SectionHeader } from "@/components/section-header";
import { useLocale } from "@/lib/locale-context";
import {
  getFeaturedArticles,
  getTrendingArticles,
  getLatestArticles,
  getArticlesByCategory,
} from "@/lib/mock-data";

function FeaturedSection() {
  const articles = getFeaturedArticles();
  const main = articles[0];
  const side = articles.slice(1, 3);

  if (!main) return null;

  return (
    <Box mb="32px">
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="20px">
        <Box gridColumn={{ lg: "span 2" }}>
          <NewsCard article={main} variant="hero" showExcerpt showAuthor imageHeight="460px" />
        </Box>
        <Flex direction="column" gap="20px">
          {side.map((a) => (
            <NewsCard key={a.id} article={a} variant="medium" showAuthor={false} imageHeight="180px" />
          ))}
        </Flex>
      </SimpleGrid>
    </Box>
  );
}

function LatestAndTrendingSidebar() {
  const { t } = useLocale();
  const latest = getLatestArticles().slice(0, 6);
  const trending = getTrendingArticles();

  return (
    <SimpleGrid columns={{ base: 1, lg: 3 }} gap="28px" mb="36px">
      <Box gridColumn={{ lg: "span 2" }}>
        <SectionHeader title={t("latest")} href="/latest" accent="#16a34a" />
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="20px">
          {latest.slice(0, 4).map((a) => (
            <NewsCard key={a.id} article={a} variant="medium" imageHeight="180px" />
          ))}
        </SimpleGrid>
      </Box>

      <Box>
        <Flex align="center" gap="8px" mb="16px" pb="12px" borderBottom="3px solid #2260bf">
          <Box w="10px" h="10px" borderRadius="50%" bg="#2260bf" />
          <Text fontSize="22px" fontWeight="900" color="#2260bf" textTransform="uppercase" letterSpacing="0.5px">
            {t("trending")}
          </Text>
        </Flex>
        <Box bg="white" border="1px solid #eee" borderRadius="6px" overflow="hidden">
          {trending.map((a, i) => (
            <Box
              key={a.id}
              borderBottom={i < trending.length - 1 ? "1px solid #f0f0f0" : "none"}
              _hover={{ bg: "#fafbfc" }}
              transition="background 0.15s"
              px="4px"
            >
              <NewsCard article={a} variant="list" showCategory showTimestamp />
            </Box>
          ))}
        </Box>
      </Box>
    </SimpleGrid>
  );
}

function CategoryRow({
  categorySlug,
  color,
}: {
  categorySlug: string;
  color: string;
}) {
  const { localized } = useLocale();
  const articles = getArticlesByCategory(categorySlug);
  if (articles.length === 0) return null;

  const categoryName = localized(articles[0].category.name);

  return (
    <Box mb="36px">
      <SectionHeader
        title={categoryName}
        href={`/category/${categorySlug}`}
        accent={color}
      />
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="20px">
        {articles.slice(0, 4).map((a) => (
          <NewsCard key={a.id} article={a} variant="medium" showCategory={false} imageHeight="170px" />
        ))}
      </SimpleGrid>
    </Box>
  );
}

function AdBanner() {
  return (
    <Box
      mb="36px"
      bg="#f8f9fa"
      border="1px solid #eee"
      borderRadius="6px"
      h="100px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize="12px" color="#bbb" fontWeight="500" textTransform="uppercase" letterSpacing="1px">
        Advertisement
      </Text>
    </Box>
  );
}

function MoreNewsGrid() {
  const { t } = useLocale();
  const articles = getLatestArticles().slice(4, 10);

  return (
    <Box mb="32px">
      <SectionHeader title={t("latest")} accent="#2260bf" />
      <Flex direction="column" gap="0">
        {articles.map((a) => (
          <NewsCard key={a.id} article={a} variant="list" showCategory />
        ))}
      </Flex>
    </Box>
  );
}

export default function HomePage() {
  return (
    <Box minH="100vh" bg="#f5f6f8" fontFamily="var(--font-mukta), sans-serif">
      <Header />

      <Container as="main" maxW="100%" py="24px" px="30px">
        <FeaturedSection />
        <AdBanner />
        <LatestAndTrendingSidebar />

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap="28px" mb="36px">
          <Box gridColumn={{ lg: "span 2" }}>
            <CategoryRow categorySlug="politics" color="#c0392b" />
            <CategoryRow categorySlug="business" color="#2260bf" />
            <CategoryRow categorySlug="entertainment" color="#8e44ad" />
          </Box>
          <Box>
            <MoreNewsGrid />
            <AdBanner />
          </Box>
        </SimpleGrid>

        <CategoryRow categorySlug="sports" color="#27ae60" />
        <CategoryRow categorySlug="technology" color="#0891b2" />
      </Container>

      <Footer />
    </Box>
  );
}
