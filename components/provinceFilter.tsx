"use client";

import { Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { provinces } from "@/lib/domain/province";
import { useLocale } from "@/lib/localeContext";

/**
 * Horizontal province chips. Presentation only — it takes the active slug and
 * renders links, so it can be dropped onto any page without that page needing
 * to know how provinces are stored.
 */
export function ProvinceFilter({ activeSlug }: { activeSlug?: string }) {
  const { locale, localized } = useLocale();

  return (
    <Flex
      gap="8px"
      mb="24px"
      overflowX="auto"
      pb="4px"
      css={{
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Chip href="/latest" label={locale === "ne" ? "सबै" : "All"} active={!activeSlug} />
      {provinces.map((p) => (
        <Chip
          key={p.slug}
          href={`/province/${p.slug}`}
          label={localized(p.name)}
          active={activeSlug === p.slug}
        />
      ))}
    </Flex>
  );
}

function Chip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href}>
      <Text
        flexShrink={0}
        whiteSpace="nowrap"
        fontSize="13px"
        fontWeight={active ? "700" : "500"}
        px="14px"
        py="7px"
        borderRadius="999px"
        bg={active ? "var(--color-brand)" : "white"}
        color={active ? "white" : "#555"}
        border="1px solid"
        borderColor={active ? "var(--color-brand)" : "#e2e2e2"}
        transition="all 0.15s"
        _hover={active ? {} : { borderColor: "var(--color-brand)", color: "var(--color-brand)" }}
      >
        {label}
      </Text>
    </Link>
  );
}
