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

  function getDayInfo(day: number): DayData | undefined {
    return monthData?.days.find((d) => d.bs.day === day);
  }

  const dayHeaders = locale === "ne" ? DAYS_NE : DAYS_EN;
  const monthLabel = locale === "ne"
    ? `${BS_MONTHS_NE[viewMonth]} ${toNepaliNum(viewYear)}`
    : `${BS_MONTHS_EN[viewMonth]} ${viewYear}`;

  return (
    <PageShell>
      <Box maxW="900px" mx="auto">
        <Text fontSize={{ base: "22px", md: "28px" }} fontWeight="800" color="var(--color-headline)" mb="24px" textAlign="center">
          {locale === "ne" ? "नेपाली पात्रो" : "Nepali Calendar"}
        </Text>

        <Box border="1px solid var(--color-border)" borderRadius="8px" overflow="hidden" bg="var(--color-surface)">
          {/* Month nav */}
          <Flex justify="space-between" align="center" px="16px" py="12px" bg={BRAND} color="white">
            <IconButton aria-label="Previous month" size="sm" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.15)" }} onClick={prevMonth}>
              <ChevronLeft size={20} strokeWidth={2} color="currentColor" aria-hidden="true" />
            </IconButton>
            <Text fontWeight="700" fontSize={{ base: "16px", md: "20px" }}>{monthLabel}</Text>
            <IconButton aria-label="Next month" size="sm" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.15)" }} onClick={nextMonth}>
              <ChevronRight size={20} strokeWidth={2} color="currentColor" aria-hidden="true" />
            </IconButton>
          </Flex>

          {/* Day headers */}
          <SimpleGrid columns={7} bg="var(--color-card-alt)" borderBottom="1px solid var(--color-border)">
            {dayHeaders.map((day, i) => (
              <Text
                key={day}
                textAlign="center"
                py="10px"
                fontSize={{ base: "11px", md: "13px" }}
                fontWeight="700"
                color={i === 6 ? "#dc2626" : "var(--color-muted)"}
              >
                {day}
              </Text>
            ))}
          </SimpleGrid>

          {/* Calendar grid */}
          <SimpleGrid columns={7}>
            {cells.map((day, idx) => {
              if (day === null) {
                return <Box key={`empty-${idx}`} borderBottom="1px solid var(--color-border)" borderRight="1px solid var(--color-border)" minH={{ base: "52px", md: "80px" }} />;
              }
              const info = getDayInfo(day);
              const isToday = viewYear === todayY && viewMonth === todayM && day === todayD;
              const isSaturday = idx % 7 === 6;
              const isHoliday = info?.isHoliday || isSaturday;
              const adDate = getAdDate(viewYear, viewMonth, day);
              const hasEvents = info && info.events.length > 0;
              const isSelected = selectedDay?.bs.day === day && selectedDay?.bs.month === viewMonth + 1;

              return (
                <Box
                  key={`day-${day}`}
                  borderBottom="1px solid var(--color-border)"
                  borderRight="1px solid var(--color-border)"
                  minH={{ base: "52px", md: "80px" }}
                  p={{ base: "2px", md: "4px" }}
                  position="relative"
                  cursor={info ? "pointer" : "default"}
                  bg={isSelected ? "var(--color-card-alt)" : isToday ? "rgba(185,28,28,0.06)" : "transparent"}
                  _hover={info ? { bg: "var(--color-card-alt)" } : undefined}
                  onClick={() => info && setSelectedDay(isSelected ? null : info)}
                  transition="background 0.1s"
                >
                  {/* BS day number */}
                  <Text
                    fontSize={{ base: "14px", md: "16px" }}
                    fontWeight={isToday ? "800" : "600"}
                    color={isToday ? BRAND : isHoliday ? "#dc2626" : "var(--color-headline)"}
                    lineHeight="1"
                    px="2px"
                  >
                    {locale === "ne" ? toNepaliNum(day) : day}
                  </Text>

                  {/* Tithi */}
                  {info?.tithiShort && (
                    <Text
                      fontSize={{ base: "7px", md: "9px" }}
                      color="var(--color-muted)"
                      lineHeight="1.2"
                      mt="1px"
                      px="2px"
                      display={{ base: "none", sm: "block" }}
                    >
                      {info.tithiShort}
                    </Text>
                  )}

                  {/* Event dot indicator on mobile */}
                  {hasEvents && (
                    <Box
                      display={{ base: "block", md: "none" }}
                      position="absolute"
                      bottom="2px"
                      left="50%"
                      transform="translateX(-50%)"
                      w="4px"
                      h="4px"
                      borderRadius="full"
                      bg={info.events.some((e) => e.isHoliday) ? "#dc2626" : BRAND}
                    />
                  )}

                  {/* Event names on desktop */}
                  {hasEvents && (
                    <Box display={{ base: "none", md: "block" }} mt="2px">
                      {info.events.slice(0, 2).map((ev, i) => (
                        <Text
                          key={i}
                          fontSize="8px"
                          lineHeight="1.3"
                          color={ev.isHoliday ? "#dc2626" : "var(--color-subtle)"}
                          fontWeight={ev.isHoliday ? "600" : "400"}
                          px="2px"
                          truncate
                        >
                          {locale === "ne" ? ev.titleNp : ev.titleEn}
                        </Text>
                      ))}
                    </Box>
                  )}

                  {/* AD date bottom-right */}
                  {adDate && (
                    <Text
                      position="absolute"
                      bottom={{ base: "1px", md: "3px" }}
                      right={{ base: "2px", md: "4px" }}
                      fontSize={{ base: "7px", md: "9px" }}
                      color="var(--color-faint)"
                      lineHeight="1"
                    >
                      {adDate.getDate()} {AD_MONTHS[adDate.getMonth()]}
                    </Text>
                  )}
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>

        {/* Selected day detail panel */}
        {selectedDay && (
          <Box mt="16px" p={{ base: "12px", md: "20px" }} border="1px solid var(--color-border)" borderRadius="8px" bg="var(--color-surface)">
            <Flex justify="space-between" align="start" mb="12px" flexWrap="wrap" gap="8px">
              <Box>
                <Text fontSize={{ base: "18px", md: "22px" }} fontWeight="800" color="var(--color-headline)">
                  {locale === "ne"
                    ? `${BS_MONTHS_NE[selectedDay.bs.month - 1]} ${toNepaliNum(selectedDay.bs.day)}, ${toNepaliNum(selectedDay.bs.year)}`
                    : `${BS_MONTHS_EN[selectedDay.bs.month - 1]} ${selectedDay.bs.day}, ${selectedDay.bs.year}`}
                </Text>
                <Text fontSize="13px" color="var(--color-muted)">
                  {locale === "ne" ? selectedDay.weekdayNp : selectedDay.weekdayEn}
                  {(() => {
                    const ad = getAdDate(selectedDay.bs.year, selectedDay.bs.month - 1, selectedDay.bs.day);
                    return ad ? ` • ${AD_MONTHS[ad.getMonth()]} ${ad.getDate()}, ${ad.getFullYear()}` : "";
                  })()}
                </Text>
              </Box>
              {selectedDay.isHoliday && (
                <Text fontSize="11px" fontWeight="700" color="#dc2626" bg="rgba(220,38,38,0.08)" px="10px" py="4px" borderRadius="999px">
                  {locale === "ne" ? "बिदा" : "Holiday"}
                </Text>
              )}
            </Flex>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="12px" mb={selectedDay.events.length > 0 ? "16px" : "0"}>
              <DetailRow label={locale === "ne" ? "तिथि" : "Tithi"} value={selectedDay.tithi} />
              <DetailRow label={locale === "ne" ? "नक्षत्र" : "Nakshatra"} value={selectedDay.nakshatra || "—"} />
              <DetailRow label={locale === "ne" ? "योग" : "Yoga"} value={selectedDay.yoga || "—"} />
              <DetailRow label={locale === "ne" ? "करण" : "Karana"} value={selectedDay.karana || "—"} />
            </SimpleGrid>

            {selectedDay.events.length > 0 && (
              <Box>
                <Text fontSize="12px" fontWeight="700" color="var(--color-muted)" textTransform="uppercase" letterSpacing="0.5px" mb="8px">
                  {locale === "ne" ? "घटनाहरू" : "Events"}
                </Text>
                {selectedDay.events.map((ev, i) => (
                  <Flex key={i} align="center" gap="8px" py="6px" borderBottom={i < selectedDay.events.length - 1 ? "1px solid var(--color-border)" : "none"}>
                    <Box w="6px" h="6px" borderRadius="full" bg={ev.isHoliday ? "#dc2626" : BRAND} flexShrink={0} />
                    <Text fontSize="14px" color="var(--color-body)">
                      {locale === "ne" ? ev.titleNp : ev.titleEn}
                    </Text>
                    {ev.isHoliday && (
                      <Text fontSize="10px" color="#dc2626" fontWeight="600">
                        {locale === "ne" ? "बिदा" : "Holiday"}
                      </Text>
                    )}
                  </Flex>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </PageShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fontSize="10px" fontWeight="700" color="var(--color-muted)" textTransform="uppercase" letterSpacing="0.3px">{label}</Text>
      <Text fontSize="14px" color="var(--color-body)" fontWeight="500">{value}</Text>
    </Box>
  );
}
