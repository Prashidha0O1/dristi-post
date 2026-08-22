"use client";

import { Box, Flex, Grid, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { BarChart3, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/lib/localeContext";
import { provinces } from "@/lib/domain/province";
import type { Article, Locale } from "@/lib/types";
import {
  getArticlesByCategory,
  getFeaturedArticles,
  getLatestArticles,
  getTrendingArticles,
} from "@/lib/mockData";
import { NepaliCalendar } from "@/components/nepaliCalendar";
import { ForexWidget } from "@/components/forexWidget";
import { GoldSilverWidget } from "@/components/goldSilverWidget";
import { PageShell } from "@/components/pageShell";
import { TimeAgo } from "@/components/timeAgo";

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
          <Text className="dp-english" mb="4px" fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.15em" color="var(--color-muted)">
            {eyebrow}
          </Text>
          <Heading as={headingLevel} fontSize="25px" fontWeight="700" lineHeight="1" color="var(--color-headline)">
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

function AdSlot({ variant = "quiet" }: { variant?: "quiet" | "between" }) {
  return (
    <Flex className="dp-ad-slot" mb={variant === "between" ? "40px" : "28px"} align="center" justify="center" color="var(--color-faint)" fontSize="10px" textTransform="uppercase" letterSpacing="0.22em">
      विज्ञापन / Advertisement
    </Flex>
  );
}

function StoryImage({
  article,
  alt,
  height,
  sizes,
  priority = false,
  className = "",
}: {
  article: Article;
  alt: string;
  height: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Box className={`dp-image-wrap ${className}`} position="relative" h={height} overflow="hidden" borderRadius="3px" bg="var(--color-card-alt)">
      <Image src={article.image} alt={alt} fill priority={priority} sizes={sizes} className="dp-image" style={{ objectFit: "cover" }} />
    </Box>
  );
}

function LeadDesk() {
  const { locale, localized } = useLocale();
  const featured = getFeaturedArticles();
  const lead = featured[0];
  const supporting = featured.slice(1, 3);

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
      <Grid className="dp-hero-grid" templateColumns={{ base: "1fr", lg: "minmax(0, 1.65fr) minmax(360px, 1fr)" }} gap="28px">
        <Box as="article">
          <Link href={`/article/${lead.slug}`} className="dp-image-wrap" style={{ display: "block" }}>
            <StoryImage article={lead} alt={localized(lead.title)} height="368px" sizes="(max-width: 992px) 100vw, 66vw" priority />
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
              <Text color="var(--color-border)" aria-hidden="true">·</Text>
              <Text>{locale === "ne" ? "पढ्न ४ मिनेट" : "4 min read"}</Text>
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
                <StoryImage article={article} alt={localized(article.title)} height="96px" sizes="138px" className="dp-support-thumb" />
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
          <Link href="/latest" className="dp-story-link" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: "2px solid var(--color-nav)", color: "var(--color-nav)", fontSize: "13px", fontWeight: 600 }}>
            <span>{locale === "ne" ? "समाचारका थप शीर्षक" : "More headlines"}</span>
            <span aria-hidden="true" style={{ fontSize: "16px" }}>↗</span>
          </Link>
        </Box>
      </Grid>
    </Box>
  );
}

function LatestLedgerRow({ article }: { article: Article }) {
  const { localized } = useLocale();
  return (
    <Box as="li">
      <Grid className="dp-ledger-row" templateColumns={{ base: "70px minmax(0, 1fr)", lg: "76px 110px minmax(0, 1fr) 76px" }} gap="12px" alignItems="center" borderBottom="1px solid var(--color-border)" py="12px">
        <TimeAgo date={article.publishedAt} className="dp-number" fontSize="11px" color="var(--color-muted)" />
        <Text className="dp-ledger-subject" fontSize="12px" fontWeight="600" color={article.category.color || BRAND}>
          {localized(article.category.name)}
        </Text>
        <Link href={`/article/${article.slug}`} className="dp-story-link" style={{ minWidth: 0, color: "var(--color-headline)", fontSize: "17px", fontWeight: 700, lineHeight: 1.28 }}>
          {localized(article.title)}
        </Link>
        <Box className="dp-ledger-thumb" position="relative" w="68px" h="48px" overflow="hidden" borderRadius="3px" bg="var(--color-card-alt)">
          <Image src={article.image} alt={localized(article.title)} fill sizes="68px" style={{ objectFit: "cover" }} />
        </Box>
      </Grid>
    </Box>
  );
}

