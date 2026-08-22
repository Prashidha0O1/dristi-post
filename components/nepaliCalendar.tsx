"use client";

import { Box, Flex, IconButton, SimpleGrid, Text } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import NepaliDate from "nepali-date-converter";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";

const BS_MONTHS_NE = ["बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कार्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत"];
const BS_MONTHS_EN = ["Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Ashoj", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];
const DAYS_NE = ["आ", "सो", "मं", "बु", "बि", "शु", "श"];
const DAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
const BRAND = "var(--color-brand)";

type CalendarVariant = "default" | "compact";

function toNepaliNum(n: number): string {
  return String(n).split("").map((digit) => NEPALI_DIGITS[parseInt(digit, 10)] || digit).join("");
}

function getDaysInBSMonth(year: number, month: number): number {
  for (let day = 32; day >= 28; day -= 1) {
    try {
      new NepaliDate(year, month, day);
      return day;
    } catch {
      continue;
    }
  }
  return 30;
}

function getFirstDayOfWeek(year: number, month: number): number {
  try {
    return new NepaliDate(year, month, 1).toJsDate().getDay();
  } catch {
    return 0;
  }
}

export function NepaliCalendar({ variant = "default" }: { variant?: CalendarVariant }) {
  const { locale } = useLocale();
  const todayNd = useMemo(() => new NepaliDate(new Date()), []);
  const [viewYear, setViewYear] = useState(todayNd.getYear());
  const [viewMonth, setViewMonth] = useState(todayNd.getMonth());
  const todayY = todayNd.getYear();
  const todayM = todayNd.getMonth();
  const todayD = todayNd.getDate();
  const daysInMonth = getDaysInBSMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const monthLabel = locale === "ne" ? `${BS_MONTHS_NE[viewMonth]} ${toNepaliNum(viewYear)}` : `${BS_MONTHS_EN[viewMonth]} ${viewYear}`;
  const dayHeaders = locale === "ne" ? DAYS_NE : DAYS_EN;
  const cells: (number | null)[] = [];
  for (let index = 0; index < firstDay; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((year) => year - 1);
      setViewMonth(11);
    } else {
      setViewMonth((month) => month - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((year) => year + 1);
      setViewMonth(0);
    } else {
      setViewMonth((month) => month + 1);
    }
  }

  const calendarGrid = (
    <SimpleGrid className="dp-calendar-grid" columns={7} gap="4px" px={variant === "compact" ? "0" : "4px"} pb={variant === "compact" ? "0" : "8px"} textAlign="center">
      {dayHeaders.map((day, index) => (
        <Text key={day} py="4px" fontSize="10px" fontWeight="700" color={index === 6 ? BRAND : "var(--color-muted)"}>{day}</Text>
      ))}
      {cells.map((day, index) => {
        const isToday = day !== null && viewYear === todayY && viewMonth === todayM && day === todayD;
        const isSaturday = index % 7 === 6;
        return (
          <Flex key={`${viewYear}-${viewMonth}-${index}`} justify="center" align="center" h={variant === "compact" ? "24px" : "36px"} borderRadius="full" bg={isToday ? BRAND : "transparent"} color={isToday ? "white" : isSaturday ? "#dc2626" : "var(--color-body)"} fontWeight={isToday ? "700" : "500"} fontSize="12px" _hover={day ? { bg: isToday ? BRAND : "var(--color-card-alt)" } : undefined}>
            {day !== null ? (locale === "ne" ? toNepaliNum(day) : day) : ""}
          </Flex>
        );
      })}
    </SimpleGrid>
  );

  const todayLabel = locale === "ne" ? `आज: ${BS_MONTHS_NE[todayM]} ${toNepaliNum(todayD)}, ${toNepaliNum(todayY)}` : `Today: ${BS_MONTHS_EN[todayM]} ${todayD}, ${todayY}`;

  if (variant === "compact") {
    return (
      <Box className="dp-utility-block" borderBottom="1px solid var(--color-border)" p="16px">
        <Flex mb="12px" align="center" justify="space-between">
          <Box>
            <Text fontSize="14px" fontWeight="700" color="var(--color-headline)">{locale === "ne" ? "नेपाली पात्रो" : "Nepali calendar"}</Text>
            <Text className="dp-english" fontSize="9px" textTransform="uppercase" letterSpacing="0.12em" color="var(--color-muted)">Calendar</Text>
          </Box>
          <Text className="dp-number" fontSize="10px" color="var(--color-muted)">{locale === "ne" ? "आज" : "Today"}</Text>
        </Flex>
        {calendarGrid}
        <Flex className="dp-widget-detail" mt="12px" pt="12px" borderTop="1px solid var(--color-border)" justify="center" textAlign="center">
          <Text fontSize="12px" color="var(--color-muted)">{todayLabel}</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      <SectionHeader title={locale === "ne" ? "नेपाली पात्रो" : "Nepali Calendar"} accent={BRAND} />
      <Box border="1px solid var(--color-border)" borderRadius="4px" overflow="hidden" bg="var(--color-surface)">
        <Flex justify="space-between" align="center" px="12px" py="10px" bg={BRAND} color="white">
          <IconButton aria-label="Previous month" size="sm" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.12)" }} onClick={prevMonth}>
            <ChevronLeft size={18} strokeWidth={1.8} color="currentColor" aria-hidden="true" />
          </IconButton>
          <Text fontWeight="700" fontSize="15px">{monthLabel}</Text>
          <IconButton aria-label="Next month" size="sm" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.12)" }} onClick={nextMonth}>
            <ChevronRight size={18} strokeWidth={1.8} color="currentColor" aria-hidden="true" />
          </IconButton>
        </Flex>
        {calendarGrid}
        <Flex px="12px" py="8px" bg="var(--color-card-alt)" borderTop="1px solid var(--color-border)" justify="center">
          <Text fontSize="12px" color="var(--color-subtle)">{todayLabel}</Text>
        </Flex>
      </Box>
    </Box>
  );
}
