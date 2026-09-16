"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { AdSlot } from "@/components/adSlot";
import { useLocale } from "@/lib/localeContext";
import type { LocalisedText } from "@/lib/domain/article";
import type { AdSlots } from "@/lib/publicQueries";

interface BlogCard {
  id: string;
  slug: string;
  title: LocalisedText;
  excerpt: LocalisedText;
  heroImage: string;
  publishedAt: string;
}

function useDate() {
  const { locale } = useLocale();
  return (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "ne" ? "en-GB" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
}

function BlogCardItem({
  blog,
  pick,
  fmt,
  imageHeight,
  showExcerpt,
}: {
  blog: BlogCard;
  pick: (t: LocalisedText) => string;
  fmt: (iso: string) => string;
  imageHeight: string;
  showExcerpt?: boolean;
}) {
  return (
    <Link href={`/blog/${blog.slug}`}>
      <Box
        role="group"
        borderRadius="16px"
        overflow="hidden"
        bg="var(--color-card)"
        border="1px solid var(--color-border)"
        transition="transform 0.18s, box-shadow 0.18s"
        _hover={{ transform: "translateY(-4px)", boxShadow: "0 12px 30px rgba(0,0,0,0.10)" }}
      >
        <Box position="relative" w="full" h={imageHeight} bg="var(--color-card-alt)">
          <Image src={blog.heroImage} alt={pick(blog.title)} fill sizes="(max-width: 768px) 100vw, 66vw" style={{ objectFit: "cover" }} />
        </Box>
        <Box p="18px 20px 22px">
          <Text fontSize="13px" color="var(--color-muted)" mb="8px">
            {fmt(blog.publishedAt)}
          </Text>
          <Text
            fontSize={showExcerpt ? "26px" : "19px"}
            fontWeight="800"
            lineHeight="1.28"
            color="var(--color-headline)"
            lineClamp={3}
            _groupHover={{ color: "var(--color-brand)" }}
            transition="color 0.15s"
          >
            {pick(blog.title)}
          </Text>
          {showExcerpt && pick(blog.excerpt) && (
            <Text mt="10px" fontSize="15px" color="var(--color-subtle)" lineHeight="1.6" lineClamp={3}>
              {pick(blog.excerpt)}
            </Text>
          )}
        </Box>
      </Box>
    </Link>
  );
}

function RecentBlogs({ blogs, pick, fmt }: { blogs: BlogCard[]; pick: (t: LocalisedText) => string; fmt: (iso: string) => string }) {
  const { locale } = useLocale();
  if (blogs.length === 0) return null;
  return (
    <Box>
      <SectionHeader title={locale === "ne" ? "हालैका ब्लग" : "Recent Blogs"} accent="var(--color-brand)" />
      {blogs.map((b, i) => (
        <Link key={b.id} href={`/blog/${b.slug}`}>
          <Flex
            gap="12px"
            py="12px"
            borderBottom={i < blogs.length - 1 ? "1px solid var(--color-border)" : "none"}
            _hover={{ "& .r-title": { color: "var(--color-brand)" } }}
            align="flex-start"
          >
            <Box position="relative" w="64px" h="48px" flexShrink={0} borderRadius="6px" overflow="hidden" bg="var(--color-card-alt)">
              <Image src={b.heroImage} alt="" fill sizes="64px" style={{ objectFit: "cover" }} />
            </Box>
            <Box flex="1" minW="0">
              <Text className="r-title" fontWeight="700" fontSize="14px" lineHeight="1.4" lineClamp={2} color="var(--color-headline)" transition="color 0.15s">
                {pick(b.title)}
              </Text>
              <Text fontSize="12px" color="var(--color-muted)" mt="2px">
                {fmt(b.publishedAt)}
              </Text>
            </Box>
          </Flex>
        </Link>
      ))}
    </Box>
  );
}

export default function BlogPageClient({ blogs, ads }: { blogs: BlogCard[]; ads: AdSlots }) {
  const { locale } = useLocale();
  const pick = (t: LocalisedText) => (locale === "ne" ? t.ne ?? t.en : t.en ?? t.ne) ?? "";
  const fmt = useDate();

  const lead = blogs[0];
  const rest = blogs.slice(1);

  return (
    <PageShell>
      <Flex gap="6px" align="center" mb="20px" fontSize="13px" color="var(--color-muted)">
        <Link href="/">
          <Text _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
            {locale === "ne" ? "गृहपृष्ठ" : "Home"}
          </Text>
        </Link>
        <Text>›</Text>
        <Text color="var(--color-brand)" fontWeight="600">{locale === "ne" ? "ब्लग" : "Blog"}</Text>
      </Flex>

      <SectionHeader title={locale === "ne" ? "ब्लग" : "Blog"} accent="var(--color-brand)" />

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="32px">
        <Box gridColumn={{ lg: "span 2" }}>
          {lead && (
            <Box mb="28px">
              <BlogCardItem blog={lead} pick={pick} fmt={fmt} imageHeight="380px" showExcerpt />
            </Box>
          )}
          {rest.length > 0 && (
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="20px">
              {rest.map((b) => (
                <BlogCardItem key={b.id} blog={b} pick={pick} fmt={fmt} imageHeight="180px" />
              ))}
            </SimpleGrid>
          )}
          {blogs.length === 0 && (
            <Box py="40px" textAlign="center">
              <Text fontSize="16px" color="var(--color-muted)">
                {locale === "ne" ? "कुनै ब्लग भेटिएन।" : "No blog posts yet."}
              </Text>
            </Box>
          )}
        </Box>

        <Box>
          <AdSlot placement="sidebar" ad={ads.sidebar} mb="28px" />
          <RecentBlogs blogs={blogs.slice(0, 6)} pick={pick} fmt={fmt} />
        </Box>
      </SimpleGrid>
    </PageShell>
  );
}
