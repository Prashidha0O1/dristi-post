"use client";

import { Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";

interface Rates {
  fineGold: string;
  tejabi: string;
  silver: string;
}

type WidgetVariant = "default" | "compact";

export function GoldSilverWidget({ variant = "default" }: { variant?: WidgetVariant }) {
  const { locale } = useLocale();
  const [rates, setRates] = useState<Rates | null>(null);

  useEffect(() => {
    fetch("/api/gold-silver")
      .then((response) => response.json())
      .then((data) => setRates(data.rates))
      .catch(() => setRates(null));
  }, []);

  if (!rates && variant === "default") return null;

  if (variant === "compact") {
    return (
      <Box className="dp-utility-block" borderBottom="1px solid var(--color-border)" p="16px">
        <Flex mb="16px" align="center" justify="space-between" gap="8px">
          <Box>
            <Text fontSize="14px" fontWeight="700" color="var(--color-headline)">{locale === "ne" ? "सुन चाँदी दर" : "Gold & silver"}</Text>
            <Text className="dp-english" fontSize="9px" textTransform="uppercase" letterSpacing="0.12em" color="var(--color-muted)">Gold & silver</Text>
          </Box>
          <Text className="dp-number" fontSize="10px" color="var(--color-muted)">Updated</Text>
        </Flex>
        {!rates ? (
          <Flex direction="column" gap="8px"><Skeleton h="18px" /><Skeleton h="12px" w="70%" /></Flex>
        ) : (
          <Flex align="flex-end" justify="space-between" gap="12px">
            <Box>
              <Text fontSize="11px" color="var(--color-muted)">{locale === "ne" ? "छापावाल सुन" : "Fine gold"}</Text>
              <Text className="dp-number" mt="2px" fontSize="19px" fontWeight="700" color="#b78912">रु {rates.fineGold}</Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="11px" color="var(--color-muted)">{locale === "ne" ? "चाँदी" : "Silver"}</Text>
              <Text className="dp-number" mt="2px" fontSize="15px" fontWeight="600" color="var(--color-muted)">रु {rates.silver}</Text>
            </Box>
          </Flex>
        )}
        <Text mt="8px" fontSize="10px" color="var(--color-faint)">{locale === "ne" ? "स्रोत: नेपाल सुनचाँदी व्यवसायी महासंघ" : "Source: FENEGOSIDA"}</Text>
      </Box>
    );
  }

  const items = [
    { label: locale === "ne" ? "छापावाल सुन" : "Fine Gold", value: rates?.fineGold || "—", color: "#d4a017" },
    { label: locale === "ne" ? "तेजाबी सुन" : "Tejabi Gold", value: rates?.tejabi || "—", color: "#c4960c" },
    { label: locale === "ne" ? "चाँदी" : "Silver", value: rates?.silver || "—", color: "#8a8a8a" },
  ];

  return (
    <Box>
      <SectionHeader title={locale === "ne" ? "सुन चाँदी दर" : "Gold & Silver Rates"} accent="#d4a017" />
      <Text fontSize="11px" color="var(--color-muted)" mb="8px">{locale === "ne" ? "स्रोत: फेनेगोसिडा (प्रति तोला)" : "Source: FENEGOSIDA (per tola)"}</Text>
      <Flex direction="column" gap="0" border="1px solid var(--color-border)" borderRadius="4px" overflow="hidden">
        {items.map((item, index) => (
          <Flex key={item.label} justify="space-between" align="center" px="12px" py="10px" bg={index % 2 === 0 ? "var(--color-surface)" : "var(--color-card-alt)"} borderTop={index > 0 ? "1px solid var(--color-border)" : "none"}>
            <Text fontSize="13px" fontWeight="500" color="var(--color-subtle)">{item.label}</Text>
            <Text className="dp-number" fontSize="14px" fontWeight="700" color={item.color}>रु {item.value}</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
