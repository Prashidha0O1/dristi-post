"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";

interface Rate {
  name: string;
  iso3: string;
  unit: number;
  buy: string;
  sell: string;
}

const HIGHLIGHT = ["USD", "EUR", "GBP", "AUD", "CAD", "JPY", "CNY", "INR", "AED", "MYR", "SAR", "QAR", "KWD", "KRW", "SGD"];

export function ForexWidget() {
  const { locale } = useLocale();
  const [rates, setRates] = useState<Rate[]>([]);
  const [date, setDate] = useState("");

  useEffect(() => {
    fetch("/api/forex")
      .then((r) => r.json())
      .then((d) => {
        setRates(d.rates || []);
        setDate(d.date || "");
      })
      .catch(() => {});
  }, []);

  const filtered = rates.filter((r) => HIGHLIGHT.includes(r.iso3));
  const display = filtered.length > 0 ? filtered : rates.slice(0, 12);

  if (display.length === 0) return null;

  return (
    <Box>
      <SectionHeader
        title={locale === "ne" ? "विदेशी मुद्रा विनिमय" : "Forex Rates"}
        accent="var(--color-brand)"
      />
      {date && (
        <Text fontSize="11px" color="var(--color-muted)" mb="8px">
          {locale === "ne" ? "स्रोत: नेपाल राष्ट्र बैंक" : "Source: Nepal Rastra Bank"} · {date}
        </Text>
      )}
      <Box border="1px solid var(--color-border)" borderRadius="4px" overflow="hidden" fontSize="12px">
        <Flex bg="var(--color-table-header)" fontWeight="700" color="var(--color-subtle)" px="10px" py="6px">
          <Text flex="1">{locale === "ne" ? "मुद्रा" : "Currency"}</Text>
          <Text w="60px" textAlign="right">{locale === "ne" ? "एकाइ" : "Unit"}</Text>
          <Text w="70px" textAlign="right">{locale === "ne" ? "किन्ने" : "Buy"}</Text>
          <Text w="70px" textAlign="right">{locale === "ne" ? "बेच्ने" : "Sell"}</Text>
        </Flex>
        {display.map((r, i) => (
          <Flex
            key={r.iso3}
            px="10px"
            py="6px"
            borderTop="1px solid var(--color-border)"
            bg={i % 2 === 0 ? "var(--color-surface)" : "var(--color-card-alt)"}
            align="center"
          >
            <Text flex="1" fontWeight="500" color="var(--color-body)">
              {r.iso3}
            </Text>
            <Text w="60px" textAlign="right" color="var(--color-muted)">{r.unit}</Text>
            <Text w="70px" textAlign="right" color="#16a34a" fontWeight="600">{r.buy}</Text>
            <Text w="70px" textAlign="right" color="#dc2626" fontWeight="600">{r.sell}</Text>
          </Flex>
        ))}
      </Box>
    </Box>
  );
}
