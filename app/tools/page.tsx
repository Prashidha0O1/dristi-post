"use client";

import { Box, Grid, Flex, Text, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { useLocale } from "@/lib/localeContext";
import { CalendarDays, DollarSign, Sparkles, ArrowRightLeft, Languages, Clock } from "lucide-react";

export default function ToolsPage() {
  const { locale } = useLocale();
  
  const tools = [
    {
      id: "calendar",
      href: "/calendar",
      titleNe: "पात्रो",
      titleEn: "Calendar",
      descNe: "नेपाली मिति, चाडपर्व, बिदा र साइतको विस्तृत जानकारी।",
      descEn: "Detailed Nepali date, festivals, holidays, and auspicious timings.",
      icon: <CalendarDays style={{ width: "32px", height: "32px", color: "var(--color-brand)" }} />
    },
    {
      id: "date-converter",
      href: "/date-converter",
      titleNe: "मिति रूपान्तरक",
      titleEn: "Date Converter",
      descNe: "वि.सं. बाट ई.सं. र ई.सं. बाट वि.सं. मा मिति सजिलै परिवर्तन गर्नुहोस्।",
      descEn: "Easily convert dates between BS (Nepali) and AD (English).",
      icon: <ArrowRightLeft style={{ width: "32px", height: "32px", color: "var(--color-brand)" }} />
    },
    {
      id: "unicode-preeti",
      href: "/unicode-preeti",
      titleNe: "युनिकोड ↔ प्रिती",
      titleEn: "Unicode ↔ Preeti",
      descNe: "नेपाली युनिकोडलाई प्रिती फन्टमा र प्रितीलाई युनिकोडमा बदल्नुहोस्।",
      descEn: "Convert Nepali Unicode to Preeti font and vice-versa.",
      icon: <Languages style={{ width: "32px", height: "32px", color: "var(--color-brand)" }} />
    },
    {
      id: "rashifal",
      href: "/rashifal",
      titleNe: "राशिफल",
      titleEn: "Rashifal (Horoscope)",
      descNe: "तपाईंको दैनिक, साप्ताहिक र मासिक राशिफल पढ्नुहोस्।",
      descEn: "Read your daily, weekly, and monthly horoscope predictions.",
      icon: <Sparkles style={{ width: "32px", height: "32px", color: "var(--color-brand)" }} />
    },
    {
      id: "forex",
      href: "/forex",
      titleNe: "विदेशी मुद्रा विनिमय",
      titleEn: "Foreign Exchange",
      descNe: "नेपाल राष्ट्र बैंकको आजको विदेशी मुद्रा खरिद तथा बिक्री दर।",
      descEn: "Today's foreign exchange buying and selling rates from NRB.",
      icon: <DollarSign style={{ width: "32px", height: "32px", color: "var(--color-brand)" }} />
    },
    {
      id: "gold-silver",
      href: "/",
      titleNe: "सुन चाँदी दर",
      titleEn: "Gold & Silver",
      descNe: "आजको सुन र चाँदीको बजार भाउको जानकारी।",
      descEn: "Today's market rates for Gold and Silver.",
      icon: <Clock style={{ width: "32px", height: "32px", color: "var(--color-brand)" }} />
    }
  ];

  return (
    <PageShell>
      <Box mb="48px">
        <Box borderBottom="2px solid var(--color-nav)" pb="12px" mb="32px">
          <Heading as="h1" fontSize="32px" fontWeight="800" color="var(--color-headline)">
            {locale === "ne" ? "उपकरणहरू (Tools)" : "Tools"}
          </Heading>
          <Text color="var(--color-muted)" fontSize="15px" mt="8px">
            {locale === "ne" 
              ? "तपाईंको दैनिक जीवनमा आवश्यक पर्ने उपयोगी डिजिटल उपकरणहरू।"
              : "Useful digital tools for your everyday needs."}
          </Text>
        </Box>
        
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="24px">
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.href} style={{ display: "block" }}>
              <Flex 
                direction="column" 
                bg="var(--color-surface)" 
                border="1px solid var(--color-border)" 
                borderRadius="8px" 
                p="24px" 
                h="100%"
                transition="all 0.2s"
                _hover={{ borderColor: "var(--color-brand)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transform: "translateY(-2px)" }}
              >
                <Flex align="center" gap="16px" mb="12px">
                  <Box bg="var(--color-page)" p="12px" borderRadius="12px">
                    {tool.icon}
                  </Box>
                  <Heading as="h2" fontSize="20px" fontWeight="700" color="var(--color-headline)">
                    {locale === "ne" ? tool.titleNe : tool.titleEn}
                  </Heading>
                </Flex>
                <Text color="var(--color-body)" fontSize="14px" lineHeight="1.6">
                  {locale === "ne" ? tool.descNe : tool.descEn}
                </Text>
              </Flex>
            </Link>
          ))}
        </Grid>
      </Box>
    </PageShell>
  );
}
