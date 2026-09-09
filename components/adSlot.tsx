"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import Image from "next/image";
import { AD_SLOTS, type AdPlacement } from "@/lib/adSlots";
import type { AdRecord } from "@/lib/domain/ad";

/**
 * One advertisement position.
 *
 * Replaces both `frontPage.tsx`'s old three-variant `AdSlot` and the four
 * hand-inlined copies that each page's sidebar had. An unsold slot renders the
 * same grey "विज्ञापन / Advertisement" placeholder the site showed before, so
 * nothing looks broken while a position is empty.
 *
 * Height is driven by the slot's aspect ratio rather than a fixed pixel value.
 * The sidebar boxes used to be `h="200px"` and the rails `minH="250px"`, which
 * would crop a correctly-proportioned creative — an enforced 300x250 in a
 * ~390px-wide sidebar wants ~325px of height. Since uploads are validated
 * against these same ratios, letting the ratio set the height means the image
 * lands exactly, with no letterboxing either way.
 */
export function AdSlot({
  placement,
  ad,
  /** Extra bottom margin — the homepage uses a wider gap for its mid-page banner. */
  mb,
  mt,
}: {
  placement: AdPlacement;
  ad?: AdRecord | null;
  mb?: string;
  mt?: string;
}) {
  const spec = AD_SLOTS[placement];
  const aspectRatio = `${spec.width} / ${spec.height}`;

  // Wide banners were a thin ruled strip; the rails and sidebar were bordered
  // boxes. That distinction is preserved for the empty state below.
  const isBanner = spec.width / spec.height >= 4;

  if (!ad) {
    // Unsold slots keep exactly the placeholder they had before this feature —
    // a full-height 8:1 grey box where the homepage used to show a 48px strip
    // would read as a layout bug rather than an empty ad position. Only the
    // filled state below takes its height from the slot's aspect ratio.
    return isBanner ? (
      <Flex
        className="dp-ad-slot"
        mb={mb}
        mt={mt}
        align="center"
        justify="center"
        color="var(--color-faint)"
        fontSize="10px"
        textTransform="uppercase"
        letterSpacing="0.22em"
      >
        विज्ञापन / Advertisement
      </Flex>
    ) : (
      <Flex
        mb={mb}
        mt={mt}
        align="center"
        justify="center"
        minH="200px"
        borderRadius="4px"
        bg="var(--color-surface)"
        border="1px solid var(--color-border)"
        color="var(--color-faint)"
        fontSize="10px"
        textTransform="uppercase"
        letterSpacing="0.22em"
        textAlign="center"
        px="12px"
      >
        विज्ञापन / Advertisement
      </Flex>
    );
  }

  return (
    <Box mb={mb} mt={mt}>
      <chakra.a
        href={ad.linkUrl}
        target="_blank"
        // `sponsored` is the correct signal for paid placement, and
        // noopener/noreferrer keep the advertiser's page away from ours.
        rel="sponsored noopener noreferrer"
        display="block"
        position="relative"
        aspectRatio={aspectRatio}
        borderRadius="4px"
        overflow="hidden"
        bg="var(--color-card-alt)"
      >
        <Image
          src={ad.imageUrl}
          alt={ad.altText}
          fill
          sizes={spec.minWidth >= 728 ? "100vw" : "400px"}
          style={{ objectFit: "cover" }}
        />
      </chakra.a>
      <Text
        mt="3px"
        fontSize="9px"
        textTransform="uppercase"
        letterSpacing="0.16em"
        color="var(--color-faint)"
        textAlign="right"
      >
        {/* Paid placement should be identifiable as such, not passed off as editorial. */}
        विज्ञापन / Advertisement
      </Text>
    </Box>
  );
}
