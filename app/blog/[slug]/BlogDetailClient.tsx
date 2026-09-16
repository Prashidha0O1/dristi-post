"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/pageShell";
import { useLocale } from "@/lib/localeContext";
import { formatDate } from "@/lib/time";
import type { LocalisedText } from "@/lib/domain/article";

interface BlogView {
  title: LocalisedText;
  body: LocalisedText;
  heroImage: string;
  publishedAt: string;
}

export default function BlogDetailClient({ blog }: { blog: BlogView }) {
  const { locale } = useLocale();
  const pick = (t: LocalisedText) => (locale === "ne" ? t.ne ?? t.en : t.en ?? t.ne) ?? "";
  const title = pick(blog.title);
  const date = new Date(blog.publishedAt).toLocaleDateString(locale === "ne" ? "ne-NP" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageShell>
      <Box maxW="760px" mx="auto">
        <Flex gap="6px" align="center" mb="14px" fontSize="13px" color="var(--color-muted)">
          <Link href="/blog">
            <Text _hover={{ color: "var(--color-brand)" }} transition="color 0.15s">
              {locale === "ne" ? "ब्लग" : "Blog"}
            </Text>
          </Link>
          <Text>›</Text>
          <Text>{date}</Text>
        </Flex>

        <Text
          as="h1"
          fontSize={{ base: "28px", md: "38px" }}
          fontWeight="800"
          lineHeight="1.25"
          color="var(--color-headline)"
          mb="20px"
        >
          {title}
        </Text>

        <Box position="relative" w="full" h={{ base: "220px", md: "420px" }} borderRadius="12px" overflow="hidden" mb="30px">
          <Image src={blog.heroImage} alt={title} fill style={{ objectFit: "cover" }} sizes="760px" priority />
        </Box>

        <Box
          className="dp-article-body"
          mb="48px"
          fontSize="19px"
          lineHeight="2"
          color="var(--color-body)"
          css={{
            "& p": { marginBottom: "20px", textAlign: "justify", textJustify: "inter-word" },
            "& h1": { fontSize: "32px", fontWeight: 800, margin: "30px 0 14px", lineHeight: 1.2 },
            "& h2": { fontSize: "26px", fontWeight: 700, margin: "28px 0 12px", lineHeight: 1.3 },
            "& h3": { fontSize: "21px", fontWeight: 700, margin: "24px 0 10px", lineHeight: 1.35 },
            "& h4": { fontSize: "19px", fontWeight: 700, margin: "20px 0 8px" },
            "& h5": { fontSize: "17px", fontWeight: 700, margin: "18px 0 6px" },
            "& h6": { fontSize: "15px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", margin: "18px 0 6px" },
            "& ul, & ol": { paddingLeft: "26px", marginBottom: "20px" },
            "& table": { borderCollapse: "collapse", width: "100%", margin: "0 0 20px", tableLayout: "fixed" },
            "& td, & th": { border: "1px solid var(--color-border)", padding: "8px 10px", verticalAlign: "top" },
            "& th": { background: "var(--color-card-alt)", fontWeight: 700, textAlign: "left" },
            "& li": { marginBottom: "8px" },
            "& a": { color: "var(--color-brand)", textDecoration: "underline" },
            "& blockquote": {
              borderLeft: "3px solid var(--color-border)",
              paddingLeft: "16px",
              color: "var(--color-subtle)",
              fontStyle: "italic",
              margin: "0 0 20px",
            },
          }}
        >
          {(() => {
            const body = pick(blog.body);
            if (/<\/?[a-z][\s\S]*>/i.test(body)) {
              return <Box dangerouslySetInnerHTML={{ __html: body }} />;
            }
            return body
              .split(/\n{2,}/)
              .map((s) => s.trim())
              .filter(Boolean)
              .map((paragraph, i) => (
                <Text key={i} mb="20px">{paragraph}</Text>
              ));
          })()}
        </Box>
      </Box>
    </PageShell>
  );
}
