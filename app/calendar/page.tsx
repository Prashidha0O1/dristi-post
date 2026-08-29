"use client";

import { Box, Flex, SimpleGrid, Text, IconButton } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import NepaliDate from "nepali-date-converter";
import { PageShell } from "@/components/pageShell";
import { useLocale } from "@/lib/localeContext";

const BS_MONTHS_NE = ["बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कार्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत"];
const BS_MONTHS_EN = ["Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Ashoj", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];
const DAYS_NE = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];
const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
const AD_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BRAND = "var(--color-brand)";

interface DayData {
  bs: { year: number; month: number; day: number };
  weekdayNp: string;
  weekdayEn: string;
  isHoliday: boolean;
  tithiShort: string;
  tithi: string;
  yoga: string;
  karana: string;
  nakshatra: string;
  sunriseNp: string;
  sunsetNp: string;
  events: { titleNp: string; titleEn: string; isHoliday: boolean }[];
}

interface MonthData {
  month: number;
  days: DayData[];
}

function toNepaliNum(n: number): string {
  return String(n).split("").map((d) => NEPALI_DIGITS[parseInt(d, 10)] || d).join("");
}

function getAdDate(bsYear: number, bsMonth: number, bsDay: number): Date | null {
  try {
    return new NepaliDate(bsYear, bsMonth, bsDay).toJsDate();
  } catch {
    return null;
  }
}

export default function CalendarPage() {
  const { locale } = useLocale();
  const todayNd = useMemo(() => new NepaliDate(new Date()), []);
  const todayY = todayNd.getYear();
  const todayM = todayNd.getMonth();
  const todayD = todayNd.getDate();

  const [viewYear, setViewYear] = useState(todayY);
  const [viewMonth, setViewMonth] = useState(todayM);
  const [yearData, setYearData] = useState<MonthData[] | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

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

  const firstDayOfWeek = useMemo(() => {
    try {
      return new NepaliDate(viewYear, viewMonth, 1).toJsDate().getDay();
    } catch {
      return 0;
    }
  }, [viewYear, viewMonth]);

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

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDay(null);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDay(null);
  }, [viewMonth]);

  
  const goToToday = useCallback(() => {
    setViewYear(todayY);
    setViewMonth(todayM);
    setSelectedDay(null);
  }, [todayY, todayM]);

  const adSubtitle = useMemo(() => {
    try {
      const d1 = new NepaliDate(viewYear, viewMonth, 1).toJsDate();
      const d2 = new NepaliDate(viewYear, viewMonth, daysInMonth).toJsDate();
      const m1 = AD_MONTHS[d1.getMonth()];
      const m2 = AD_MONTHS[d2.getMonth()];
      const y2 = d2.getFullYear();
      if (m1 === m2) return `${BS_MONTHS_EN[viewMonth]} · ${m1} ${y2}`;
      return `${BS_MONTHS_EN[viewMonth]} · ${m1}/${m2} ${y2}`;
    } catch {
      return "";
    }
  }, [viewYear, viewMonth, daysInMonth]);

