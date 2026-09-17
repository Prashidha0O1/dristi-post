"use client";

import { Box, Flex, Grid, SimpleGrid, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useLocale } from "@/lib/localeContext";
import { useSettings } from "@/lib/settingsContext";

function formatWhatsApp(wa: string | undefined) {
  if (!wa) return "#";
  if (wa.startsWith("http")) return wa;
  const clean = wa.replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}`;
}
import { categories } from "@/lib/config";

const SOCIALS = [
  {
    name: "Facebook",
    href: "https://facebook.com/",
    path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.014-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    name: "X",
    href: "https://x.com/",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/",
    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z",
  },
];

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text mb="12px" color="white" fontSize="12px" fontWeight="700" textTransform="uppercase" letterSpacing="0.14em">
      {children}
    </Text>
  );
}

export function Footer() {
  const { t, localized, locale } = useLocale();
  const { footer } = useSettings();
  
  const topSlugs = ["politics", "society", "economy", "health", "sports", "entertainment", "tourism", "blog", "education", "science-tech"];
  const footerCategories = [
    ...categories.filter(c => topSlugs.includes(c.slug)).slice(0, 10),
    { id: "province", slug: "province", name: { ne: "प्रदेश", en: "Provinces" } }
  ];


  return (
    <Box as="footer" className="dp-footer" bg="var(--color-nav)" color="rgba(255,255,255,0.7)">
      <Box maxW="var(--max-content)" mx="auto" px="var(--side-pad)" pt="40px" pb="24px">
        <Grid className="dp-footer-grid" templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(2, minmax(0, 1fr))", lg: "1.35fr repeat(3, minmax(0, 1fr))" }} gap={{ base: "28px", md: "32px" }} mb="32px">
          <Box gridColumn={{ base: "1 / -1", md: "auto" }}>
            <Text fontSize="25px" fontWeight="800" lineHeight="1" fontFamily="var(--font-mukta), sans-serif">
              <Text as="span" color="var(--color-brand)">{locale === "ne" ? "दृष्टि" : "Dristi"}</Text>{" "}
              <Text as="span" color="white">{locale === "ne" ? "टाइम्स" : "Times"}</Text>
            </Text>
            <Text mt="12px" maxW="260px" color="rgba(255,255,255,0.55)" fontSize="13px" lineHeight="1.6">
              {locale === "ne" ? footer.description_ne || "नेपालका समाचार, विचार र उपयोगी जानकारीलाई स्पष्ट र जिम्मेवार ढंगले प्रस्तुत गर्ने डिजिटल न्यूजरुम।" : footer.description_en || "A digital newsroom presenting Nepal's news, ideas, and useful information with clarity and responsibility."}
            </Text>
            <Box mt="16px" fontSize="11px" color="rgba(255,255,255,0.4)" lineHeight="1.6">
              <Text>{locale === "ne" ? "कम्पनी दर्ता नं.:" : "Company Reg. No.:"} {footer.companyRegNo}</Text>
              <Text>{locale === "ne" ? "सूचना विभाग दर्ता नं.:" : "Media Reg. No.:"} {footer.mediaRegNo}</Text>
            </Box>
            <Text className="dp-english" mt="16px" color="rgba(255,255,255,0.4)" fontSize="10px" textTransform="uppercase" letterSpacing="0.14em">
              Nepal&apos;s trusted newsroom
            </Text>
          </Box>

          <Box gridColumn={{ base: "1 / -1", md: "auto" }}>
            <FooterHeading>{t("categories")}</FooterHeading>
            <SimpleGrid columns={2} gapY="8px" fontSize="13px">
              {footerCategories.map((category) => (
                <Link key={category.id} href={category.id === "province" ? "/province/koshi" : `/${category.slug}`}>
                  <Text _hover={{ color: "white" }} transition="color 150ms ease">{localized(category.name)}</Text>
                </Link>
              ))}
              <Link href="/jobs">
                  <Text _hover={{ color: "white" }} transition="color 150ms ease">{locale === "ne" ? "रोजगारी" : "Jobs"}</Text>
                </Link>
            </SimpleGrid>
          </Box>

          <Box>
            <FooterHeading>{locale === "ne" ? "उपकरणहरू" : "Tools"}</FooterHeading>
            <Flex direction="column" gap="8px" fontSize="13px">
              <Link href="/calendar"><Text _hover={{ color: "white" }} transition="color 150ms ease">{locale === "ne" ? "पात्रो" : "Calendar"}</Text></Link>
              <Link href="/date-converter"><Text _hover={{ color: "white" }} transition="color 150ms ease">{locale === "ne" ? "मिति रूपान्तरक" : "Date Converter"}</Text></Link>
              <Link href="/unicode-preeti"><Text _hover={{ color: "white" }} transition="color 150ms ease">{locale === "ne" ? "युनिकोड → प्रिती" : "Unicode → Preeti"}</Text></Link>
              <Link href="/rashifal"><Text _hover={{ color: "white" }} transition="color 150ms ease">{locale === "ne" ? "राशिफल" : "Rashifal"}</Text></Link>
              <Link href="/forex"><Text _hover={{ color: "white" }} transition="color 150ms ease">{locale === "ne" ? "विदेशी मुद्रा" : "Forex"}</Text></Link>
              <Link href="/gold-silver"><Text _hover={{ color: "white" }} transition="color 150ms ease">{locale === "ne" ? "सुन चाँदी दर" : "Gold & Silver"}</Text></Link>
            </Flex>
          </Box>

          

          <Box wordBreak="break-word">
            <Box mb="24px">
              <FooterHeading>{locale === "ne" ? "विज्ञापनका लागि सम्पर्क" : "Contact for advertisement"}</FooterHeading>
              <Flex direction="column" gap="6px" fontSize="13px" color="rgba(255,255,255,0.7)">
                <a href={`mailto:${footer.email}`} style={{ display: "inline-block" }}>
                  <Text _hover={{ color: "white" }} transition="color 150ms ease">{footer.email ? `Email: ${footer.email}` : "Email"}</Text>
                </a>
                <a href={`tel:${footer.phone}`} style={{ display: "inline-block" }}>
                  <Text className="dp-english" _hover={{ color: "white" }} transition="color 150ms ease">{footer.phone ? `Phone: ${footer.phone}` : "Phone"}</Text>
                </a>
                <a href={formatWhatsApp(footer.whatsapp)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
                  <Text className="dp-english" _hover={{ color: "white" }} transition="color 150ms ease">{footer.whatsapp ? `WhatsApp: ${footer.whatsapp}` : "WhatsApp"}</Text>
                </a>
              </Flex>
            </Box>

            <FooterHeading>{locale === "ne" ? "हामीसँग जोडिनुहोस्" : "Stay connected"}</FooterHeading>
            <Flex gap="8px">
              
              {SOCIALS.map((social) => {
                const dbHref = social.name === "Facebook" ? footer.socialFacebook :
                               social.name === "X" ? footer.socialX :
                               social.name === "TikTok" ? footer.socialTiktok : social.href;
                return (
                <a
                  key={social.name}
                  className="dp-social-link"
                  href={dbHref || social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={social.path} />
                  </svg>
                </a>
                );
              })}

            </Flex>
          </Box>
        </Grid>

        <Flex borderTop="1px solid rgba(255,255,255,0.12)" pt="16px" gap="8px" direction={{ base: "column", sm: "row" }} align={{ base: "flex-start", sm: "center" }} justify="space-between" color="rgba(255,255,255,0.4)" fontSize="11px">
          <Text>© {locale === "ne" ? "२०८३ दृष्टि टाइम्स। सर्वाधिकार सुरक्षित।" : "2026 Dristi Times. All rights reserved."}</Text>
          <Text className="dp-english">Editorial policy · Privacy · Contact</Text>
        </Flex>
      </Box>
    </Box>
  );
}
