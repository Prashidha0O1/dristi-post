// Authenticated, per-request admin page: never statically prerendered.
// (Also keeps `next build` from connecting to the database.)
export const dynamic = "force-dynamic";

import { Box, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import { Megaphone, Plus } from "lucide-react";
import { getContainer } from "@/lib/container";
import { AD_SLOTS, adPlacements, formatAdSlotSize } from "@/lib/adSlots";
import type { AdRecord } from "@/lib/domain/ad";
import { Badge, ButtonLink, Card, EmptyState, PageHeader } from "../ui";
import {
  activateAdAction,
  deactivateAdAction,
  deleteAdAction,
} from "../adActions";
import { AdRowActions } from "./AdRowActions";

export default async function AdsListPage() {
  const container = getContainer();

  // The ads table may not exist yet (migration unrun). Surface that as an
  // explanation rather than a 500 — the admin is where someone would come to
  // find out why no ads are showing.
  const result = await container.listAds
    .execute({ limit: 200 })
    .then((r) => ({ ok: true as const, items: r.items, total: r.total }))
    .catch((e: unknown) => ({
      ok: false as const,
      items: [] as AdRecord[],
      total: 0,
      message: e instanceof Error ? e.message : String(e),
    }));

  // Grouped by slot rather than listed flat: the question an operator has is
  // "which positions are sold and which are empty", which a flat list buries.
  const bySlot = new Map(adPlacements.map((p) => [p, [] as AdRecord[]]));
  for (const ad of result.items) bySlot.get(ad.placement)?.push(ad);

  const liveCount = result.items.filter((a) => a.isActive).length;

  return (
    <Box>
      <PageHeader
        title="Ads"
        subtitle={
          result.ok
            ? `${liveCount} of ${adPlacements.length} slots filled · ${result.total} total`
            : undefined
        }
        action={
          <ButtonLink href="/admin/ads/new" icon={<Plus size={15} strokeWidth={2.2} aria-hidden="true" />}>
            New Ad
          </ButtonLink>
        }
      />

      {!result.ok && (
        <Box
          mb="20px"
          px="16px"
          py="13px"
          borderRadius="8px"
          bg="var(--color-danger-bg)"
          color="var(--color-danger-fg)"
          fontSize="13px"
          lineHeight="1.6"
        >
          <Text fontWeight="700" mb="2px">Could not load ads</Text>
          <Text>{result.message}</Text>
          <Text mt="6px" opacity={0.85}>
            If this says the table is missing, the ads schema hasn&apos;t been applied to Supabase
            yet.
          </Text>
        </Box>
      )}

      <Flex direction="column" gap="18px">
        {adPlacements.map((placement) => {
          const spec = AD_SLOTS[placement];
          const ads = bySlot.get(placement) ?? [];
          const live = ads.find((a) => a.isActive);

          return (
            <Card key={placement}>
              <Flex
                align={{ base: "flex-start", sm: "center" }}
                justify="space-between"
                direction={{ base: "column", sm: "row" }}
                gap="8px"
                px="18px"
                py="14px"
                borderBottom="1px solid var(--color-border)"
              >
                <Box>
                  <Flex align="center" gap="9px" flexWrap="wrap">
                    <Text fontSize="15px" fontWeight="700" color="var(--color-headline)">
                      {spec.label}
                    </Text>
                    <Badge tone={live ? "success" : "neutral"}>
                      {live ? "live" : "empty"}
                    </Badge>
                    <Text fontSize="12px" color="var(--color-muted)" fontFamily="monospace">
                      {formatAdSlotSize(placement)}
                    </Text>
                  </Flex>
                  <Text fontSize="12px" color="var(--color-muted)" mt="2px">
                    {spec.where}
                  </Text>
                </Box>
                {ads.length > 0 && (
                  <Text fontSize="12px" color="var(--color-faint)">
                    {ads.length} {ads.length === 1 ? "creative" : "creatives"}
                  </Text>
                )}
              </Flex>

              {ads.length === 0 ? (
                <Box px="18px" py="20px">
                  <Text fontSize="13px" color="var(--color-muted)">
                    Nothing here yet — this slot shows the grey placeholder on the site.
                  </Text>
                </Box>
              ) : (
                ads.map((ad) => (
                  <Flex
                    key={ad.id}
                    align="center"
                    gap="14px"
                    px="18px"
                    py="12px"
                    borderBottom="1px solid var(--color-border)"
                    transition="background 0.12s"
                    _hover={{ bg: "var(--color-card-alt)" }}
                    css={{ "&:last-of-type": { borderBottom: "none" } }}
                  >
                    <Box
                      position="relative"
                      w="88px"
                      h="56px"
                      flexShrink={0}
                      borderRadius="4px"
                      overflow="hidden"
                      bg="var(--color-card-alt)"
                      border="1px solid var(--color-border)"
                    >
                      <Image
                        src={ad.imageUrl}
                        alt=""
                        fill
                        sizes="88px"
                        style={{ objectFit: "contain" }}
                        unoptimized
                      />
                    </Box>

                    <Box flex="1" minW="0">
                      <Text fontSize="14px" fontWeight="600" color="var(--color-headline)" lineClamp={1}>
                        {ad.altText}
                      </Text>
                      <Text fontSize="12px" color="var(--color-muted)" lineClamp={1}>
                        {ad.linkUrl}
                      </Text>
                    </Box>

                    <Flex w="70px" justify="center" flexShrink={0}>
                      {ad.isActive && <Badge tone="success">live</Badge>}
                    </Flex>

                    <Box w="190px" flexShrink={0}>
                      <AdRowActions
                        id={ad.id}
                        isActive={ad.isActive}
                        activateAction={activateAdAction.bind(null, ad.id)}
                        deactivateAction={deactivateAdAction.bind(null, ad.id)}
                        deleteAction={deleteAdAction.bind(null, ad.id)}
                      />
                    </Box>
                  </Flex>
                ))
              )}
            </Card>
          );
        })}
      </Flex>

      {result.ok && result.total === 0 && (
        <Box mt="18px">
          <Card>
            <EmptyState
              icon={<Megaphone size={30} strokeWidth={1.5} aria-hidden="true" />}
              title="No ads yet"
              hint="Upload a creative for any slot above. Until then every position shows the placeholder."
              action={
                <ButtonLink href="/admin/ads/new" icon={<Plus size={15} strokeWidth={2.2} aria-hidden="true" />}>
                  New Ad
                </ButtonLink>
              }
            />
          </Card>
        </Box>
      )}
    </Box>
  );
}
