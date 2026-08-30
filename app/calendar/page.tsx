"use client";

import { Box, Flex, SimpleGrid, Text, IconButton } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerY, setPickerY] = useState(todayY);
  const [pickerM, setPickerM] = useState(todayM);
  const [pickerD, setPickerD] = useState(todayD);
  const [autoSelectDay, setAutoSelectDay] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const y = params.get('y');
      const m = params.get('m');
      const d = params.get('d');
      if (y && m && d) {
        setViewYear(parseInt(y, 10));
        setViewMonth(parseInt(m, 10));
        setAutoSelectDay(parseInt(d, 10));
        // Clean up URL so it doesn't stay there if they refresh or navigate
        window.history.replaceState(null, '', '/calendar');
      }
    }
  }, []);

  const daysInPickerMonth = useMemo(() => {
    for (let day = 32; day >= 28; day -= 1) {
      try {
        new NepaliDate(pickerY, pickerM, day);
        return day;
      } catch {
        continue;
      }
    }
    return 30;
  }, [pickerY, pickerM]);

  useEffect(() => {
    if (pickerD > daysInPickerMonth) setPickerD(daysInPickerMonth);
  }, [daysInPickerMonth, pickerD]);



  const handleOpenPicker = () => {
    setPickerY(viewYear);
    setPickerM(viewMonth);
    setPickerD(selectedDay ? selectedDay.bs.day : 1);
    setPickerOpen(!pickerOpen);
  };

  const handleGo = () => {
    setViewYear(pickerY);
    setViewMonth(pickerM);
    setAutoSelectDay(pickerD);
    setPickerOpen(false);
  };

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

  useEffect(() => {
    if (autoSelectDay !== null && monthData) {
      const info = monthData.days.find(d => d.bs.day === autoSelectDay);
      if (info) setSelectedDay(info);
      setAutoSelectDay(null);
    }
  }, [autoSelectDay, monthData]);

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
  const remaining = cells.length % 7;
  if (remaining > 0) {
    for (let i = 0; i < 7 - remaining; i++) cells.push(null);
  }

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
      <Box maxW="900px" mx="auto" px={{ base: "0px", md: "16px" }}>
        {/* Header Area */}
        <Flex justify="space-between" align="center" mb="16px" flexWrap="wrap" gap="16px" px={{ base: "16px", md: "0" }}>
          
          <Box position="relative">
            <Flex align="baseline" gap="8px" cursor="pointer" onClick={handleOpenPicker} _hover={{ opacity: 0.8 }} transition="opacity 0.2s" flexWrap="wrap">
              <Text fontSize={{ base: "24px", md: "32px" }} fontWeight="800" color="var(--color-headline)" lineHeight="1">
                {locale === "ne" ? `${BS_MONTHS_NE[viewMonth]} ${toNepaliNum(viewYear)}` : `${BS_MONTHS_EN[viewMonth]} ${viewYear}`}
              </Text>
              <ChevronDown size={22} strokeWidth={2.5} color="var(--color-headline)" style={{ transform: "translateY(2px)" }} />
              <Text fontSize={{ base: "13px", md: "15px" }} fontWeight="500" color="var(--color-muted)" ml="4px">
                {adSubtitle}
              </Text>
            </Flex>

            {pickerOpen && (
              <>
                <Box position="fixed" top="0" left="0" w="100vw" h="100vh" zIndex={9} onClick={() => setPickerOpen(false)} />
                <Box position="absolute" top="100%" left="0" mt="8px" p="16px" w="320px" bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" boxShadow="lg" zIndex={10}>
                  <Text fontSize="13px" fontWeight="700" mb="12px" color="var(--color-headline)">
                    {locale === "ne" ? "मिति छान्नुहोस्" : "Select Date"}
                  </Text>
                  
                  <Flex gap="8px" flexDir="column">
                    <Flex gap="8px">
                      <select
                        value={pickerY}
                        onChange={(e) => setPickerY(Number(e.target.value))}
                        style={{ padding: "8px", fontSize: "14px", borderRadius: "6px", backgroundColor: "var(--color-page)", border: "1px solid var(--color-border)", color: "var(--color-body)", outline: "none", cursor: "pointer", flex: "1" }}
                      >
                        {Array.from({ length: 101 }, (_, i) => 2000 + i).map(y => (
                          <option key={y} value={y}>{locale === "ne" ? toNepaliNum(y) : y}</option>
                        ))}
                      </select>
                      <select
                        value={pickerM}
                        onChange={(e) => setPickerM(Number(e.target.value))}
                        style={{ padding: "8px", fontSize: "14px", borderRadius: "6px", backgroundColor: "var(--color-page)", border: "1px solid var(--color-border)", color: "var(--color-body)", outline: "none", cursor: "pointer", flex: "1" }}
                      >
                        {BS_MONTHS_EN.map((m, i) => (
                          <option key={i} value={i}>{locale === "ne" ? BS_MONTHS_NE[i] : m}</option>
                        ))}
                      </select>
                      <select
                        value={pickerD}
                        onChange={(e) => setPickerD(Number(e.target.value))}
                        style={{ padding: "8px", fontSize: "14px", borderRadius: "6px", backgroundColor: "var(--color-page)", border: "1px solid var(--color-border)", color: "var(--color-body)", outline: "none", cursor: "pointer", width: "70px" }}
                      >
                        {Array.from({ length: daysInPickerMonth }, (_, i) => i + 1).map(d => (
                          <option key={d} value={d}>{locale === "ne" ? toNepaliNum(d) : d}</option>
                        ))}
                      </select>
                    </Flex>
                    
                    <Box
                      as="button"
                      onClick={handleGo}
                      bg="var(--color-brand)"
                      color="white"
                      w="full"
                      py="8px"
                      mt="4px"
                      borderRadius="6px"
                      fontWeight="700"
                      fontSize="14px"
                      _hover={{ opacity: 0.9 }}
                      transition="opacity 0.2s"
                    >
                      {locale === "ne" ? "खोज्नुहोस्" : "Go to Date"}
                    </Box>
                  </Flex>
                </Box>
              </>
            )}
          </Box>


          <Flex align="center" gap="12px">
            <Box
              as="button"
              onClick={goToToday}
              bg="#b91c1c"
              color="white"
              px="16px"
              py="4px"
              borderRadius="4px"
              fontSize="14px"
              fontWeight="700"
              _hover={{ bg: "#991b1b" }}
              transition="background 0.2s"
            >
              {locale === "ne" ? "आज" : "Today"}
            </Box>
            <Flex gap="8px">
              <IconButton aria-label="Previous month" size="sm" borderRadius="full" variant="outline" borderColor="var(--color-border)" color="var(--color-headline)" _hover={{ bg: "var(--color-card-alt)" }} onClick={prevMonth}>
                <ChevronLeft size={18} strokeWidth={2.5} />
              </IconButton>
              <IconButton aria-label="Next month" size="sm" borderRadius="full" variant="outline" borderColor="var(--color-border)" color="var(--color-headline)" _hover={{ bg: "var(--color-card-alt)" }} onClick={nextMonth}>
                <ChevronRight size={18} strokeWidth={2.5} />
              </IconButton>
            </Flex>
          </Flex>
        </Flex>

        <Box border="1px solid var(--color-border)" borderRadius={{ base: "0", md: "8px" }} overflow="hidden" bg="var(--color-surface)">
          {/* Weekday Headers */}
          <SimpleGrid columns={7} borderBottom="1px solid var(--color-border)">
            {dayHeaders.map((day, idx) => {
              const isWeekend = idx === 0 || idx === 6;
              const shortDayNe = ["आइ", "सो", "मं", "बु", "बि", "शु", "शन"][idx];
              const shortDayEn = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][idx];
              return (
                <Text
                  key={day}
                  py={{ base: "8px", md: "12px" }}
                  textAlign="center"
                  fontSize={{ base: "13px", md: "15px" }}
                  fontWeight="800"
                  color={isWeekend ? "#b91c1c" : "var(--color-headline)"}
                  borderRight={idx < 6 ? "1px solid var(--color-border)" : "none"}
                >
                  <Box as="span" display={{ base: "none", md: "inline" }}>{day}</Box>
                  <Box as="span" display={{ base: "inline", md: "none" }}>{locale === "ne" ? shortDayNe : shortDayEn}</Box>
                </Text>
              );
            })}
          </SimpleGrid>

          {/* Calendar Grid */}
          <SimpleGrid columns={7}>
            {cells.map((day, idx) => {
              if (day === null) {
                return <Box key={`empty-${idx}`} borderBottom="1px solid var(--color-border)" borderRight={idx % 7 < 6 ? "1px solid var(--color-border)" : "none"} minH={{ base: "65px", md: "105px" }} bg="rgba(0,0,0,0.01)" />;
              }
              const info = getDayInfo(day);
              const isToday = viewYear === todayY && viewMonth === todayM && day === todayD;
              const isWeekend = idx % 7 === 0 || idx % 7 === 6;
              const hasHoliday = info?.isHoliday;
              const isRedDay = isWeekend || hasHoliday;
              const adDate = getAdDate(viewYear, viewMonth, day);
              const hasEvents = info && info.events.length > 0;
              const isSelected = selectedDay?.bs.day === day && selectedDay?.bs.month === viewMonth + 1;
              
              const bgColor = isToday ? BRAND : isSelected ? "var(--color-card-alt)" : "transparent";
              const textColor = isToday ? "white" : isRedDay ? "#b91c1c" : "var(--color-headline)";

              return (
                <Box
                  key={`day-${day}`}
                  boxShadow={isSelected && !isToday ? "inset 0 0 0 1px var(--color-brand)" : undefined}
                  borderBottom="1px solid var(--color-border)"
                  borderRight={idx % 7 < 6 ? "1px solid var(--color-border)" : "none"}
                  minH={{ base: "65px", md: "105px" }}
                  p="4px"
                  position="relative"
                  bg={bgColor}
                  cursor="pointer"
                  _hover={!isToday ? { bg: "var(--color-card-alt)" } : undefined}
                  onClick={() => info && setSelectedDay(isSelected ? null : info)}
                  transition="background 0.1s"
                >
                  {/* AD Date (Top Right) */}
                  {adDate && (
                    <Text
                      position="absolute"
                      top="4px"
                      right="4px"
                      fontSize={{ base: "10px", md: "13px" }}
                      fontWeight="700"
                      color={isToday ? "rgba(255,255,255,0.9)" : "var(--color-muted)"}
                      lineHeight="1"
                    >
                      {adDate.getDate()}
                    </Text>
                  )}

                  {/* Desktop Events / Festivals (Top Center) */}
                  {hasEvents && (
                    <Box display={{ base: "none", md: "block" }} position="absolute" top="16px" left="0" w="full" px="2px" textAlign="center">
                      <Text
                        fontSize="9px"
                        fontWeight="600"
                        lineHeight="1.4"
                        lineClamp={2}
                        color={isToday ? "white" : hasHoliday ? "#b91c1c" : "var(--color-subtle)"}
                      >
                        {info.events.map((e) => (locale === "ne" ? e.titleNp : e.titleEn)).join(" / ")}
                      </Text>
                    </Box>
                  )}

                  {/* BS Date (Center) */}
                  <Flex h="full" align="center" justify="center" pt={{ base: "4px", md: "20px" }}>
                    <Text
                      fontSize={{ base: "28px", md: "40px" }}
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
                      bottom={{ base: "6px", md: "6px" }}
                      left="0"
                      w="full"
                      textAlign="center"
                      fontSize={{ base: "9px", md: "11px" }}
                      fontWeight="500"
                      color={textColor}
                    >
                      {info.tithiShort}
                    </Text>
                  )}

                  {/* Mobile Event Dot (Bottom Center below Tithi) */}
                  {hasEvents && (
                    <Box
                      display={{ base: "block", md: "none" }}
                      position="absolute"
                      bottom="2px"
                      left="50%"
                      transform="translateX(-50%)"
                      w="3px"
                      h="3px"
                      borderRadius="full"
                      bg={isToday ? "white" : "#b91c1c"}
                    />
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

            <SimpleGrid columns={{ base: 2, sm: 3 }} gap="12px" mb={selectedDay.events.length > 0 ? "16px" : "0"}>
              <DetailRow label={locale === "ne" ? "तिथि" : "Tithi"} value={selectedDay.tithi || "—"} />
              <DetailRow label={locale === "ne" ? "नक्षत्र" : "Nakshatra"} value={selectedDay.nakshatra || "—"} />
              <DetailRow label={locale === "ne" ? "योग" : "Yoga"} value={selectedDay.yoga || "—"} />
              <DetailRow label={locale === "ne" ? "करण" : "Karana"} value={selectedDay.karana || "—"} />
              <DetailRow label={locale === "ne" ? "सूर्योदय" : "Sunrise"} value={selectedDay.sunriseNp || "—"} />
              <DetailRow label={locale === "ne" ? "सूर्यास्त" : "Sunset"} value={selectedDay.sunsetNp || "—"} />
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
