"use client";

import { Box, Text, SimpleGrid } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import type { LocalisedText } from "@/lib/domain/article";

interface BlogCard {
  id: string;
  slug: string;
  title: LocalisedText;
  excerpt: LocalisedText;
  heroImage: string;
  publishedAt: string;
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "ne" ? "en-GB" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogPageClient({ blogs }: { blogs: BlogCard[] }) {
  const { locale } = useLocale();
  const pick = (t: LocalisedText) => (locale === "ne" ? t.ne ?? t.en : t.en ?? t.ne) ?? "";

  return (
    <PageShell>
      <SectionHeader title={locale === "ne" ? "ब्लग" : "Blog"} accent="var(--color-brand)" />

      <Text fontSize="15px" color="var(--color-subtle)" mb="28px" lineHeight="1.7">
        {locale === "ne"
          ? "विचार, विश्लेषण र गाइडहरू"
          : "Insights, analysis, and guides"}
      </Text>

      {blogs.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="28px">
          {blogs.map((b) => (
            <Link key={b.id} href={`/blog/${b.slug}`}>
              <Box
                role="group"
                borderRadius="16px"
                overflow="hidden"
                bg="var(--color-card)"
                border="1px solid var(--color-border)"
                transition="transform 0.18s, box-shadow 0.18s"
                _hover={{ transform: "translateY(-4px)", boxShadow: "0 12px 30px rgba(0,0,0,0.10)" }}
              >
                <Box position="relative" w="full" h="200px" bg="var(--color-card-alt)">
                  <Image
                    src={b.heroImage}
                    alt={pick(b.title)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Box p="18px 20px 22px">
                  <Text fontSize="13px" color="var(--color-muted)" mb="8px">
                    {formatDate(b.publishedAt, locale)}
                  </Text>
                  <Text
                    fontSize="20px"
                    fontWeight="800"
                    lineHeight="1.3"
                    color="var(--color-headline)"
                    lineClamp={3}
                    _groupHover={{ color: "var(--color-brand)" }}
                    transition="color 0.15s"
                  >
                    {pick(b.title)}
                  </Text>
                </Box>
              </Box>
            </Link>
          ))}
        </SimpleGrid>
      ) : (
        <Box py="48px" textAlign="center">
          <Text fontSize="16px" color="var(--color-muted)">
            {locale === "ne" ? "कुनै ब्लग भेटिएन।" : "No blog posts yet."}
          </Text>
        </Box>
      )}
    </PageShell>
  );
}
