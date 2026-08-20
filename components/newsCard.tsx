"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { useLocale } from "@/lib/localeContext";
import { TimeAgo } from "./timeAgo";

interface NewsCardProps {
  article: Article;
  variant?: "hero" | "featured" | "standard" | "compact" | "list";
  showCategory?: boolean;
  showExcerpt?: boolean;
  showTimestamp?: boolean;
  showAuthor?: boolean;
  imageHeight?: string;
}

export function NewsCard({
  article,
  variant = "standard",
  showCategory = true,
  showExcerpt = false,
  showTimestamp = true,
  showAuthor = false,
  imageHeight,
}: NewsCardProps) {
  const { localized } = useLocale();

  const title = localized(article.title);
  const excerpt = localized(article.excerpt);
  const categoryName = localized(article.category.name);
  const authorName = localized(article.author.name);
  const catColor = article.category.color || "var(--color-brand)";

  // List: text-first, small thumbnail right
  if (variant === "list") {
    return (
      <Link href={`/article/${article.slug}`}>
        <Flex
          gap="12px"
          py="12px"
          borderBottom="1px solid #eee"
          _hover={{ "& .title": { color: "var(--color-brand)" } }}
          cursor="pointer"
        >
          <Box flex="1" minW="0">
            {showCategory && (
              <Text fontSize="11px" fontWeight="700" color={catColor} textTransform="uppercase" mb="3px" letterSpacing="0.5px">
                {categoryName}
              </Text>
            )}
            <Text className="title" fontWeight="700" fontSize="15px" lineHeight="1.5" lineClamp={2} color="#1a1a1a" transition="color 0.15s">
              {title}
            </Text>
            {showTimestamp && <TimeAgo date={article.publishedAt} fontSize="12px" color="#999" mt="4px" />}
          </Box>
          <Box position="relative" w="80px" h="60px" flexShrink={0} borderRadius="3px" overflow="hidden">
            <Image src={article.image} alt={title} fill style={{ objectFit: "cover" }} sizes="80px" />
          </Box>
        </Flex>
      </Link>
    );
  }

  // Compact: smaller image + headline, for sidebar / secondary
  if (variant === "compact") {
    return (
      <Link href={`/article/${article.slug}`}>
        <Box _hover={{ "& .title": { color: "var(--color-brand)" }, "& .img img": { transform: "scale(1.03)" } }} cursor="pointer">
          <Box className="img" position="relative" w="full" h={imageHeight || "140px"} overflow="hidden" borderRadius="3px" mb="10px">
            <Image src={article.image} alt={title} fill style={{ objectFit: "cover", transition: "transform 0.4s" }} sizes="(max-width: 768px) 50vw, 25vw" />
          </Box>
          {showCategory && (
            <Text fontSize="11px" fontWeight="700" color={catColor} textTransform="uppercase" mb="4px" letterSpacing="0.5px">
              {categoryName}
            </Text>
          )}
          <Text className="title" fontWeight="700" fontSize="16px" lineHeight="1.4" lineClamp={2} color="#1a1a1a" transition="color 0.15s">
            {title}
          </Text>
          {showTimestamp && <TimeAgo date={article.publishedAt} fontSize="12px" color="#999" mt="6px" />}
        </Box>
      </Link>
    );
  }

  // Hero: large lead story with overlay text
  if (variant === "hero") {
    return (
      <Link href={`/article/${article.slug}`}>
        <Box
          position="relative"
          borderRadius="4px"
          overflow="hidden"
          _hover={{ "& .img img": { transform: "scale(1.02)" } }}
          cursor="pointer"
          h="full"
        >
          <Box className="img" position="relative" w="full" h={imageHeight || "480px"} overflow="hidden">
            <Image src={article.image} alt={title} fill style={{ objectFit: "cover", transition: "transform 0.6s ease" }} sizes="(max-width: 768px) 100vw, 66vw" priority />
          </Box>
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            bg="linear-gradient(transparent 0%, rgba(0,0,0,0.85) 100%)"
            p={{ base: "20px", md: "30px" }}
            pt={{ base: "80px", md: "120px" }}
          >
            {article.isBreaking && (
              <Text display="inline-block" bg="var(--color-brand)" color="white" fontSize="10px" fontWeight="700" px="8px" py="2px" borderRadius="1px" textTransform="uppercase" letterSpacing="1px" mb="10px">
                Breaking
              </Text>
            )}
            {showCategory && (
              <Text fontSize="12px" fontWeight="600" color="rgba(255,255,255,0.7)" textTransform="uppercase" mb="6px" letterSpacing="1px">
                {categoryName}
              </Text>
            )}
            <Text fontWeight="800" fontSize={{ base: "24px", md: "32px" }} lineHeight="1.25" color="white" lineClamp={3} mb="8px">
              {title}
            </Text>
            {showExcerpt && (
              <Text fontSize="15px" color="rgba(255,255,255,0.7)" lineClamp={2} lineHeight="1.6" mb="8px" display={{ base: "none", md: "block" }}>
                {excerpt}
              </Text>
            )}
            <Flex align="center" gap="12px">
              {showAuthor && <Text fontSize="13px" color="rgba(255,255,255,0.6)" fontWeight="500">{authorName}</Text>}
              {showTimestamp && <TimeAgo date={article.publishedAt} fontSize="13px" color="rgba(255,255,255,0.5)" />}
            </Flex>
          </Box>
        </Box>
      </Link>
    );
  }

  // Featured: image top, strong headline, for secondary stories
  if (variant === "featured") {
    return (
      <Link href={`/article/${article.slug}`}>
        <Box
          _hover={{ "& .title": { color: "var(--color-brand)" }, "& .img img": { transform: "scale(1.03)" } }}
          cursor="pointer"
          h="full"
        >
          <Box className="img" position="relative" w="full" h={imageHeight || "200px"} overflow="hidden" borderRadius="3px" mb="12px">
            <Image src={article.image} alt={title} fill style={{ objectFit: "cover", transition: "transform 0.4s" }} sizes="(max-width: 768px) 100vw, 33vw" />
            {article.isBreaking && (
              <Text position="absolute" top="8px" left="8px" bg="var(--color-brand)" color="white" fontSize="10px" fontWeight="700" px="7px" py="2px" borderRadius="1px" textTransform="uppercase" letterSpacing="0.5px">
                Breaking
              </Text>
            )}
          </Box>
          {showCategory && (
            <Text fontSize="11px" fontWeight="700" color={catColor} textTransform="uppercase" mb="4px" letterSpacing="0.5px">
              {categoryName}
            </Text>
          )}
          <Text className="title" fontWeight="700" fontSize="18px" lineHeight="1.4" lineClamp={3} color="#1a1a1a" transition="color 0.15s" mb="6px">
            {title}
          </Text>
          {showExcerpt && (
            <Text fontSize="14px" color="#666" lineClamp={2} lineHeight="1.6" mb="6px">
              {excerpt}
            </Text>
          )}
          <Flex align="center" gap="8px">
            {showAuthor && <Text fontSize="12px" color="#999" fontWeight="500">{authorName}</Text>}
            {showTimestamp && <TimeAgo date={article.publishedAt} fontSize="12px" color="#999" />}
          </Flex>
        </Box>
      </Link>
    );
  }

  // Standard: clean card with subtle border, default
  return (
    <Link href={`/article/${article.slug}`}>
      <Box
        bg="white"
        borderRadius="4px"
        overflow="hidden"
        border="1px solid #eee"
        _hover={{ "& .title": { color: "var(--color-brand)" }, "& .img img": { transform: "scale(1.03)" } }}
        transition="box-shadow 0.2s"
        cursor="pointer"
        h="full"
      >
        <Box className="img" position="relative" w="full" h={imageHeight || "180px"} overflow="hidden">
          <Image src={article.image} alt={title} fill style={{ objectFit: "cover", transition: "transform 0.4s" }} sizes="(max-width: 768px) 100vw, 25vw" />
          {article.isBreaking && (
            <Text position="absolute" top="8px" left="8px" bg="var(--color-brand)" color="white" fontSize="10px" fontWeight="700" px="7px" py="2px" borderRadius="1px" textTransform="uppercase" letterSpacing="0.5px">
              Breaking
            </Text>
          )}
        </Box>
        <Box p="14px">
          {showCategory && (
            <Text fontSize="11px" fontWeight="700" color={catColor} textTransform="uppercase" mb="4px" letterSpacing="0.5px">
              {categoryName}
            </Text>
          )}
          <Text className="title" fontWeight="700" fontSize="17px" lineHeight="1.4" lineClamp={2} color="#1a1a1a" transition="color 0.15s" mb="6px">
            {title}
          </Text>
          {showExcerpt && (
            <Text fontSize="14px" color="#666" lineClamp={2} lineHeight="1.6" mb="6px">
              {excerpt}
            </Text>
          )}
          <Flex align="center" gap="8px" justify="space-between">
            {showAuthor && <Text fontSize="12px" color="#999" fontWeight="500">{authorName}</Text>}
            {showTimestamp && <TimeAgo date={article.publishedAt} fontSize="12px" color="#999" />}
          </Flex>
        </Box>
      </Box>
    </Link>
  );
}
