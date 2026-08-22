"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import { unicodeToPreeti } from "@/lib/unicodeToPreeti";

export default function UnicodePreetiPage() {
  const { locale } = useLocale();
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const output = unicodeToPreeti(input);

  function handleCopy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <PageShell>
      <SectionHeader
        title={locale === "ne" ? "युनिकोड → प्रिती रूपान्तरक" : "Unicode → Preeti Converter"}
        accent="var(--color-brand)"
      />

      <Box maxW="700px" mx="auto" py="20px">
        <Text fontSize="14px" color="#666" mb="20px" lineHeight="1.7">
          {locale === "ne"
            ? "तलको बक्समा युनिकोड नेपाली टाइप गर्नुहोस् वा पेस्ट गर्नुहोस्। प्रिती फन्टमा रूपान्तरित पाठ तल देखिनेछ।"
            : "Type or paste Unicode Nepali text in the box below. The converted Preeti font text will appear underneath."}
        </Text>

        <Box mb="16px">
          <Text fontSize="12px" fontWeight="600" color="#555" mb="6px">
            {locale === "ne" ? "युनिकोड इनपुट" : "Unicode Input"}
          </Text>
          <Box
            as="textarea"
            w="full"
            h="150px"
            p="12px"
            border="1px solid #ddd"
            borderRadius="4px"
            fontSize="15px"
            lineHeight="1.8"
            resize="vertical"
            fontFamily="var(--font-mukta), sans-serif"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            placeholder={locale === "ne" ? "यहाँ नेपाली टाइप गर्नुहोस्..." : "Type Nepali text here..."}
          />
        </Box>

        <Box mb="16px">
          <Flex justify="space-between" align="center" mb="6px">
            <Text fontSize="12px" fontWeight="600" color="#555">
              {locale === "ne" ? "प्रिती आउटपुट" : "Preeti Output"}
            </Text>
            <Box
              as="button"
              fontSize="12px"
              fontWeight="600"
              color={copied ? "#16a34a" : "var(--color-brand)"}
              bg="transparent"
              border="none"
              cursor="pointer"
              onClick={handleCopy}
              disabled={!output}
            >
              {copied
                ? (locale === "ne" ? "कपी भयो ✓" : "Copied ✓")
                : (locale === "ne" ? "कपी गर्नुहोस्" : "Copy")}
            </Box>
          </Flex>
          <Box
            as="textarea"
            w="full"
            h="150px"
            p="12px"
            border="1px solid #ddd"
            borderRadius="4px"
            fontSize="15px"
            lineHeight="1.8"
            resize="vertical"
            bg="#f9f9f9"
            fontFamily="Preeti, sans-serif"
            value={output}
            readOnly
          />
        </Box>
      </Box>
    </PageShell>
  );
}
