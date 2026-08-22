"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import NepaliDate from "nepali-date-converter";

const BS_MONTHS_NE = [
  "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत",
];
const BS_MONTHS_EN = [
  "Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Ashoj",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];
const DAYS_NE = ["आ", "सो", "मं", "बु", "बि", "शु", "श"];
const DAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

const BRAND = "var(--color-brand)";

function toNepaliNum(n: number): string {
  return String(n).split("").map((d) => NEPALI_DIGITS[parseInt(d)] || d).join("");
}

function getDaysInBSMonth(year: number, month: number): number {
  for (let d = 32; d >= 28; d--) {
    try {
      new NepaliDate(year, month, d);
      return d;
    } catch {
      continue;
    }
  }
  return 30;
}

function getFirstDayOfWeek(year: number, month: number): number {
  try {
    const nd = new NepaliDate(year, month, 1);
    return nd.toJsDate().getDay();
  } catch {
    return 0;
  }
}

export function NepaliCalendar() {
  const { locale } = useLocale();
  const todayNd = useMemo(() => new NepaliDate(new Date()), []);
  const [viewYear, setViewYear] = useState(todayNd.getYear());
  const [viewMonth, setViewMonth] = useState(todayNd.getMonth());

  const todayY = todayNd.getYear();
  const todayM = todayNd.getMonth();
  const todayD = todayNd.getDate();

  const daysInMonth = getDaysInBSMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const monthLabel = locale === "ne"
    ? `${BS_MONTHS_NE[viewMonth]} ${toNepaliNum(viewYear)}`
    : `${BS_MONTHS_EN[viewMonth]} ${viewYear}`;

  const dayHeaders = locale === "ne" ? DAYS_NE : DAYS_EN;

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <Box>
      <SectionHeader
        title={locale === "ne" ? "नेपाली पात्रो" : "Nepali Calendar"}
        accent={BRAND}
      />
      <Box border="1px solid #eee" borderRadius="4px" overflow="hidden" bg="white">
        <Flex justify="space-between" align="center" px="12px" py="10px" bg={BRAND} color="white">
          <Box as="button" onClick={prevMonth} bg="transparent" border="none" color="white" cursor="pointer" fontSize="18px" fontWeight="700" px="8px">
            ‹
          </Box>
          <Text fontWeight="700" fontSize="15px">{monthLabel}</Text>
          <Box as="button" onClick={nextMonth} bg="transparent" border="none" color="white" cursor="pointer" fontSize="18px" fontWeight="700" px="8px">
            ›
          </Box>
        </Flex>

        <SimpleGrid columns={7} px="4px" pt="8px" pb="4px">
          {dayHeaders.map((d, i) => (
            <Text key={d} textAlign="center" fontSize="11px" fontWeight="700" color={i === 6 ? BRAND : "#999"} py="4px">
              {d}
            </Text>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={7} px="4px" pb="8px">
          {cells.map((day, i) => {
            const isToday = day !== null && viewYear === todayY && viewMonth === todayM && day === todayD;
            const isSaturday = i % 7 === 6;
            return (
              <Flex
                key={i}
                justify="center"
                align="center"
                h="36px"
                borderRadius="4px"
                bg={isToday ? BRAND : "transparent"}
                color={isToday ? "white" : isSaturday ? "#dc2626" : "#333"}
                fontWeight={isToday ? "700" : "500"}
                fontSize="13px"
                transition="background 0.1s"
                _hover={day ? { bg: isToday ? BRAND : "#f0f0f0" } : {}}
              >
                {day !== null ? (locale === "ne" ? toNepaliNum(day) : day) : ""}
              </Flex>
            );
          })}
        </SimpleGrid>

        <Flex px="12px" py="8px" bg="#f9f9f9" borderTop="1px solid #eee" justify="center">
          <Text fontSize="12px" color="#666">
            {locale === "ne"
              ? `आज: ${BS_MONTHS_NE[todayM]} ${toNepaliNum(todayD)}, ${toNepaliNum(todayY)}`
              : `Today: ${BS_MONTHS_EN[todayM]} ${todayD}, ${todayY}`}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
