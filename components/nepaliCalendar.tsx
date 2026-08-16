"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/localeContext";
import {
  toNepaliDate,
  toNepaliDigits,
  getBSMonthDays,
  getFirstDayOfBSMonth,
  getBSMonthName,
  getBSDayHeaders,
} from "@/lib/nepaliDate";

const BRAND = "var(--color-brand)";

export function NepaliCalendar() {
  const { locale } = useLocale();
  const [cal, setCal] = useState<{
    year: number;
    month: number;
    day: number;
    totalDays: number;
    firstDay: number;
    adDate: string;
  } | null>(null);

  useEffect(() => {
    const now = new Date();
    const bs = toNepaliDate(now);
    const totalDays = getBSMonthDays(bs.year, bs.month);
    const firstDay = getFirstDayOfBSMonth(bs.year, bs.month);
    const adDate = now.toLocaleDateString(locale === "ne" ? "ne-NP" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCal({ year: bs.year, month: bs.month, day: bs.day, totalDays, firstDay, adDate });
  }, [locale]);

  if (!cal) return null;

  const dayHeaders = getBSDayHeaders(locale);
  const monthName = getBSMonthName(cal.month, locale);
  const cells: (number | null)[] = [];
  for (let i = 0; i < cal.firstDay; i++) cells.push(null);
  for (let d = 1; d <= cal.totalDays; d++) cells.push(d);

  return (
    <Box bg="white" border="1px solid #eee" borderRadius="4px" overflow="hidden">
      {/* Header */}
      <Box bg="#faf8f5" px="16px" py="14px" borderBottom="1px solid #eee">
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Text fontSize="24px" fontWeight="800" color="#1a1a1a" lineHeight="1.2">
              {monthName} {locale === "ne" ? toNepaliDigits(cal.day) : cal.day}
            </Text>
            <Text fontSize="12px" color="#888" mt="2px">
              {cal.adDate}
            </Text>
          </Box>
          <Text fontSize="13px" color="#999" fontWeight="600" fontFamily="var(--font-poppins), sans-serif">
            {locale === "ne" ? `${toNepaliDigits(cal.year)} वि.सं.` : `${cal.year} BS`}
          </Text>
        </Flex>
      </Box>

      {/* Calendar grid */}
      <Box px="12px" py="12px">
        {/* Day headers */}
        <SimpleGrid columns={7} gap="0" mb="4px">
          {dayHeaders.map((d, i) => (
            <Text
              key={i}
              textAlign="center"
              fontSize="11px"
              fontWeight="600"
              color={i === 6 ? BRAND : "#999"}
              py="4px"
              letterSpacing="0.5px"
            >
              {d}
            </Text>
          ))}
        </SimpleGrid>

        {/* Date cells */}
        <SimpleGrid columns={7} gap="0">
          {cells.map((d, i) => {
            if (d === null) return <Box key={`e-${i}`} h="34px" />;
            const isToday = d === cal.day;
            const colIndex = i % 7;
            const isSaturday = colIndex === 6;
            const dayStr = locale === "ne" ? toNepaliDigits(d) : String(d);

            return (
              <Flex
                key={d}
                align="center"
                justify="center"
                h="34px"
                w="34px"
                mx="auto"
                borderRadius="4px"
                bg={isToday ? BRAND : "transparent"}
                cursor="pointer"
                transition="background 0.15s"
                _hover={isToday ? {} : { bg: "#f5f5f5" }}
              >
                <Text
                  fontSize="13px"
                  fontWeight={isToday ? "700" : "500"}
                  color={isToday ? "white" : isSaturday ? BRAND : "#333"}
                >
                  {dayStr}
                </Text>
              </Flex>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Footer */}
      <Flex
        justify="space-between"
        align="center"
        px="16px"
        py="10px"
        borderTop="1px solid #f0f0f0"
        fontSize="12px"
        color="#999"
      >
        <Text fontWeight="600">
          {monthName} {locale === "ne" ? toNepaliDigits(cal.year) : cal.year}
        </Text>
      </Flex>
    </Box>
  );
}
