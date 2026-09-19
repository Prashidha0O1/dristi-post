"use client";
import React from "react";


import { categories } from "@/lib/config";
import { Box, Flex, Grid, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/lib/localeContext";
import { provinces } from "@/lib/domain/province";
import type { Article } from "@/lib/types";
import type { BlogRecord } from "@/lib/domain/blog";
import { NepaliCalendar } from "@/components/nepaliCalendar";
import { ForexWidget } from "@/components/forexWidget";
import { GoldSilverWidget } from "@/components/goldSilverWidget";
import { PageShell } from "@/components/pageShell";
import { TimeAgo } from "@/components/timeAgo";
import { AdSlot } from "@/components/adSlot";
import type { AdSlots } from "@/lib/publicQueries";

const BRAND = "var(--color-brand)";

function FrontPageSectionHeader({
  eyebrow,
  title,
  href,
  actionLabel,
  headingLevel = "h2",
}: {
  eyebrow: string;
  title: string;
  href?: string;
  actionLabel?: string;
  headingLevel?: "h1" | "h2" | "h3";
}) {
  return (
    <Box mb="20px">
      <Flex align="flex-end" justify="space-between" gap="16px" mb="8px">
        <Box>
          {eyebrow && (
            <Text className="dp-english" fontSize="11px" fontWeight="600" textTransform="uppercase" letterSpacing="0.12em" color="var(--color-muted)" mb="4px">
              {eyebrow}
            </Text>
          )}
          <Heading as={headingLevel} fontSize={{ base: "24px", lg: "28px" }} fontWeight="700" color="var(--color-headline)" m="0" lineHeight="1.2">
            {title}
          </Heading>
        </Box>
        {href && actionLabel && (
          <Link href={href} className="dp-story-link dp-english" style={{ display: "inline-flex", alignItems: "center", gap: "4px", flexShrink: 0, fontSize: "11px", fontWeight: 600, color: "var(--color-brand)" }}>
            {actionLabel}
            <Text as="span" fontSize="14px" lineHeight="1" aria-hidden="true">→</Text>
          </Link>
        )}
      </Flex>
      <Box className="dp-rule" />
    </Box>
  );
}

function StoryImage({
  article,
  alt,
  height,
  aspectRatio,
  sizes,
  priority = false,
  className = "",
}: {
  article: Article;
  alt: string;
  height?: any;
  aspectRatio?: number | string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Box className={`dp-image-wrap ${className}`} position="relative" h={height} style={aspectRatio ? { aspectRatio } : undefined} overflow="hidden" borderRadius="3px" bg="var(--color-card-alt)">
      <Image src={article.image} alt={alt} fill priority={priority} sizes={sizes} className="dp-image" style={{ objectFit: "cover" }} />
    </Box>
  );
}

function LeadDesk({ articles, ads }: { articles: Article[]; ads: AdSlots }) {
  const { locale, localized } = useLocale();
  const featured = articles.filter((a) => a.isFeatured);
  const lead = featured[0];
  const supporting = featured.slice(1, 3);
  const secondaryFeatured = featured.slice(3, 7);

  if (!lead) return null;

  return (
    <Box as="section" aria-labelledby="top-stories-heading" mb="48px">
      <FrontPageSectionHeader
        eyebrow="Top stories"
        title={locale === "ne" ? "मुख्य समाचार" : "Top stories"}
        href="#latest"
        actionLabel={locale === "ne" ? "सबै हेर्नुहोस्" : "See all"}
        headingLevel="h1"
      />
      <Grid className="dp-hero-grid" templateColumns={{ base: "1fr", lg: "minmax(0, 1.65fr) minmax(360px, 1fr)" }} gap="28px" alignItems="start">
        <Box as="article">
          <Link href={`/article/${lead.slug}`} className="dp-image-wrap" style={{ display: "block" }}>
            <StoryImage article={lead} alt={localized(lead.title)} aspectRatio={16/9} sizes="(max-width: 992px) 100vw, 66vw" priority />
          </Link>
          <Box pt="16px">
            <Flex align="center" gap="8px" mb="8px" fontSize="11px" fontWeight="600" color={lead.category.color || BRAND}>
              <Text>{localized(lead.category.name)}</Text>
              <Text color="var(--color-border)" aria-hidden="true">·</Text>
              <TimeAgo date={lead.publishedAt} className="dp-number" fontSize="11px" fontWeight="400" color="var(--color-muted)" />
            </Flex>
            <Link href={`/article/${lead.slug}`} className="dp-story-link dp-lead-title" style={{ display: "block", maxWidth: "780px", color: "var(--color-headline)", fontSize: "39px", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.015em" }}>
              {localized(lead.title)}
            </Link>
            <Text mt="12px" maxW="760px" fontSize="16px" lineHeight="1.55" color="var(--color-muted)" lineClamp={2}>
              {localized(lead.excerpt)}
            </Text>
            <Flex mt="12px" align="center" gap="8px" fontSize="12px" color="var(--color-muted)">
              <Text>{localized(lead.author.name)}</Text>
            </Flex>
          </Box>
        </Box>

        <Box className="dp-supporting-desk">
          <Text className="dp-english" mb="12px" fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="0.15em" color="var(--color-muted)">
            Supporting desk
          </Text>
          {supporting.map((article) => (
            <Box as="article" key={article.id} className="dp-support-row" borderTop="1px solid var(--color-border)" py="16px">
              <Link href={`/article/${article.slug}`} style={{ display: "flex", gap: "16px", minWidth: 0 }}>
                <StoryImage article={article} alt={localized(article.title)} aspectRatio={16/9} sizes="138px" className="dp-support-thumb" />
                <Box minW="0">
                  <Text mb="4px" fontSize="11px" fontWeight="600" color={article.category.color || BRAND}>
                    {localized(article.category.name)}
                  </Text>
                  <Text className="dp-story-link" fontSize="19px" fontWeight="700" lineHeight="1.28" lineClamp={3} color="var(--color-headline)">
                    {localized(article.title)}
                  </Text>
                  <TimeAgo date={article.publishedAt} className="dp-number" mt="8px" fontSize="11px" color="var(--color-muted)" />
                </Box>
              </Link>
            </Box>
          ))}
          <Link href="/latest" className="dp-story-link" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: "2px solid var(--color-brand)", color: "var(--color-brand)", fontSize: "13px", fontWeight: 600 }}>
            <span>{locale === "ne" ? "समाचारका थप शीर्षक" : "More headlines"}</span>
            <span aria-hidden="true" style={{ fontSize: "16px" }}>↗</span>
          </Link>
          <AdSlot placement="home-lead-rail" ad={ads["home-lead-rail"]} mt="24px" />
        </Box>
      </Grid>

      {/* 4 Small Box Type Featured Articles below the main hero grid */}
      {secondaryFeatured.length > 0 && (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap="24px" mt="32px" pt="32px" borderTop="1px solid var(--color-border)">
          {secondaryFeatured.map((article) => (
            <Box as="article" key={article.id}>
              <Link href={`/article/${article.slug}`} className="dp-image-wrap" style={{ display: "block" }}>
                <StoryImage article={article} alt={localized(article.title)} aspectRatio={16/9} sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 25vw" />
              </Link>
              <Box pt="12px">
                <Text mb="4px" fontSize="11px" fontWeight="600" color={article.category.color || BRAND}>
                  {localized(article.category.name)}
                </Text>
                <Link href={`/article/${article.slug}`} className="dp-story-link" style={{ display: "block", fontSize: "16px", fontWeight: 700, lineHeight: 1.3, color: "var(--color-headline)" }}>
                  {localized(article.title)}
                </Link>
                <TimeAgo date={article.publishedAt} className="dp-number" mt="8px" fontSize="11px" color="var(--color-muted)" />
              </Box>
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
}

function LatestLedgerRow({ article }: { article: Article }) {
  const { localized } = useLocale();
  return (
    <Box as="li">
      {/* The 2-column `base` layout only looks right below 760px, where the
          CSS in globals.css hides the category/thumbnail columns to match.
          Jumping straight to `lg` (992px) left everything from 760-992px on
          that cramped 2-column grid with all 4 items still rendered — the
          title got shoved into the 70px column and wrapped one word per
          line. `md` (768px) closes that gap. */}
      <Grid className="dp-ledger-row" templateColumns={{ base: "70px minmax(0, 1fr)", md: "76px 110px minmax(0, 1fr) 76px" }} gap="12px" alignItems="center" borderBottom="1px solid var(--color-border)" py="12px">
        <TimeAgo date={article.publishedAt} className="dp-number" fontSize="11px" color="var(--color-muted)" />
        <Text className="dp-ledger-subject" fontSize="12px" fontWeight="600" color={article.category.color || BRAND}>
          {localized(article.category.name)}
        </Text>
        <Link href={`/article/${article.slug}`} className="dp-story-link" style={{ minWidth: 0, color: "var(--color-headline)", fontSize: "17px", fontWeight: 700, lineHeight: 1.28 }}>
          {localized(article.title)}
        </Link>
        <Box className="dp-ledger-thumb" position="relative" w="76px" style={{ aspectRatio: 16/9 }} overflow="hidden" borderRadius="3px" bg="var(--color-card-alt)">
          <Image src={article.image} alt={localized(article.title)} fill sizes="76px" style={{ objectFit: "cover" }} />
        </Box>
      </Grid>
    </Box>
  );
}

function UtilityRail() {
  return (
    <Flex direction="column" gap="0" className="dp-utility-rail-standalone">
      <NepaliCalendar variant="default" />
      <Box border="1px solid var(--color-border)" borderTop="none" borderRadius="0 0 4px 4px" overflow="hidden" bg="var(--color-surface)">
        <Grid templateColumns="1fr" gap="0">
          <GoldSilverWidget variant="compact" />
          <ForexWidget variant="compact" />
        </Grid>
      </Box>
    </Flex>
  );
}

function LatestSection({ articles, ads, blogs }: { articles: Article[]; ads: AdSlots; blogs: BlogRecord[] }) {
  const { locale, localized } = useLocale();
  const latest = articles.slice(0, 8);
  return (
    <Box as="section" id="latest" aria-labelledby="latest-heading" mb="44px">
      <Grid className="dp-ledger-grid" templateColumns={{ base: "1fr", lg: "minmax(0, 1.95fr) minmax(310px, 1fr)" }} gap="32px" alignItems="stretch">
        {/* Left column is a flex column — articles fill top, blogs fill the bottom */}
        <Flex direction="column">
          <FrontPageSectionHeader eyebrow="Latest updates" title={locale === "ne" ? "ताजा अपडेट" : "Latest updates"} href="/latest" actionLabel={locale === "ne" ? "सबै हेर्नुहोस्" : "View all"} />
          <Grid className="dp-ledger-head" templateColumns="76px 110px minmax(0, 1fr) 76px" gap="12px" pb="8px" color="var(--color-muted)" fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.12em">
            <Text className="dp-english">Time</Text>
            <Text>विषय</Text>
            <Text className="dp-english">Story</Text>
            <Text aria-hidden="true" />
          </Grid>
          <Box as="ol" listStyleType="none">
            {latest.map((article) => <LatestLedgerRow key={article.id} article={article} />)}
          </Box>
          <Link href="/latest" className="dp-story-link" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "16px", color: "var(--color-brand)", fontSize: "13px", fontWeight: 600 }}>
            {locale === "ne" ? "सबै ताजा अपडेट" : "All latest updates"}
            <Text as="span" fontSize="15px" aria-hidden="true">→</Text>
          </Link>

          {/* Blogs section replacing the ad in the left column empty space */}
          {blogs && blogs.length > 0 && (
            <Box mt="12px" pt="16px" borderTop="1px solid var(--color-border)">
              <Flex align="center" justify="space-between" mb="16px" borderBottom="1px solid var(--color-border)" pb="8px">
                <Text fontSize="14px" fontWeight="700" color="var(--color-headline)" textTransform="uppercase" letterSpacing="0.05em">
                  {locale === "ne" ? "ब्लग / विचार" : "Blogs & Opinions"}
                </Text>
                <Link href="/blog" className="dp-story-link" style={{ color: "var(--color-brand)", fontSize: "12px", fontWeight: 600 }}>
                  {locale === "ne" ? "सबै हेर्नुहोस् →" : "View all →"}
                </Link>
              </Flex>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="24px">
                {blogs.slice(0, 2).map(blog => (
                  <Link key={blog.id} href={`/blog/${blog.slug}`} className="dp-image-wrap" style={{ display: "block" }}>
                    <Box width="100%" style={{ aspectRatio: 16/9 }} position="relative" borderRadius="6px" overflow="hidden" mb="12px">
                      {blog.heroImage ? (
                        <Image src={blog.heroImage} alt="" fill style={{ objectFit: "cover" }} />
                      ) : (
                        <Box width="100%" height="100%" bg="var(--color-border)" />
                      )}
                    </Box>
                    <Text className="dp-story-link" fontSize="16px" fontWeight="700" color="var(--color-headline)" lineHeight="1.4" lineClamp={3}>
                      {locale === "ne" ? (blog.title.ne || blog.title.en) : (blog.title.en || blog.title.ne)}
                    </Text>
                  </Link>
                ))}
              </Grid>
            </Box>
          )}
        </Flex>
        <UtilityRail />
      </Grid>
      
      {/* Ad pushed below the entire LatestSection grid — full width on all devices */}
      <Box mt="32px">
        <AdSlot placement="home-latest-rail" ad={ads["home-latest-rail"]} />
      </Box>
    </Box>
  );
}


// We dynamically generate the category blocks for the homepage so that ANY 
// category with an article automatically appears, instead of being hardcoded to just 5.
const HOME_CATEGORY_BLOCKS = categories
  .filter(c => !["blog", "interview", "entertainment"].includes(c.slug))
  .map(c => ({
    categorySlug: c.slug,
    titleNe: c.name.ne,
    titleEn: c.name.en,
    eyebrow: c.name.en,
  }));


function CategoryBlock({ categorySlug, articles, title, eyebrow }: { categorySlug: string; articles: Article[]; title: string; eyebrow?: string }) {
  const { locale, localized } = useLocale();
  const inCategory = articles.filter((a) => a.category.slug === categorySlug);

  // No padding-from-other-categories trick: with real data a thin category is
  // a real, honest state, not something to paper over with unrelated stories.
  if (inCategory.length === 0) return null;

  const feature = inCategory[0];
  const list = inCategory.slice(1, 5);

  return (
    <Box>
      <FrontPageSectionHeader eyebrow={locale === "ne" ? "" : (eyebrow || "")} title={title} href={`/${categorySlug}`} actionLabel={locale === "ne" ? "सबै हेर्नुहोस्" : "See all"} />
      <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 1fr)" }} gap="28px">

        {/* Left: Title + Excerpt */}
        <Flex direction="column" justify="flex-start">
          <Link href={`/article/${feature.slug}`} className="dp-story-link" style={{ display: "block", color: "var(--color-headline)", fontSize: "22px", fontWeight: 700, lineHeight: 1.28, marginBottom: "12px" }}>
            {localized(feature.title)}
          </Link>
          <Text fontSize="14px" lineHeight="1.6" color="var(--color-muted)" lineClamp={4}>
            {localized(feature.excerpt)}
          </Text>
        </Flex>

        {/* Center: Image */}
        <Link href={`/article/${feature.slug}`} style={{ display: "block" }}>
          <StoryImage article={feature} alt={localized(feature.title)} aspectRatio={16/9} sizes="(max-width: 992px) 100vw, 34vw" />
        </Link>

        {/* Right: up to 4 small articles */}
        {list.length > 0 && (
          <Flex direction="column" justify="space-between" borderLeft={{ lg: "1px solid var(--color-border)" }} pl={{ lg: "20px" }}>
            {list.map((item, index) => (
              <Flex key={item.id} gap="12px" align="center" borderBottom={index < list.length - 1 ? "1px solid var(--color-border)" : "none"} pb={index < list.length - 1 ? "12px" : "0"} pt={index > 0 ? "12px" : "0"}>
                <Box flex="1">
                  <Link href={`/article/${item.slug}`} className="dp-story-link" style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "var(--color-headline)", lineHeight: 1.35 }}>
                    {localized(item.title)}
                  </Link>
                  <TimeAgo date={item.publishedAt} className="dp-number" mt="4px" fontSize="10px" color="var(--color-muted)" />
                </Box>
                <Box w="80px" flexShrink={0} borderRadius="3px" overflow="hidden" bg="var(--color-surface)">
                  <StoryImage article={item} alt={localized(item.title)} aspectRatio={16/9} sizes="80px" />
                </Box>
              </Flex>
            ))}
          </Flex>
        )}

      </Grid>
    </Box>
  );
}

function AllCategoriesSection({ articles, ads }: { articles: Article[]; ads: AdSlots }) {
  const { locale } = useLocale();
  let visibleCount = 0;
  return (
    <Box as="section" mb="48px">
      <Flex direction="column" gap="48px">
        {HOME_CATEGORY_BLOCKS.map((block) => {
          const hasArticles = articles.some((a) => a.category.slug === block.categorySlug);
          if (!hasArticles) return null;
          visibleCount++;
          const showAd = visibleCount === 2;
          return (
            <React.Fragment key={block.categorySlug}>
              <CategoryBlock
                categorySlug={block.categorySlug}
                articles={articles}
                title={locale === "ne" ? block.titleNe : block.titleEn}
                eyebrow={block.eyebrow}
              />
              {showAd && <AdSlot placement="home-mid" ad={ads["home-mid"]} />}
            </React.Fragment>
          );
        })}
      </Flex>
    </Box>
  );
}

function ProvinceRail() {
  const { localized, locale } = useLocale();
  return (
    <Box as="section" id="provinces" mb="0" borderTop="1px solid var(--color-border)" borderBottom="1px solid var(--color-border)" py="16px">
      <Grid templateColumns={{ base: "1fr", md: "170px minmax(0, 1fr)", lg: "200px minmax(0, 1fr)" }} gap="16px" alignItems="center">
        <Box>
          <Text className="dp-english" mb="4px" fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.14em" color="var(--color-muted)">Browse by province</Text>
          <Heading as="h2" fontSize="21px" fontWeight="700" color="var(--color-headline)">{locale === "ne" ? "प्रदेश अनुसार समाचार" : "News by province"}</Heading>
        </Box>
        <SimpleGrid columns={{ base: 2, sm: 4, md: 7 }} gapX="24px" gapY="8px">
          {provinces.map((province, index) => (
            <Link key={province.slug} href={`/province/${province.slug}`} className={`dp-province-link ${index === 0 ? "is-active" : ""}`}>
              <Text fontSize="14px">{localized(province.name)}</Text>
              <Text className="dp-english" mt="2px" fontSize="9px" color="var(--color-faint)">{province.name.en}</Text>
            </Link>
          ))}
        </SimpleGrid>
      </Grid>
    </Box>
  );
}

function CompactTopicList({ slug, title, englishTitle, accent, articles }: { slug: string; title: string; englishTitle: string; accent: string; articles: Article[] }) {
  const { localized } = useLocale();
  const inCategory = articles.filter((a) => a.category.slug === slug).slice(0, 3);

  if (inCategory.length === 0) return null;

  return (
    <Box>
      <Flex align="center" justify="space-between" borderBottom={`2px solid ${accent}`} pb="8px" mb="0">
        <Heading as="h3" fontSize="19px" fontWeight="700" color="var(--color-headline)">{title}</Heading>
        <Text className="dp-english" fontSize="10px" fontWeight="600" color={accent}>{englishTitle}</Text>
      </Flex>
      {inCategory.map((article, index) => (
        <Box as="article" key={article.id} borderBottom={index < inCategory.length - 1 ? "1px solid var(--color-border)" : "none"} py="12px">
          <Link href={`/article/${article.slug}`} className="dp-story-link" style={{ display: "block", color: "var(--color-headline)", fontSize: "16px", fontWeight: 700, lineHeight: 1.35 }}>
            {localized(article.title)}
          </Link>
          <TimeAgo date={article.publishedAt} className="dp-number" mt="4px" fontSize="10px" color="var(--color-muted)" />
        </Box>
      ))}
    </Box>
  );
}

function ClosingDesk({ articles }: { articles: Article[] }) {
  const { locale, localized } = useLocale();
  const feature = articles.find((a) => a.category.slug === "entertainment");
  if (!feature) return null;
  return (
    <Box as="section" id="closing" aria-labelledby="closing-heading" mt={{ base: "24px", lg: "32px" }}>
      <Box mb="20px">
        <Text className="dp-english" mb="4px" fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.15em" color="var(--color-muted)">Culture, sport & technology</Text>
        <Heading as="h2" id="closing-heading" fontSize="25px" fontWeight="700" lineHeight="1" color="var(--color-headline)">{locale === "ne" ? "दिनको बाँकी डेस्क" : "The rest of the day"}</Heading>
      </Box>
      <Box className="dp-rule" mb="24px" />
      <Grid className="dp-closing-grid" templateColumns={{ base: "1fr", lg: "1.25fr 1fr 1fr" }} gap="28px">
        <Box as="article">
          <Link href={`/article/${feature.slug}`} style={{ display: "block" }}>
            <StoryImage article={feature} alt={localized(feature.title)} aspectRatio={16/9} sizes="(max-width: 992px) 100vw, 34vw" />
          </Link>
          <Text mt="12px" fontSize="11px" fontWeight="600" color={feature.category.color || BRAND}>{localized(feature.category.name)}</Text>
          <Link href={`/article/${feature.slug}`} className="dp-story-link" style={{ display: "block", marginTop: "4px", color: "var(--color-headline)", fontSize: "21px", fontWeight: 700, lineHeight: 1.28 }}>
            {localized(feature.title)}
          </Link>
          <Text mt="8px" fontSize="13px" lineHeight="1.5" color="var(--color-muted)" lineClamp={2}>{localized(feature.excerpt)}</Text>
        </Box>
        <CompactTopicList slug="sports" title={locale === "ne" ? "खेलकुद" : "Sports"} englishTitle="Sports" accent="#059669" articles={articles} />
        <CompactTopicList slug="science-tech" title={locale === "ne" ? "विज्ञान र प्रविधि" : "Science & Tech"} englishTitle="Science & Tech" accent="#0891b2" articles={articles} />
      </Grid>
    </Box>
  );
}

export default function FrontPage({
  articles,
  ads,
  blogs,
}: {
  articles: Article[];
  ads: AdSlots;
  blogs: BlogRecord[];
}) {
  return (
    <PageShell>
      <AdSlot placement="home-top" ad={ads["home-top"]} mb="28px" />
      <LeadDesk articles={articles} ads={ads} />
      <LatestSection articles={articles} ads={ads} blogs={blogs} />
      <AllCategoriesSection articles={articles} ads={ads} />
      <ProvinceRail />
      <ClosingDesk articles={articles} />
    </PageShell>
  );
}
