"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useLocale } from "@/lib/localeContext";
import Link from "next/link";

type WidgetVariant = "default" | "compact";

export function GoldSilverWidget({ variant = "default" }: { variant?: WidgetVariant }) {
  const { locale } = useLocale();
  const isCompact = variant === "compact";
  const iframeSrc = isCompact 
    ? "https://arthakendra.com/widget/gold-silver-widget?showGraph=false" 
    : "https://arthakendra.com/widget/gold-silver-widget";
  // Set height large enough so it never scrolls internally
  const iframeHeight = isCompact ? "420px" : "1100px";

  return (
    <Box className={isCompact ? "dp-utility-block" : ""} borderBottom={isCompact ? "1px solid var(--color-border)" : "none"}>
      {isCompact && (
        <Flex mb="0" align="center" justify="space-between" gap="8px" p="16px" pb="0">
          <Link href="/gold-silver" style={{ display: "block" }}>
            <Box>
              <Text fontSize="14px" fontWeight="700" color="var(--color-headline)">{locale === "ne" ? "सुन चाँदी दर" : "Gold & silver"}</Text>
              <Text className="dp-english" fontSize="9px" textTransform="uppercase" letterSpacing="0.12em" color="var(--color-muted)">Gold & silver</Text>
            </Box>
          </Link>
          <Link href="/gold-silver" style={{ fontSize: "11px", color: "var(--color-brand)", textDecoration: "underline", fontWeight: 600 }}>
            {locale === "ne" ? "सबै हेर्नुहोस्" : "See all"}
          </Link>
        </Flex>
      )}
      <Box px="0" pt="0" pb="0" position="relative">
        {/* Transparent overlay ONLY on the home page (compact) to intercept clicks */}
        {isCompact && (
          <Link href="/gold-silver" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, display: "block" }} aria-label="View Gold and Silver details"></Link>
        )}
        <iframe 
          style={{ border: "none" }} 
          height={iframeHeight} 
          width="100%" 
          src={iframeSrc}
          title="Gold Silver Widget"
          scrolling="no"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </Box>
    </Box>
  );
}
