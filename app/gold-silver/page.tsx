import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import { PageShell } from "@/components/pageShell";
import { GoldSilverWidget } from "@/components/goldSilverWidget";

export const metadata = {
  title: "Gold & Silver Rates - Dristi Times",
  description: "Live gold and silver rates in Nepal",
};

export default function GoldSilverPage() {
  return (
    <PageShell>
      <Box maxW="800px" mx="auto" pt="20px" mb="64px">
        <Box borderBottom="2px solid var(--color-nav)" pb="12px" mb="32px">
          <Heading as="h1" fontSize={{ base: "28px", md: "32px" }} fontWeight="800" color="var(--color-headline)">
            सुन चाँदी दर (Gold & Silver Rates)
          </Heading>
          <Text color="var(--color-muted)" fontSize="16px" mt="8px">
            नेपाली बजारमा आजको सुन र चाँदीको भाउ तथा ऐतिहासिक चार्ट।
          </Text>
        </Box>
        
        <Box bg="var(--color-surface)" borderRadius="12px" p={{ base: "16px", md: "32px" }} boxShadow="sm" border="1px solid var(--color-border)">
          <GoldSilverWidget variant="default" />
        </Box>
      </Box>
    </PageShell>
  );
}
