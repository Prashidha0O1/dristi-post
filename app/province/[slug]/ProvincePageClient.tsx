"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { NewsCard } from "@/components/newsCard";
import { SectionHeader } from "@/components/sectionHeader";
import { ProvinceFilter } from "@/components/provinceFilter";
import { useLocale } from "@/lib/localeContext";
import type { Province } from "@/lib/domain/province";
import type { Article } from "@/lib/types";

export default function ProvincePageClient({
  province,
  articles,
}: {
  province: Province;
  articles: Article[];
}) {
  const { locale, localized } = useLocale();

  const provinceName = localized(province.name);
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
        <Text color="var(--color-brand)" fontWeight="600">
          {provinceName}
        </Text>
      </Flex>

      <SectionHeader
        title={
          locale === "ne"
            ? `${provinceName} प्रदेश`
            : `${provinceName} Province`
        }
        accent="var(--color-brand)"
      />

      <Text fontSize="13px" color="#888" mb="20px">
        {locale === "ne"
          ? `प्रदेश नं. ${province.number} · राजधानी: ${localized(province.capital)}`
          : `Province No. ${province.number} · Capital: ${localized(province.capital)}`}
      </Text>

      <ProvinceFilter activeSlug={province.slug} />

      {articles.length === 0 ? (
        <Box py="48px" textAlign="center">
          <Text fontSize="16px" color="#999">
            {locale === "ne"
              ? "यस प्रदेशका समाचार अझै प्रकाशित भएका छैनन्।"
              : "No news published for this province yet."}
          </Text>
        </Box>
      ) : (
        <>
          {lead && (
            <Box mb="28px">
              <NewsCard article={lead} variant="hero" showExcerpt showAuthor imageHeight="380px" />
            </Box>
          )}
          {rest.length > 0 && (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="20px">
              {rest.map((a) => (
                <NewsCard key={a.id} article={a} variant="featured" imageHeight="170px" />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </PageShell>
  );
}
