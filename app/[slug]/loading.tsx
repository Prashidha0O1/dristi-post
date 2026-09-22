"use client";

import { Grid, GridItem, Box, Skeleton, Flex } from "@chakra-ui/react";
import { PageShell } from "@/components/pageShell";

export default function CategoryLoading() {
  return (
    <PageShell>
      <Skeleton height="36px" width="200px" mb="24px" borderRadius="4px" />
      
      <Grid templateColumns={{ base: "1fr", lg: "8fr 4fr" }} gap="32px">
        {/* Main Content Skeleton */}
        <GridItem>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="24px">
            {[...Array(6)].map((_, i) => (
              <GridItem key={i}>
                <Box bg="var(--color-surface)" borderRadius="8px" overflow="hidden" boxShadow="0 2px 8px rgba(0,0,0,0.05)">
                  <Skeleton height="200px" width="100%" />
                  <Box p="16px">
                    <Skeleton height="16px" width="40px" mb="12px" borderRadius="4px" />
                    <Skeleton height="24px" width="100%" mb="8px" />
                    <Skeleton height="24px" width="80%" mb="12px" />
                    <Skeleton height="14px" width="120px" />
                  </Box>
                </Box>
              </GridItem>
            ))}
          </Grid>
        </GridItem>
        
        {/* Sidebar Skeleton */}
        <GridItem>
          <Box bg="var(--color-surface)" p="20px" borderRadius="8px" mb="24px">
            <Skeleton height="24px" width="140px" mb="20px" />
            <Flex direction="column" gap="16px">
              {[...Array(5)].map((_, i) => (
                <Flex key={i} gap="12px">
                  <Skeleton height="60px" width="80px" borderRadius="4px" />
                  <Box flex="1">
                    <Skeleton height="16px" width="100%" mb="8px" />
                    <Skeleton height="16px" width="60%" />
                  </Box>
                </Flex>
              ))}
            </Flex>
          </Box>
        </GridItem>
      </Grid>
    </PageShell>
  );
}
