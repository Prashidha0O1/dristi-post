"use client";

import { Box, SimpleGrid, Flex, Text } from "@chakra-ui/react";
import { PageShell } from "@/components/pageShell";
import { NewsCard } from "@/components/newsCard";
import { SectionHeader } from "@/components/sectionHeader";
import { TimeAgo } from "@/components/timeAgo";
import { useLocale } from "@/lib/localeContext";
import {
  getFeaturedArticles,
  getTrendingArticles,
  getLatestArticles,
  getArticlesByCategory,
} from "@/lib/mockData";
import { NepaliCalendar } from "@/components/nepaliCalendar";
import { ForexWidget } from "@/components/forexWidget";
import { GoldSilverWidget } from "@/components/goldSilverWidget";

function AdBanner({ variant = "slim" }: { variant?: "slim" | "full" }) {
  const isFull = variant === "full";
  return (
    <Box
      mb={isFull ? "36px" : "24px"}
      bg="var(--color-surface)"
      border="1px dashed var(--color-border)"
      h={isFull ? { base: "160px", md: "250px" } : "90px"}
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="4px"
    >
      <Text
        fontSize={isFull ? "13px" : "11px"}
        color="var(--color-muted)"
        fontWeight="500"
        textTransform="uppercase"
        letterSpacing="2px"
      >
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
        <Box mb="24px">
          <NepaliCalendar />
        </Box>
        <Box mb="24px">
          <GoldSilverWidget />
        </Box>
        <Box mt="24px">
          <SectionHeader title={t("trending")} accent="var(--color-brand)" />
          <Box>
            {trending.map((a, i) => (
              <Flex
                key={a.id}
                gap="12px"
                py="14px"
                borderBottom={i < trending.length - 1 ? "1px solid var(--color-border)" : "none"}
                _hover={{ "& .rank": { color: "var(--color-brand)" }, "& .t-title": { color: "var(--color-brand)" } }}
                cursor="pointer"
                align="flex-start"
              >
                <Text
                  className="rank"
                  fontSize="28px"
                  fontWeight="900"
                  color="var(--color-border)"
                  lineHeight="1"
                  w="40px"
                  textAlign="center"
                  flexShrink={0}
                  whiteSpace="nowrap"
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
                    <Text className="t-title" fontWeight="700" fontSize="15px" lineHeight="1.45" lineClamp={2} color="var(--color-headline)" transition="color 0.15s">
                      {locale === "ne" ? a.title.ne : a.title.en}
                    </Text>
                  </a>
                  <TimeAgo date={a.publishedAt} fontSize="12px" color="var(--color-muted)" mt="3px" />
                </Box>
              </Flex>
            ))}
          </Box>
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
  const { locale } = useLocale();
  return (
    <PageShell>
        <AdBanner />
        <HeroSection />
        <LatestWithSidebar />

        <AdBanner variant="full" />

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap="28px" mb="36px">
          <Box gridColumn={{ lg: "span 2" }}>
            <CategorySection categorySlug="politics" color="var(--color-brand)" />
            <CategorySection categorySlug="business" color="#1a56db" />
            <CategorySection categorySlug="entertainment" color="#7c3aed" />
          </Box>
          <Box>
            <MoreNews />
            <Box mb="32px">
              <ForexWidget />
            </Box>
            <AdBanner />
          </Box>
        </SimpleGrid>

        <CategorySection categorySlug="sports" color="#059669" />
        <CategorySection categorySlug="technology" color="#0891b2" />
    </PageShell>
  );
}
