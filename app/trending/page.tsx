"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { TimeAgo } from "@/components/timeAgo";
import { useLocale } from "@/lib/localeContext";
import { getTrendingArticles, getLatestArticles } from "@/lib/mockData";
import { NewsCard } from "@/components/newsCard";

export default function TrendingPage() {
  const { locale, localized, t } = useLocale();
  const trending = getTrendingArticles();
  const latest = getLatestArticles().slice(0, 4);

  return (
    <PageShell>
      <Flex gap="6px" align="center" mb="20px" fontSize="13px" color="#999">
        <Link href="/">
          <Text _hover={{ color: "#c0392b" }} transition="color 0.15s">
            {locale === "ne" ? "गृहपृष्ठ" : "Home"}
          </Text>
        </Link>
        <Text>›</Text>
        <Text color="#1a1a1a" fontWeight="600">{t("trending")}</Text>
      </Flex>

      <SectionHeader title={t("trending")} accent="#c0392b" />

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="32px">
        <Box gridColumn={{ lg: "span 2" }}>
          {trending.map((a, i) => {
            const title = localized(a.title);
            const categoryName = localized(a.category.name);
            const catColor = a.category.color || "#c0392b";

            return (
              <Link key={a.id} href={`/article/${a.slug}`}>
                <Flex
                  gap="20px"
                  py="20px"
                  borderBottom="1px solid #eee"
                  _hover={{ "& .t-title": { color: "#c0392b" }, "& .t-img img": { transform: "scale(1.03)" } }}
                  cursor="pointer"
                  align="flex-start"
                >
                  <Text
                    fontSize="36px"
                    fontWeight="900"
                    color="#e8e8e8"
                    lineHeight="1"
                    w="50px"
                    textAlign="center"
                    flexShrink={0}
                    whiteSpace="nowrap"
                    fontFamily="var(--font-poppins), sans-serif"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </Text>

                  <Box flex="1" minW="0">
                    <Text fontSize="11px" fontWeight="700" color={catColor} textTransform="uppercase" letterSpacing="0.5px" mb="4px">
                      {categoryName}
                    </Text>
                    <Text className="t-title" fontWeight="700" fontSize="20px" lineHeight="1.4" noOfLines={2} color="#1a1a1a" transition="color 0.15s" mb="6px">
                      {title}
                    </Text>
                    <Text fontSize="14px" color="#666" noOfLines={2} lineHeight="1.6" mb="6px" display={{ base: "none", sm: "block" }}>
                      {localized(a.excerpt)}
                    </Text>
                    <TimeAgo date={a.publishedAt} fontSize="13px" color="#999" />
                  </Box>

                  <Box className="t-img" position="relative" w={{ base: "100px", sm: "160px" }} h={{ base: "75px", sm: "110px" }} flexShrink={0} borderRadius="3px" overflow="hidden">
                    <Image src={a.image} alt={title} fill style={{ objectFit: "cover", transition: "transform 0.4s" }} sizes="160px" />
                  </Box>
                </Flex>
              </Link>
            );
          })}
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

          <SectionHeader title={t("latest")} accent="#1a1a2e" href="/latest" />
          {latest.map((a) => (
            <NewsCard key={a.id} article={a} variant="list" showCategory />
          ))}
        </Box>
      </SimpleGrid>
    </PageShell>
  );
}