function UtilityRail() {
  const { locale } = useLocale();
  return (
    <Box className="dp-utility-rail" border="1px solid var(--color-border)" bg="var(--color-surface)">
      <Flex className="dp-utility-title" align="center" justify="space-between" bg="var(--color-nav)" color="white" px="16px" py="12px">
        <Box>
          <Text className="dp-english" fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.14em" color="rgba(255,255,255,0.6)">
            Nepal at a glance
          </Text>
          <Text fontSize="20px" fontWeight="700" lineHeight="1.1">
            {locale === "ne" ? "नेपालको अवस्था" : "Nepal at a glance"}
          </Text>
        </Box>
        <Info size={18} strokeWidth={1.8} color="rgba(255,255,255,0.65)" aria-hidden="true" />
      </Flex>
      <NepaliCalendar variant="compact" />
      <GoldSilverWidget variant="compact" />
      <ForexWidget variant="compact" />
    </Box>
  );
}

function LatestSection() {
  const { locale } = useLocale();
  const latest = getLatestArticles().slice(0, 5);
  return (
    <Box as="section" id="latest" aria-labelledby="latest-heading" mb="44px">
      <FrontPageSectionHeader eyebrow="Latest updates" title={locale === "ne" ? "ताजा अपडेट" : "Latest updates"} href="/latest" actionLabel={locale === "ne" ? "सबै हेर्नुहोस्" : "View all"} />
      <Grid className="dp-ledger-grid" templateColumns={{ base: "1fr", lg: "minmax(0, 1.95fr) minmax(310px, 1fr)" }} gap="32px">
        <Box>
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
        </Box>
        <UtilityRail />
      </Grid>
    </Box>
  );
}

function FeatureStory({ article }: { article: Article }) {
  const { localized } = useLocale();
  return (
    <Box as="article">
      <Link href={`/article/${article.slug}`} style={{ display: "block" }}>
        <StoryImage article={article} alt={localized(article.title)} height="228px" sizes="(max-width: 992px) 100vw, 42vw" />
      </Link>
      <Text mt="12px" fontSize="11px" fontWeight="600" color={article.category.color || BRAND}>{localized(article.category.name)}</Text>
      <Link href={`/article/${article.slug}`} className="dp-story-link" style={{ display: "block", marginTop: "4px", color: "var(--color-headline)", fontSize: "22px", fontWeight: 700, lineHeight: 1.28 }}>
        {localized(article.title)}
      </Link>
      <Text mt="8px" fontSize="14px" lineHeight="1.5" color="var(--color-muted)" lineClamp={2}>
        {localized(article.excerpt)}
      </Text>
    </Box>
  );
}

function BusinessDigest() {
  const { localized } = useLocale();
  const digest = getLatestArticles().filter((article) => ["business", "education"].includes(article.category.slug)).slice(0, 3);
  return (
    <Box className="dp-business-digest">
      <Text className="dp-english" mb="8px" fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="0.14em" color="var(--color-muted)">
        Business digest
      </Text>
      {digest.map((article) => (
        <Box as="article" key={article.id} borderTop="1px solid var(--color-border)" py="12px">
          <Text mb="4px" fontSize="11px" fontWeight="600" color={article.category.color || BRAND}>{localized(article.category.name)}</Text>
          <Link href={`/article/${article.slug}`} className="dp-story-link" style={{ display: "block", color: "var(--color-headline)", fontSize: "16px", fontWeight: 700, lineHeight: 1.35 }}>
            {localized(article.title)}
          </Link>
          <TimeAgo date={article.publishedAt} className="dp-number" mt="4px" fontSize="10px" color="var(--color-muted)" />
        </Box>
      ))}
    </Box>
  );
}

