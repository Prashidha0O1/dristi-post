"use client";

import { Box, Flex, Text, SimpleGrid, chakra } from "@chakra-ui/react";
import Link from "next/link";
import { Briefcase, Clock, MapPin, Wallet } from "lucide-react";
import { PageShell } from "@/components/pageShell";
import { useLocale } from "@/lib/localeContext";
import { employmentTypes, type JobRecord } from "@/lib/domain/job";
import { localisedTextToRecord } from "@/lib/domain/article";
import { findProvince } from "@/lib/domain/province";

const TYPE_NAME = new Map(employmentTypes.map((t) => [t.value, t.name]));

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Flex gap="10px" align="flex-start">
      <Box color="var(--color-muted)" mt="2px" flexShrink={0}>{icon}</Box>
      <Box minW="0">
        <Text fontSize="11px" fontWeight="700" color="var(--color-muted)" textTransform="uppercase" letterSpacing="0.06em">
          {label}
        </Text>
        <Text fontSize="15px" color="var(--color-body)" fontWeight="500">{value}</Text>
      </Box>
    </Flex>
  );
}

export default function JobDetailClient({ job }: { job: JobRecord }) {
  const { locale, localized } = useLocale();

  const typeName = TYPE_NAME.get(job.employmentType);
  const province = job.provinceSlug ? findProvince(job.provinceSlug) : undefined;

  // An editor may enter either a URL or a bare email; render the right scheme.
  const applyHref = /^https?:\/\//i.test(job.applyUrl) ? job.applyUrl : `mailto:${job.applyUrl}`;

  const paragraphs = localized(localisedTextToRecord(job.description))
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <PageShell>
      <Flex gap="6px" align="center" mb="20px" fontSize="13px" color="var(--color-muted)">
        <Link href="/">
          <Text _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
            {locale === "ne" ? "गृहपृष्ठ" : "Home"}
          </Text>
        </Link>
        <Text>›</Text>
        <Link href="/jobs">
          <Text _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
            {locale === "ne" ? "रोजगार" : "Jobs"}
          </Text>
        </Link>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="36px">
        <Box gridColumn={{ lg: "span 2" }}>
          <Text fontSize="14px" fontWeight="700" color="var(--color-brand)" mb="6px">
            {job.company}
          </Text>
          <Text
            as="h1"
            fontSize={{ base: "26px", md: "34px" }}
            fontWeight="800"
            lineHeight="1.25"
            color="var(--color-headline)"
            mb="20px"
          >
            {localized(localisedTextToRecord(job.title))}
          </Text>

          <SimpleGrid
            columns={{ base: 1, sm: 2 }}
            gap="16px"
            mb="28px"
            py="20px"
            borderTop="1px solid var(--color-border)"
            borderBottom="1px solid var(--color-border)"
          >
            <Detail
              icon={<MapPin size={16} strokeWidth={1.8} aria-hidden="true" />}
              label={locale === "ne" ? "स्थान" : "Location"}
              value={job.location + (province ? ` · ${localized(province.name)}` : "")}
            />
            <Detail
              icon={<Briefcase size={16} strokeWidth={1.8} aria-hidden="true" />}
              label={locale === "ne" ? "प्रकार" : "Type"}
              value={typeName ? localized(typeName) : job.employmentType}
            />
            {job.salary && (
              <Detail
                icon={<Wallet size={16} strokeWidth={1.8} aria-hidden="true" />}
                label={locale === "ne" ? "तलब" : "Salary"}
                value={job.salary}
              />
            )}
            {job.deadline && (
              <Detail
                icon={<Clock size={16} strokeWidth={1.8} aria-hidden="true" />}
                label={locale === "ne" ? "अन्तिम मिति" : "Deadline"}
                value={job.deadline}
              />
            )}
          </SimpleGrid>

          <Box mb="36px" fontSize="17px" lineHeight="1.9" color="var(--color-body)">
            {paragraphs.map((paragraph, i) => (
              <Text key={i} mb="16px">{paragraph}</Text>
            ))}
          </Box>
        </Box>

        <Box>
          <Box
            position={{ lg: "sticky" }}
            top={{ lg: "96px" }}
            border="1px solid var(--color-border)"
            borderRadius="8px"
            bg="var(--color-surface)"
            p="20px"
          >
            <Text fontSize="15px" fontWeight="700" color="var(--color-headline)" mb="6px">
              {locale === "ne" ? "आवेदन दिनुहोस्" : "Apply for this role"}
            </Text>
            <Text fontSize="13px" color="var(--color-muted)" mb="16px" lineHeight="1.6">
              {locale === "ne"
                ? "आवेदन दृष्टि पोस्ट मार्फत होइन, सीधै रोजगारदातासँग जान्छ।"
                : "Applications go directly to the employer, not through Dristi Post."}
            </Text>
            <chakra.a
              href={applyHref}
              target="_blank"
              rel="noopener noreferrer nofollow"
              display="block"
              textAlign="center"
              px="20px"
              py="12px"
              bg="var(--color-brand)"
              color="white"
              borderRadius="4px"
              fontSize="15px"
              fontWeight="700"
              _hover={{ opacity: 0.9 }}
              transition="opacity 0.15s"
            >
              {locale === "ne" ? "आवेदन दिनुहोस्" : "Apply now"}
            </chakra.a>
          </Box>
        </Box>
      </SimpleGrid>
    </PageShell>
  );
}
