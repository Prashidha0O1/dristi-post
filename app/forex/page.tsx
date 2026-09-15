"use client";

import { Box, Flex, Heading, Text, Skeleton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/pageShell";
import { useLocale } from "@/lib/localeContext";
import { getFlagUrl } from "@/lib/currencyFlags";

interface Rate {
  name: string;
  iso3: string;
  unit: number;
  buy: string;
  sell: string;
}

export default function ForexPageClient() {
  const { locale } = useLocale();
  const [rates, setRates] = useState<Rate[]>([]);
  const [date, setDate] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");

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

  const filteredRates = rates.filter(
    (rate) =>
      rate.name.toLowerCase().includes(search.toLowerCase()) ||
      rate.iso3.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell>
      <Box maxW="800px" mx="auto" pt="20px">
        <Box borderBottom="2px solid var(--color-nav)" pb="12px" mb="32px">
          <Heading as="h1" fontSize={{ base: "28px", md: "32px" }} fontWeight="800" color="var(--color-headline)">
            {locale === "ne" ? "विदेशी मुद्रा विनिमय (Forex)" : "Foreign Exchange"}
          </Heading>
          <Text color="var(--color-muted)" fontSize="15px" mt="8px">
            {locale === "ne" ? "नेपाल राष्ट्र बैंकको आजको विदेशी मुद्रा खरिद तथा बिक्री दर।" : "Today's foreign exchange buying and selling rates from NRB."}
            {date ? ` · ${date}` : ""}
          </Text>
        </Box>
        <Box mb="24px">
          <input
            type="text"
            placeholder={locale === "ne" ? "मुद्रा खोज्नुहोस्..." : "Search currency..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-headline)",
              fontSize: "15px",
              width: "100%",
              maxWidth: "100%",
            }}
          />
        </Box>

        {!loaded ? (
          <Flex direction="column" gap="16px">
            <Skeleton h="48px" />
            <Skeleton h="48px" />
            <Skeleton h="48px" />
          </Flex>
        ) : filteredRates.length === 0 ? (
          <Text py="32px" textAlign="center" color="var(--color-muted)">No currencies found.</Text>
        ) : (
          <Box overflowX="auto" pb="16px">
            <Box border="1px solid var(--color-border)" borderRadius="4px" overflow="hidden" fontSize="14px" minW="600px">
              <Flex bg="var(--color-table-header)" fontWeight="700" color="var(--color-subtle)" px="16px" py="12px">
                <Text flex="2">{locale === "ne" ? "मुद्रा" : "Currency"}</Text>
                <Text flex="1" textAlign="center">{locale === "ne" ? "प्रतीक" : "Symbol"}</Text>
                <Text flex="1" textAlign="right">{locale === "ne" ? "एकाइ" : "Unit"}</Text>
                <Text flex="1" textAlign="right">{locale === "ne" ? "किन्ने" : "Buy"}</Text>
                <Text flex="1" textAlign="right">{locale === "ne" ? "बेच्ने" : "Sell"}</Text>
              </Flex>
              {filteredRates.map((rate, index) => (
                <Flex key={rate.iso3} px="16px" py="12px" borderTop="1px solid var(--color-border)" bg={index % 2 === 0 ? "var(--color-surface)" : "var(--color-card-alt)"} align="center">
                  <Flex flex="2" align="center" gap="10px">
                    {getFlagUrl(rate.iso3) && <img src={getFlagUrl(rate.iso3)!} alt={rate.iso3} width="24" height="16" style={{ borderRadius: "2px", border: "1px solid rgba(0,0,0,0.1)" }} />}
                    <Text fontWeight="500" color="var(--color-body)">{rate.name}</Text>
                  </Flex>
                  <Text className="dp-english" flex="1" textAlign="center" fontWeight="600" color="var(--color-subtle)">{rate.iso3}</Text>
                  <Text className="dp-number" flex="1" textAlign="right" color="var(--color-muted)">{rate.unit}</Text>
                  <Text className="dp-number" flex="1" textAlign="right" color="#16a34a" fontWeight="700">{rate.buy}</Text>
                  <Text className="dp-number" flex="1" textAlign="right" color="#dc2626" fontWeight="700">{rate.sell}</Text>
                </Flex>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </PageShell>
  );
}
