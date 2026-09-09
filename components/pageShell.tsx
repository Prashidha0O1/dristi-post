"use client";

import { Box } from "@chakra-ui/react";
import { SiteHeader } from "@/components/new-ui/SiteHeader";
import { Footer } from "@/components/footer";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100vh" bg="var(--color-page)" fontFamily="var(--font-mukta), sans-serif">
      <SiteHeader />
      <Box
        as="main"
        className="dp-main"
        maxW="var(--max-content)"
        mx="auto"
        px="var(--side-pad)"
        pt="24px"
        pb="24px"
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