function MostReadList() {
  const { localized, locale } = useLocale();
  const stories = getTrendingArticles().slice(0, 4);
  return (
    <Box as="aside" className="dp-most-read" aria-label={locale === "ne" ? "धेरै पढिएका समाचार" : "Most read stories"}>
      <Flex align="flex-end" justify="space-between" borderBottom="2px solid var(--color-brand)" pb="8px" mb="4px">
        <Box>
          <Text className="dp-english" mb="4px" fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.14em" color="var(--color-muted)">Most read</Text>
          <Heading as="h3" fontSize="21px" fontWeight="700" color="var(--color-headline)">{locale === "ne" ? "धेरै पढिएका" : "Most read"}</Heading>
        </Box>
        <BarChart3 size={18} strokeWidth={1.8} color={BRAND} aria-hidden="true" />
      </Flex>
      <Box as="ol" listStyleType="none">
        {stories.map((article, index) => (
          <Flex as="li" key={article.id} gap="12px" borderBottom={index < stories.length - 1 ? "1px solid var(--color-border)" : "none"} py="12px" align="flex-start">
            <Text className="dp-number" w="36px" flexShrink={0} fontSize="27px" fontWeight="700" lineHeight="1" color="var(--color-border)">{String(index + 1).padStart(2, "0")}</Text>
            <Link href={`/article/${article.slug}`} className="dp-story-link" style={{ color: "var(--color-headline)", fontSize: "15px", fontWeight: 700, lineHeight: 1.35 }}>
              {localized(article.title)}
            </Link>
          </Flex>
        ))}
      </Box>
      <Text className="dp-english" mt="4px" fontSize="10px" color="var(--color-faint)">Based on the last 24 hours</Text>
    </Box>
  );
}

function PublicAffairsSection() {
  const { locale } = useLocale();
  const politics = getArticlesByCategory("politics");
  const feature = politics[1] || politics[0];
  if (!feature) return null;

  return (
    <Box as="section" id="public-affairs" aria-labelledby="public-affairs-heading" mb="48px">
      <FrontPageSectionHeader eyebrow="Public affairs & economy" title={locale === "ne" ? "सार्वजनिक जीवन र अर्थतन्त्र" : "Public affairs & economy"} href="/category/politics" actionLabel={locale === "ne" ? "सबै हेर्नुहोस्" : "See all"} />
      <Grid className="dp-public-grid" templateColumns={{ base: "1fr", lg: "minmax(0, 1.95fr) minmax(300px, 1fr)" }} gap="32px">
        <Grid templateColumns={{ base: "1fr", md: "minmax(0, 1.25fr) minmax(250px, 0.85fr)" }} gap="28px">
          <FeatureStory article={feature} />
          <BusinessDigest />
        </Grid>
        <MostReadList />
      </Grid>
    </Box>
  );
}