function getDayInfo(day: number): DayData | undefined {
    return monthData?.days.find((d) => d.bs.day === day);
  }

  const dayHeaders = locale === "ne" ? DAYS_NE : DAYS_EN;
  const monthLabel = locale === "ne"
    ? `${BS_MONTHS_NE[viewMonth]} ${toNepaliNum(viewYear)}`
    : `${BS_MONTHS_EN[viewMonth]} ${viewYear}`;

  return (
    <PageShell>
      <Box maxW="1200px" mx="auto" px={{ base: "0px", md: "16px" }}>
        {/* Header Area */}
        <Flex justify="space-between" align="center" mb="24px" flexWrap="wrap" gap="16px" px={{ base: "16px", md: "0" }}>
          <Flex align="baseline" gap="12px" flexWrap="wrap">
            <Text fontSize={{ base: "28px", md: "36px" }} fontWeight="800" color="var(--color-headline)" lineHeight="1">
              {locale === "ne" ? `${BS_MONTHS_NE[viewMonth]} ${toNepaliNum(viewYear)}` : `${BS_MONTHS_EN[viewMonth]} ${viewYear}`}
            </Text>
            <Text fontSize="16px" fontWeight="500" color="var(--color-muted)">
              {adSubtitle}
            </Text>
          </Flex>

          <Flex align="center" gap="12px">
            <Box
              as="button"
              onClick={goToToday}
              bg="#b91c1c"
              color="white"
              px="20px"
              py="6px"
              borderRadius="6px"
              fontSize="15px"
              fontWeight="700"
              _hover={{ bg: "#991b1b" }}
              transition="background 0.2s"
            >
              {locale === "ne" ? "आज" : "Today"}
            </Box>
            <Flex gap="8px">
              <IconButton aria-label="Previous month" size="sm" borderRadius="full" variant="outline" borderColor="var(--color-border)" color="var(--color-headline)" _hover={{ bg: "var(--color-card-alt)" }} onClick={prevMonth}>
                <ChevronLeft size={20} strokeWidth={2.5} />
              </IconButton>
              <IconButton aria-label="Next month" size="sm" borderRadius="full" variant="outline" borderColor="var(--color-border)" color="var(--color-headline)" _hover={{ bg: "var(--color-card-alt)" }} onClick={nextMonth}>
                <ChevronRight size={20} strokeWidth={2.5} />
              </IconButton>
            </Flex>
          </Flex>
        </Flex>

        <Box border="1px solid var(--color-border)" borderRadius={{ base: "0", md: "8px" }} overflow="hidden" bg="var(--color-surface)">
          {/* Weekday Headers */}
          <SimpleGrid columns={7} borderBottom="1px solid var(--color-border)">
            {dayHeaders.map((day, idx) => {
              const isWeekend = idx === 0 || idx === 6;
              return (
                <Text
                  key={day}
                  py="12px"
                  textAlign="center"
                  fontSize={{ base: "13px", md: "16px" }}
                  fontWeight="800"
                  color={isWeekend ? "#b91c1c" : "var(--color-headline)"}
                  borderRight={idx < 6 ? "1px solid var(--color-border)" : "none"}
                >
                  {day}
                </Text>
              );
            })}
          </SimpleGrid>

          {/* Calendar Grid */}
          <SimpleGrid columns={7}>
            {cells.map((day, idx) => {
              if (day === null) {
                return <Box key={`empty-${idx}`} borderBottom="1px solid var(--color-border)" borderRight={idx % 7 < 6 ? "1px solid var(--color-border)" : "none"} minH={{ base: "100px", md: "140px" }} bg="rgba(0,0,0,0.01)" />;
              }
              const info = getDayInfo(day);
              const isToday = viewYear === todayY && viewMonth === todayM && day === todayD;
              const isWeekend = idx % 7 === 0 || idx % 7 === 6;
              const hasHoliday = info?.isHoliday;
              const isRedDay = isWeekend || hasHoliday;
              const adDate = getAdDate(viewYear, viewMonth, day);
              const hasEvents = info && info.events.length > 0;
              
              const bgColor = isToday ? "#15803d" : "transparent";
              const textColor = isToday ? "white" : isRedDay ? "#b91c1c" : "var(--color-headline)";

              return (
                <Box
                  key={`day-${day}`}
                  borderBottom="1px solid var(--color-border)"
                  borderRight={idx % 7 < 6 ? "1px solid var(--color-border)" : "none"}
                  minH={{ base: "120px", md: "140px" }}
                  p="8px"
                  position="relative"
                  bg={bgColor}
                  cursor="default"
                >
                  {/* AD Date (Top Right) */}
                  {adDate && (
                    <Text
                      position="absolute"
                      top="8px"
                      right="8px"
                      fontSize={{ base: "13px", md: "16px" }}
                      fontWeight="700"
                      color={isToday ? "rgba(255,255,255,0.9)" : "var(--color-muted)"}
                      lineHeight="1"
                    >
                      {adDate.getDate()}
                    </Text>
                  )}

                  {/* Events / Festivals (Top Center) */}
                  {hasEvents && (
                    <Box position="absolute" top="28px" left="0" w="full" px="4px" textAlign="center">
                      <Text
                        fontSize={{ base: "9px", md: "11px" }}
                        fontWeight="600"
                        lineHeight="1.3"
                        lineClamp={2}
                        color={isToday ? "white" : hasHoliday ? "#b91c1c" : "var(--color-subtle)"}
                      >
                        {info.events.map((e) => (locale === "ne" ? e.titleNp : e.titleEn)).join(" / ")}
                      </Text>
                    </Box>
                  )}

                  {/* BS Date (Center) */}
                  <Flex h="full" align="center" justify="center" pt={{ base: "12px", md: "16px" }}>
                    <Text
                      fontSize={{ base: "36px", md: "46px" }}
                      fontWeight="500"
                      lineHeight="1"
                      color={textColor}
                    >
                      {locale === "ne" ? toNepaliNum(day) : day}
                    </Text>
                  </Flex>

                  {/* Tithi (Bottom Center) */}
                  {info?.tithiShort && (
                    <Text
                      position="absolute"
                      bottom="8px"
                      left="0"
                      w="full"
                      textAlign="center"
                      fontSize={{ base: "11px", md: "13px" }}
                      fontWeight="500"
                      color={textColor}
                    >
                      {info.tithiShort}
                    </Text>
                  )}
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>
      </Box>
    </PageShell>
  );
}
