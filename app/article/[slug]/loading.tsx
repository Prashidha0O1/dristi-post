"use client";

import { Grid, GridItem, Box, Skeleton, Flex } from "@chakra-ui/react";
import { PageShell } from "@/components/pageShell";

export default function ArticleLoading() {
  return (
    <PageShell>
      <Grid templateColumns={{ base: "1fr", lg: "8fr 4fr" }} gap={{ base: "32px", lg: "48px" }}>
        {/* Main Article Skeleton */}
        <GridItem>
          <Skeleton height="16px" width="80px" mb="16px" borderRadius="4px" />
          <Skeleton height="40px" width="100%" mb="12px" />
          <Skeleton height="40px" width="70%" mb="24px" />
          
          <Flex gap="16px" mb="32px" align="center">
            <Skeleton height="20px" width="120px" />
            <Skeleton height="20px" width="100px" />
          </Flex>
          
          <Skeleton height="400px" width="100%" borderRadius="8px" mb="40px" />
          
          <Flex direction="column" gap="16px">
            <Skeleton height="20px" width="100%" />
            <Skeleton height="20px" width="100%" />
            <Skeleton height="20px" width="90%" />
            <Skeleton height="20px" width="95%" />
            <Skeleton height="20px" width="85%" />
          </Flex>
        </GridItem>
        
        {/* Sidebar Skeleton */}
        <GridItem>
          <Box bg="var(--color-surface)" p="20px" borderRadius="8px">
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
