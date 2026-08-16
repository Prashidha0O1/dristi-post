"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { useLocale } from "@/lib/locale-context";
import { TimeAgo } from "./time-ago";

interface NewsCardProps {
  article: Article;
  variant?: "hero" | "medium" | "small" | "horizontal" | "list";
  showCategory?: boolean;
  showExcerpt?: boolean;
  showTimestamp?: boolean;
  showAuthor?: boolean;
  imageHeight?: string;
}

export function NewsCard({
  article,
  variant = "medium",
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
  const catColor = article.category.color || "#2260bf";

  if (variant === "list") {
    return (
      <Link href={`/article/${article.slug}`}>
        <Flex
          gap="12px"
          py="12px"
          borderBottom="1px solid #f0f0f0"
          _hover={{ "& .card-title": { color: "#2260bf" } }}
          transition="all 0.15s"
          cursor="pointer"
        >
          <Box flex="1" minW="0">
            {showCategory && (
              <Text
                fontSize="13px"
                fontWeight="700"
                color={catColor}
                textTransform="uppercase"
                mb="4px"
                letterSpacing="0.3px"
              >
                {categoryName}
              </Text>
            )}
            <Text
              className="card-title"
              fontWeight="700"
              fontSize="17px"
              lineHeight="1.45"
              noOfLines={2}
              color="#1a1a2e"
              transition="color 0.15s"
            >
              {title}
            </Text>
            {showTimestamp && (
              <TimeAgo date={article.publishedAt} fontSize="13px" color="#999" mt="6px" />
            )}
          </Box>
          <Box
            position="relative"
            w="100px"
            h="72px"
            flexShrink={0}
            borderRadius="6px"
            overflow="hidden"
          >
            <Image src={article.image} alt={title} fill style={{ objectFit: "cover" }} sizes="100px" />
          </Box>
        </Flex>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${article.slug}`}>
        <Flex
          gap="16px"
          _hover={{ "& .card-title": { color: "#2260bf" } }}
          transition="all 0.15s"
          cursor="pointer"
        >
          <Box
            position="relative"
            w="140px"
            h="95px"
            flexShrink={0}
            borderRadius="6px"
            overflow="hidden"
          >
            <Image src={article.image} alt={title} fill style={{ objectFit: "cover" }} sizes="140px" />
          </Box>
          <Box flex="1" minW="0">
            {showCategory && (
              <Text
                fontSize="13px"
                fontWeight="700"
                color={catColor}
                textTransform="uppercase"
                mb="4px"
                letterSpacing="0.3px"
              >
                {categoryName}
              </Text>
            )}
            <Text
              className="card-title"
              fontWeight="700"
              fontSize="17px"
              lineHeight="1.45"
              noOfLines={2}
              color="#1a1a2e"
              transition="color 0.15s"
            >
              {title}
            </Text>
            {showTimestamp && (
              <TimeAgo date={article.publishedAt} fontSize="13px" color="#999" mt="6px" />
            )}
          </Box>
        </Flex>
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link href={`/article/${article.slug}`}>
        <Box
          position="relative"
          borderRadius="10px"
          overflow="hidden"
          _hover={{ "& .hero-image img": { transform: "scale(1.03)" } }}
          transition="all 0.3s"
          cursor="pointer"
          h="full"
        >
          <Box className="hero-image" position="relative" w="full" h={imageHeight || "460px"}>
            <Image src={article.image} alt={title} fill style={{ objectFit: "cover", transition: "transform 0.5s ease" }} sizes="(max-width: 768px) 100vw, 66vw" priority />
          </Box>
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            bg="linear-gradient(transparent, rgba(0,0,0,0.8))"
            p={{ base: "20px", md: "32px" }}
            pt={{ base: "80px", md: "100px" }}
          >
            {article.isBreaking && (
              <Box display="inline-block" bg="#c0392b" color="white" fontSize="12px" fontWeight="700" px="12px" py="4px" borderRadius="3px" textTransform="uppercase" letterSpacing="0.5px" mb="12px">
                Breaking
              </Box>
            )}
            {showCategory && (
              <Text fontSize="14px" fontWeight="600" color="rgba(255,255,255,0.85)" textTransform="uppercase" mb="8px" letterSpacing="0.5px">
                {categoryName}
              </Text>
            )}
            <Text fontWeight="800" fontSize={{ base: "22px", md: "30px" }} lineHeight="1.3" color="white" noOfLines={3} mb="10px">
              {title}
            </Text>
            {showExcerpt && (
              <Text fontSize="16px" color="rgba(255,255,255,0.8)" noOfLines={2} lineHeight="1.5" mb="10px" display={{ base: "none", md: "block" }}>
                {excerpt}
              </Text>
            )}
            <Flex align="center" gap="14px">
              {showAuthor && (
                <Text fontSize="14px" color="rgba(255,255,255,0.7)" fontWeight="500">
                  {authorName}
                </Text>
              )}
              {showTimestamp && (
                <TimeAgo date={article.publishedAt} fontSize="14px" color="rgba(255,255,255,0.7)" />
              )}
            </Flex>
          </Box>
        </Box>
      </Link>
    );
  }

  // medium variant (also used for "small" now)
  return (
    <Link href={`/article/${article.slug}`}>
      <Box
        borderRadius="8px"
        overflow="hidden"
        bg="white"
        border="1px solid #eee"
        _hover={{ shadow: "0 4px 16px rgba(0,0,0,0.08)", "& .card-title": { color: "#2260bf" }, "& .card-image img": { transform: "scale(1.03)" } }}
        transition="all 0.2s"
        cursor="pointer"
        h="full"
      >
        <Box className="card-image" position="relative" w="full" h={imageHeight || "180px"} overflow="hidden">
          <Image src={article.image} alt={title} fill style={{ objectFit: "cover", transition: "transform 0.4s ease" }} sizes="(max-width: 768px) 100vw, 25vw" />
          {article.isBreaking && (
            <Box position="absolute" top="10px" left="10px" bg="#c0392b" color="white" fontSize="11px" fontWeight="700" px="10px" py="3px" borderRadius="3px" textTransform="uppercase" letterSpacing="0.5px">
              Breaking
            </Box>
          )}
        </Box>
        <Box p="14px">
          {showCategory && (
            <Text fontSize="13px" fontWeight="700" color={catColor} textTransform="uppercase" mb="6px" letterSpacing="0.3px">
              {categoryName}
            </Text>
          )}
          <Text className="card-title" fontWeight="700" fontSize="18px" lineHeight="1.4" noOfLines={2} color="#1a1a2e" transition="color 0.15s" mb="8px">
            {title}
          </Text>
          {showExcerpt && (
            <Text fontSize="15px" color="#666" noOfLines={2} lineHeight="1.55" mb="8px">
              {excerpt}
            </Text>
          )}
          <Flex align="center" gap="8px" justify="space-between">
            {showAuthor && (
              <Text fontSize="13px" color="#999" fontWeight="500">{authorName}</Text>
            )}
            {showTimestamp && (
              <TimeAgo date={article.publishedAt} fontSize="13px" color="#999" />
            )}
          </Flex>
        </Box>
      </Box>
    </Link>
  );
}
