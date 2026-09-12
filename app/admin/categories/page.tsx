// Authenticated, per-request admin page: never statically prerendered.
// (Also keeps `next build` from connecting to the database.)
export const dynamic = "force-dynamic";

import { Box, Flex, Text } from "@chakra-ui/react";
import { Info } from "lucide-react";
import { categories } from "@/lib/config";
import { Card, PageHeader, TableHead, TableRow } from "../ui";

export default function CategoriesPage() {
  return (
    <Box>
      <PageHeader title="Categories" subtitle={`${categories.length} defined`} />

      <Box
        mb="20px"
        px="16px"
        py="13px"
        borderRadius="8px"
        bg="var(--color-info-bg)"
        color="var(--color-info-fg)"
        fontSize="13px"
        lineHeight="1.6"
      >
        <Flex gap="9px" align="flex-start">
          <Box mt="1px" flexShrink={0}>
            <Info size={15} strokeWidth={2} aria-hidden="true" />
          </Box>
          <Box>
            <Text fontWeight="700" mb="2px">Read-only</Text>
            <Text>
              These come from <Text as="span" fontFamily="monospace">lib/config.ts</Text> and can&apos;t
              be edited here yet. They must also exist as rows in the Supabase categories table, or
              saving an article in that category will fail.
            </Text>
          </Box>
        </Flex>
      </Box>

      <Card>
        <TableHead>
          <Text w="44px">#</Text>
          <Text flex="1">Name (EN)</Text>
          <Text flex="1">Name (NE)</Text>
          <Text w="140px" display={{ base: "none", md: "block" }}>Slug</Text>
          <Text w="70px" textAlign="center">Colour</Text>
        </TableHead>

        {categories.map((cat, i) => (
          <TableRow key={cat.id}>
            <Text w="44px" color="var(--color-faint)" fontSize="13px">{i + 1}</Text>
            <Text flex="1" fontWeight="600" color="var(--color-headline)" lineClamp={1} pr="10px">
              {cat.name.en}
            </Text>
            <Text flex="1" color="var(--color-body)" lineClamp={1} pr="10px">{cat.name.ne}</Text>
            <Text
              w="140px"
              fontSize="12px"
              color="var(--color-muted)"
              fontFamily="monospace"
              display={{ base: "none", md: "block" }}
            >
              {cat.slug}
            </Text>
            <Flex w="70px" justify="center">
              <Box
                w="22px"
                h="22px"
                borderRadius="5px"
                bg={cat.color || "var(--color-faint)"}
                border="1px solid var(--color-border)"
                title={cat.color}
              />
            </Flex>
          </TableRow>
        ))}
      </Card>
    </Box>
  );
}
