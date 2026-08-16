"use client";

import { Box, SimpleGrid, Flex, Text } from "@chakra-ui/react";
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

function AdBanner() {
  return (
    <Box
      mb="24px"
      bg="white"
      border="1px solid #eee"
      h="90px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="2px"
    >
      <Text fontSize="11px" color="#ccc" fontWeight="500" textTransform="uppercase" letterSpacing="2px">
        विज्ञापन / Advertisement
      </Text>
    </Box>
  );
}

function HeroSection() {
  const articles = getFeaturedArticles();
  const lead = articles[0];
  const secondary = articles.slice(1, 3);

  if (!lead) return null;

  return (
    <Box mb="32px">
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="20px">
        <Box gridColumn={{ lg: "span 2" }}>
          <NewsCard article={lead} variant="hero" showExcerpt showAuthor imageHeight="480px" />
        </Box>
        <Flex direction="column" gap="20px">
          {secondary.map((a) => (
            <NewsCard key={a.id} article={a} variant="featured" imageHeight="190px" showExcerpt={false} />
          ))}
        </Flex>
      </SimpleGrid>
    </Box>
  );
}

function LatestWithSidebar() {
  const { t, locale } = useLocale();
  const latest = getLatestArticles().slice(0, 4);
  const trending = getTrendingArticles();

  return (
    <SimpleGrid columns={{ base: 1, lg: 3 }} gap="28px" mb="36px">
      <Box gridColumn={{ lg: "span 2" }}>
        <SectionHeader title={t("latest")} href="/latest" accent="#1a1a2e" />
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="18px">
          {latest.map((a) => (
            <NewsCard key={a.id} article={a} variant="featured" imageHeight="170px" />
          ))}
        </SimpleGrid>
      </Box>

      <Box>
        <SectionHeader title={t("trending")} accent="#c0392b" />
        <Box>
          {trending.map((a, i) => (
            <Flex
              key={a.id}
              gap="12px"
              py="14px"
              borderBottom={i < trending.length - 1 ? "1px solid #eee" : "none"}
              _hover={{ "& .rank": { color: "#c0392b" }, "& .t-title": { color: "#c0392b" } }}
              cursor="pointer"
              align="flex-start"
            >
              <Text
                className="rank"
                fontSize="28px"
                fontWeight="900"
                color="#e0e0e0"
                lineHeight="1"
                w="32px"
                textAlign="center"
                flexShrink={0}
                fontFamily="var(--font-poppins), sans-serif"
                transition="color 0.15s"
              >
                {String(i + 1).padStart(2, "0")}
              </Text>
              <Box flex="1" minW="0">
                <Text fontSize="11px" fontWeight="700" color={a.category.color || "#888"} textTransform="uppercase" letterSpacing="0.5px" mb="2px">
                  {locale === "ne" ? a.category.name.ne : a.category.name.en}
                </Text>
                <a href={`/article/${a.slug}`}>
                  <Text className="t-title" fontWeight="700" fontSize="15px" lineHeight="1.45" noOfLines={2} color="#1a1a1a" transition="color 0.15s">
                    {locale === "ne" ? a.title.ne : a.title.en}
                  </Text>
                </a>
                <Text fontSize="12px" color="#aaa" mt="3px">
                  {locale === "ne" ? (
                    <span>{Math.floor(Math.random() * 10 + 1)} घण्टा अगाडि</span>
                  ) : null}
                </Text>
              </Box>
            </Flex>
          ))}
        </Box>
      </Box>
    </SimpleGrid>
  );
}

function CategorySection({
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
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="18px">
        {articles.slice(0, 4).map((a) => (
          <NewsCard key={a.id} article={a} variant="compact" showCategory={false} imageHeight="150px" />
        ))}
      </SimpleGrid>
    </Box>
  );
}

function MoreNews() {
  const { t } = useLocale();
  const articles = getLatestArticles().slice(4, 10);

  return (
    <Box mb="32px">
      <SectionHeader title={t("latest")} accent="#1a1a2e" />
      {articles.map((a) => (
        <NewsCard key={a.id} article={a} variant="list" showCategory />
      ))}
    </Box>
  );
}

export default function HomePage() {
  return (
    <Box minH="100vh" bg="#f7f8fa" fontFamily="var(--font-mukta), sans-serif">
      <Header />

      <Box as="main" maxW="var(--max-content)" mx="auto" px="var(--side-pad)" py="24px">
        <AdBanner />
        <HeroSection />
        <LatestWithSidebar />

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap="28px" mb="36px">
          <Box gridColumn={{ lg: "span 2" }}>
            <CategorySection categorySlug="politics" color="#c0392b" />
            <CategorySection categorySlug="business" color="#1a56db" />
            <CategorySection categorySlug="entertainment" color="#7c3aed" />
          </Box>
          <Box>
            <MoreNews />
            <AdBanner />
          </Box>
        </SimpleGrid>

        <CategorySection categorySlug="sports" color="#059669" />
        <CategorySection categorySlug="technology" color="#0891b2" />
      </Box>

      <Footer />
    </Box>
  );
}
