"use client";

import { Flex, Text, Box } from "@chakra-ui/react";
import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  href?: string;
  accent?: string;
}

export function SectionHeader({ title, href, accent = "#2260bf" }: SectionHeaderProps) {
  return (
    <Flex
      align="center"
      gap="10px"
      mb="18px"
      pb="12px"
      borderBottom="3px solid #2260bf"
    >
      <Text
        fontSize={{ base: "20px", md: "24px" }}
        fontWeight="900"
        color={accent}
        textTransform="uppercase"
        letterSpacing="0.5px"
        lineHeight="1.2"
      >
        {title}
      </Text>
      {href && (
        <Link href={href}>
          <Box
            w="28px"
            h="28px"
            borderRadius="50%"
            border={`2px solid ${accent}`}
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition="all 0.15s"
            _hover={{ bg: accent, "& svg": { color: "white" } }}
            cursor="pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Box>
        </Link>
      )}
    </Flex>
  );
}
