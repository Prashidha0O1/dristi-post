"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { AdSlot } from "@/components/adSlot";
import { useLocale } from "@/lib/localeContext";
import { formatDate } from "@/lib/time";
import type { LocalisedText } from "@/lib/domain/article";
import type { AdSlots } from "@/lib/publicQueries";

interface BlogCard {
  id: string;
  slug: string;
  title: LocalisedText;
  excerpt: LocalisedText;
  heroImage: string;
  publishedAt: string;
  isFeatured?: boolean;
}

function useDate() {
  const { locale } = useLocale();
  return (iso: string) => formatDate(iso, locale as any);
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
  imageHeight: any;
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
        display="flex"
        flexDirection="column"
        h="100%"
      >
        <Box position="relative" w="full" style={{ aspectRatio: 16/9 }} bg="var(--color-card-alt)" flexShrink={0}>
          <Image src={blog.heroImage} alt={pick(blog.title)} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
        </Box>
        <Box p="18px 20px 22px" flex="1" display="flex" flexDirection="column">
          <Text fontSize="13px" color="var(--color-muted)" mb="8px">
            {fmt(blog.publishedAt)}
          </Text>
          <Text
            fontSize="19px"
            fontWeight="800"
            lineHeight="1.28"
            color="var(--color-headline)"
            lineClamp={3}
            _groupHover={{ color: "var(--color-brand)" }}
            transition="color 0.15s"
            mb="8px"
          >
            {pick(blog.title)}
          </Text>
          {showExcerpt && pick(blog.excerpt) && (
            <Text fontSize="15px" color="var(--color-subtle)" lineHeight="1.6" lineClamp={3} mt="auto">
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
            <Box position="relative" w="76px" style={{ aspectRatio: 16/9 }} flexShrink={0} borderRadius="6px" overflow="hidden" bg="var(--color-card-alt)">
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

export default function BlogPageClient({ blogs, ads, total, currentPage }: { blogs: BlogCard[]; ads: AdSlots; total: number; currentPage: number }) {
  const { locale } = useLocale();
  const pick = (t: LocalisedText) => (locale === "ne" ? t.ne ?? t.en : t.en ?? t.ne) ?? "";
  const fmt = useDate();

  const limit = 16;
  const totalPages = Math.ceil(total / limit);

  const featuredBlogs = blogs.filter((b) => b.isFeatured);
  const regularBlogs = blogs.filter((b) => !b.isFeatured);

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

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="32px">
        <Box gridColumn={{ lg: "span 2" }}>
          {featuredBlogs.length > 0 && (
            <Box mb="32px">
              <SectionHeader title={locale === "ne" ? "प्रमुख ब्लग" : "Featured Blog"} accent="var(--color-brand)" />
              <BlogCardItem blog={featuredBlogs[0]} pick={pick} fmt={fmt} imageHeight={{ base: "230px", md: "340px" }} showExcerpt />
              {featuredBlogs.length > 1 && (
                 <SimpleGrid columns={{ base: 1, sm: 2 }} gap="24px" mt="24px">
                   {featuredBlogs.slice(1).map((b) => (
                     <BlogCardItem key={b.id} blog={b} pick={pick} fmt={fmt} imageHeight={{ base: "180px", md: "180px" }} showExcerpt />
                   ))}
                 </SimpleGrid>
              )}
            </Box>
          )}

          <SectionHeader title={locale === "ne" ? "सबै ब्लगहरू" : "All Blogs"} accent="var(--color-brand)" />
          
          {regularBlogs.length > 0 && (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap="24px" mb="32px">
                {regularBlogs.map((b) => (
                  <BlogCardItem key={b.id} blog={b} pick={pick} fmt={fmt} imageHeight={{ base: "200px", md: "210px" }} showExcerpt />
                ))}
              </SimpleGrid>
              
              {totalPages > 1 && (
                <Flex justify="center" align="center" gap="16px" mt="40px" mb="32px">
                  {currentPage > 1 ? (
                    <Link href={`/blog?page=${currentPage - 1}`}>
                      <Box as="button" px="16px" py="8px" border="1px solid var(--color-border)" borderRadius="4px" _hover={{ bg: "var(--color-paper)", color: "var(--color-brand)", borderColor: "var(--color-brand)" }} transition="all 0.15s">
                        {locale === "ne" ? "अघिल्लो" : "Previous"}
                      </Box>
                    </Link>
                  ) : (
                    <Box px="16px" py="8px" border="1px solid var(--color-border)" borderRadius="4px" opacity={0.5} cursor="not-allowed">
                      {locale === "ne" ? "अघिल्लो" : "Previous"}
                    </Box>
                  )}
                  
                  <Text fontSize="14px" fontWeight="600" color="var(--color-muted)">
                    {locale === "ne" ? `पृष्ठ ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                  </Text>
                  
                  {currentPage < totalPages ? (
                    <Link href={`/blog?page=${currentPage + 1}`}>
                      <Box as="button" px="16px" py="8px" border="1px solid var(--color-border)" borderRadius="4px" _hover={{ bg: "var(--color-paper)", color: "var(--color-brand)", borderColor: "var(--color-brand)" }} transition="all 0.15s">
                        {locale === "ne" ? "अर्को" : "Next"}
                      </Box>
                    </Link>
                  ) : (
                    <Box px="16px" py="8px" border="1px solid var(--color-border)" borderRadius="4px" opacity={0.5} cursor="not-allowed">
                      {locale === "ne" ? "अर्को" : "Next"}
                    </Box>
                  )}
                </Flex>
              )}
            </>
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
