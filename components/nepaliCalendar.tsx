"use client";

import { Box, Flex, IconButton, SimpleGrid, Text } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import NepaliDate from "nepali-date-converter";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import { useRouter } from "next/navigation";

const BS_MONTHS_NE = ["बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कार्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत"];
const BS_MONTHS_EN = ["Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Ashoj", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];
const DAYS_NE = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];
const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const AD_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
const BRAND = "var(--color-brand)";

type CalendarVariant = "default" | "compact";

interface DayData {
  bs: { year: number; month: number; day: number };
  isHoliday: boolean;
  tithiShort: string;
  events: { titleNp: string; titleEn: string; isHoliday: boolean }[];
}
interface MonthData {
  month: number;
  days: DayData[];
}

function toNepaliNum(n: number): string {
  return String(n).split("").map((digit) => NEPALI_DIGITS[parseInt(digit, 10)] || digit).join("");
}

export function NepaliCalendar({ variant = "default" }: { variant?: CalendarVariant }) {
  const { locale } = useLocale();
  const router = useRouter();
  
  const todayNd = useMemo(() => new NepaliDate(new Date()), []);
  const [viewYear, setViewYear] = useState(todayNd.getYear());
  const [viewMonth, setViewMonth] = useState(todayNd.getMonth());
  const todayY = todayNd.getYear();
  const todayM = todayNd.getMonth();
  const todayD = todayNd.getDate();

  const [yearData, setYearData] = useState<MonthData[] | null>(null);

  useEffect(() => {
    fetch(`/years/${viewYear}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setYearData(data))
      .catch(() => setYearData(null));
  }, [viewYear]);

  const monthData = useMemo(() => {
    if (!yearData) return null;
    return yearData.find((m) => m.month === viewMonth + 1) ?? null;
  }, [yearData, viewMonth]);

  const daysInMonth = useMemo(() => {
    if (monthData) return monthData.days.length;
    for (let day = 32; day >= 28; day -= 1) {
      try {
        new NepaliDate(viewYear, viewMonth, day);
        return day;
      } catch {
        continue;
      }
    }
    return 30;
  }, [viewYear, viewMonth, monthData]);

  const firstDay = useMemo(() => {
    try {
      return new NepaliDate(viewYear, viewMonth, 1).toJsDate().getDay();
    } catch {
      return 0;
    }
  }, [viewYear, viewMonth]);

  const monthLabel = locale === "ne" ? `${BS_MONTHS_NE[viewMonth]} ${toNepaliNum(viewYear)}` : `${BS_MONTHS_EN[viewMonth]} ${viewYear}`;
  const dayHeaders = locale === "ne" ? DAYS_NE : DAYS_EN;
  
  const cells: (number | null)[] = [];
  for (let index = 0; index < firstDay; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  const remaining = cells.length % 7;
  if (remaining > 0) {
    for (let index = 0; index < 7 - remaining; index += 1) cells.push(null);
  }

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
  
  function getAdDate(y: number, m: number, d: number) {
    try {
      return new NepaliDate(y, m, d).toJsDate();
    } catch {
      return null;
    }
  }

  const calendarGrid = (
    <Box borderLeft="1px solid var(--color-border)" borderTop="1px solid var(--color-border)">
      <SimpleGrid columns={7} textAlign="center" bg="var(--color-surface)">
        {dayHeaders.map((day, idx) => {
          const isWeekend = idx === 0 || idx === 6;
          const shortDayNe = ["आइ", "सो", "मं", "बु", "बि", "शु", "शन"][idx];
          const shortDayEn = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][idx];
          return (
            <Text
              key={day}
              py="6px"
              fontSize="11px"
              fontWeight="800"
              color={isWeekend ? "#b91c1c" : "var(--color-headline)"}
              borderBottom="1px solid var(--color-border)"
              borderRight="1px solid var(--color-border)"
            >
              <Box as="span" display={{ base: "inline", sm: "none" }}>{locale === "ne" ? shortDayNe : shortDayEn}</Box>
              <Box as="span" display={{ base: "none", sm: "inline" }}>{day}</Box>
            </Text>
          );
        })}
        
        {cells.map((day, idx) => {
          if (day === null) {
            return <Box key={`empty-${idx}`} borderBottom="1px solid var(--color-border)" borderRight="1px solid var(--color-border)" minH="45px" bg="rgba(0,0,0,0.01)" />;
          }
          
          const info = monthData?.days.find((d) => d.bs.day === day);
          const isToday = viewYear === todayY && viewMonth === todayM && day === todayD;
          const isWeekend = idx % 7 === 0 || idx % 7 === 6;
          const hasHoliday = info?.isHoliday;
          const isRedDay = isWeekend || hasHoliday;
          const adDate = getAdDate(viewYear, viewMonth, day);
          const hasEvents = info && info.events.length > 0;
          
          const bgColor = isToday ? BRAND : "transparent";
          const textColor = isToday ? "white" : isRedDay ? "#b91c1c" : "var(--color-headline)";

          return (
            <Box
              key={`day-${day}`}
              borderBottom="1px solid var(--color-border)"
              borderRight="1px solid var(--color-border)"
              minH="50px"
              p="2px"
              position="relative"
              bg={bgColor}
              cursor="pointer"
              _hover={!isToday ? { bg: "var(--color-card-alt)" } : undefined}
              onClick={() => router.push(`/calendar?y=${viewYear}&m=${viewMonth}&d=${day}`)}
              transition="background 0.1s"
            >
              {/* AD Date (Top Right) */}
              {adDate && (
                <Text position="absolute" top="2px" right="2px" fontSize="8px" fontWeight="700" color={isToday ? "rgba(255,255,255,0.9)" : "var(--color-muted)"} lineHeight="1">
                  {adDate.getDate()}
                </Text>
              )}
              {/* BS Date (Center) */}
              <Flex h="full" align="center" justify="center" pt="2px">
                <Text fontSize="18px" fontWeight="600" lineHeight="1" color={textColor}>
                  {locale === "ne" ? toNepaliNum(day) : day}
                </Text>
              </Flex>
              {/* Tithi (Bottom Center) */}
              {info?.tithiShort && (
                <Text position="absolute" bottom="2px" left="0" w="full" textAlign="center" fontSize="7px" fontWeight="500" color={textColor}>
                  {info.tithiShort}
                </Text>
              )}
              {/* Mobile Event Dot */}
              {hasEvents && (
                <Box position="absolute" bottom="0px" left="50%" transform="translateX(-50%)" w="2px" h="2px" borderRadius="full" bg={isToday ? "white" : "#b91c1c"} />
              )}
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
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
          <Flex align="center" gap="4px">
            <IconButton aria-label="Previous month" size="xs" variant="ghost" onClick={prevMonth}>
              <ChevronLeft size={14} strokeWidth={1.8} color="currentColor" aria-hidden="true" />
            </IconButton>
            <Text className="dp-number" fontSize="11px" fontWeight="600" color="var(--color-headline)">{monthLabel}</Text>
            <IconButton aria-label="Next month" size="xs" variant="ghost" onClick={nextMonth}>
              <ChevronRight size={14} strokeWidth={1.8} color="currentColor" aria-hidden="true" />
            </IconButton>
          </Flex>
        </Flex>
        {calendarGrid}
        
      </Box>
    );
  }

  return (
    <Box>
      <SectionHeader title={locale === "ne" ? "नेपाली पात्रो" : "Nepali Calendar"} accent={BRAND} />
      <Box borderRadius="4px 4px 0 0" overflow="hidden" bg="var(--color-surface)">
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
        
      </Box>
    </Box>
  );
}
