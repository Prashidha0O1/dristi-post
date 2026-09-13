"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { Briefcase, Clock, MapPin } from "lucide-react";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import { formatSalary } from "@/lib/formatSalary";
import { employmentTypes, type JobRecord } from "@/lib/domain/job";
import { localisedTextToRecord } from "@/lib/domain/article";
import { findProvince } from "@/lib/domain/province";

const TYPE_NAME = new Map(employmentTypes.map((t) => [t.value, t.name]));

function JobCard({ job }: { job: JobRecord }) {
  const { locale, localized } = useLocale();
  const typeName = TYPE_NAME.get(job.employmentType);
  const province = job.provinceSlug ? findProvince(job.provinceSlug) : undefined;

  return (
    <Link href={`/jobs/${job.slug}`}>
      <Box
        border="1px solid var(--color-border)"
        borderRadius="6px"
        bg="var(--color-surface)"
        p="18px"
        h="full"
        transition="border-color 0.15s"
        _hover={{ borderColor: "var(--color-brand)" }}
      >
        <Flex justify="space-between" align="flex-start" gap="10px" mb="8px">
          <Text fontSize="12px" fontWeight="700" color="var(--color-brand)" lineClamp={1}>
            {job.company}
          </Text>
          {job.isFeatured && (
            <Text
              flexShrink={0}
              fontSize="10px"
              fontWeight="700"
              px="8px"
              py="2px"
              borderRadius="999px"
              bg="var(--color-tag-bg)"
              color="var(--color-tag-text)"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              {locale === "ne" ? "विशेष" : "Featured"}
            </Text>
          )}
        </Flex>

        <Text fontSize="18px" fontWeight="700" color="var(--color-headline)" lineHeight="1.3" lineClamp={2} mb="12px">
          {localized(localisedTextToRecord(job.title))}
        </Text>

        <Flex direction="column" gap="6px" fontSize="13px" color="var(--color-muted)">
          <Flex align="center" gap="6px">
            <MapPin size={14} strokeWidth={1.8} aria-hidden="true" />
            <Text lineClamp={1}>
              {job.location}
              {province ? ` · ${localized(province.name)}` : ""}
            </Text>
          </Flex>
          <Flex align="center" gap="6px">
            <Briefcase size={14} strokeWidth={1.8} aria-hidden="true" />
            <Text>{typeName ? localized(typeName) : job.employmentType}</Text>
          </Flex>
          {job.deadline && (
            <Flex align="center" gap="6px">
              <Clock size={14} strokeWidth={1.8} aria-hidden="true" />
              <Text className="dp-number">
                {locale === "ne" ? "अन्तिम मिति: " : "Deadline: "}{job.deadline}
              </Text>
            </Flex>
          )}
        </Flex>

        {job.salary && (
          <Text mt="12px" pt="12px" borderTop="1px solid var(--color-border)" fontSize="14px" fontWeight="600" color="var(--color-headline)">
            {formatSalary(job.salary, locale)}
          </Text>
        )}
      </Box>
    </Link>
  );
}

export default function JobsPageClient({ jobs }: { jobs: JobRecord[] }) {
  const { locale } = useLocale();

  return (
    <PageShell>
      <SectionHeader
        title={locale === "ne" ? "रोजगार" : "Jobs"}
        accent="var(--color-brand)"
      />

      <Text fontSize="15px" color="var(--color-subtle)" mb="24px" lineHeight="1.7">
        {locale === "ne"
          ? "नेपालभरका पछिल्ला रोजगारीका अवसरहरू"
          : "The latest job openings from across Nepal"}
      </Text>

      {jobs.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="18px">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </SimpleGrid>
      ) : (
        <Box py="48px" textAlign="center">
          <Text fontSize="16px" color="var(--color-muted)">
            {locale === "ne" ? "हाल कुनै रोजगारी सूचना छैन।" : "No job listings at the moment."}
          </Text>
        </Box>
      )}
    </PageShell>
  );
}
