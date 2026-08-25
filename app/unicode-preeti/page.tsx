"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import { useState } from "react";
import { PageShell } from "@/components/pageShell";
import { SectionHeader } from "@/components/sectionHeader";
import { useLocale } from "@/lib/localeContext";
import { unicodeToPreeti } from "@/lib/unicodeToPreeti";
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";

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
        title={locale === "ne" ? "नेपाली टाइपिंग → प्रिती रूपान्तरक" : "Nepali Typing → Preeti Converter"}
        accent="var(--color-brand)"
      />

      <Box maxW="700px" mx="auto" py="20px">
        <Text fontSize="14px" color="var(--color-subtle)" mb="20px" lineHeight="1.7">
          {locale === "ne"
            ? "तलको बक्समा नेपाली युनिकोड वा रोमन (Mero) टाइप गर्नुहोस्। प्रिती फन्टमा रूपान्तरित पाठ तल देखिनेछ।"
            : "Type or paste Nepali Unicode or Romanized (Mero) text below. The converted Preeti font text will appear underneath."}
        </Text>

        <Box mb="16px">
          <Text fontSize="12px" fontWeight="600" color="var(--color-subtle)" mb="6px">
            {locale === "ne" ? "इनपुट" : "Input"}
          </Text>
          <Box w="full">
            <ReactTransliterate
              value={input}
              onChangeText={(text) => setInput(text)}
              lang="ne"
              placeholder={locale === "ne" ? "यहाँ टाइप गर्नुहोस् (मेरो नाम वा mero naam)..." : "Type here (मेरो नाम or mero naam)..."}
              renderComponent={(props) => (
                <chakra.textarea
                  w="full"
                  h="150px"
                  p="12px"
                  border="1px solid var(--color-input-border)"
                  borderRadius="4px"
                  fontSize="15px"
                  lineHeight="1.8"
                  fontFamily="var(--font-mukta), sans-serif"
                  bg="var(--color-input-bg)"
                  color="var(--color-body)"
                  resize="vertical"
                  _focus={{
                    outline: "2px solid var(--color-brand)",
                    outlineOffset: "-1px",
                  }}
                  {...props}
                />
              )}
            />
          </Box>
        </Box>

        <Box mb="16px">
          <Flex justify="space-between" align="center" mb="6px">
            <Text fontSize="12px" fontWeight="600" color="var(--color-subtle)">
              {locale === "ne" ? "प्रिती आउटपुट" : "Preeti Output"}
            </Text>
            <chakra.button
              fontSize="12px"
              fontWeight="600"
              color={copied ? "#16a34a" : "var(--color-brand)"}
              bg="transparent"
              border="none"
              cursor="pointer"
              onClick={handleCopy}
            >
              {copied
                ? (locale === "ne" ? "कपी भयो ✓" : "Copied ✓")
                : (locale === "ne" ? "कपी गर्नुहोस्" : "Copy")}
            </chakra.button>
          </Flex>
          <chakra.textarea
            w="full"
            h="150px"
            p="12px"
            border="1px solid var(--color-input-border)"
            borderRadius="4px"
            fontSize="20px"
            lineHeight="1.5"
            bg="var(--color-card-alt)"
            color="var(--color-body)"
            className="dp-preeti-font"
            value={output}
            readOnly
          />
        </Box>
      </Box>
    </PageShell>
  );
}
