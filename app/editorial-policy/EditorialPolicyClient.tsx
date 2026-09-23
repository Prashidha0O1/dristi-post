"use client";

import { Box, Text } from "@chakra-ui/react";
import { PageShell } from "@/components/pageShell";
import { useLocale } from "@/lib/localeContext";

export default function EditorialPolicyClient({ policies }: { policies: any }) {
  const { locale } = useLocale();
  const htmlContent = locale === "ne" ? policies.editorial_ne : policies.editorial_en;

  return (
    <PageShell>
      <Box maxW="800px" mx="auto" px="var(--side-pad)" py="60px">
        <Text as="h1" fontSize="32px" fontWeight="800" color="var(--color-headline)" mb="24px" fontFamily="var(--font-mukta), sans-serif">
          {locale === "ne" ? "सम्पादकीय नीति" : "Editorial Policy"}
        </Text>
        
        <Box 
          color="var(--color-body)" 
          fontSize="17px" 
          lineHeight="1.8" 
          css={{ "& p": { marginBottom: "16px" }, "& h2": { fontSize: "24px", fontWeight: "700", color: "var(--color-headline)", marginTop: "32px", marginBottom: "16px" } }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </Box>
    </PageShell>
  );
}
