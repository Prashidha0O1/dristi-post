"use client";

import { Box } from "@chakra-ui/react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100vh" bg="#f7f8fa" fontFamily="var(--font-mukta), sans-serif">
      <Header />
      <Box as="main" maxW="var(--max-content)" mx="auto" px="var(--side-pad)" py="24px">
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
