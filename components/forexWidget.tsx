"use client";

import { Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import { getFlagUrl } from "@/lib/currencyFlags";

interface Rate {
  name: string;
  iso3: string;
  unit: number;
  buy: string;
  sell: string;
}

const HIGHLIGHT = ["USD", "EUR", "GBP", "AUD", "CAD", "JPY", "CNY", "INR", "AED", "MYR", "SAR", "QAR", "KWD", "KRW", "SGD"];
type WidgetVariant = "default" | "compact";

export function ForexWidget({ variant = "default" }: { variant?: WidgetVariant }) {
  const { locale } = useLocale();
  const [rates, setRates] = useState<Rate[]>([]);
  const [date, setDate] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/forex")
      .then((response) => response.json())
      .then((data) => {
        setRates(data.rates || []);
        setDate(data.date || "");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const filtered = rates.filter((rate) => HIGHLIGHT.includes(rate.iso3));
  const display = filtered.length > 0 ? filtered : rates.slice(0, 12);

  if (variant === "compact") {
    const usd = rates.find((rate) => rate.iso3 === "USD");
    const inr = rates.find((rate) => rate.iso3 === "INR");
    return (
      <Box className="dp-utility-block" p="16px">
        <Flex mb="16px" align="center" justify="space-between" gap="8px" wrap="wrap">
          <Box>
            <Text fontSize="14px" fontWeight="700" color="var(--color-headline)">{locale === "ne" ? "विदेशी मुद्रा" : "Foreign exchange"}</Text>
            <Text className="dp-english" fontSize="9px" textTransform="uppercase" letterSpacing="0.12em" color="var(--color-muted)">Foreign exchange</Text>
          </Box>
          <Link href="/forex" style={{ fontSize: "11px", color: "var(--color-brand)", textDecoration: "underline", fontWeight: 600 }}>
            {locale === "ne" ? "सबै हेर्नुहोस्" : "See all"}
          </Link>
        </Flex>
        {!loaded ? (
          <Flex direction="column" gap="10px"><Skeleton h="16px" /><Skeleton h="16px" /></Flex>
        ) : (
          <Flex direction="column" gap="0">
            <Flex align="center" justify="space-between" borderBottom="1px solid var(--color-border)" pb="8px">
              <Flex align="center" gap="6px"><img src={getFlagUrl("USD")!} alt="US" width="16" height="11" style={{ borderRadius: "2px", border: "1px solid rgba(0,0,0,0.1)" }} /><Text className="dp-english" fontSize="12px" fontWeight="600" color="var(--color-headline)">USD {usd?.unit || 1}</Text></Flex>
              <Text className="dp-number" fontSize="16px" fontWeight="700" color="var(--color-headline)">रु {usd?.buy || "—"}</Text>
            </Flex>
            <Flex align="center" justify="space-between" pt="8px">
              <Flex align="center" gap="6px"><img src={getFlagUrl("INR")!} alt="IN" width="16" height="11" style={{ borderRadius: "2px", border: "1px solid rgba(0,0,0,0.1)" }} /><Text className="dp-english" fontSize="12px" fontWeight="600" color="var(--color-headline)">INR {inr?.unit || 100}</Text></Flex>
              <Text className="dp-number" fontSize="16px" fontWeight="700" color="var(--color-headline)">रु {inr?.buy || "—"}</Text>
            </Flex>
          </Flex>
        )}
        <Text mt="8px" fontSize="10px" color="var(--color-faint)">{locale === "ne" ? "स्रोत: नेपाल राष्ट्र बैंक" : "Source: Nepal Rastra Bank"}{date ? ` · ${date}` : ""}</Text>
      </Box>
    );
  }

  if (display.length === 0) return null;

  return (
    <Box>
      <SectionHeader title={locale === "ne" ? "विदेशी मुद्रा विनिमय" : "Forex Rates"} accent="var(--color-brand)" />
      {date && <Text fontSize="11px" color="var(--color-muted)" mb="8px">{locale === "ne" ? "स्रोत: नेपाल राष्ट्र बैंक" : "Source: Nepal Rastra Bank"} · {date}</Text>}
      <Box border="1px solid var(--color-border)" borderRadius="4px" overflow="hidden" fontSize="12px">
        <Flex bg="var(--color-table-header)" fontWeight="700" color="var(--color-subtle)" px="10px" py="6px">
          <Text flex="1">{locale === "ne" ? "मुद्रा" : "Currency"}</Text>
          <Text w="60px" textAlign="right">{locale === "ne" ? "एकाइ" : "Unit"}</Text>
          <Text w="70px" textAlign="right">{locale === "ne" ? "किन्ने" : "Buy"}</Text>
          <Text w="70px" textAlign="right">{locale === "ne" ? "बेच्ने" : "Sell"}</Text>
        </Flex>
        {display.map((rate, index) => (
          <Flex key={rate.iso3} px="10px" py="6px" borderTop="1px solid var(--color-border)" bg={index % 2 === 0 ? "var(--color-surface)" : "var(--color-card-alt)"} align="center">
            <Flex flex="1" align="center" gap="8px">
              {getFlagUrl(rate.iso3) && <img src={getFlagUrl(rate.iso3)!} alt={rate.iso3} width="16" height="11" style={{ borderRadius: "2px", border: "1px solid rgba(0,0,0,0.1)" }} />}
              <Text fontWeight="500" color="var(--color-body)">{rate.iso3}</Text>
            </Flex>
            <Text className="dp-number" w="60px" textAlign="right" color="var(--color-muted)">{rate.unit}</Text>
            <Text className="dp-number" w="70px" textAlign="right" color="#16a34a" fontWeight="600">{rate.buy}</Text>
            <Text className="dp-number" w="70px" textAlign="right" color="#dc2626" fontWeight="600">{rate.sell}</Text>
          </Flex>
        ))}
      </Box>
    </Box>
  );
}
