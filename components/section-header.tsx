"use client";

import { Flex, Text, Box } from "@chakra-ui/react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

interface SectionHeaderProps {
  title: string;
  href?: string;
  accent?: string;
}

export function SectionHeader({ title, href, accent = "#c0392b" }: SectionHeaderProps) {
  const { t } = useLocale();

  return (
    <Box mb="20px">
      <Flex align="center" justify="space-between" pb="10px" borderBottom={`2px solid ${accent}`}>
        <Text
          fontSize="20px"
          fontWeight="800"
          color="#1a1a1a"
          lineHeight="1.2"
          textTransform="uppercase"
          letterSpacing="0.3px"
        >
          {title}
        </Text>
        {href && (
          <Link href={href}>
            <Text
              fontSize="12px"
              color={accent}
              fontWeight="600"
              _hover={{ textDecoration: "underline" }}
              transition="all 0.15s"
            >
              {t("seeAll")} →
            </Text>
          </Link>
        )}
      </Flex>
    </Box>
  );
}