function ProvinceRail() {
  const { localized, locale } = useLocale();
  return (
    <Box as="section" id="provinces" mb="48px" borderTop="1px solid var(--color-border)" borderBottom="1px solid var(--color-border)" py="20px">
      <Grid templateColumns={{ base: "1fr", md: "248px minmax(0, 1fr)" }} gap="16px" alignItems="center">
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

const CLOSING_FALLBACKS: Record<"sports" | "technology", Array<{ title: Record<Locale, string>; time: Record<Locale, string> }>> = {
  sports: [
    { title: { ne: "ऐतिहासिक जितपछि टोलीको अर्को लक्ष्य", en: "The team's next target after a historic win" }, time: { ne: "२ घण्टा अगाडि", en: "2h ago" } },
    { title: { ne: "स्थानीय मैदानमा नयाँ प्रतिभाको खोजी", en: "Finding new talent on local grounds" }, time: { ne: "आज", en: "Today" } },
    { title: { ne: "महिला खेलाडीका लागि थप पूर्वाधार आवश्यक", en: "More infrastructure needed for women athletes" }, time: { ne: "हिजो", en: "Yesterday" } },
  ],
  technology: [
    { title: { ne: "काठमाडौंको स्टार्टअप इकोसिस्टममा नयाँ लगानी", en: "New investment in Kathmandu's startup ecosystem" }, time: { ne: "३ घण्टा अगाडि", en: "3h ago" } },
    { title: { ne: "डिजिटल सेवामा नागरिकको पहुँच बढाउँदै स्थानीय तह", en: "Local governments expand access to digital services" }, time: { ne: "आज", en: "Today" } },
    { title: { ne: "साइबर सुरक्षाबारे विद्यार्थीलाई सचेतना", en: "Students receive new cyber-safety awareness training" }, time: { ne: "हिजो", en: "Yesterday" } },
  ],
};

function CompactTopicList({ slug, title, englishTitle, accent }: { slug: "sports" | "technology"; title: string; englishTitle: string; accent: string }) {
  const { localized } = useLocale();
  const articles = getArticlesByCategory(slug);
  const fallbacks = CLOSING_FALLBACKS[slug];
  return (
    <Box>
      <Flex align="center" justify="space-between" borderBottom={`2px solid ${accent}`} pb="8px" mb="0">
        <Heading as="h3" fontSize="19px" fontWeight="700" color="var(--color-headline)">{title}</Heading>
        <Text className="dp-english" fontSize="10px" fontWeight="600" color={accent}>{englishTitle}</Text>
      </Flex>
      {fallbacks.map((fallback, index) => {
        const article = articles[index];
        const href = article ? `/article/${article.slug}` : `/category/${slug}`;
        return (
          <Box as="article" key={`${slug}-${index}`} borderBottom={index < fallbacks.length - 1 ? "1px solid var(--color-border)" : "none"} py="12px">
            <Link href={href} className="dp-story-link" style={{ display: "block", color: "var(--color-headline)", fontSize: "16px", fontWeight: 700, lineHeight: 1.35 }}>
              {article ? localized(article.title) : localized(fallback.title)}
            </Link>
            {article ? <TimeAgo date={article.publishedAt} className="dp-number" mt="4px" fontSize="10px" color="var(--color-muted)" /> : <Text className="dp-number" mt="4px" fontSize="10px" color="var(--color-muted)">{localized(fallback.time)}</Text>}
          </Box>
        );
      })}
    </Box>
  );
}

function ClosingDesk() {
  const { locale, localized } = useLocale();
  const feature = getArticlesByCategory("entertainment")[0];
  if (!feature) return null;
  return (
    <Box as="section" id="closing" aria-labelledby="closing-heading">
      <Box mb="20px">
        <Text className="dp-english" mb="4px" fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.15em" color="var(--color-muted)">Culture, sport & technology</Text>
        <Heading as="h2" id="closing-heading" fontSize="25px" fontWeight="700" lineHeight="1" color="var(--color-headline)">{locale === "ne" ? "दिनको बाँकी डेस्क" : "The rest of the day"}</Heading>
      </Box>
      <Box className="dp-rule" mb="24px" />
      <Grid className="dp-closing-grid" templateColumns={{ base: "1fr", lg: "1.25fr 1fr 1fr" }} gap="28px">
        <Box as="article">
          <Link href={`/article/${feature.slug}`} style={{ display: "block" }}>
            <StoryImage article={feature} alt={localized(feature.title)} height="178px" sizes="(max-width: 992px) 100vw, 34vw" />
          </Link>
          <Text mt="12px" fontSize="11px" fontWeight="600" color={feature.category.color || BRAND}>{localized(feature.category.name)}</Text>
          <Link href={`/article/${feature.slug}`} className="dp-story-link" style={{ display: "block", marginTop: "4px", color: "var(--color-headline)", fontSize: "21px", fontWeight: 700, lineHeight: 1.28 }}>
            {localized(feature.title)}
          </Link>
          <Text mt="8px" fontSize="13px" lineHeight="1.5" color="var(--color-muted)" lineClamp={2}>{localized(feature.excerpt)}</Text>
        </Box>
        <CompactTopicList slug="sports" title={locale === "ne" ? "खेलकुद" : "Sports"} englishTitle="Sports" accent="#059669" />
        <CompactTopicList slug="technology" title={locale === "ne" ? "प्रविधि" : "Technology"} englishTitle="Technology" accent="#0891b2" />
      </Grid>
    </Box>
  );
}

export default function FrontPage() {
  return (
    <PageShell>
      <AdSlot />
      <LeadDesk />
      <LatestSection />
      <AdSlot variant="between" />
      <PublicAffairsSection />
      <ProvinceRail />
      <ClosingDesk />
    </PageShell>
  );
}
