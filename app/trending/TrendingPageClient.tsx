"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { TimeAgo } from "@/components/timeAgo";
import { useLocale } from "@/lib/localeContext";
import { NewsCard } from "@/components/newsCard";
import type { Article } from "@/lib/types";
import { AdSlot } from "@/components/adSlot";
import type { AdSlots } from "@/lib/publicQueries";

export default function TrendingPageClient({ trending, latest, ads }: { trending: Article[]; latest: Article[]; ads: AdSlots }) {
  const { locale, localized, t } = useLocale();

  return (
    <PageShell>
      <Flex gap="6px" align="center" mb="20px" fontSize="13px" color="var(--color-muted)">
        <Link href="/">
          <Text _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
            {locale === "ne" ? "गृहपृष्ठ" : "Home"}
          </Text>
        </Link>
        <Text>›</Text>
        <Text color="var(--color-headline)" fontWeight="600">{t("trending")}</Text>
      </Flex>

      <SectionHeader title={t("trending")} accent="var(--color-brand)" />

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="32px">
        <Box gridColumn={{ lg: "span 2" }}>
          {trending.length === 0 && (
            <Box py="40px" textAlign="center">
              <Text fontSize="16px" color="var(--color-muted)">
                {locale === "ne" ? "हाल कुनै ट्रेन्डिङ समाचार छैन।" : "No trending articles yet."}
              </Text>
            </Box>
          )}
          {trending.map((a, i) => {
            const title = localized(a.title);
            const categoryName = localized(a.category.name);
            const catColor = a.category.color || "var(--color-brand)";

            return (
              <Link key={a.id} href={`/article/${a.slug}`}>
                <Flex
                  gap="20px"
                  py="20px"
                  borderBottom="1px solid var(--color-border)"
                  _hover={{ "& .t-title": { color: "var(--color-brand)" }, "& .t-img img": { transform: "scale(1.03)" } }}
                  cursor="pointer"
                  align="flex-start"
                >
                  <Text
                    fontSize="36px"
                    fontWeight="900"
                    color="var(--color-border)"
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
                    <Text className="t-title" fontWeight="700" fontSize="20px" lineHeight="1.4" lineClamp={2} color="var(--color-headline)" transition="color 0.15s" mb="6px">
                      {title}
                    </Text>
                    <Text fontSize="14px" color="var(--color-subtle)" lineClamp={2} lineHeight="1.6" mb="6px" display={{ base: "none", sm: "block" }}>
                      {localized(a.excerpt)}
                    </Text>
                    <TimeAgo date={a.publishedAt} fontSize="13px" color="var(--color-muted)" />
                  </Box>

                  <Box className="t-img" position="relative" w={{ base: "100px", sm: "160px" }} h={{ base: "75px", sm: "110px" }} flexShrink={0} borderRadius="3px" overflow="hidden">
                    <Image src={a.image} alt={title} fill style={{ objectFit: "cover", transition: "transform 0.4s" }} sizes="160px" />
                  </Box>
                </Flex>
              </Link>
            );
          })}
        </Box>

        <Box>
          <AdSlot placement="sidebar" ad={ads.sidebar} mb="28px" />

          <SectionHeader title={t("latest")} accent="var(--color-nav)" href="/latest" />
          {latest.map((a) => (
            <NewsCard key={a.id} article={a} variant="list" showCategory />
          ))}
        </Box>
      </SimpleGrid>
    </PageShell>
  );
}
