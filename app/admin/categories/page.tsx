import { Box, Flex, Text } from "@chakra-ui/react";
import { categories } from "@/lib/config";

export default function CategoriesPage() {
  return (
    <Box>
      <Text fontSize="24px" fontWeight="800" color="var(--color-headline)" mb="24px">
        Categories
      </Text>

      <Box bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" overflow="hidden">
        <Flex bg="var(--color-card-alt)" px="16px" py="10px" fontWeight="700" fontSize="12px" color="var(--color-muted)" textTransform="uppercase" letterSpacing="0.5px">
          <Text w="40px">#</Text>
          <Text flex="1">Name (EN)</Text>
          <Text flex="1">Name (NE)</Text>
          <Text w="100px">Slug</Text>
          <Text w="80px" textAlign="center">Color</Text>
        </Flex>

        {categories.map((cat, i) => (
          <Flex key={cat.id} px="16px" py="12px" borderTop="1px solid var(--color-border)" align="center" fontSize="14px">
            <Text w="40px" color="var(--color-muted)">{i + 1}</Text>
            <Text flex="1" fontWeight="600" color="var(--color-headline)">{cat.name.en}</Text>
            <Text flex="1" color="var(--color-body)">{cat.name.ne}</Text>
            <Text w="100px" fontSize="12px" color="var(--color-muted)" fontFamily="monospace">{cat.slug}</Text>
            <Flex w="80px" justify="center">
              <Box w="20px" h="20px" borderRadius="4px" bg={cat.color || "#888"} />
            </Flex>
          </Flex>
        ))}
      </Box>

      <Text fontSize="12px" color="var(--color-muted)" mt="16px">
        Category management will be fully editable once the database is connected. Currently showing config-defined categories.
      </Text>
    </Box>
  );
}
