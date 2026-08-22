"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";

interface Rates {
  fineGold: string;
  tejabi: string;
  silver: string;
}

export function GoldSilverWidget() {
  const { locale } = useLocale();
  const [rates, setRates] = useState<Rates | null>(null);

  useEffect(() => {
    fetch("/api/gold-silver")
      .then((r) => r.json())
      .then((d) => setRates(d.rates))
      .catch(() => {});
  }, []);

  if (!rates) return null;

  const items = [
    { label: locale === "ne" ? "छापावाल सुन" : "Fine Gold", value: rates.fineGold, color: "#d4a017" },
    { label: locale === "ne" ? "तेजाबी सुन" : "Tejabi Gold", value: rates.tejabi, color: "#c4960c" },
    { label: locale === "ne" ? "चाँदी" : "Silver", value: rates.silver, color: "#8a8a8a" },
  ];

  return (
    <Box>
      <SectionHeader
        title={locale === "ne" ? "सुन चाँदी दर" : "Gold & Silver Rates"}
        accent="#d4a017"
      />
      <Text fontSize="11px" color="var(--color-muted)" mb="8px">
        {locale === "ne" ? "स्रोत: फेनेगोसिडा (प्रति तोला)" : "Source: FENEGOSIDA (per tola)"}
      </Text>
      <Flex direction="column" gap="0" border="1px solid var(--color-border)" borderRadius="4px" overflow="hidden">
        {items.map((item, i) => (
          <Flex
            key={item.label}
            justify="space-between"
            align="center"
            px="12px"
            py="10px"
            bg={i % 2 === 0 ? "var(--color-surface)" : "var(--color-card-alt)"}
            borderTop={i > 0 ? "1px solid var(--color-border)" : "none"}
          >
            <Text fontSize="13px" fontWeight="500" color="var(--color-subtle)">
              {item.label}
            </Text>
            <Text fontSize="14px" fontWeight="700" color={item.color}>
              रु {item.value}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
