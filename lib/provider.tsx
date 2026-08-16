"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "./theme";
import { LocaleProvider } from "./locale-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <LocaleProvider>{children}</LocaleProvider>
    </ChakraProvider>
  );
}
