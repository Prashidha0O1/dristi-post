"use client";

import { Box, Flex, Text, SimpleGrid, Input, chakra } from "@chakra-ui/react";
import { useState } from "react";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import NepaliDate from "nepali-date-converter";

const BS_MONTHS = [
  "Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Ashoj",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];
const BS_MONTHS_NE = [
  "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत",
];

export default function DateConverterPage() {
  const { locale } = useLocale();
  const [mode, setMode] = useState<"bs2ad" | "ad2bs">("bs2ad");

  const [bsYear, setBsYear] = useState("2083");
  const [bsMonth, setBsMonth] = useState("1");
  const [bsDay, setBsDay] = useState("1");
  const [adDate, setAdDate] = useState("");

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function convertBsToAd() {
    try {
      setError(null);
      const nd = new NepaliDate(parseInt(bsYear), parseInt(bsMonth) - 1, parseInt(bsDay));
      const ad = nd.toJsDate();
      setResult(ad.toLocaleDateString(locale === "ne" ? "ne-NP" : "en-US", {
        year: "numeric", month: "long", day: "numeric", weekday: "long",
      }));
    } catch {
      setError(locale === "ne" ? "अमान्य मिति" : "Invalid date");
      setResult(null);
    }
  }

  function convertAdToBs() {
    try {
      setError(null);
      const parts = adDate.split("-");
      if (parts.length !== 3) throw new Error("bad");
      const jsDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const nd = new NepaliDate(jsDate);
      const m = locale === "ne" ? BS_MONTHS_NE[nd.getMonth()] : BS_MONTHS[nd.getMonth()];
      setResult(`${nd.getYear()} ${m} ${nd.getDate()}`);
    } catch {
      setError(locale === "ne" ? "अमान्य मिति" : "Invalid date");
      setResult(null);
    }
  }

  const yearOptions = Array.from({ length: 101 }, (_, i) => 2000 + i);
  const monthNames = locale === "ne" ? BS_MONTHS_NE : BS_MONTHS;

  return (
    <PageShell>
      <SectionHeader
        title={locale === "ne" ? "मिति रूपान्तरक" : "Date Converter"}
        accent="var(--color-brand)"
      />

      <Box maxW="600px" mx="auto" py="20px">
        <Flex gap="0" mb="24px" borderRadius="4px" overflow="hidden" border="1px solid #ddd">
          {(["bs2ad", "ad2bs"] as const).map((m) => (
            <chakra.button
              key={m}
              flex="1"
              py="10px"
              fontSize="14px"
              fontWeight="600"
              bg={mode === m ? "var(--color-brand)" : "white"}
              color={mode === m ? "white" : "#555"}
              border="none"
              cursor="pointer"
              transition="all 0.15s"
              onClick={() => { setMode(m); setResult(null); setError(null); }}
            >
              {m === "bs2ad"
                ? (locale === "ne" ? "बि.सं. → ई.सं." : "BS → AD")
                : (locale === "ne" ? "ई.सं. → बि.सं." : "AD → BS")}
            </chakra.button>
          ))}
        </Flex>

        {mode === "bs2ad" ? (
          <SimpleGrid columns={3} gap="12px" mb="16px">
            <Box>
              <Text fontSize="12px" fontWeight="600" color="#555" mb="4px">
                {locale === "ne" ? "वर्ष" : "Year"}
              </Text>
              <chakra.select w="full" h="40px" border="1px solid #ddd" borderRadius="4px" px="8px" fontSize="14px" bg="white"
                value={bsYear} onChange={(e) => setBsYear(e.target.value)}>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </chakra.select>
            </Box>
            <Box>
              <Text fontSize="12px" fontWeight="600" color="#555" mb="4px">
                {locale === "ne" ? "महिना" : "Month"}
              </Text>
              <chakra.select w="full" h="40px" border="1px solid #ddd" borderRadius="4px" px="8px" fontSize="14px" bg="white"
                value={bsMonth} onChange={(e) => setBsMonth(e.target.value)}>
                {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </chakra.select>
            </Box>
            <Box>
              <Text fontSize="12px" fontWeight="600" color="#555" mb="4px">
                {locale === "ne" ? "गते" : "Day"}
              </Text>
              <chakra.select w="full" h="40px" border="1px solid #ddd" borderRadius="4px" px="8px" fontSize="14px" bg="white"
                value={bsDay} onChange={(e) => setBsDay(e.target.value)}>
                {Array.from({ length: 32 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
              </chakra.select>
            </Box>
          </SimpleGrid>
        ) : (
          <Box mb="16px">
            <Text fontSize="12px" fontWeight="600" color="#555" mb="4px">
              {locale === "ne" ? "ई.सं. मिति" : "AD Date"}
            </Text>
            <Input type="date" value={adDate} onChange={(e) => setAdDate(e.target.value)}
              h="40px" border="1px solid #ddd" borderRadius="4px" fontSize="14px" />
          </Box>
        )}

        <chakra.button
          w="full"
          py="12px"
          bg="var(--color-brand)"
          color="white"
          border="none"
          borderRadius="4px"
          fontSize="15px"
          fontWeight="700"
          cursor="pointer"
          transition="opacity 0.15s"
          _hover={{ opacity: 0.9 }}
          onClick={mode === "bs2ad" ? convertBsToAd : convertAdToBs}
        >
          {locale === "ne" ? "रूपान्तरण गर्नुहोस्" : "Convert"}
        </chakra.button>

        {error && (
          <Text mt="16px" textAlign="center" color="#dc2626" fontSize="14px" fontWeight="500">
            {error}
          </Text>
        )}

        {result && (
          <Box mt="20px" p="20px" bg="white" border="1px solid #eee" borderRadius="4px" textAlign="center">
            <Text fontSize="12px" fontWeight="600" color="#999" textTransform="uppercase" letterSpacing="1px" mb="8px">
              {locale === "ne" ? "परिणाम" : "Result"}
            </Text>
            <Text fontSize="24px" fontWeight="800" color="#1a1a1a">
              {result}
            </Text>
          </Box>
        )}
      </Box>
    </PageShell>
  );
}
